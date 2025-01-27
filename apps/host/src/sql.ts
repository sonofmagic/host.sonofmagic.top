export const GET_TABLE = `SELECT Domain,
  Ip
FROM MAP;`

export const UPSERT = `INSERT
  OR REPLACE INTO MAP (Domain, Ip)
VALUES (?, ?)`
