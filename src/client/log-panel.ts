/** 浮动日志面板：纯 DOM 实现，手机端可直接查看调试日志。 */

import { getEntries, subscribe, type LogEntry } from './log-bus.ts'

/** 安装浮动日志面板；返回卸载函数。 */
export function installLogPanel(): () => void {
  const panel = document.createElement('div')
  panel.dataset.mobileComposerLog = 'panel'
  panel.style.cssText = [    'position: fixed',
    'bottom: 70px',
    'right: 12px',
    'z-index: 2147483647',
    'max-width: 300px',
    'max-height: 240px',
    'overflow: auto',
    'background: rgba(0,0,0,0.88)',
    'color: #e8e8e8',
    'font-family: ui-monospace, monospace',
    'font-size: 11px',
    'line-height: 1.5',
    'border-radius: 8px',
    'padding: 8px',
    'display: none',
    'pointer-events: auto',
  ].join(';')

  const toggle = document.createElement('button')
  toggle.dataset.mobileComposerLog = 'toggle'
  toggle.textContent = '调试日志'
  toggle.style.cssText = [    'position: fixed',
    'bottom: 16px',
    'right: 16px',
    'z-index: 2147483647',
    'background: rgba(0,0,0,0.72)',
    'color: #fff',
    'border: 1px solid rgba(255,255,255,0.35)',
    'border-radius: 20px',
    'padding: 7px 14px',
    'font-size: 12px',
    'font-family: system-ui, sans-serif',
    'cursor: pointer',
    'pointer-events: auto',
  ].join(';')

  const clearBtn = document.createElement('button')
  clearBtn.textContent = '清空'
  clearBtn.style.cssText = [    'background: rgba(255,107,107,0.2)',
    'color: #ff6b6b',
    'border: none',
    'border-radius: 4px',
    'padding: 2px 8px',
    'font-size: 11px',
    'cursor: pointer',
    'margin-left: 6px',
  ].join(';')

  const header = document.createElement('div')
  header.textContent = 'DSH 调试日志'
  header.style.cssText = [    'display: flex',
    'align-items: center',
    'justify-content: space-between',
    'margin-bottom: 6px',
    'font-weight: 600',
    'font-size: 12px',
  ].join(';')
  header.appendChild(clearBtn)

  const content = document.createElement('div')
  content.dataset.mobileComposerLog = 'content'
  content.textContent = '暂无日志'
  content.style.cssText = [    'white-space: pre-wrap',
    'word-break: break-all',
  ].join(';')

  panel.appendChild(header)
  panel.appendChild(content)

  document.body.appendChild(panel)
  document.body.appendChild(toggle)

  // 展开 / 收起
  let badge = 0
  const setBadge = (): void => {
    toggle.textContent = badge > 0 ? ('调试日志 (' + badge + ')') : '调试日志'
  }
  const render = (list: readonly LogEntry[]): void => {
    if (list.length === 0) {
      content.textContent = '暂无日志'
      return
    }
    content.innerHTML = list
      .map((e) => {
        const color = e.level === 'error' ? '#ff6b6b' : e.level === 'warn' ? '#ffd93d' : '#7ec699'
        const time = new Date(e.timestamp).toLocaleTimeString()
        return '<div style="color:' + color + ';margin-bottom:2px"><span style="opacity:0.6">[' + time + ']</span> ' + escapeHtml(e.message) + '</div>'
      })
      .join('')
  }

  const isOpen = (): boolean => panel.style.display !== 'none'
  const toggleOpen = (): void => {
    const open = isOpen()
    panel.style.display = open ? 'none' : 'block'
    if (!open) {
      badge = 0
      setBadge()
    }
  }

  toggle.addEventListener('click', toggleOpen)
  clearBtn.addEventListener('click', () => {
    content.textContent = '暂无日志'
  })

  const unsubscribe = subscribe((list) => {
    render(list)
    if (!isOpen()) {
      badge++
      setBadge()
    }
  })

  render(getEntries())

  return () => {
    unsubscribe()
    panel.remove()
    toggle.remove()
  }
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}