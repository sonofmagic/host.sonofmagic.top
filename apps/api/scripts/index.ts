import type { QueryResult } from '../src/types'
import fs from 'fs-extra'
import path from 'pathe'
import { query } from './utils'

async function main() {
  // await query('init.sql')
  // await query('upsert.sql', ['content.nuxt.com', '104.18.7.73'])
  // await query('upsert.sql', ['nuxt.com', '76.76.21.21'])
  const res = await query('list.sql') as QueryResult[]
  const hostList = res[0].results?.map((x) => {
    return {
      domain: x.Domain,
      ip: x.Ip,
    }
  }) ?? []
  const iSOString = new Date().toISOString()
  await fs.writeFile(
    path.resolve(__dirname, '../../cdn/public/index.html'),
    [
      '# https://github.com/sonofmagic/host.sonofmagic.top',
      '',
      ...hostList
        .map(
          x => `${x.ip} ${x.domain}`,
        ),
      '',
      `# ${iSOString}`,
    ].join('\n'),
  )
  await fs.writeJSON(
    path.resolve(__dirname, '../../cdn/public/index.json'),
    hostList,
    {
      spaces: 2,
    },
  )
}

main()
