import type { DnsRecord } from './types'
import { domainToASCII } from 'node:url'

const dnsTypeNumbers: { [key: number]: string } = {
  1: 'A',
  2: 'NS',
  5: 'CNAME',
  6: 'SOA',
  12: 'PTR',
  15: 'MX',
  16: 'TXT',
  24: 'SIG',
  25: 'KEY',
  28: 'AAAA',
  33: 'SRV',
  257: 'CAA',
}

function prepareDnsRecord(record: DnsRecord): DnsRecord {
  if (record.name.endsWith('.')) {
    record.name = record.name.slice(0, -1)
  }

  if (['CNAME', 'NS'].includes(record.type) && record.data.endsWith('.')) {
    record.data = record.data.slice(0, -1)
  }

  return record
}
// https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/make-api-requests/
// https://cloudflare-dns.com/dns-query?name=icebreaker.top&type=A
// https://github.com/cloudflare/workers-sdk/issues/7835
export async function dnsRecordsCloudflare(name: string, type: string = 'A'): Promise<DnsRecord[]> {
  const re = await fetch(`https://cloudflare-dns.com/dns-query?name=${domainToASCII(name)}&type=${type}`, {
    headers: {
      accept: 'application/dns-json',
    },
  })

  if (!re.ok) {
    throw new Error(`Error fetching DNS records for ${name}: ${re.status} ${re.statusText}`)
  }

  const json: any = await re.json()
  const records: DnsRecord[] = (json.Answer || json.Authority || []).map((record: any) => {
    const type = dnsTypeNumbers[record.type] || String(record.type)

    return prepareDnsRecord({ name: record.name, type, ttl: record.TTL, data: record.data })
  })

  return records
}

export async function dnsRecordsGoogle(name: string, type: string = 'A'): Promise<DnsRecord[]> {
  const re = await fetch(`https://dns.google/resolve?name=${domainToASCII(name)}&type=${type}`)

  if (!re.ok) {
    throw new Error(`Error fetching DNS records for ${name}: ${re.status} ${re.statusText}`)
  }

  const json: any = await re.json()
  const records: DnsRecord[] = (json.Answer || json.Authority || []).map((record: any) => {
    return prepareDnsRecord({
      name: record.name,
      type: dnsTypeNumbers[record.type] || String(record.type),
      ttl: record.TTL,
      data: record.data,
    })
  })

  return records
}
