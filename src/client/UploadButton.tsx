import { useRef, useCallback } from 'react'
import type { PropsLocale, PropsRuntime } from './props.ts'
import type { NS } from './locales.ts'
import { log } from './log-bus.ts'

export type UploadButtonProps =
  PropsRuntime<'conversation.input.left'>
  & PropsLocale<typeof NS>

/** 本按钮自带隐藏 input 的标记值，用于在 DOM 里把它和官方 input 区分开。 */
const OWN_INPUT = 'upload'

/**
 * 向上找到官方那个 `<input type="file">`（跳过本按钮自己的）。
 *
 * 官方 InputBar 在每个 composer 的工具行里都保留了一个隐藏 file input
 * （0.1.5/0.1.6 均在，`onPickFiles → intakeFiles → addFiles` 管线完好），
 * 只是 0.1.6 把触发它的按钮删掉了。本按钮复用它，而不是自己重做一套 intake。
 * @param start - 本按钮自己的隐藏 input（起点）。
 * @returns 官方 file input；找不到返回 null。
 */
function findOfficialInput(start: HTMLInputElement): HTMLInputElement | null {
  let node: HTMLElement | null = start.parentElement
  for (let depth = 0; node !== null && depth < 8; depth += 1, node = node.parentElement) {
    for (const candidate of node.querySelectorAll<HTMLInputElement>('input[type="file"]')) {
      if (candidate.dataset.mobileComposerInput === OWN_INPUT) continue
      return candidate
    }
  }
  return null
}

/**
 * 「上传图片」按钮，挂在 conversation.input.left 槽位（工具行「+」号旁）。
 *
 * ## 为什么走官方 input（2026-09-17 真机定位）
 *
 * 旧实现自己在 inject 层构造 `addFiles`：`sessions.scopeOf(actx)` +
 * `conversation.createDrafts` + `input.for(actx).addAttachments`。这条路**静默失效**：
 * slot 的 `inject` 工厂收到的是 **`sessionId`（字符串）**，不是 Context
 * （见 ui-slots 的 `InjectParams`：`ScopeOf<K> extends 'session' ? [sessionId] : ...`），
 * 于是 `scopeOf(actx)` 恒为 undefined，函数返回「会话不可用」，界面上表现为
 * 「选了图但什么都没发生」。
 *
 * 改成把选中的图片交给官方那个隐藏 input（用 `DataTransfer` 回填 `files` 再派发
 * `change`），整条 intake 管线（图片限额校验、草稿创建、后台上传、toast 提示）
 * 全部复用官方实现 —— 与官方附件按钮走的是同一段代码，不再有第二套实现可以漂移。
 *
 * 本按钮保留自己的 `accept` 白名单，所以它仍然是「只选图片」的入口。
 */
export function UploadButton({ t }: UploadButtonProps) {
  const fileRef = useRef<HTMLInputElement | null>(null)

  const onPick = useCallback((): void => {
    try {
      const input = fileRef.current
      if (input === null) {
        log('warn', '文件输入元素不存在')
        return
      }

      const files = Array.from(input.files ?? [])
      if (files.length === 0) {
        log('warn', '没有选择文件')
        return
      }

      // 仅保留图片类型（与按钮语义一致；官方 intake 还会按 imageLimits 二次校验）
      const imageFiles = files.filter(f => f.type.startsWith('image/'))
      log('info', '选择文件', files.length, '个，其中图片', imageFiles.length, '个')
      if (imageFiles.length === 0) {
        log('warn', '没有选择有效的图片文件')
        return
      }

      const official = findOfficialInput(input)
      if (official === null) {
        log('error', '未找到官方附件 input，无法提交图片（DSH 结构可能已变更）')
        return
      }

      // 用 DataTransfer 把文件回填给官方 input，再派发 change —— React 的
      // onChange 由根容器委托监听，冒泡的 change 会被正常接住。
      const transfer = new DataTransfer()
      for (const file of imageFiles) transfer.items.add(file)
      official.files = transfer.files
      official.dispatchEvent(new Event('change', { bubbles: true }))
      log('info', '已交给官方附件管线', imageFiles.length, '个')
    } catch (error) {
      log('error', '图片上传失败:', error)
    } finally {
      if (fileRef.current) {
        fileRef.current.value = ''
      }
    }
  }, [])

  const onClick = useCallback((): void => {
    const input = fileRef.current
    if (input) {
      input.value = ''
      input.click()
    }
  }, [])

  /**
   * mousedown 时 preventDefault，避免抢走 Lexical composer 的焦点。
   *
   * 官方所有工具栏按钮都做这件事（`InputBar.tsx` 的 `keepFocus` → `keepDraftFocus`，
   * 注释原文：「Button presses steal focus from the editor」）。移动端输入法在
   * contenteditable 失焦时会丢弃尚未提交的组合文本，表现为「打好的问题不见了、
   * 只剩图片」——本插件曾漏掉这一步。
   * @param event - 按钮的 mousedown 事件。
   */
  const keepFocus = useCallback((event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault()
  }, [])

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        data-mobile-composer-input={OWN_INPUT}
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        style={{
          position: 'absolute',
          left: '-9999px',
          opacity: 0,
          width: 0,
          height: 0,
          overflow: 'hidden'
        }}
        onChange={onPick}
      />
      <button
        type="button"
        data-mobile-composer="upload"
        aria-label={t('upload')}
        title={t('upload')}
        onMouseDown={keepFocus}
        onClick={onClick}
      >
        {/* 图片图标（画框 + 山 + 太阳）。旧图标是「方框 + 向上箭头」，看起来像下载。 */}
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <rect
            x="2"
            y="3"
            width="12"
            height="10"
            rx="1.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <circle cx="5.9" cy="6.5" r="1.15" fill="currentColor" />
          <path
            d="M2.6 11.9l3.3-3.1 2.3 2.1 2.1-1.9 3.1 2.9"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </>
  )
}
