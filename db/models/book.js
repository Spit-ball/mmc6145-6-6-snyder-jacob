import { Schema } from 'mongoose'

const bookSchema = new Schema({
  googleId: String,
  title: String,
  authors: [String],
  pageCount: Number,
  categories: [String],
  thumbnail: String,
  description: String,
  previewLink: String,
})

export default bookSchema