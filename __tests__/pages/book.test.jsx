import { vi } from 'vitest'
import { act } from 'react-dom/test-utils'
import Book, { getServerSideProps } from '../../pages/book/[id]'
import { fakeContextRender, mockRouter } from '../util/setup'
import { addBookHandler, removeBookHandler } from '../util/mocks/handlers'
import { screen, fireEvent } from '@testing-library/react'
import bookSearchContext from '../util/bookSearchContext.json'
import favoriteBooks from '../util/favoriteBooks.json'
import { createRequest, createResponse } from 'node-mocks-http'
import db from '../../db'

describe('Book Page', () => {
  describe('getServerSideProps', () => {
    it('should pass { props: { user, isLoggedIn } } if user is logged in', async () => {
      vi.spyOn(db.book, 'getByGoogleId')
        .mockImplementationOnce(vi.fn())
      const req = createRequest({
        method: "GET"
      });
      req.session = { user: { id: 'myid'} }
      const res = createResponse();
      const {
        props: {
          user,
          isLoggedIn
        }
      } = await getServerSideProps({req, res, params: {id: ""}})
      expect(user).toHaveProperty('id', 'myid')
      expect(isLoggedIn).toBe(true)
    })
    it('should pass { props: { book } } if book is found in favorites', async () => {
      const book = favoriteBooks[0]
      const mockGetByGoogleId = vi.fn(async () => book)
      vi.spyOn(db.book, 'getByGoogleId')
        .mockImplementationOnce(mockGetByGoogleId)
      const req = createRequest({
        method: "GET"
      });
      req.session = { user: { id: 'myid'} }
      const res = createResponse();
      const {
        props: {
          book: bookProp,
        }
      } = await getServerSideProps({req, res, params: {id: book.googleId}})
      expect(bookProp).toEqual(book)
    })
    it('should not pass { props: { book } } if book not found in favorites', async () => {
      const mockGetByGoogleId = vi.fn(async () => null)
      vi.spyOn(db.book, 'getByGoogleId')
        .mockImplementationOnce(mockGetByGoogleId)
      const req = createRequest({
        method: "GET"
      });
      req.session = { user: { id: 'myid'} }
      const res = createResponse();
      const { props } = await getServerSideProps({req, res, params: {id: ""}})
      expect(props).not.toHaveProperty('book')
    })
  })

  describe('Component', () => {
    it('should redirect to home page using next/router push if book is not found and user logged in', async () => {
      fakeContextRender(
        <Book isLoggedIn={true} />,
        {
          state: {bookSearchResults: []},
          location: '/book/anything'
        }
      )
      expect(mockRouter.push).toHaveBeenCalledTimes(1)
      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })
    it('should redirect to home page using next/router push if book is not found and user NOT logged in', async () => {
      fakeContextRender(
        <Book isLoggedIn={false} />,
        {
          state: {bookSearchResults: []},
          location: '/book/anything'
        }
      )
      expect(mockRouter.push).toHaveBeenCalledTimes(1)
      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })
    it('should render book info from favorites/props', async () => {
      const book = favoriteBooks[0]
      fakeContextRender(
        <Book isLoggedIn={true} book={book} />,
        {
          state: {bookSearchResults: []},
          location: `/book/anything`
        }
      )
      expect(screen.getByText(book.title)).toBeInTheDocument()
      expect(screen.getByText(new RegExp(book.description.replace(/([\(\)])/g, "\\$1"), 'i'))).toBeInTheDocument()
      const img = screen.getByAltText(book.title)
      expect(img).toBeInTheDocument()
      expect(img.src).toBe(book.thumbnail)
      expect(screen.getByText(/remove from favorites/i)).toBeInTheDocument()
    })
    it('should render book info from search/context if user logged in', async () => {
      const book = bookSearchContext[0]
      vi.spyOn(mockRouter.query, 'id', 'get').mockReturnValueOnce(book.googleId)
      fakeContextRender(
        <Book isLoggedIn={true} />,
        {
          state: {bookSearchResults: [book]},
          location: `/book/anything`
        }
      )
      expect(screen.getByText(book.title)).toBeInTheDocument()
      expect(screen.getByText(new RegExp(book.description.replace(/([\(\)])/g, "\\$1"), 'i'))).toBeInTheDocument()
      const img = screen.getByAltText(book.title)
      expect(img).toBeInTheDocument()
      expect(img.src).toBe(book.thumbnail)
      expect(screen.getByText(/add to favorites/i)).toBeInTheDocument()
    })
    it('should render book info from search/context if user NOT logged in', async () => {
      const book = bookSearchContext[0]
      vi.spyOn(mockRouter.query, 'id', 'get').mockReturnValueOnce(book.googleId)
      fakeContextRender(
        <Book isLoggedIn={false} />,
        {
          state: {bookSearchResults: [book]},
          location: `/book/anything`
        }
      )
      expect(screen.getByText(book.title)).toBeInTheDocument()
      expect(screen.getByText(new RegExp(book.description.replace(/([\(\)])/g, "\\$1"), 'i'))).toBeInTheDocument()
      const img = screen.getByAltText(book.title)
      expect(img).toBeInTheDocument()
      expect(img.src).toBe(book.thumbnail)
    })
    it('should render login button instead of add to favorites if user not logged in', async () => {
      const book = bookSearchContext[0]
      vi.spyOn(mockRouter.query, 'id', 'get').mockReturnValueOnce(book.googleId)
      fakeContextRender(
        <Book isLoggedIn={false} />,
        {
          state: {bookSearchResults: [book]},
          location: `/book/anything`
        }
      )
      expect(screen.getByText(book.title)).toBeInTheDocument()
      expect(screen.getByText(new RegExp(book.description.replace(/([\(\)])/g, "\\$1"), 'i'))).toBeInTheDocument()
      const img = screen.getByAltText(book.title)
      expect(img).toBeInTheDocument()
      expect(img.src).toBe(book.thumbnail)
      // secondary login button replaces add to favorites
      expect(screen.getAllByText(/login/i).length).toBe(2)
    })
    it('should call POST /api/book when adding book to favorites', async () => {
      const book = bookSearchContext[0]
      vi.spyOn(mockRouter.query, 'id', 'get').mockReturnValueOnce(book.googleId)
      fakeContextRender(
        <Book isLoggedIn={true} />,
        {
          state: {bookSearchResults: [book]},
          location: `/book/anything`,
        }
      )
      fireEvent.click(screen.getByText(/add to favorites/i))
      await act(() => new Promise(r => setTimeout(r, 0)))
      expect(addBookHandler).toHaveBeenCalledTimes(1)
    })
    it('should send title, description, pages, googleId, thumbnail, previewLink, categories, authors in request body when adding book', async () => {
      const book = bookSearchContext[0]
      vi.spyOn(mockRouter.query, 'id', 'get').mockReturnValueOnce(book.googleId)
      fakeContextRender(
        <Book isLoggedIn={true} />,
        {
          state: {bookSearchResults: [book]},
          location: `/book/anything`,
        }
      )
      fireEvent.click(screen.getByText(/add to favorites/i))
      await act(() => new Promise(r => setTimeout(r, 0)))
      expect(addBookHandler).toHaveBeenCalledTimes(1)
      const sentBook = await addBookHandler.calls[0][0].json()
      expect(sentBook).toHaveProperty('title', book.title)
      expect(sentBook).toHaveProperty('pageCount', book.pageCount)
      expect(sentBook).toHaveProperty('googleId', book.googleId)
      expect(sentBook).toHaveProperty('thumbnail', book.thumbnail)
      expect(sentBook).toHaveProperty('previewLink', book.previewLink)
      expect(sentBook).toHaveProperty('description', book.description)
      expect(sentBook).toHaveProperty('authors', book.authors)
      expect(sentBook).toHaveProperty('categories', book.categories)
    })
    it('should refresh using router.replace(router.asPath) after adding book to favorites', async () => {
      const book = bookSearchContext[0]
      vi.spyOn(mockRouter.query, 'id', 'get').mockReturnValueOnce(book.googleId)
      vi.spyOn(mockRouter, 'asPath', 'get').mockReturnValueOnce(`/book/${book.googleId}`)
      fakeContextRender(
        <Book isLoggedIn={true} />,
        {
          state: {bookSearchResults: [book]},
          location: `/book/anything`,
        }
      )
      fireEvent.click(screen.getByText(/add to favorites/i))
      await act(() => new Promise(r => setTimeout(r, 0)))
      expect(addBookHandler).toHaveBeenCalledTimes(1)
      expect(mockRouter.replace).toHaveBeenCalledTimes(1)
      expect(mockRouter.replace).toHaveBeenCalledWith(`/book/${book.googleId}`)
    })
    it('should call DELETE /api/book when removing book from favorites', async () => {
      const book = favoriteBooks[0]
      vi.spyOn(mockRouter, 'asPath', 'get').mockReturnValueOnce(`/book/${book.googleId}`)
      fakeContextRender(
        <Book isLoggedIn={true} book={book} />,
        {
          state: {bookSearchResults: []},
          location: `/book/anything`,
        }
      )
      fireEvent.click(screen.getByText(/remove from favorites/i))
      await act(() => new Promise(r => setTimeout(r, 0)))
      expect(removeBookHandler).toHaveBeenCalledTimes(1)
    })
    it('should send book id in body when removing book from favorites', async () => {
      const book = favoriteBooks[0]
      vi.spyOn(mockRouter, 'asPath', 'get').mockReturnValueOnce(`/book/${book.googleId}`)
      fakeContextRender(
        <Book isLoggedIn={true} book={book} />,
        {
          state: {bookSearchResults: []},
          location: `/book/anything`,
        }
      )
      fireEvent.click(screen.getByText(/remove from favorites/i))
      await act(() => new Promise(r => setTimeout(r, 0)))
      expect(removeBookHandler).toHaveBeenCalledTimes(1)
      const { id } = await removeBookHandler.calls[0][0].json()
      expect(id).toBe(book.id)
    })
    it('should refresh using router.replace(router.asPath) after removing book from favorites', async () => {
      const book = favoriteBooks[0]
      vi.spyOn(mockRouter, 'asPath', 'get').mockReturnValueOnce(`/book/${book.googleId}`)
      fakeContextRender(
        <Book isLoggedIn={true} book={book} />,
        {
          state: {bookSearchResults: []},
          location: `/book/anything`,
        }
      )
      fireEvent.click(screen.getByText(/remove from favorites/i))
      await act(() => new Promise(r => setTimeout(r, 0)))
      expect(mockRouter.replace).toHaveBeenCalledTimes(1)
      expect(mockRouter.replace).toHaveBeenCalledWith(`/book/${book.googleId}`)
    })
  })
})
