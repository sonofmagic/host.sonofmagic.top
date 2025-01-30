# 常见问题

## 为什么不直接使用 `cloudflare worker` 来返回 `host` 呢？

因为 `cloudflare worker` 每天有限制请求的次数，可能会被击穿影响服务

所以不如使用 `cloudflare page` 然后动态生成 `host` 再同步到全世界

## 为什么不使用定时任务触发器和 fs 来生成 host, 反而要绕远路重新部署 cdn 呢？

因为 `cloudflare worker` 不是标准的 nodejs 环境，很多 API 是用不了的，比如 fs

https://developers.cloudflare.com/workers/runtime-apis/nodejs/

另外，即使是使用 nodejs 环境，成功利用定时触发器，去动态生成了 host 文件。

那也得考虑 `api 网关` 的请求次数计费，这肯定没有免费的香。

所以，这是由于环境导致的问题，假如是一个服务器的 nodejs 环境，根本不需要做这样的处理。
