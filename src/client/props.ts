/**
 * 本地最小槽位 props 类型，替代 `@deepseek-ai/dsh-client-ui-slots` 的类型导入。
 *
 * ## 为什么不再从 ui-slots 导类型
 *
 * rc.2 的 web bundle seed 表移除了 `@deepseek-ai/dsh-client-ui-slots` 模块
 * （slots 服务改由 `dsh-client-ui-renderer` 的 SlotRegistry 提供，API 面不变）。
 * 类型导入虽被 esbuild 擦除、不影响运行时，但源码继续引用一个已出包表的
 * 模块会误导后续维护，也过不了干净的类型检查。此处按实际用到的 props
 * 形状本地声明（以 rc.2 SlotCore 的注入行为为准）。
 */

/** locale 槽位注入的翻译函数（LocaleFace.bind(NS) 产物）。 */
export type Translate<K extends string = string> = (key: K) => string

/** PropsLocale：插件词典命名空间下的翻译函数（泛型参数保留以兼容旧调用形态）。 */
export interface PropsLocale<_N extends string = string> {
  t: Translate
}

/** 会话作用域槽位（conversation.input.right 等）注入的运行时 props。 */
export interface SessionRuntimeProps {
  session: {
    running: boolean
    subagent: unknown
    [key: string]: unknown
  }
  input: {
    draft: string
    imageIds: readonly string[]
    [key: string]: unknown
  }
}

/**
 * PropsRuntime：按槽位名给到对应作用域的运行时 props。
 * - `conversation.input.left` / `settings.general.item`：根作用域，无附加运行时 props；
 * - `conversation.input.right`：会话作用域，附加 `session` / `input`。
 */
export type PropsRuntime<K extends string = string> = PropsLocale &
  (K extends 'conversation.input.right' ? SessionRuntimeProps : unknown)
