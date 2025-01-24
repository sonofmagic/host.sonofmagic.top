import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { getDnsRecords } from './get-dns-records'

const app = new Hono<{ Bindings: CloudflareBindings }>()

export interface HostKV {
  ip: string
  domain: string
}

app.get('/', async (ctx) => {
  const domains = await ctx.env.domains.list()
  const allSettled = await Promise.allSettled(
    domains.keys.reduce<Promise<HostKV>[]>((acc, { name }) => {
      acc.push(
        new Promise<HostKV>((resolve, reject) => {
          getDnsRecords(
            name,
          ).then(
            (records) => {
              const firstIpRecord = records
                .find(x => x.type === 'A')
              if (firstIpRecord) {
                resolve({
                  ip: firstIpRecord.data,
                  domain: name,
                })
              }
              else {
                reject(new Error(`No A record found for ${name}`))
              }
            },
          ).catch(reject)
        }),
      )
      return acc
    }, []),
  )
  if (allSettled.every(x => x.status === 'fulfilled')) {
    return ctx.text(
      allSettled.filter(x => x.status === 'fulfilled').map(x => x.value).map(x => `${x.ip} ${x.domain}`).join('\n'),
    )
  }
  throw new HTTPException(400, {
    message: allSettled.filter(x => x.status === 'rejected').map(x => x.reason).join('\n'),
  })
})

app.get('/add', async (ctx) => {
  const { url } = ctx.req.query()
  if (!url) {
    return ctx.text('No url provided')
  }
  ctx.env.domains.put(url, '')
  return ctx.text(`Added ${url}`)
})

export default app
