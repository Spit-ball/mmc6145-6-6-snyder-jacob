import { vi } from 'vitest'
import authHandler from '../../../pages/api/auth/[action]'
import { createRequest, createResponse } from 'node-mocks-http'
import db from '../../../db'

describe('auth API endpoints', () => {
  it('should return 404 if /api/[action] is not login, logout, or signup', async () => {
    vi.spyOn(db.auth, 'login').mockImplementationOnce(vi.fn())
    vi.spyOn(db.user, 'create').mockImplementationOnce(vi.fn())
    const req = createRequest({
      method: "POST",
      query: {action: "banana"},
      session: {
        destroy: vi.fn(),
        save: vi.fn()
      }
    })
    const res = createResponse()
    await authHandler(req, res)
    expect(res.statusCode).toBe(404)
    expect(db.auth.login).not.toHaveBeenCalled()
    expect(db.user.create).not.toHaveBeenCalled()
    expect(req.session.save).not.toHaveBeenCalled()
    expect(req.session.destroy).not.toHaveBeenCalled()
  })
  describe('POST /api/logout', () => {
    it('should return 404 if method is not POST', async () => {
      const req = createRequest({
        method: "GET",
        query: {action: "logout"},
      })
      const res = createResponse()
      await authHandler(req, res)
      expect(res.statusCode).toBe(404)
    })
    it('should return 200 and destroy the session', async () => {
      const req = createRequest({
        method: "POST",
        query: {action: "logout"},
        session: {
          save: vi.fn(),
          destroy: vi.fn()
        }
      })
      const res = createResponse()
      await authHandler(req, res)
      expect(res.statusCode).toBe(200)
      expect(req.session.destroy).toHaveBeenCalledTimes(1)
      expect(req.session.save).not.toHaveBeenCalled()
    })
  })
  describe('POST /api/signup', () => {
    it('should return 404 if method is not POST', async () => {
      vi.spyOn(db.user, 'create').mockImplementationOnce(vi.fn())
      const req = createRequest({
        method: "GET",
        query: {action: "signup"},
      })
      const res = createResponse()
      await authHandler(req, res)
      expect(res.statusCode).toBe(404)
      expect(db.user.create).not.toHaveBeenCalled()
    })
    it('should redirect to /search with successful signup', async () => {
      vi.spyOn(db.user, 'create')
        .mockImplementationOnce(vi.fn(async () => ({username: "banana", id: "myid"})))
      const req = createRequest({
        method: "POST",
        query: {action: "signup"},
        session: {
          save: vi.fn(),
          destroy: vi.fn()
        }
      })
      const res = createResponse()
      await authHandler(req, res)
      expect(res.statusCode).toBe(302)
      expect(res._getRedirectUrl()).toBe('/search')
    })
    it('should create user and save username/id to session/log user in with successful signup', async () => {
      vi.spyOn(db.user, 'create')
        .mockImplementationOnce(vi.fn(async () => ({username: "banana", id: "myid"})))
      const req = createRequest({
        method: "POST",
        query: {action: "signup"},
        session: {
          save: vi.fn(),
          destroy: vi.fn()
        }
      })
      const res = createResponse()
      await authHandler(req, res)
      expect(db.user.create).toHaveBeenCalledTimes(1)
      expect(req.session.save).toHaveBeenCalledTimes(1)
      expect(req.session).toHaveProperty('user', {username: "banana", id: "myid"})
    })
    it('should return 400 with {error: error.message} if db.user.create throws an error', async () => {
      vi.spyOn(db.user, 'create')
        .mockImplementationOnce(vi.fn(async () => {
          throw new Error('oh no!')
        }))
      const req = createRequest({
        method: "POST",
        query: {action: "signup"},
        session: {
          save: vi.fn(),
          destroy: vi.fn()
        }
      })
      const res = createResponse()
      await authHandler(req, res)
      expect(res.statusCode).toBe(400)
      expect(res._getData()).toBe(JSON.stringify({error: 'oh no!'}))
      expect(db.user.create).toHaveBeenCalledTimes(1)
      expect(req.session.save).not.toHaveBeenCalled()
      expect(req.session).not.toHaveProperty('user', {username: "banana", id: "myid"})
    })
  })
  describe('POST /api/login', () => {
    it('should return 404 if method is not POST', async () => {
      vi.spyOn(db.auth, 'login').mockImplementationOnce(vi.fn())
      const req = createRequest({
        method: "GET",
        query: {action: "login"},
      })
      const res = createResponse()
      await authHandler(req, res)
      expect(res.statusCode).toBe(404)
      expect(db.auth.login).not.toHaveBeenCalled()
    })
    it('should return 400 when db.auth.login errors and pass error message as {error: error.message}', async () => {
      vi.spyOn(db.auth, 'login').mockImplementationOnce(vi.fn(async () => {
        throw new Error('oh no')
      }))
      const req = createRequest({
        session: {
          save: vi.fn(),
          destroy: vi.fn()
        },
        method: "POST",
        query: {action: "login"},
        body: {username: "banana", password: "bananarama"}
      })
      const res = createResponse()
      await authHandler(req, res)
      expect(res.statusCode).toBe(400)
      expect(res._getData()).toBe(JSON.stringify({error: "oh no"}))
      expect(db.auth.login).toHaveBeenCalledTimes(1)
      expect(db.auth.login).toHaveBeenCalledWith("banana", "bananarama")
      expect(req.session.save).not.toHaveBeenCalled()
      expect(req.session).not.toHaveProperty("user")
    })
    it('should return 200 and save username/id to session when given correct username/password', async () => {
      vi.spyOn(db.auth, 'login').mockImplementationOnce(vi.fn(async () => ({username: "fake", id: "fakeid"})))
      const req = createRequest({
        session: {
          save: vi.fn(),
          destroy: vi.fn()
        },
        method: "POST",
        query: {action: "login"},
        body: {username: "banana", password: "bananarama"}
      })
      const res = createResponse()
      await authHandler(req, res)
      expect(res.statusCode).toBe(200)
      expect(db.auth.login).toHaveBeenCalledTimes(1)
      expect(db.auth.login).toHaveBeenCalledWith("banana", "bananarama")
      expect(req.session.save).toHaveBeenCalledTimes(1)
      expect(req.session.user).toEqual({username: "fake", id: "fakeid"})
    })
  })
})