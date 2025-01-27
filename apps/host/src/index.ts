import { Hono } from 'hono'
import { showRoutes } from 'hono/dev'
import { getFirstIpRecord } from './get-dns-records'
import { UPSERT } from './sql'

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

// app.get('/scheduled', async (ctx) => {

// })

showRoutes(app, {
  verbose: true,
})

export default {
  fetch: app.fetch,
  // async scheduled(event, env, ctx) {

  // },
} satisfies ExportedHandler<CloudflareBindings>
