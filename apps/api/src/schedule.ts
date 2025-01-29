import { getFirstIpRecord } from '@icebreakers/dns'
import { GET_TABLE, UPSERT } from './sql'

export async function scheduledTask(env: CloudflareBindings) {
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
  return p
}
