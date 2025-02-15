import { getSubDomains } from '@/get-sub-domains'
import { isCI } from 'ci-info'

describe.skipIf(isCI)('get-sub-domains', () => {
  it('sonofmagic.top', async () => {
    const subDomains = await getSubDomains('sonofmagic.top')
    expect(subDomains).toMatchSnapshot()
  })
})
