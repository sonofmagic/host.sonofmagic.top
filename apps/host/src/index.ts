import type { JwtVariables } from 'hono/jwt'
import { Hono } from 'hono'
import { showRoutes } from 'hono/dev'
import { HTTPException } from 'hono/http-exception'
import { sign } from 'hono/jwt'
import { getFirstIpRecord } from './get-dns-records'
import { scheduledTask } from './schedule'
import { jwt } from './simple-jwt'
import { UPSERT } from './sql'

type Variables = JwtVariables
const app = new Hono<{ Bindings: CloudflareBindings, Variables: Variables }>()

app.use('/*', async (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
  })
  if (c.req.path.startsWith('/auth')) {
    return await next()
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

  const firstIpRecord = await getFirstIpRecord(name)
  if (firstIpRecord) {
    await env.DB.prepare(UPSERT).bind(name, firstIpRecord.data).run()
  }

  return ctx.text(`Added ${name}, Ip: ${firstIpRecord?.data}`)
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
    c.header('Set-Cookie', `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`)
    return c.text('Login successful')
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

showRoutes(app, {
  verbose: true,
})

export default {
  fetch: app.fetch,
  // https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/
  // npx wrangler dev --test-scheduled
  // curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"
  scheduled(_event, env, ctx) {
    ctx.waitUntil(scheduledTask(env))
  },
} satisfies ExportedHandler<CloudflareBindings>
