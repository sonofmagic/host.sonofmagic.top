# 私有化部署

你需要先准备一个 `cloudflare` 和一个 `github` 账号

## 项目原理

```mermaid
flowchart TB
    subgraph Cloudflare 服务
    cdn["page(cdn)"]
    dns[dns]
    worker["worker
    边缘计算节点"]
    d1[d1数据库]@{shape: cyl}
    end
    subgraph Github
    github[action]
    end
    subgraph 用户组
    user[普通用户]
    admin["管理员"]
    end
    d1 --数据--> worker
    github --生成 host 文件部署--> cdn
    github --定期触发--> github
    worker -.手动触发.-> github
    worker --请求--> dns
    dns --返回ip--> worker
    worker --更新数据--> d1
    user --请求--> cdn
    cdn --返回数据--> user
    d1 --获取数据--> github
    admin --jwt认证--> worker
    worker --定期触发获取最新ip更新d1--> worker
```

## 目录结构

- apps (应用目录)
  - api (cloudflare worker 代码)
  - cdn (cdn 静态资源, 用来部署 host 文件)
  - docs (本文档，可忽略)
  - mgmt (管理后台，可忽略)

## 部署

简单点说就是，直接 `fork` 这个项目，然后填充环境变量，即可部署

其中你只需要在 `Cloudflare` 上创建对应的 `Pages` 资源即可

其余的部分可交给 `wrangler` 进行处理和部署
