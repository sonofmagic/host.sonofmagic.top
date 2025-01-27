import { Hono } from 'hono'
import { showRoutes } from 'hono/dev'
import { getFirstIpRecord } from './get-dns-records'
import { GET_TABLE, UPSERT } from './sql'

const app = new Hono<{ Bindings: CloudflareBindings }>()

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

showRoutes(app, {
  verbose: true,
})

export default {
  fetch: app.fetch,
  async scheduled(_event, env, ctx) {
    const res = await env.DB.prepare(GET_TABLE).run()
    const hostList = (res).results?.map((x) => {
      return {
        domain: x.Domain as string,
        ip: x.Ip,
      }
    }) ?? []
    const p = Promise.allSettled(hostList.map(async (x) => {
      const firstIpRecord = await getFirstIpRecord(x.domain)
      if (firstIpRecord) {
        await env.DB.prepare(UPSERT).bind(x.domain, firstIpRecord.data).run()
      }
    }))
    ctx.waitUntil(p)
  },
} satisfies ExportedHandler<CloudflareBindings>
