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
