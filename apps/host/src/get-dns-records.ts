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

/**
 * Get DNS records of a given type for a FQDN.
 *
 * @param name Fully qualified domain name.
 * @param type DNS record type: A, AAAA, TXT, CNAME, MX, etc.
 * @param resolver Which DNS resolver to use. If not specified, the best DNS resolver for this runtime will be used.
 * @returns Array of discovered `DnsRecord` objects.
 *
 * @example Get TXT records for example.com
 * ```js
 * import { getDnsRecords } from '@layered/dns-records'
 *
 * const txtRecords = await getDnsRecords('example.com', 'TXT')
 * ```
 *
 * @example Get MX records for android.com from Google DNS resolver
 * ```js
 * import { getDnsRecords } from '@layered/dns-records'
 *
 * const mxRecords = await getDnsRecords('android.com', 'MX', 'google-dns')
 * ```
 */
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
