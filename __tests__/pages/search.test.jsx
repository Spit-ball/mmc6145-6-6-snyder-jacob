import Search, { getServerSideProps } from '../../pages/search'
import bookSearchResults from '../util/bookSearchContext.json'
import { fakeContextRender } from '../util/setup'
import { getBookHandler as searchBooksHandler } from '../util/mocks/handlers'
import { screen, fireEvent } from '@testing-library/react'
import { createRequest, createResponse } from 'node-mocks-http'
import { SEARCH_BOOKS } from '../../context/book/actions'
import { act } from 'react-dom/test-utils'
import { vi } from 'vitest'

describe('Search page', () => {
  describe('getServerSideProps', () => {
    it('should pass user and isLoggedIn props if user is logged in', async () => {
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
    it('should NOT pass user and isLoggedIn=false props if user is NOT logged in', async () => {
      const req = createRequest({
        method: "GET"
      });
      req.session = {}
      const res = createResponse();
      const { props } = await getServerSideProps({ req, res, params: { id: "" } })
      expect(props).not.toHaveProperty('user')
      expect(props).toHaveProperty('isLoggedIn', false)
    })
  })
  describe('Component', () => {
    it('should render title and search bar', () => {
      fakeContextRender(<Search />)
      expect(screen.getByText(/Book Search/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Search by author, title, and\/or keywords:/i)).toBeInTheDocument()
    })
    it('should call Books API once when searching', async () => {
      fakeContextRender(<Search />)
      const input = screen.getByLabelText(/Search by author, title, and\/or keywords:/i)
      fireEvent.change(input, {target: {value: 'conan'}})
      fireEvent.click(screen.getByText(/submit/i))
      await act(() => new Promise(r => setTimeout(r, 0)))
      expect(searchBooksHandler).toHaveBeenCalledTimes(1)
    })
    it('should call context dispatch function when searching', async () => {
      const dispatch = vi.fn()
      fakeContextRender(<Search />, {dispatch})
      const input = screen.getByLabelText(/Search by author, title, and\/or keywords:/i)
      fireEvent.change(input, {target: {value: 'conan'}})
      fireEvent.click(screen.getByText(/submit/i))
      await act(() => new Promise(r => setTimeout(r, 0)))
      expect(dispatch).toHaveBeenCalledTimes(1)
      expect(searchBooksHandler).toHaveBeenCalledTimes(1)
    })
    it('should call context dispatch function when searching with SEARCH_BOOKS action', async () => {
      const dispatch = vi.fn()
      fakeContextRender(<Search />, {dispatch})
      const input = screen.getByLabelText(/Search by author, title, and\/or keywords:/i)
      fireEvent.change(input, {target: {value: 'conan'}})
      fireEvent.click(screen.getByText(/submit/i))
      await act(() => new Promise(r => setTimeout(r, 0)))
      expect(dispatch).toHaveBeenCalledTimes(1)
      expect(dispatch.calls[0][0]).toHaveProperty('action', SEARCH_BOOKS)
      expect(searchBooksHandler).toHaveBeenCalledTimes(1)
    })
    it('should call context dispatch function when searching with search results payload', async () => {
      const dispatch = vi.fn()
      fakeContextRender(<Search />, {dispatch})
      const input = screen.getByLabelText(/Search by author, title, and\/or keywords:/i)
      fireEvent.change(input, {target: {value: 'conan'}})
      fireEvent.click(screen.getByText(/submit/i))
      await act(() => new Promise(r => setTimeout(r, 0)))
      expect(searchBooksHandler).toHaveBeenCalledTimes(1)
      expect(dispatch).toHaveBeenCalledTimes(1)
      expect(dispatch.calls[0][0]).toHaveProperty('payload')
      const {payload} = dispatch.calls[0][0]
      expect(Array.isArray(payload)).toBe(true)
      for (const book of payload) {
        expect(book).toHaveProperty('title')
        expect(book).toHaveProperty('thumbnail')
        expect(book).toHaveProperty('previewLink')
        expect(book).toHaveProperty('googleId')
      }
    })
    it('should not call Books API again if query is unchanged', async () => {
      fakeContextRender(<Search />)
      const input = screen.getByLabelText(/Search by author, title, and\/or keywords:/i)
      fireEvent.change(input, {target: {value: 'conan'}})
      fireEvent.click(screen.getByText(/submit/i))
      fireEvent.click(screen.getByText(/submit/i))
      fireEvent.click(screen.getByText(/submit/i))
      await act(() => new Promise(r => setTimeout(r, 0)))
      expect(searchBooksHandler).toHaveBeenCalledTimes(1)
    })
    it('should not call Books API again until previous request is done', async () => {
      fakeContextRender(<Search />)
      const input = screen.getByLabelText(/Search by author, title, and\/or keywords:/i)
      fireEvent.change(input, {target: {value: 'con'}})
      fireEvent.click(screen.getByText(/submit/i))
      fireEvent.change(input, {target: {value: 'cona'}})
      fireEvent.click(screen.getByText(/submit/i))
      fireEvent.change(input, {target: {value: 'conan'}})
      fireEvent.click(screen.getByText(/submit/i))
      await act(() => new Promise(r => setTimeout(r, 0)))
      expect(searchBooksHandler).toHaveBeenCalledTimes(1)
    })
    it('should NOT call Books API when search field is blank', async () => {
      fakeContextRender(<Search />)
      const input = screen.getByLabelText(/Search by author, title, and\/or keywords:/i)
      fireEvent.change(input, {target: {value: ''}})
      fireEvent.click(screen.getByText(/submit/i))
      await act(() => new Promise(r => setTimeout(r, 0)))
      expect(searchBooksHandler).not.toHaveBeenCalled()
    })
    it('should ONLY show search data that is in context', async () => {
      const {container} = fakeContextRender(<Search />, {state: {bookSearchResults: [], favoriteBooks: []}})
      const input = screen.getByLabelText(/Search by author, title, and\/or keywords:/i)
      fireEvent.change(input, {target: {value: 'conan'}})
      fireEvent.click(screen.getByText(/submit/i))
      await act(() => new Promise(r => setTimeout(r, 0)))
      for(const {title, thumbnail} of bookSearchResults) {
        expect(screen.queryByText(title)).toBeNull()
        if (thumbnail)
          expect(container.querySelector(`img[src="${thumbnail}"]`)).toBeNull()
      }
    })
    it('should show title of each result when searching', async () => {
      fakeContextRender(<Search />, {state: {bookSearchResults, favoriteBooks: []}})
      const input = screen.getByLabelText(/Search by author, title, and\/or keywords:/i)
      fireEvent.change(input, {target: {value: 'conan'}})
      fireEvent.click(screen.getByText(/submit/i))
      for(const {title} of bookSearchResults) {
        expect(await screen.findByText(title)).toBeInTheDocument()
      }
    })
    it('should show image of each result with title as alt text when searching', async () => {
      fakeContextRender(<Search />, {state: {bookSearchResults, favoriteBooks: []}})
      const input = screen.getByLabelText(/Search by author, title, and\/or keywords:/i)
      fireEvent.change(input, {target: {value: 'conan'}})
      fireEvent.click(screen.getByText(/submit/i))
      for(const {title, thumbnail} of bookSearchResults) {
        const img = await screen.findByAltText(title)
        expect(img).toBeInTheDocument()
        if (thumbnail)
          expect(img.src).toBe(thumbnail)
        else
          expect(img.src).contains('placeholder')
      }
    })
    it('should render book link of each result when searching', async () => {
      fakeContextRender(<Search />, {state: {bookSearchResults, favoriteBooks: []}})
      const input = screen.getByLabelText(/Search by author, title, and\/or keywords:/i)
      fireEvent.change(input, {target: {value: 'conan'}})
      fireEvent.click(screen.getByText(/submit/i))
      for(const {title, googleId} of bookSearchResults) {
        const preview = await screen.findByText(title)
        const containingLink = preview.closest('a')
        expect(containingLink.href).toContain(`/book/${googleId}`)
      }
    })
    it('should show authors of each result when searching', async () => {
      fakeContextRender(<Search />, {state: {bookSearchResults, favoriteBooks: []}})
      const input = screen.getByLabelText(/Search by author, title, and\/or keywords:/i)
      fireEvent.change(input, {target: {value: 'conan'}})
      fireEvent.click(screen.getByText(/submit/i))
      for(const {title, authors = []} of bookSearchResults) {
        const preview = await screen.findByText(title)
        const containingLink = preview.closest('a')
        for(const author of authors) {
          expect(containingLink.innerHTML.includes(author)).toBeTruthy()
        }
      }
    })
  })
})