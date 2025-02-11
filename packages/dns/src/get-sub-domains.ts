interface Cert {
  issuer_ca_id: number
  issuer_name: string
  common_name: string
  name_value: string
  id: number
  entry_timestamp: string
  not_before: string
  not_after: string
  serial_number: string
  result_count: number
}

export async function getSubDomains(domain: string): Promise<string[]> {
  const url = `https://crt.sh/?q=%25.${domain}&output=json`
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch subdomains for ${domain}: ${response.statusText}`)
    }
    const data = await response.json()
    const subDomains = data.reduce((acc: string[], cert: Cert) => {
      const subDomain = cert.name_value.split('\n')
      subDomain.forEach((domain) => {
        const originDomain = domain.replace(`*.`, '')
        if (!acc.includes(originDomain)) {
          acc.push(originDomain)
        }
      })
      return acc
    }, [])
    return subDomains
  }
  catch (error) {
    console.error(error)
    return []
  }
}
