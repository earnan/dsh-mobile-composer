/**
 * dsh-mobile-composer，浏览器半（rc.2 架构适配版）。
 *
 * ## 0.1.7-rc.2 适配要点（相对 0.1.6）
 *
 * - `settingsScope` 服务被整体删除 → 设置读写改走共享 `configForms` 服务
 *   （`dsh-client-ui-settings` 提供），按字段归属绑定 entry，见 `forms-reader.ts`；
 * - Host 侧设置页改由插件 Config schema 派生（不再手动注册 namespace）；
 * - `slots` 服务由 `dsh-client-ui-renderer` 的 SlotRegistry 提供，API 面不变；
 * - package.json 的 dsh.client.inject 换成 rc.2 seed 表内模块
 *   （locale / ui-renderer / ui-settings / ui-layout）。
 * - 会话槽位、DOM 注入（attach/enter-newline/float-drag）与 0.1.6 版一致。
 */
import { UploadButton } from './UploadButton.tsx'
import { SteerButton } from './SteerButton.tsx'
import { DebugLogSetting } from './DebugLogSetting.tsx'
import { installEnterNewline } from './enter-newline.ts'
import { installFloatDrag } from './float-drag.ts'
import { installAttachButton } from './attach-button.ts'
import { installLogPanel } from './log-panel.ts'
import { log } from './log-bus.ts'
import { NS, zh, en } from './locales.ts'
import type { MobileRemoteKey } from './locales.ts'
import { DEBUG_LOG_FIELD } from './settings-meta.ts'
import { SharedFormsReader } from './forms-reader.ts'
import type { ConfigFormsFace } from './forms-reader.ts'
import type { PropsLocale, PropsRuntime } from './props.ts'

/** 官方 busy-Enter 偏好所在的命名空间与字段（对齐 harness `submission-settings.ts`）。 */
const BUSY_ENTER_FIELD = 'busyEnter'
type BusyEnterBehavior = 'queue' | 'steer'

/** 插件用到的客户端服务面（本地最小类型，替代 dsh-client-runtime 的 ClientContext）。 */
interface ClientCtx {
  /** 必需服务（entry inject 就绪后才进 apply）。 */
  slots: {
    inject(key: string, callback: () => () => void): () => void
    register(options: Record<string, unknown>, component: unknown): () => void
  }
  locale: {
    register(ns: string, dict: Record<string, Record<string, string>>): () => void
  }
  /** 共享配置 forms（rc.2 设置面入口，由 ui-settings 提供）。 */
  configForms: ConfigFormsFace
  /** cordis 标准：按名取可选服务。 */
  get(name: string): unknown | undefined
  /** cordis 标准：等子集服务就绪后进回调。 */
  inject(services: string[], callback: (scope: ClientCtx) => void): void
  /** cordis 标准：fiber 生命周期效果。 */
  effect(install: () => (() => void) | void, name?: string): () => void
}

/** 必需注入的服务（rc.2：settingsScope 已删，设置走 configForms）。 */
export const inject = ['slots', 'locale', 'conversation', 'sessions', 'configForms'] as const

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
/* 0.1.6 注入的回形针：复刻官方 .add 圆形按钮（28px / selector 填充 / primary 字形）。
   与官方附件按钮同样全宽度可见（不做窄屏限制），保证 track 与 main 外观一致。 */
[data-mobile-composer='attach'] {
  display: grid;
  place-items: center;
  flex: none;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 999px;
  corner-shape: round;
  background: var(--dsw-specific-selector);
  color: var(--dsw-alias-label-primary);
  cursor: pointer;
}
[data-mobile-composer='attach']:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover-solid);
}
[data-mobile-composer='attach']:disabled {
  opacity: 0.5;
  cursor: default;
}
@media (min-width: 1024px) {
  [data-mobile-composer='upload'],
  [data-mobile-composer='steer'] {
    display: none;
  }
}
/* 窄屏隐藏牛马修仙看板（dsh-worktime-board）的右下角浮动徽标。
   它的样式是 position:fixed; right:16px; bottom:16px; z-index:2147483000，
   正好压在 composer 右侧的「发送 / 插话」按钮上，导致按钮点不到、也看不见。
   桌面端不动（那里有足够空间）。 */
