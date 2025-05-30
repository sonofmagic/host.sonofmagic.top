import { domainToASCII } from 'node:url'

export function isTld(tld: string): boolean {
  if (tld.startsWith('.')) {
    tld = tld.substring(1)
  }

  return /^(?:[a-z]{2,64}|xn[a-z0-9-]{5,})$/i.test(domainToASCII(tld))
}

/**
 * Basic check to test if a string is a valid domain name.
 *
 * @param domain Fully qualified domain name.
 * @returns True if the string is a valid format for a domain name
 */
export function isDomain(domain: string): boolean {
  if (domain.endsWith('.')) {
    domain = domain.substring(0, domain.length - 1)
  }

  const labels = domainToASCII(domain).split('.').reverse()
  const labelTest = /^(?:[\w-]{1,64}|xn[a-z0-9-]{5,})$/i

  return labels.length > 1 && labels.every((label, index) => {
    return index ? !label.startsWith('-') && !label.endsWith('-') && labelTest.test(label) : isTld(label)
  })
}
