/** DNS Record object, with type, ttl and value */
export interface DnsRecord {
  /** Fully qualified domain name (example.com, mail.google.com, analytics.x.com) */
  name: string
  /** Record type: A, AAAA, CNAME, MX, TXT, etc. */
  type: string
  /** Time to live (in seconds) for this record */
  ttl: number
  /** Record data: IP for A or AAAA, fqdn for CNAME, etc */
  data: string
}

export interface HostKV {
  ip: string
  domain: string
}

export interface QueryResult {
  results?: Array<{ Domain: string, Ip: string }>
}
