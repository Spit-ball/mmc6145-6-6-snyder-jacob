import { vi } from 'vitest'
import bookHandler from '../../../pages/api/book'
import { createRequest, createResponse } from 'node-mocks-http'
import bookSearchResults from '../../util/bookSearchContext.json'
import db from '../../../db'

describe('book API endpoints', () => {
  describe('POST /api/book', () => {
    it('should add book if user logged in', async () => {
      const book = bookSearchResults[0]
      vi.spyOn(db.book, 'add').mockImplementationOnce(vi.fn(async () => book))
      const req = createRequest({
        method: 'POST',
        body: JSON.stringify(book),
        session: {
          user: {
            id: 'myid',
            username: 'banana'
          }
        }
      })
      const res = createResponse()
      await bookHandler(req, res)
      expect(res.statusCode).toBe(200)
      expect(db.book.add).toHaveBeenCalledTimes(1)
      expect(db.book.add).toHaveBeenCalledWith('myid', book)
    })
    it('should return 401 if user not logged in (no req.session) ', async () => {
      const book = bookSearchResults[0]
      vi.spyOn(db.book, 'add').mockImplementationOnce(vi.fn(async () => null))
      const req = createRequest({
        method: 'POST',
        body: JSON.stringify(book),
        session: {
          // user: {
          //   id: 'myid',
          //   username: 'banana'
          // }
        }
      })
      const res = createResponse()
      await bookHandler(req, res)
      expect(res.statusCode).toBe(401)
      expect(db.book.add).not.toHaveBeenCalled()
    })
    it('should return 401 if user not found (db.book.add returns null) and destroy session', async () => {
      const book = bookSearchResults[0]
      vi.spyOn(db.book, 'add').mockImplementationOnce(vi.fn(async () => null))
      const req = createRequest({
        method: 'POST',
        body: JSON.stringify(book),
        session: {
          user: {
            id: 'myid',
            username: 'banana'
          },
          destroy: vi.fn()
        }
      })
      const res = createResponse()
      await bookHandler(req, res)
      expect(res.statusCode).toBe(401)
      expect(req.session.destroy).toHaveBeenCalledTimes(1)
    })
    it('should return 400 and JSON {error: error.message} when db.book.add throws an error', async () => {
      const book = bookSearchResults[0]
      vi.spyOn(db.book, 'add').mockImplementationOnce(vi.fn(async () => {
        throw new Error('oh no')
      }))
      const req = createRequest({
        method: 'POST',
        body: JSON.stringify(book),
        session: {
          user: {
            id: 'myid',
            username: 'banana'
          },
          destroy: vi.fn()
        }
      })
      const res = createResponse()
      await bookHandler(req, res)
      expect(res.statusCode).toBe(400)
      expect(res._getData()).toBe(JSON.stringify({error: 'oh no'}))
      expect(req.session.destroy).not.toHaveBeenCalled()
    })
  })
  describe('DELETE /api/book', () => {
    it('should remove book if user logged in', async () => {
      const book = {...bookSearchResults[0], id: 'bookid'}
      vi.spyOn(db.book, 'remove').mockImplementationOnce(vi.fn(async () => true))
      const req = createRequest({
        method: 'DELETE',
        body: JSON.stringify(book),
        session: {
          user: {
            id: 'myid',
            username: 'banana'
          }
        }
      })
      const res = createResponse()
      await bookHandler(req, res)
      expect(res.statusCode).toBe(200)
      expect(db.book.remove).toHaveBeenCalledTimes(1)
      expect(db.book.remove).toHaveBeenCalledWith('myid', 'bookid')
    })
    it('should return 401 if user not logged in (no req.session)', async () => {
      const book = {...bookSearchResults[0], id: 'bookid'}
      vi.spyOn(db.book, 'remove').mockImplementationOnce(vi.fn())
      const req = createRequest({
        method: 'DELETE',
        body: JSON.stringify(book),
        session: {
          // user: {
          //   id: 'myid',
          //   username: 'banana'
          // }
        }
      })
      const res = createResponse()
      await bookHandler(req, res)
      expect(res.statusCode).toBe(401)
      expect(db.book.remove).not.toHaveBeenCalled()
    })
    it('should return 401 if user not found (db.book.remove returns null) and destroy session', async () => {
      const book = {...bookSearchResults[0], id: 'bookid'}
      vi.spyOn(db.book, 'remove').mockImplementationOnce(vi.fn(async () => null))
      const req = createRequest({
        method: 'DELETE',
        body: JSON.stringify(book),
        session: {
          user: {
            id: 'myid',
            username: 'banana'
          },
          destroy: vi.fn()
        }
      })
      const res = createResponse()
      await bookHandler(req, res)
      expect(res.statusCode).toBe(401)
      expect(req.session.destroy).toHaveBeenCalledTimes(1)
    })
    it('should return 400 and JSON {error: error.message} when db.book.remove throws an error', async () => {
      const book = {...bookSearchResults[0], id: 'bookid'}
      vi.spyOn(db.book, 'remove').mockImplementationOnce(vi.fn(async () => {
        throw new Error('oh no')
      }))
      const req = createRequest({
        method: 'DELETE',
        body: JSON.stringify(book),
        session: {
          user: {
            id: 'myid',
            username: 'banana'
          },
          destroy: vi.fn()
        }
      })
      const res = createResponse()
      await bookHandler(req, res)
      expect(res.statusCode).toBe(400)
      expect(res._getData()).toBe(JSON.stringify({error: 'oh no'}))
      expect(req.session.destroy).not.toHaveBeenCalled()
    })
  })
})
