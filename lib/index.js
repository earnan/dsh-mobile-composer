/**
 * dsh-mobile-composer，主机侧半（rc.2 构建产物，与 src/index.ts 保持一致）。
 * Config schema 即本 entry 的设置页（Host 按 profile entry 的 Config 派生 form，
 * 经共享 configuration forms 服务）；浏览器半边通过 exports["./client"] 发货。
 */
import z from '@deepseek-ai/schemastery'

/** 设置 schema；debugLog 必须 volatile()（上设置页 + 免重启直达运行实例）。 */
export const Config = z.object({
	debugLog: z.boolean().default(false).volatile()
});

export function apply() {}
