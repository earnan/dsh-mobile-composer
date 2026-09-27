/**
 * 本地最小槽位 props 类型，替代 `@deepseek-ai/dsh-client-ui-slots` 的类型导入。
 *
 * ## 为什么不再从 ui-slots 导类型
 *
 * rc.2 的 web bundle seed 表移除了 `@deepseek-ai/dsh-client-ui-slots` 模块
 * （slots 服务改由 `dsh-client-ui-renderer` 的 SlotRegistry 提供，API 面不变）。
 * 类型导入虽被 esbuild 擦除、不影响运行时，但源码继续引用一个已出包表的
 * 模块会误导后续维护，也过不了干净的类型检查。此处按实际用到的 props
 * 形状本地声明（以 rc.2 的槽位契约与作用域适配器注入行为为准）。
 */

/** locale 槽位注入的翻译函数（LocaleFace.bind(NS) 产物）。 */
export type Translate<K extends string = string> = (key: K) => string

/** PropsLocale：插件词典命名空间下的翻译函数（泛型参数保留以兼容旧调用形态）。 */
export interface PropsLocale<_N extends string = string> {
  t: Translate
}

/**
 * 标准选择器钩子（rc.2 `@deepseek-ai/dsh-client-store` 契约）。
 * 选中值缺席由源自身表达，钩子调用点始终稳定。
 */
export type SnapshotSelectorHook<T> = <S>(sel: (s: T) => S, eq?: (a: S, b: S) => boolean) => S

/** 会话快照中本插件用到的字段（`dsh-api-session-controller` 的 SessionSnapshot 子集）。 */
export interface SessionSnapshotLite {
  readonly running: boolean
  readonly subagent: unknown
}

/** 输入区状态中本插件用到的字段（ui-conversation 的 InputState 子集）。 */
export interface InputStateLite {
  readonly draft: string
  readonly attachmentIds: readonly string[]
}

/**
 * 会话作用域槽位的**标准套件**（`conversation.input.*` 等）。
 *
 * ⚠️ rc.2 不再向槽位注入 `{session, input}` 平铺对象：只有声明
 * `owner: InputZone` 的槽位（如 `conversation.input.dock`）才由 owner 传入该对象；
 * `conversation.input.right` 的 `ownerProps` 为空，会话态数据只能经
 * `useSession` / `useInput` 钩子读取，动作经 `inputActions` 平铺 prop 触达。
 * 详见知识库 `dsh/rc2-slot-owner-contract-input-zone.md`。
 */
export interface SessionComposerRuntimeProps {
  useSession: SnapshotSelectorHook<SessionSnapshotLite>
  useInput: SnapshotSelectorHook<InputStateLite>
  inputActions: {
    submit: () => void
    setDraft: (text: string) => void
  }
}

/**
 * PropsRuntime：按槽位名给到对应作用域的运行时 props。
 * - `conversation.input.left` / `settings.general.item`：根作用域，无附加运行时 props；
 * - `conversation.input.right`：会话作用域标准套件（钩子 + `inputActions`）。
 */
export type PropsRuntime<K extends string = string> = PropsLocale &
  (K extends 'conversation.input.right' ? SessionComposerRuntimeProps : unknown)
