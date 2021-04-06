export * from './src/db.js' // eslint-disable-line import/export
import {createdb as createDatascriptDB} from './src/db.js'

// data in MemStore won't get write to disk
const MemStore = new Map()

const PASSWORD = Symbol('password')
const LOCKED = Symbol('locked')

// eslint-disable-next-line import/export
export const createdb = (...args) => {
  const conn = createDatascriptDB(...args)
  conn.setPassword = p => MemStore.set(PASSWORD, p)
  conn.getPassword = () => MemStore.get(PASSWORD)
  conn.deletePassword = () => MemStore.delete(PASSWORD)

  conn.setLocked = p => MemStore.set(LOCKED, p)
  conn.getLocked = () => MemStore.get(LOCKED)
  conn.deleteLocked = () => MemStore.delete(LOCKED)

  return conn
}
