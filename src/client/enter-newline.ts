/**
 * 移动端「回车 = 换行」。
 *
 * ## 背景（2026-09-17 源码实测 + 真机验证）
 *
 * - **composer 是 Lexical contenteditable，不是 textarea**：0.1.5 / 0.1.6 都由
 *   `ComposerContentEditable.tsx` 渲染 `<div contentEditable>`；`DraftEditor.tsx`
 *   的注释也印证了 textarea → div 的迁移。旧实现按 `TEXTAREA` 匹配 target，
 *   在两个版本上**从未生效**。
 * - **官方 Enter 语义**（`input/editor/keymap.ts` 的 `KEY_ENTER_COMMAND`）：
 *   - `Shift+Enter` → 返回 false，交给 Lexical 原生插入换行；
 *   - IME 组合中 → 返回 true 且不 preventDefault，交给输入法选词；
 *   - 其余 → `preventDefault` 并提交发送。
 *
 * ## 做法
 *
 * 手机没有 Shift 键，所以窄屏下把**裸 Enter 翻译成 `Shift+Enter`**：
 * 在 document 捕获阶段拦下原事件（`preventDefault + stopPropagation`，阻断官方提交），
 * 再向同一 target 派发一个 `shiftKey: true` 的同款 keydown —— 让 Lexical 走它自己的
 * 官方换行路径插入换行。
 *
 * 这样不需要自己操作 DOM 或编辑器状态（`execCommand` / 直接改 contenteditable
 * 都会与 Lexical 的内部状态脱同步），只是把「手机上没有的那个修饰键」补上。
 *
 * ## 为什么 Enter 判定要认 keyCode（真机踩坑）
 *
 * 安卓输入法的「回车/换行」键发出的 keydown 常常是 `key: 'Unidentified'` +
 * `keyCode: 13`。而 Lexical 的 `isEnterKey` 同时认 `key`、`keyCode`、`which`
 * （三者任一命中即当作 Enter 并提交）——只按 `event.key === 'Enter'` 判定会漏掉，
 * 表现为「守卫提前返回、官方照常发送」。故此处与 Lexical 用同一套判据。
 *
 * 桌面端（≥1024px）完全不受影响：Enter 仍是官方语义，Shift+Enter 换行。
 */
import { log } from './log-bus.ts'

/** 窄屏判定：与插件其余移动端增强一致。 */
const MOBILE_QUERY = '(max-width: 1023px)'

/** 已上报过的诊断原因，避免日志刷屏（每个原因每次会话只报一次）。 */
const reported = new Set<string>()

/** 上报一次诊断信息（同原因只报一次）。 */
function reportOnce(reason: string, message: string): void {
  if (reported.has(reason)) return
  reported.add(reason)
  log('warn', `[enter-newline] ${message}`)
}

/**
 * 与 Lexical `isEnterKey` 同源的 Enter 判据：`key` / `code` / `keyCode` / `which`
 * 任一命中即视为 Enter（安卓输入法常只给后两者）。
 * @param event - 键盘事件。
 * @returns 是否应视为 Enter 键。
 */
function isEnterKey(event: KeyboardEvent): boolean {
  return event.key === 'Enter'
    || event.code === 'Enter'
    || event.keyCode === 13
    || event.which === 13
}

/**
 * 目标是否属于 composer 的编辑面。
 *
 * 主判据 `[data-input-scroll]`（`DraftEditor.tsx` 的滚动容器）；兜底判据是向上
 * 若干层存在官方 `<input type="file">` —— 那就是 composer 卡片。两条判据都不命中
 * 才放弃拦截（例如设置页里的其它可编辑元素）。
 * @param target - keydown 的事件目标。
 * @returns 是否属于 composer 编辑面。
 */
function isComposerEditable(target: HTMLElement): boolean {
  if (!target.isContentEditable) return false
  if (target.closest('[data-input-scroll], [data-composer-card]') !== null) return true
  let node: HTMLElement | null = target
  for (let depth = 0; node !== null && depth < 6; depth += 1, node = node.parentElement) {
    if (node.querySelector('input[type="file"]') !== null) return true
  }
  return false
}

/**
 * 安装回车换行（窄屏生效）。
 * @returns 卸载函数。
 */
export function installEnterNewline(): () => void {
  const mq = window.matchMedia(MOBILE_QUERY)

  const onKeyDown = (event: KeyboardEvent): void => {
    if (!isEnterKey(event) || event.shiftKey) return

    const target = event.target
    if (!(target instanceof HTMLElement)) return
    if (!isComposerEditable(target)) {
      // 非 composer 的 Enter（如设置页输入）不干预，也不上报。
      return
    }
    if (!mq.matches) {
      reportOnce('wide', '当前非窄屏（<1024px 才拦截），Enter 保持官方语义')
      return
    }
    // IME 组合中（含旧引擎 keyCode 229）：这次 Enter 是「选词确认」，交还输入法。
    if (event.isComposing || event.keyCode === 229) return

    // 阻断官方提交路径。
    event.preventDefault()
    event.stopPropagation()

    // 补上手机上没有的修饰键，交给 Lexical 的官方换行分支。
    const synthetic = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
      composed: true,
    })
    // 旧引擎读 keyCode / which，二者无法经构造器设置，手动补齐以兼容 Lexical 的
    // 事件判定。
    Object.defineProperty(synthetic, 'keyCode', { get: () => 13 })
    Object.defineProperty(synthetic, 'which', { get: () => 13 })
    target.dispatchEvent(synthetic)
    reportOnce('intercepted', '已接管 Enter（改为换行）')
  }

  document.addEventListener('keydown', onKeyDown, true)
  return () => { document.removeEventListener('keydown', onKeyDown, true) }
}
