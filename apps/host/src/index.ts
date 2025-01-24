import { Hono } from 'hono'
import { showRoutes } from 'hono/dev'
import { getFirstIpRecord, HostTextCacheKey, setHostText } from './get-dns-records'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.get('/', async (ctx) => {
  const { env } = ctx
  const hostText = await env.host.get(HostTextCacheKey)
  return ctx.text(hostText || '# No host text')
})

app.get('/add', async (ctx) => {
  const { env } = ctx
  const { name } = ctx.req.query()
  if (!name) {
    return ctx.text('No domain name provided')
  }

  const firstIpRecord = await getFirstIpRecord(name)
  if (firstIpRecord) {
    await env.domains.put(name, firstIpRecord.data)
  }

  return ctx.text(`Added ${name}, Ip: ${firstIpRecord?.data}`)
})

app.get('/clear', async (ctx) => {
  const domains = await ctx.env.domains.list()
  await Promise.all(domains.keys.map((x) => {
    return ctx.env.domains.delete(x.name)
  }))

  return ctx.text(`clear all ${domains.keys.length}`)
})

app.get('/scheduled', async (ctx) => {
  const { env } = ctx
  const { allSettled } = await setHostText(env)
  return ctx.json(
    {
      fulfilled: allSettled.filter(x => x.status === 'fulfilled').length,
      rejected: allSettled.filter(x => x.status === 'rejected').length,
    },
  )
})

showRoutes(app, {
  verbose: true,
})

export default {
  fetch: app.fetch,
  async scheduled(event, env, ctx) {
    ctx.waitUntil(setHostText(env, event))
  },
} satisfies ExportedHandler<CloudflareBindings>
