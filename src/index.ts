/**
 * dsh-mobile-composer，主机侧半。纯客户端 UI 插件：空 apply 的存在只是让插件
 * 出现在 host cordis.yml / Loader；浏览器半边通过 exports["./client"] 发货，
 * 经 package.json 的 dsh.client 声明被发现。
 *
 * ## rc.2 设置模型（0.1.7 起）
 *
 * 插件的 `Config` schema（schemastery）**就是**本 entry 的设置页：Host 按
 * profile entry 的 Config 派生 form，经共享 configuration forms 面服务。
 * 字段必须是 `volatile()`——这既让它出现在设置页，也让修改免重启直达运行实例
 * （loader 把新值提交进字段引用并在 fiber 上广播 `loader/volatile-update`）。
 * 客户端按 `debugLog` 字段归属绑定（见 `src/client/forms-reader.ts`）。
 */
import z from '@deepseek-ai/schemastery'

/** 插件配置域。 */
export interface MobileComposerConfig {
  /** 是否启用浮动调试日志面板；缺省 false。 */
  debugLog?: boolean
}

/** 设置 schema；Host 据此派生本 entry 的设置页 form（volatile 修饰见类注释）。 */
export const Config = z.object({
  debugLog: z.boolean().default(false).volatile(),
})

export function apply(): void {}
