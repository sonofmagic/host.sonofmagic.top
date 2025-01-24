import type { DnsRecord } from './types'
import { dnsRecordsCloudflare, dnsRecordsGoogle } from './dns-resolvers'
import { isDomain } from './utils'

function bestDnsResolverForThisRuntime(): string {
  // @ts-ignore
  if (globalThis.navigator?.userAgent === 'Cloudflare-Workers') {
    return 'cloudflare-dns'
  }
  else {
    return 'google-dns'
  }
  // return 'google-dns'
}

export async function getDnsRecords(name: string, type: string = 'A', resolver?: string): Promise<DnsRecord[]> {
  if (!isDomain(name)) {
    throw new Error(`"${name}" is not a valid domain name`)
  }

  if (!resolver) {
    resolver = bestDnsResolverForThisRuntime()
  }

  if (resolver === 'cloudflare-dns') {
    return dnsRecordsCloudflare(name, type)
  }
  else if (resolver === 'google-dns') {
    return dnsRecordsGoogle(name, type)
  }
  else if (resolver === 'deno-dns') {
    throw new Error('Deno DNS not yet implemented')
  }

  throw new Error(`Invalid DNS resolver: ${resolver}`)
}

export async function getFirstIpRecord(name: string) {
  const records = await getDnsRecords(
    name,
  )
  const firstIpRecord = records
    .find(x => x.type === 'A')
  return firstIpRecord
}

export const HostTextCacheKey = 'index'

export async function setHostText(env: CloudflareBindings, event?: ScheduledController) {
  const domains = await env.domains.list()
  const allSettled = await Promise.allSettled(
    domains.keys.map(async ({ name }) => {
      const firstIpRecord = await getFirstIpRecord(name)

      if (firstIpRecord) {
        await env.domains.put(name, firstIpRecord.data)
        return {
          ip: firstIpRecord.data,
          domain: name,
        }
      }
      throw new Error(`No A record found for ${name}`)
    }),
  )
  const iSOString = new Date().toISOString()
  await env.host.put(
    HostTextCacheKey,
    allSettled
      .filter(
        x => x.status === 'fulfilled',
      )
      .map(
        x => x.value,
      )
      .filter(x => x.ip)
      .map(
        x => `${x.ip} ${x.domain}`,
      )
      .concat(`\n# ${iSOString}`)
      .join('\n'),
  )

  await env.host.put('trigger', event ? 'scheduled' : 'manual')
  await env.host.put('last_updated', iSOString)
  return {
    allSettled,
  }
}
