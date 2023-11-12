import User from '../models/user'
import { normalizeId, dbConnect } from './util'

export async function getAll(userId) {
  await dbConnect()
  const user = await User.findById(userId).lean()
  if (!user) return null
  return user.favoriteBooks.map(book => normalizeId(book))
}

export async function getByGoogleId(userId, bookId) {
  await dbConnect()
  const user = await User.findById(userId).lean()
  if (!user) return null
  const book = user.favoriteBooks.find(book => book.googleId === bookId)
  if (book) return normalizeId(book)
  return null
}

export async function add(userId, book) {
  await dbConnect()
  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { favoriteBooks: book } },
    { new: true }
  )
  if (!user) return null
  const addedBook = user.favoriteBooks.find(bk => bk.googleId === book.googleId)
  return normalizeId(addedBook)
}

export async function remove(userId, bookId) {
  await dbConnect()
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { favoriteBooks: {_id: bookId } } },
    { new: true }
  )
  if (!user) return null
  return true
}