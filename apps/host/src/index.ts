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
    await setHostText(env)
  }

  return ctx.text(`Added ${name}, Ip: ${firstIpRecord?.data}`)
})

async function clearKV(namespace: KVNamespace<string>) {
  const list = await namespace.list()
  await Promise.all(list.keys.map((x) => {
    return namespace.delete(x.name)
  }))
  return {
    count: list.keys.length,
  }
}

app.get('/clear', async (ctx) => {
  const { count: domainsCount } = await clearKV(ctx.env.domains)
  const { count: hostCount } = await clearKV(ctx.env.host)
  return ctx.text(`clear all domains:${domainsCount}\nclear all host:${hostCount}`)
})

app.get('/scheduled', async (ctx) => {
  const { env } = ctx

  const { allSettled } = await setHostText(env)
  const fulfilled = allSettled.filter(x => x.status === 'fulfilled').length
  return ctx.json(
    {
      fulfilled,
      rejected: allSettled.length - fulfilled,
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
