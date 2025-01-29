import process from 'node:process'
import Cloudflare from 'cloudflare'
import { config } from 'dotenv'
import fs from 'fs-extra'
import path from 'pathe'

config()

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

export async function query(name: string, params?: string[]) {
  const client = getClient()
  const res = await client.d1.database.query(process.env.CLOUDFLARE_DATABASE_ID!, {
    account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
    sql: await getSql(name),
    params,
  })
  return res
}
