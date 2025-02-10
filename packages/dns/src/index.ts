import type { DnsRecord } from './types'
import { getDnsRecords, getFirstIpRecord } from './get-dns-records'
import { getSubDomains } from './get-sub-domains'

export {
  getDnsRecords,
  getFirstIpRecord,
  getSubDomains,
}

export type {
  DnsRecord,
}
