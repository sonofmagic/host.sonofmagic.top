import process from 'node:process'
import { config } from 'dotenv'
import { sign } from 'hono/jwt'

config()

const payload = {
  sub: 'user',
  role: 'admin',
  exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365 * 3, // three years
}
const secret = process.env.JWT_SECRET!

async function main() {
  const token = await sign(payload, secret)
  console.log(token)
}

main()
