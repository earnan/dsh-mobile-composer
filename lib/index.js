/**
 * dsh-mobile-composer，主机侧半。注册「调试日志」设置命名空间；
 * 浏览器半边通过 exports["./client"] 发货（package.json dsh.client 声明发现）。
 */
import z from '@deepseek-ai/schemastery'

const NS = 'mobile-composer'
const SCHEMA = z.object({ debugLog: z.boolean().required(false) })

/**
 * Host 侧 apply：当 settings 服务可用时注册命名空间（client 经 settingsScope 绑定读写）。
 * @param ctx - Host 上下文。
 */
export function apply(ctx) {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(NS, SCHEMA)
  })
}
