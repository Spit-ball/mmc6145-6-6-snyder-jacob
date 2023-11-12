import { afterEach, afterAll, beforeAll, vi } from 'vitest'
import '@testing-library/jest-dom'
import { server } from './mocks/server'
import { bookContext, BookProvider } from '../../context/book'
import { render, cleanup, configure } from '@testing-library/react'

vi.mock('iron-session/next', () => ({
  withIronSessionSsr: getSSP => getSSP,
  withIronSessionApiRoute: apiHandler => apiHandler
}))

vi.mock('next/router', () => ({
  useRouter: () => mockRouter
}))

// Mock Next's Link Component because it does NOT render correctly with testing-library
vi.mock('next/link', () => ({default: ({children, ...props}) => <a {...props}>{children}</a>}))

configure({
  getElementError: (message, container) => {
    const error = new Error(message);
    error.name = 'TestingLibraryElementError';
    error.stack = null;
    return error;
  },
});

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })

  const fetch = global.fetch

  vi.stubGlobal('fetch', (url, options) => {
    if (url.startsWith('/'))
      url = window.location.origin + url
    return fetch(url, options)
  })
})

afterAll(() => {
  server.close()
  vi.restoreAllMocks()
})

afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
  cleanup()
})

export const mockRouter = {
  query: {id: null},
  push: vi.fn(),
  replace: vi.fn(),
  asPath: null,
  back: vi.fn()
}

export function fakeContextRender(
  Component,
  {state = {bookSearchResults: []}, dispatch = () => {}} = {}
) {
  return render(
    <bookContext.Provider value={[state, dispatch]}>
      {Component}
    </bookContext.Provider>
  )
}

export function customRender(
  Component
) {
  return render(
    <BookProvider>
      {Component}
    </BookProvider>
  )
}
