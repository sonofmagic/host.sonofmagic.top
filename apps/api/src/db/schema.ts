import { numeric, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const map = sqliteTable('MAP', {
  domain: text('Domain').primaryKey(),
  ip: text('Ip'),
})

export const user = sqliteTable('USERS', {
  id: text('Id').primaryKey(),
  name: text('Name'),
  email: text('Email'),
  password: text('Password'),
  salt: text('Salt'),
  createdAt: numeric('CreatedAt'),
  updatedAt: numeric('UpdatedAt'),
})
