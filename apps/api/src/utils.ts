import bcrypt from 'bcryptjs'

export async function generateHash(password: string) {
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)
  return {
    salt,
    hash,
  }
}

export function compareHash(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}
