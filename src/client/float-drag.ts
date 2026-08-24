/** 退出按钮拖拽：给 dsh-desktop-launcher 的浮动关机按钮加 pointer 拖拽 + 位置记忆。 */

const STORAGE_KEY = 'dsh-mobile-composer:shutdown-pos'
const DRAG_THRESHOLD = 4

/** 目标按钮选择器：浮动关机按钮容器内的 button。 */
const BUTTON_SELECTOR = '[data-dsh-shutdown-float] button'

/**
 * 安装退出按钮拖拽。按钮由第三方 dsh-desktop-launcher 挂载，可能晚于本插件，
 * 故用 MutationObserver 检测其出现/重挂载，出现即 arm 拖拽。
 * 拖动与点击以 4px 阈值区分；拖动结束后抑制本次 click，避免误触确认框。
 * @returns 卸载函数。
 */
export function installFloatDrag(): () => void {
  let button: HTMLButtonElement | null = null
  let cleanup: (() => void) | undefined
  let observer: MutationObserver | undefined

  const arm = (): void => {
    if (button !== null) return
    const host = document.querySelector(BUTTON_SELECTOR)
    if (host === null) return
    button = host as HTMLButtonElement

    // 恢复记忆位置（转成 left/top 固定定位）
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== null) {
      const [x, y] = saved.split(',').map(Number)
      if (Number.isFinite(x) && Number.isFinite(y)) {
        button.style.right = 'auto'
        button.style.bottom = 'auto'
        button.style.left = `${x}px`
        button.style.top = `${y}px`
      }
    }

    let dragging = false
    let moved = false
    let startX = 0
    let startY = 0
    let originX = 0
    let originY = 0

    const onDown = (event: PointerEvent): void => {
      if (event.button !== 0 || button === null) return
      dragging = true
      moved = false
      startX = event.clientX
      startY = event.clientY
      const rect = button.getBoundingClientRect()
      originX = rect.left
      originY = rect.top
      button.setPointerCapture(event.pointerId)
    }

    const onMove = (event: PointerEvent): void => {
      if (!dragging || button === null) return
      const dx = event.clientX - startX
      const dy = event.clientY - startY
      if (!moved && Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return
      moved = true
      button.style.right = 'auto'
      button.style.bottom = 'auto'
      button.style.left = `${originX + dx}px`
      button.style.top = `${originY + dy}px`
    }

    const onUp = (event: PointerEvent): void => {
      if (!dragging) return
      dragging = false
      if (moved && button !== null) {
        const dx = event.clientX - startX
        const dy = event.clientY - startY
        localStorage.setItem(STORAGE_KEY, `${originX + dx},${originY + dy}`)
        const suppress = (ev: Event): void => { ev.stopPropagation(); ev.preventDefault() }
        button.addEventListener('click', suppress, { capture: true, once: true })
      }
    }

    button.addEventListener('pointerdown', onDown)
    button.addEventListener('pointermove', onMove)
    button.addEventListener('pointerup', onUp)
    button.addEventListener('pointercancel', onUp)

    cleanup = () => {
      if (button !== null) {
        button.removeEventListener('pointerdown', onDown)
        button.removeEventListener('pointermove', onMove)
        button.removeEventListener('pointerup', onUp)
        button.removeEventListener('pointercancel', onUp)
      }
      button = null
    }
  }

  const scan = (): void => {
    const current = document.querySelector(BUTTON_SELECTOR)
    if (current !== button) {
      cleanup?.()
      cleanup = undefined
      arm()
    }
  }

  observer = new MutationObserver(scan)
  observer.observe(document.body, { childList: true, subtree: true })
  scan()

  return () => {
    observer?.disconnect()
    observer = undefined
    cleanup?.()
    cleanup = undefined
  }
}
