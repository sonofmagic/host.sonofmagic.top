import process from 'node:process'
import Cloudflare from 'cloudflare'
import { config } from 'dotenv'
import fs from 'fs-extra'
import path from 'pathe'

async function getSql(name: string) {
  const sql = await fs.readFile(path.resolve(__dirname, `./sql/${name}`), 'utf8')
  return sql
}

let client: Cloudflare
function getClient() {
  if (client) {
    return client
  }
  client = new Cloudflare({
    apiEmail: process.env.CLOUDFLARE_EMAIL,
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
  })
  return client
}

async function query(name: string, params?: string[]) {
  const client = getClient()
  const res = await client.d1.database.query(process.env.CLOUDFLARE_DATABASE_ID!, {
    account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
    sql: await getSql(name),
    params,
  })
  return res
}

interface QueryResult {
  results?: Array<{ Domain: string, Ip: string }>
}
async function main() {
  config()
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
    hostList
      .map(
        x => `${x.ip} ${x.domain}`,
      )
      .concat(`\n# https://github.com/sonofmagic/cloudflare-workers`, `# ${iSOString}`)
      .join('\n'),
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
