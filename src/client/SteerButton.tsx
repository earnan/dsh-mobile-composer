import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { NS } from './locales.ts'

/** 由 apply 注入：把当前草稿以 steer（插话）模式提交进运行中的回合。 */
export interface SteerInjected {
  steer: () => void
}

export type SteerButtonProps =
  PropsRuntime<'conversation.input.right'>
  & PropsLocale<typeof NS>
  & SteerInjected

/**
 * 「插话发送」按钮，挂在 conversation.input.right 槽位（发送按钮左侧）。
 * 仅在运行中（running && 无子代理）时渲染——此时官方主按钮被「停止」占据，
 * 回车又被改成纯换行，此按钮恢复「桌面端运行中回车」的 steer 手势。
 * 桌面端由 CSS 隐藏（运行中回车本就 steer）。
 */
export function SteerButton({ session, input, steer, t }: SteerButtonProps) {
  if (!session.running || session.subagent !== null) return null
  const empty = input.draft.trim() === '' && input.imageIds.length === 0
  return (
    <button
      type="button"
      data-mobile-composer="steer"
      aria-label={t('steer')}
      title={t('steer')}
      disabled={empty}
      onClick={steer}
    >
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <path
          d="M8.3125 0.98c.355.073.667.224.95.452.225.181.468.426.717.675l4.728 4.728-1.414 1.414L9 3.956v11.086H7V3.956L2.707 8.248 1.293 6.835l4.728-4.728c.249-.249.492-.404.717-.563.239-.192.547-.388.95-.452.209-.033.415-.025.624 0Z"
          fill="currentColor"
        />
      </svg>
    </button>
  )
}
