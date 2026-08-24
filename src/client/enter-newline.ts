/** 移动端「回车=换行」：document 捕获阶段拦截，早于 React 委托的 onKeyDown。 */

const MOBILE_QUERY = '(max-width: 1023px)'

/**
 * 安装回车换行：窄屏下，composer 的 textarea 回车只换行，不触发发送。
 * 通过原生 value setter + 派发 input 事件驱动 React 受控组件，使 draft 状态同步。
 * @returns 卸载函数。
 */
export function installEnterNewline(): () => void {
  const mq = window.matchMedia(MOBILE_QUERY)

  const onKeyDown = (event: KeyboardEvent): void => {
    if (!mq.matches) return
    if (event.key !== 'Enter' || event.shiftKey) return
    const target = event.target as HTMLElement | null
    if (target === null || target.tagName !== 'TEXTAREA') return
    if (target.closest('[data-composer-card]') === null) return
    // IME 组合中（含旧引擎 keyCode 229）不拦截，交还官方处理。
    if (event.isComposing || event.keyCode === 229) return

    event.preventDefault()
    event.stopPropagation()

    const textarea = target as HTMLTextAreaElement
    const start = textarea.selectionStart ?? textarea.value.length
    const end = textarea.selectionEnd ?? start
    const next = textarea.value.slice(0, start) + '\n' + textarea.value.slice(end)

    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value',
    )?.set
    if (setter !== undefined) setter.call(textarea, next)
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
    textarea.setSelectionRange(start + 1, start + 1)
  }

  document.addEventListener('keydown', onKeyDown, true)
  return () => { document.removeEventListener('keydown', onKeyDown, true) }
}