@media (max-width: 1023px) {
  .wtb-badge {
    display: none !important;
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
 * 窄屏把官方 `busyEnter` 规范为 `queue`，离开窄屏还原用户原值。
 *
 * ## 为什么（harness 源码 `input/submission-policy.ts` 的 `resolveSubmitMode`）
 *
 * 官方主发送按钮与 Enter **共用 `'enter'` 手势**，投递模式直接取 `busyEnter`：
 *
 * ```js
 * if (!running || !steeringAvailable) return 'queue'
 * if (gesture === 'enter') return preferred   // ← Enter 与主按钮都走这条
 * return preferred === 'queue' ? 'steer' : 'queue'
 * ```
 *
 * 移动端的设计是三条语义互不重叠：
 * 1. **Enter** = 换行（见 `enter-newline.ts`，手机没有 Shift 键）
 * 2. **官方主发送按钮** = 排队发送（不打断当前回合）
 * 3. **插件 steer 按钮** = 插话发送（显式打断）
 *
 * 第 2 条要求官方按钮落在 `queue` 上，而 `busyEnter` 是 Host 持久化偏好
 * （可能被用户设成 `steer`，那样官方按钮就会插话，与第 3 条重叠）。故窄屏接管为
 * `queue`，宽屏归还用户自己的值 —— 桌面端 Enter=插话 的既有习惯不受影响。
 *
 * 未设置时无需接管：harness 的默认值本就是 `queue`。
 *
 * ## rc.2 适配
 *
 * `busyEnter` 属 ui-conversation 的设置域，经共享 configForms 读取器按字段绑定
 * （reader 直到 mirror 点名携带 `busyEnter` 的 entry 才可写；此前的 set 返回 false，
 * 但 sync 只在读到 `steer` 时才写，读不到就不会写，时序安全）。
 * @param ctx - 客户端根上下文。
 * @returns 卸载函数（会还原被接管的偏好）。
 */
function installMobileQueueDefault(ctx: ClientCtx): () => void {
  const mq = window.matchMedia('(max-width: 1023px)')
  const host = new SharedFormsReader(ctx.configForms, BUSY_ENTER_FIELD)
  /** 被本模块接管前的用户值；undefined 表示当前未接管。 */
  let taken: BusyEnterBehavior | undefined

  const sync = (): void => {
    const current = host.getSnapshot().value?.busyEnter as BusyEnterBehavior | undefined
    if (mq.matches) {
      // 仅当用户明确设成了 steer 才需要接管。
      if (taken === undefined && current === 'steer') {
        taken = 'steer'
        void host.set(BUSY_ENTER_FIELD, 'queue')
      }
      return
    }
    if (taken !== undefined) {
      const restore = taken
      taken = undefined
      void host.set(BUSY_ENTER_FIELD, restore)
    }
  }

  const unsubscribe = host.subscribe(sync)
  mq.addEventListener('change', sync)
  sync()
  return () => {
    unsubscribe()
    mq.removeEventListener('change', sync)
    host.dispose()
    if (taken !== undefined) void host.set(BUSY_ENTER_FIELD, taken)
  }
}

/**
 * dsh-mobile-composer，浏览器半：移动端增强 + 设置开关。
 * - 传图按钮（conversation.input.left）
 * - 插话发送按钮（conversation.input.right）
 * - 回车=换行（document 捕获拦截）
 * - 退出按钮拖动（DOM 注入）
 * - 「调试日志」设置开关（settings.general.item；rc.2：Config schema 派生设置页）
 * @param ctx - 客户端根上下文。
 */
export function apply(ctx: ClientCtx): void {
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
  // 0.1.6 起的适配不变：上传走官方隐藏 <input type="file"> 的 intake 管线。
  ctx.inject(['conversation', 'sessions'], (scope: ClientCtx) => {
    const conversation = scope.get('conversation') as
      | { input: { for(ctx: ClientCtx): { submit(mode: string): Promise<void> } } }
      | undefined
    log('info', 'apply: conversation =', conversation ? 'READY' : 'MISSING')

    // 上传槽位不需要 inject：UploadButton 直接把选中的图片交给官方隐藏
    // <input type="file">，复用官方 intake 管线。
    scope.slots.inject('conversation.input.left', () => scope.slots.register({
      name: 'conversation.input.left',
      id: 'mobile-composer-upload',
      order: 0,
      locale: NS,
    }, UploadButton))

    scope.slots.inject('conversation.input.right', () => scope.slots.register({
      name: 'conversation.input.right',
      id: 'mobile-composer-steer',
      order: 0,
      locale: NS,
      inject: (sessionId: string) => ({
        steer: () => {
          // ⚠️ session 槽位的 inject 工厂收到的是 **SessionId 字符串**，不是 Context
          // （SlotCore 的 InjectParams：ScopeOf<K> extends 'session' ? [sessionId] : ...）。
          // 而 `input.for` 需要 session 作用域的 Context，故先用 sessions.scope(id) 换。
          const conv = scope.get('conversation') as typeof conversation
          const sessions = scope.get('sessions') as
            | { scope(id: string): ClientCtx | undefined }
            | undefined
          const actx = sessions?.scope(sessionId)
          if (actx === undefined) {
            log('warn', 'steer: 无法解析 session 作用域', sessionId)
            return
          }
          void conv?.input.for(actx).submit('steer')
        },
      }),
    }, SteerButton))
  })

  ctx.effect(() => installAttachButton(), 'dsh-mobile-composer: attach-button(0.1.6)')
  ctx.effect(() => installEnterNewline(), 'dsh-mobile-composer: enter-newline')
  ctx.effect(() => installMobileQueueDefault(ctx), 'dsh-mobile-composer: mobile queue default')
  ctx.effect(() => installFloatDrag(), 'dsh-mobile-composer: float-drag')

  // 浮动日志面板：URL ?debug=1 强制启用（兜底）。
  if (new URLSearchParams(window.location.search).has('debug')) {
    ctx.effect(() => installLogPanel(), 'dsh-mobile-composer: log-panel(force)')
  }

  // 「调试日志」开关：rc.2 设置模型下，本插件的 Config schema（host 侧 lib/index.js
  // 导出）被 Host 派生为共享设置面上的一个 form；client 按 debugLog 字段归属绑定。
  const host = new SharedFormsReader(ctx.configForms, DEBUG_LOG_FIELD)
  ctx.effect(() => () => host.dispose(), 'dsh-mobile-composer: debuglog reader')

  // 订阅 debugLog，动态装/卸浮动日志面板。
  ctx.effect(() => {
    let disposePanel: (() => void) | undefined
    const sync = () => {
      const snap = host.getSnapshot()
      const on = snap.value?.debugLog === true
      if (on && !disposePanel) disposePanel = installLogPanel()
      else if (!on && disposePanel) { disposePanel(); disposePanel = undefined }
    };
    const unsub = host.subscribe(sync)
    sync()
    return () => { unsub(); if (disposePanel) disposePanel() }
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

// 槽位 props 类型在此文件仅供组件签名引用，保持显式 re-export 便于排查。
export type { PropsLocale, PropsRuntime }
