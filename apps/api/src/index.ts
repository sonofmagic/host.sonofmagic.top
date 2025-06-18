import type { JwtVariables } from 'hono/jwt'
import { getFirstIpRecord, getSubDomains } from '@icebreakers/dns'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { jwt, sign } from 'hono/jwt'
import { dispatchAction } from './github'
import { scheduledTask } from './schedule'
import { UPSERT } from './sql'

type Variables = JwtVariables
const app = new Hono<{ Bindings: CloudflareBindings, Variables: Variables }>()

app.use((c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
  })
  if (c.req.path.startsWith('/auth')) {
    return next()
  }
  else {
    return jwtMiddleware(c, next)
  }
})

app.get('/add', async (ctx) => {
  const { env } = ctx
  const { name } = ctx.req.query()

  if (!name) {
    return ctx.text('No domain name provided')
  }

  const subDomains = await getSubDomains(name)
  const hosts: { domain: string, ip: string }[] = []

  // 等待所有 DNS 查询完成
  await Promise.allSettled(subDomains.map(async (domain) => {
    const firstIpRecord = await getFirstIpRecord(domain)
    if (firstIpRecord) {
      hosts.push({ domain, ip: firstIpRecord.data })
    }
  }))

  // 如果没有找到任何记录，提前返回
  if (hosts.length === 0) {
    return ctx.text('No valid DNS records found')
  }

  try {
    // 为每个 host 创建独立的 prepared statement
    const statements = hosts.map(host =>
      env.DB.prepare(UPSERT).bind(host.domain, host.ip),
    )

    // 执行批处理操作
    const results = await env.DB.batch(statements)

    // 可以添加结果验证
    const totalUpdated = results.reduce((sum, result) => sum + result.meta.changes, 0)

    return ctx.text(`Added ${name} and its subdomains. Updated ${totalUpdated} records.`)
  }
  catch (error) {
    // 错误处理
    console.error('Failed to update database:', error)
    return ctx.text('Failed to update database', 500)
  }
})

app.get('/scheduled', async (ctx) => {
  const tasks = await scheduledTask(ctx.env)
  return ctx.text(`${tasks.length}`)
})

app.post('/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  // todo
  const res = await c.env.DB.prepare('').bind([email, password]).run()
  const user = res.results[0]
  if (user) {
    const payload = {
      email,
      id: user.id,
    }
    const token = await sign(payload, c.env.JWT_SECRET)
    // c.header('Set-Cookie', `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`)
    return c.text(token)
  }
  else {
    throw new HTTPException(400, {
      message: 'User not found',
    })
  }

  // res.results[0]
})

app.get('/self', async (c) => {
  const payload = c.get('jwtPayload')
  return c.json(payload)
})

app.get('/deploy', async (c) => {
  const res = await dispatchAction({
    repo: c.env.GITHUB_REPO,
    token: c.env.GITHUB_TOKEN,
    user: c.env.GITHUB_USER,
  })
  const text = await res.text()
  return c.text(text)
})

// showRoutes(app, {
//   verbose: true,
// })

export default {
  fetch: app.fetch,
  // https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/
  // npx wrangler dev --test-scheduled
  // curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"
  scheduled(_event, env, ctx) {
    ctx.waitUntil(scheduledTask(env))
  },
} satisfies ExportedHandler<CloudflareBindings>
