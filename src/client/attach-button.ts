/**
 * 0.1.6 附件入口修复：注入回形针按钮，转发到官方隐藏 file input。
 *
 * 源码实测（2026-09-16，对照 main=0.1.5-alpha.1 / track=0.1.6-alpha.1）：
 *
 * - **0.1.5**（`InputBar.tsx` L496-515）：工具栏内联渲染官方「回形针」按钮，
 *   位于「+」右侧（第 2 格），点击 → `fileInputRef.current.click()`。
 * - **0.1.6**（`InputBar.tsx` L399-421）：官方把附件改成「+」菜单里的 file
 *   command（`apply.ts` L212-221 注册进 `commandUi`，icon=paperclip），工具栏里
 *   **只剩下 hidden `<input type="file">`**（onChange=onPickFiles → intakeFiles →
 *   addFiles），但**没有任何可见按钮去触发它** —— 桌面与移动端都失去了可见附件入口。
 *
 * 做法：当工具栏中官方附件按钮缺失时，在「+」右侧（即原官方位置）注入一个回形针
 * 按钮，点击即转发到官方 hidden input。这样复用官方完整 intake 管线（图片限额校验、
 * 草稿创建、后台上传），**与插件自身的 addFiles 逻辑零耦合**，也不依赖任何 0.1.6
 * 新增的私有 API。
 *
 * 判别「官方按钮是否存在」：0.1.5 中紧跟「+」（或其 Tooltip wrapper）之后的是官方
 * 回形针按钮；0.1.6 中紧跟其后的是 `<input type="file">`。故「下一个兄弟节点是 file
 * input」⟺ 官方按钮缺失 ⟺ 需要注入。
 *
 * 幂等：注入节点标记 `data-mobile-composer="attach"`；MutationObserver 在 React
 * 重渲染（会话切换 / 工具栏重建）后自动补回，官方按钮出现时自动移除。
 */
import { zh, en } from './locales.ts'

/** 官方「+」命令菜单按钮（命令选择器）的稳定锚点。 */
const PLUS_SELECTOR = 'button[aria-haspopup="listbox"]'
/** 本模块注入按钮的标记与选择器。 */
const ATTACH_SELECTOR = '[data-mobile-composer="attach"]'
/** 官方「上传图片」槽位按钮，用于判定当前工具栏是否属于有会话的 composer。 */
const UPLOAD_SELECTOR = '[data-mobile-composer="upload"]'

/** 官方 ic_ds_paperclip_outline_16 的 path（与 ui-primitives 同源，保证外观一致）。 */
const PAPERCLIP_PATH
  = 'M5.5498 9.75V5H6.9502V9.75C6.9502 10.3299 7.4201 10.7998 8 10.7998C8.5799 10.7998'
  + ' 9.0498 10.3299 9.0498 9.75V4.5C9.0498 2.9536 7.7964 1.7002 6.25 1.7002C4.7036 1.7002'
  + ' 3.4502 2.9536 3.4502 4.5V9.75C3.4502 12.2629 5.4871 14.2998 8 14.2998C10.5129 14.2998'
  + ' 12.5498 12.2629 12.5498 9.75V4H13.9502V9.75C13.9502 13.0361 11.2861 15.7002 8 15.7002'
  + 'C4.71391 15.7002 2.0498 13.0361 2.0498 9.75V4.5C2.04981 2.1804 3.9304 0.299806 6.25 0.299805'
  + 'C8.5696 0.299805 10.4502 2.1804 10.4502 4.5V9.75C10.4502 11.1031 9.3531 12.2002 8 12.2002'
  + 'C6.6469 12.2002 5.5498 11.1031 5.5498 9.75Z'

/** 按浏览器语言挑选按钮文案（DSH 界面语言通常与浏览器一致）。 */
function attachLabel(): string {
  const lang = (document.documentElement.lang || navigator.language || '').toLowerCase()
  return lang.startsWith('zh') ? zh.attach : en.attach
}

/** 构造回形针按钮；样式由 index.tsx 的 MOBILE_CSS 复刻官方 `.add` 提供。 */
function createAttachButton(): HTMLButtonElement {
  const label = attachLabel()
  const button = document.createElement('button')
  button.type = 'button'
  button.dataset.mobileComposer = 'attach'
  button.setAttribute('aria-label', label)
  button.title = label
  button.innerHTML
    = `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">`
    + `<path d="${PAPERCLIP_PATH}" fill="currentColor"/></svg>`
  return button
}

