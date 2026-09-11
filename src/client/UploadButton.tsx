import { useRef, useCallback } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { NS } from './locales.ts'
import { log } from './log-bus.ts'

export type UploadButtonProps =
  PropsRuntime<'conversation.input.left'>
  & PropsLocale<typeof NS>

/**
 * 「上传图片」按钮，挂在 conversation.input.left 槽位（工具行「+」号旁）。
 * 复用 DSH 0.1.5 公开面 inputActions.addFiles 走「本地草稿 + 入列 + 发送时上传」全流程，
 * 移动端与桌面端完全同源（桌面 InputBar 自身即用此 API）。
 *
 * 历史坑（2026-09 DSH 升 0.1.5-alpha.1）：
 * 早期实现用 conversation.createDraftImages(files) + inputActions.addImages(ids)，
 * 二者在本体 0.1.5 已被移除（createDraftImages→createDrafts、addImages→addFiles），
 * 调用方拿到 undefined 直接静默失败，按钮「点了没反应」。改用 addFiles 后不再依赖任何
 * 私有/非公开 API，版本再演进只要桌面 InputBar 还能传图，本按钮就同步可用。
 *
 * addFiles 返回值约定：成功返回 null，失败返回错误文案（如不支持的图片类型 / 会话不可用）。
 */
export function UploadButton({ inputActions, t }: UploadButtonProps) {
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

      log('info', '选择文件', files.length, '个')
      files.forEach((f, i) => log('info', '  文件[' + i + ']:', f.type, f.name, f.size + ' bytes'))

      // 仅保留图片类型（与按钮语义一致；addFiles 内部还会按 imageLimits 二次校验）
      const imageFiles = files.filter(f => f.type.startsWith('image/'))
      if (imageFiles.length === 0) {
        log('warn', '没有选择有效的图片文件')
        return
      }

      log('info', '有效图片文件', imageFiles.length, '个')

      if (typeof inputActions.addFiles !== 'function') {
        log('error', 'addFiles 不可用（inputActions 未注入到 conversation.input.left 槽位）')
        return
      }

      const rejected = inputActions.addFiles(imageFiles)
      if (rejected) {
        log('error', '添加图片失败:', rejected)
      } else {
        log('info', '图片已添加到输入框', imageFiles.length, '个')
      }
    } catch (error) {
      log('error', '图片上传失败:', error)
    } finally {
      if (fileRef.current) {
        fileRef.current.value = ''
      }
    }
  }, [inputActions])

  const onClick = useCallback((): void => {
    const input = fileRef.current
    if (input) {
      input.value = ''
      input.click()
    }
  }, [])

  return (
    <>
      <input
        ref={fileRef}
        type="file"
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
        onClick={onClick}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path
            d="M5.5 8.5 8 11l2.5-2.5M8 3.5V11M3 12.5h10a1.5 1.5 0 0 0 1.5-1.5V5A1.5 1.5 0 0 0 13 3.5H9.2L8 2H4.5A1.5 1.5 0 0 0 3 3.5v7.5A1.5 1.5 0 0 0 4.5 12.5Z"
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
