import type { JwtVariables } from 'hono/jwt'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { jwt, sign } from 'hono/jwt'

type Variables = JwtVariables
const app = new Hono<{ Bindings: Env, Variables: Variables }>()

app.use((c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
  })
  if (c.req.path.startsWith('/auth')) {
    return next()
  }
  else {
    return jwtMiddleware(c, next)
  }
})

app.post('/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  // todo
  const res = await c.env.DB.prepare('').bind([email, password]).run()
  const user = res.results[0]
  if (user) {
    const payload = {
      email,
      id: user.id,
    }
    const token = await sign(payload, c.env.JWT_SECRET)
    // c.header('Set-Cookie', `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`)
    return c.text(token)
  }
  else {
    throw new HTTPException(400, {
      message: 'User not found',
    })
  }

  // res.results[0]
})

app.get('/self', async (c) => {
  const payload = c.get('jwtPayload')
  return c.json(payload)
})

// https://crt.sh/?q=icebreaker.top
// https://github.com/LayeredStudio/dns-records
export default {
  fetch: app.fetch,
  // https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/
  // npx wrangler dev --test-scheduled
  // curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"

} satisfies ExportedHandler<Env>
