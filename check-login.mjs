import bcrypt from 'bcrypt'
import prisma from './src/config/prisma.js'

const email = 'admin@esport.test'
const pass = 'admin1234'

const user = await prisma.user.findUnique({ where: { email } })
console.log('user found:', !!user)
console.log('hash starts with:', user?.password?.slice(0, 7))
console.log('bcrypt compare:', user ? await bcrypt.compare(pass, user.password) : false)

await prisma.$disconnect()
