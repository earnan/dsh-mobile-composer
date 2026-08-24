/**
 * dsh-mobile-composer，主机侧半。纯客户端 UI 插件：空 apply 的存在只是让插件
 * 出现在 host cordis.yml / Loader；浏览器半边通过 exports["./client"] 发货，
 * 经 package.json 的 dsh.client 声明被发现。
 */
export function apply(): void {}
