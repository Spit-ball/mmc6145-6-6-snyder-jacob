import { vi } from 'vitest'
import Favorites, { getServerSideProps } from '../../pages/favorites'
import { fakeContextRender } from '../util/setup'
import { screen } from '@testing-library/react'
import favoriteBooks from '../util/favoriteBooks.json'
import { createRequest, createResponse } from 'node-mocks-http'
import db from '../../db'

describe('Favorites page', () => {
  describe('getServerSideProps', () => {
    it('should pass { props: { user, isLoggedIn } } if user is logged in', async () => {
      vi.spyOn(db.book, 'getAll')
        .mockImplementationOnce(vi.fn(async () => []))
      const req = createRequest({
        method: "GET"
      });
      req.session = { user: { id: 'myid' } }
      const res = createResponse();
      const {
        props: {
          user,
          isLoggedIn
        }
      } = await getServerSideProps({ req, res, params: { id: "" } })
      expect(user).toHaveProperty('id', 'myid')
      expect(isLoggedIn).toBe(true)
    })
    it('should pass { props: { favoriteBooks } } if user is logged in', async () => {
      vi.spyOn(db.book, 'getAll')
        .mockImplementationOnce(vi.fn(async () => favoriteBooks))
      const req = createRequest({
        method: "GET"
      });
      req.session = { user: { id: 'myid' } }
      const res = createResponse();
      const { props } = await getServerSideProps({ req, res, params: { id: "" } })
      expect(props).toHaveProperty('favoriteBooks', favoriteBooks)
    })
    it('should log user out by destroying the session if db.books.getAll does not find user', async () => {
      vi.spyOn(db.book, 'getAll')
        .mockImplementationOnce(vi.fn(async () => null))
      const req = createRequest({
        method: "GET"
      });
      req.session = { user: { id: 'myid' } }
      const mockDestroy = vi.fn()
      req.session.destroy = mockDestroy
      const res = createResponse();
      const { props } = await getServerSideProps({ req, res, params: { id: "" } })
      expect(mockDestroy).toHaveBeenCalledTimes(1)
      expect(props).not.toBeDefined()
    })
    it('should pass { redirect: {destination: "/login"} } if db.books.getAll does not find user', async () => {
      vi.spyOn(db.book, 'getAll')
        .mockImplementationOnce(vi.fn(async () => null))
      const req = createRequest({
        method: "GET"
      });
      req.session = { user: { id: 'myid' } }
      req.session.destroy = vi.fn()
      const res = createResponse();
      const { redirect } = await getServerSideProps({ req, res, params: { id: "" } })
      expect(redirect).toBeDefined()
      expect(redirect).toHaveProperty('destination', '/login')
    })
  })
  describe('Component', () => {
    it('should render title', () => {
      fakeContextRender(<Favorites favoriteBooks={[]} />, { state: { bookSearchResults: [] } })
      expect(screen.queryByText(/Favorite Books/i)).toBeInTheDocument()
    })
    it('should render message about no favorite books when no books are saved to favorites', () => {
      fakeContextRender(<Favorites favoriteBooks={[]} />, { state: { bookSearchResults: [] } })
      expect(screen.queryByText(/Favorite Books/i)).toBeInTheDocument()
      expect(screen.queryByText(/You don't have any books saved to your favorites./i)).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /go to search/i }))
    })
    it('should render favorite book titles from context', () => {
      fakeContextRender(<Favorites favoriteBooks={favoriteBooks} />, { state: { bookSearchResults: [] } })
      expect(screen.queryByText(/Favorite Books/i)).toBeInTheDocument()
      expect(screen.queryByText(/You don't have any books saved to your favorites./i)).not.toBeInTheDocument()
      for (const { title } of favoriteBooks) {
        expect(screen.queryByText(title)).toBeInTheDocument()
      }
    })
    it('should show image of favorite books with title as alt text', async () => {
      fakeContextRender(<Favorites favoriteBooks={favoriteBooks} />, { state: { bookSearchResults: [] } })
      for (const { title } of favoriteBooks) {
        expect(await screen.findByAltText(title)).toBeTruthy()
      }
    })
    it('should render book link of favorite books', async () => {
      fakeContextRender(<Favorites favoriteBooks={favoriteBooks} />, { state: { bookSearchResults: [] } })
      for (const { title, googleId } of favoriteBooks) {
        const preview = await screen.findByText(title)
        const containingLink = preview.closest('a')
        expect(containingLink.href).toContain(`/book/${googleId}`)
      }
    })
    it('should show authors of favorite books', async () => {
      fakeContextRender(<Favorites favoriteBooks={favoriteBooks} />, { state: { bookSearchResults: [] } })
      for (const { title, authors } of favoriteBooks) {
        const preview = await screen.findByText(title)
        const containingLink = preview.closest('a')
        for (const author of authors) {
          expect(containingLink.innerHTML.includes(author)).toBeTruthy()
        }
      }
    })
  })
})