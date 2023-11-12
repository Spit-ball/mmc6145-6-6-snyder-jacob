import bookSearchResults from './util/bookSearchContext.json'
import reducer from '../context/book/reducer'
import * as actions from '../context/book/actions'
import initialState from '../context/book/state'
import { useBookContext, BookProvider } from '../context/book'
import { render, screen, fireEvent } from '@testing-library/react'

describe('book context', () => {
  describe('actions', () => {
    it('should contain SEARCH_BOOKS', () => {
      expect(actions).toHaveProperty('SEARCH_BOOKS')
    })
  })

  describe('reducer', () => {
    it('should return initial state when called with incorrect action', () => {
      const initialState = {bookSearchResults}
      const newState = reducer(initialState, {action: 'bogus action'})
      expect(newState).toEqual(initialState)
    })
    it('should add search results to state', () => {
      const initialState = {bookSearchResults: []}
      const newState = reducer(initialState, {action: actions.SEARCH_BOOKS, payload: bookSearchResults})
      expect(newState).toEqual({bookSearchResults})
    })
  })
  describe('useBookContext and BookProvider', () => {
    it('should be exported from src/context/book', () => {
      expect(useBookContext).toBeDefined()
      expect(typeof useBookContext).toBe('function')
      expect(BookProvider).toBeDefined()
      expect(typeof BookProvider).toBe('function')
    })
    it('should share state with components', () => {
      const Dummy = () => {
        const [state] = useBookContext()
        return <>{JSON.stringify(state)}</>
      }
      const { container } = render(<BookProvider><Dummy/></BookProvider>)
      const renderedState = JSON.parse(container.textContent)
      expect(renderedState).toEqual(initialState)
    })
    it('should share dispatch fn with components', () => {
      const Dummy = () => {
        const [state, dispatch] = useBookContext()
        return (
          <>
            <div>
              {JSON.stringify(state.bookSearchResults)}
            </div>
            <button onClick={() => dispatch({
              action: actions.SEARCH_BOOKS,
              payload: ['banana']
            })}>
              click me
            </button>
          </>
        )
      }
      render(<BookProvider><Dummy/></BookProvider>)
      fireEvent.click(screen.getByText('click me'))
      expect(screen.getByText(/banana/i)).toBeInTheDocument()
    })
  })
})
