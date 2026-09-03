import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { DraftAttachmentId, IConversation, ComposerAttachment } from '@deepseek-ai/dsh-client-ui-conversation/client'
// 拉入 ctx.settingsScope / ctx.locale 的 type augmentation（side-effect type import）
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { UploadButton } from './UploadButton.tsx'
import { SteerButton } from './SteerButton.tsx'
import { DebugLogSetting } from './DebugLogSetting.tsx'
import { installEnterNewline } from './enter-newline.ts'
import { installFloatDrag } from './float-drag.ts'
import { installLogPanel } from './log-panel.ts'
import { log } from './log-bus.ts'
import { NS, zh, en } from './locales.ts'
import type { MobileRemoteKey } from './locales.ts'
import {
  MOBILE_COMPOSER_SETTINGS_NAMESPACE,
  type MobileComposerSettings,
} from './settings-meta.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    mobileComposer: MobileRemoteKey
  }
}

/**
 * 运行时 conversation 服务：createDraftImages 未进 IConversation 公开接口，
 * 但运行时实例（ConversationController）存在该方法。类型在此补全。
 */
interface ConversationRuntime extends IConversation {
  createDraftImages(files: readonly File[]): readonly ComposerAttachment[]
}

/** sessions 服务最小面：按 id 取 session 作用域 ctx。 */
interface SessionsFace {
  scope(id: string): ClientContext | undefined
}

/** 必需注入的服务。settingsScope 用可选 ctx.inject，避免 ui-settings 缺失时拖垮插件。 */
export const inject = ['slots', 'locale', 'conversation', 'sessions', 'remote', 'settingsScope'] as const

const MOBILE_CSS = `[data-mobile-composer='upload'],
[data-mobile-composer='steer'] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: currentColor;
  cursor: pointer;
  flex: none;
}
[data-mobile-composer='upload']:hover:not(:disabled),
[data-mobile-composer='steer']:hover:not(:disabled) {
  background: rgba(127, 127, 127, 0.16);
}
[data-mobile-composer='steer']:disabled {
  opacity: 0.35;
  cursor: default;
}
@media (min-width: 1024px) {
  [data-mobile-composer='upload'],
  [data-mobile-composer='steer'] {
    display: none;
  }
}
[data-dsh-shutdown-float] button {
  cursor: grab;
}
[data-dsh-shutdown-float] button:active {
  cursor: grabbing;
}
`

/**
 * dsh-mobile-composer，浏览器半：移动端增强 + 设置开关。
 * - 传图按钮（conversation.input.left）
 * - 插话发送按钮（conversation.input.right）
 * - 回车=换行（document 捕获拦截）
 * - 退出按钮拖动（DOM 注入）
 * - 「调试日志」设置开关（settings.general.item）
 * @param ctx - 客户端根上下文。
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-mobile-composer: dictionaries')

  ctx.effect(() => {
    const tag = document.createElement('style')
    tag.dataset.plugin = '@dsh-external/dsh-mobile-composer'
    tag.textContent = MOBILE_CSS
    document.head.appendChild(tag)
    return () => { tag.remove() }
  }, 'dsh-mobile-composer: styles')

  // 用 ctx.inject 确保 conversation/sessions 服务就绪后再注册槽位，
  // 否则 apply 时 get('conversation') 可能返回 undefined。
  ctx.inject(['conversation', 'sessions'], (scope: ClientContext) => {
    const conversation = scope.get('conversation') as ConversationRuntime | undefined
    log('info', 'apply: conversation =', conversation ? 'READY' : 'MISSING')
    log('info', 'apply: createDraftImages =', conversation && typeof conversation.createDraftImages === 'function' ? 'READY' : 'MISSING')

    scope.slots.inject('conversation.input.left', () => scope.slots.register({
      name: 'conversation.input.left',
      id: 'mobile-composer-upload',
      order: 0,
      locale: NS,
      inject: () => ({
        createImages: (files: readonly File[]) => {
          const conv = scope.get('conversation') as ConversationRuntime | undefined
          log('info', 'createImages: conversation =', conv ? 'READY' : 'MISSING')
          if (!conv) {
            log('error', 'createImages: conversation 未找到')
            return []
          }
          if (typeof conv.createDraftImages !== 'function') {
            log('error', 'createImages: createDraftImages 不可用')
            return []
          }
          try {
            const result = conv.createDraftImages(files)
            log('info', 'createImages: createDraftImages 返回', result.length, '个')
            return result
          } catch (e) {
            log('error', 'createImages: createDraftImages 异常:', e)
            return []
          }
        },
      }),
    }, UploadButton))

    scope.slots.inject('conversation.input.right', () => scope.slots.register({
      name: 'conversation.input.right',
      id: 'mobile-composer-steer',
      order: 0,
      locale: NS,
      inject: (actx) => ({
        steer: () => {
          // actx 由 slot inject 提供，类型推断为 SessionId；input.for 需 ClientContext（历史遗留，运行时正常）。
          const conv = scope.get('conversation')
          void conv?.input.for(actx as unknown as ClientContext).submit('steer')
        },
      }),
    }, SteerButton))
  })

  ctx.effect(() => installEnterNewline(), 'dsh-mobile-composer: enter-newline')
  ctx.effect(() => installFloatDrag(), 'dsh-mobile-composer: float-drag')

  // 浮动日志面板：URL ?debug=1 强制启用（兜底）。
  if (new URLSearchParams(window.location.search).has('debug')) {
    ctx.effect(() => installLogPanel(), 'dsh-mobile-composer: log-panel(force)')
  }

  // 设置开关（与官方 locale 一致：inject 顶层含 settingsScope，apply 顶层绑定）。
  const host = ctx.settingsScope.bind<MobileComposerSettings>({
    namespace: MOBILE_COMPOSER_SETTINGS_NAMESPACE,
  })

  // 订阅 debugLog，动态装/卸浮动日志面板。
  ctx.effect(() => {
    let disposePanel: (() => void) | undefined
    let unsub: (() => void) | undefined
    const sync = () => {
      const snap = host.getSnapshot()
      const on = snap.value?.debugLog === true
      if (on && !disposePanel) disposePanel = installLogPanel()
      else if (!on && disposePanel) { disposePanel(); disposePanel = undefined }
    };
    unsub = host.subscribe(sync)
    sync()
    return () => { unsub?.(); if (disposePanel) disposePanel() }
  }, 'dsh-mobile-composer: log-panel(settings)')

  // 设置行：DebugLog 开关。
  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'mobile-composer-debuglog',
    order: 0,
    locale: NS,
    inject: () => ({
      debugLog: host.getSnapshot().value?.debugLog === true,
      onToggle: (v: boolean) => { void host.set('debugLog', v) },
    }),
  }, DebugLogSetting))
}