/** 该元素是否为（或包含）官方「+」命令按钮。 */
function isPlusControl(element: Element | null): boolean {
  if (element === null) return false
  if (element.matches(PLUS_SELECTOR)) return true
  return element.querySelector(PLUS_SELECTOR) !== null
}

/**
 * 从「+」向上找到最近的、包含本插件上传按钮的祖先 —— 即 composer 的工具行。
 * 用「包含上传按钮」而非固定层数定位，对官方 Tooltip 是否包一层 wrapper 免疫。
 * @param plus - 官方「+」按钮。
 * @returns 工具行元素；无会话的 composer 下返回 null。
 */
function findToolRow(plus: HTMLButtonElement): HTMLElement | null {
  let node: HTMLElement | null = plus.parentElement
  for (let depth = 0; node !== null && depth < 6; depth += 1, node = node.parentElement) {
    if (node.querySelector(UPLOAD_SELECTOR) !== null) return node
  }
  return null
}

/** 为单个 composer 工具行同步附件按钮（幂等：状态一致时不触碰 DOM）。 */
function syncToolRow(plus: HTMLButtonElement): void {
  const row = findToolRow(plus)
  if (row === null) return

  const existing = row.querySelector<HTMLButtonElement>(ATTACH_SELECTOR)
  const input = row.querySelector<HTMLInputElement>('input[type="file"]')
  if (input === null) {
    existing?.remove()
    return
  }

  // 判别官方附件按钮：看 file input 的前一个兄弟（跳过本模块节点）。
  // 0.1.5 → 官方回形针；0.1.6 → 「+」。该判定不受本按钮插入影响，故不会振荡。
  //
  // ⚠️ 曾踩坑：若改用「「+」的下一个兄弟是否 file input」判定，插入自身会把条件
  // 翻转成“官方按钮存在” → 下一轮删掉自己 → 条件又翻转回来，每帧增删一次，
  // 表现为界面不停抽搐 + 按钮重叠。
  let beforeInput: Element | null = input.previousElementSibling
  if (beforeInput !== null && beforeInput.matches(ATTACH_SELECTOR)) {
    beforeInput = beforeInput.previousElementSibling
  }
  const officialPresent = !isPlusControl(beforeInput)

  if (officialPresent) {
    // 官方按钮在位（0.1.5）：撤掉我们的注入，避免重复入口。
    existing?.remove()
    return
  }
  if (existing !== null) return

  // 插入位置：工具行内「+」所在的直接子元素之后（= 官方原位置）。
  let anchor: Element = plus
  while (anchor.parentElement !== null && anchor.parentElement !== row) anchor = anchor.parentElement

  const button = createAttachButton()
  // mousedown preventDefault：官方所有工具栏按钮都如此（InputBar 的 keepFocus →
  // keepDraftFocus，注释原文「Button presses steal focus from the editor」）。
  // 不这样做会抢走 Lexical composer 的焦点，移动端输入法随即丢弃未提交的组合文本
  // —— 表现为「打好的问题不见了、只剩图片」。
  button.addEventListener('mousedown', (event) => { event.preventDefault() })
  button.addEventListener('click', () => {
    // 转发到官方 hidden input：复用官方 intakeFiles → addFiles 完整管线。
    const target = row.querySelector<HTMLInputElement>('input[type="file"]')
    if (target !== null) target.click()
  })
  anchor.insertAdjacentElement('afterend', button)
}

/**
 * 安装附件按钮注入器。
 * @returns 卸载函数（断开 MutationObserver；已注入的按钮由 React 卸载时自然消失）。
 */
export function installAttachButton(): () => void {
  let scheduled = false

  const sync = (): void => {
    for (const plus of document.querySelectorAll<HTMLButtonElement>(PLUS_SELECTOR)) {
      try {
        syncToolRow(plus)
      } catch {
        // 单个工具行的异常不得中断其余 composer。
      }
    }
  }

  const schedule = (): void => {
    if (scheduled) return
    scheduled = true
    // 合并同一批 DOM 变更；50ms 足以跨过 React 的一次提交，又不会被高频重渲染拖住。
    setTimeout(() => {
      scheduled = false
      sync()
    }, 50)
  }

  sync()
  const observer = new MutationObserver(schedule)
  observer.observe(document.body, { childList: true, subtree: true })
  return () => { observer.disconnect() }
}
