import { compare } from 'bcrypt'
import User from '../models/user'
import { normalizeId, dbConnect } from './util'

export async function login(username, password) {
  if (!(username && password))
    throw new Error('Must include username and password')

  await dbConnect()
  const user = await User.findOne({username}).lean()

  if (!user)
    throw new Error('User not found')

  const isPasswordCorrect= await compare(password, user.password)

  if (!isPasswordCorrect)
    throw new Error('Password is incorrect')

  return normalizeId(user)
}