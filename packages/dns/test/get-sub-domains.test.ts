import { isCI } from 'ci-info'
import { getSubDomains } from '@/get-sub-domains'

describe.skipIf(isCI)('get-sub-domains', () => {
  it('sonofmagic.top', async () => {
    const subDomains = await getSubDomains('sonofmagic.top')
    expect(subDomains.sort()).toMatchSnapshot()
  })
})
