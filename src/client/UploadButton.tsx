import { useRef } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { DraftAttachmentId } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { NS } from './locales.ts'

/** 由 apply 注入：把浏览器 File 转成会话草稿图（conversation.createDraftImages）。 */
export interface UploadInjected {
  createImages: (files: readonly File[]) => readonly { id: DraftAttachmentId }[]
}

export type UploadButtonProps =
  PropsRuntime<'conversation.input.left'>
  & PropsLocale<typeof NS>
  & UploadInjected

/**
 * 「上传图片」按钮，挂在 conversation.input.left 槽位（工具行「+」号旁）。
 * 复用公开面 inputActions.addImages 走图片入列流程，移动端与桌面端均可用。
 */
export function UploadButton({ inputActions, createImages, t }: UploadButtonProps) {
  const fileRef = useRef<HTMLInputElement | null>(null)

  const onPick = (): void => {
    const input = fileRef.current
    if (input === null) return
    const files = Array.from(input.files ?? [])
    if (files.length === 0) return
    const images = createImages(files)
    if (images.length > 0) inputActions.addImages(images.map(image => image.id))
    input.value = ''
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={onPick}
      />
      <button
        type="button"
        data-mobile-composer="upload"
        aria-label={t('upload')}
        title={t('upload')}
        onClick={() => { fileRef.current?.click() }}
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
