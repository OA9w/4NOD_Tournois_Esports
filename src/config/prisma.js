import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/index.js'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const url = process.env.DATABASE_URL || 'file:./dev.db'
const adapter = new PrismaBetterSqlite3({ url })

const prisma = new PrismaClient({ adapter })
export default prisma
