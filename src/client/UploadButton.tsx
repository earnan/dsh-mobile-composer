import { useRef, useCallback } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { DraftAttachmentId, ComposerAttachment } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { NS } from './locales.ts'
import { log } from './log-bus.ts'

/** 由 apply 注入：把浏览器 File 转成会话草稿图（conversation.createDraftImages）。 */
export interface UploadInjected {
  createImages: (files: readonly File[]) => readonly ComposerAttachment[]
}

export type UploadButtonProps =
  PropsRuntime<'conversation.input.left'>
  & PropsLocale<typeof NS>
  & UploadInjected

/**
 * 「上传图片」按钮，挂在 conversation.input.left 槽位（工具行「+」号旁）。
 * 复用公开面 inputActions.addImages 走图片入列流程，移动端与桌面端均可用。
 *
 * 改进版本：解决移动端图片上传兼容性问题，使用浮动日志面板调试。
 */
export function UploadButton({ inputActions, createImages, t }: UploadButtonProps) {
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

      // 验证文件类型，确保是图片
      const imageFiles = files.filter(f => f.type.startsWith('image/'))
      if (imageFiles.length === 0) {
        log('warn', '没有选择有效的图片文件')
        return
      }

      log('info', '有效图片文件', imageFiles.length, '个')

      const images = createImages(imageFiles)
      log('info', '创建图片', images.length, '个')
      if (images.length > 0) {
        const ids = images.map(image => image.id)
        log('info', '添加图片ID', ids as unknown as string[])
        inputActions.addImages(ids)
        log('info', '图片已添加到输入框')
      } else {
        log('warn', 'createImages 返回空数组')
      }
    } catch (error) {
      log('error', '图片上传失败:', error)
    } finally {
      if (fileRef.current) {
        fileRef.current.value = ''
      }
    }
  }, [createImages, inputActions])

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