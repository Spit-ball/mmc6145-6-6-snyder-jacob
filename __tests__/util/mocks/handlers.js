import { rest } from 'msw'
import bookSearchData from './bookSearchResults.json'
import { vi } from 'vitest'

const bookSearchDataNoResults = {
  kind: "books#volumes",
  totalItems: 0
}

export const getBookHandler = vi.fn((req, res, ctx) => {
  if(req.url.searchParams.get('q') === 'conan')
    return res(ctx.status(200), ctx.json(bookSearchData))
  return res(ctx.status(200), ctx.json(bookSearchDataNoResults))
})

export const addBookHandler = vi.fn((req, res, ctx) => {
  return res(ctx.status(200), ctx.json({}))
})

export const removeBookHandler = vi.fn((req, res, ctx) => {
  return res(ctx.status(200), ctx.json({}))
})

export const loginHandler = vi.fn((req, res, ctx) => {
  return res(ctx.status(200), ctx.json({}))
})

export const signupHandler = vi.fn((req, res, ctx) => {
  return res(ctx.status(200), ctx.json({}))
})

export const logoutHandler = vi.fn((req, res, ctx) => {
  return res(ctx.status(200), ctx.json({}))
})

export const handlers = [
  rest.get('https://www.googleapis.com/books/v1/volumes', getBookHandler),
  rest.post(window.location.origin + '/api/book', addBookHandler),
  rest.delete(window.location.origin + '/api/book', removeBookHandler),
  rest.post(window.location.origin + '/api/auth/login', loginHandler),
  rest.post(window.location.origin + '/api/auth/logout', logoutHandler),
  rest.post(window.location.origin + '/api/auth/signup', signupHandler),
]
