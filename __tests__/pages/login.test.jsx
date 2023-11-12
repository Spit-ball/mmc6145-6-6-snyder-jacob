import { act } from 'react-dom/test-utils'
import Login, { getServerSideProps } from '../../pages/login'
import { render, screen, fireEvent } from '@testing-library/react'
import { loginHandler } from '../util/mocks/handlers'
import { createRequest, createResponse } from 'node-mocks-http'

describe('Login page', () => {
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
    it('should pass only {props: { isLoggedIn: false } } if user is NOT logged in', async () => {
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
    it('should render title', () => {
      render(<Login />)
      expect(screen.getByText(/Welcome back! Log in below./i)).toBeInTheDocument()
    })
    it('should call login endpoint if login is clicked', async () => {
      render(<Login />)
      expect(screen.getByText(/Welcome back! Log in below./i)).toBeInTheDocument()
      fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user1' } })
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'banana' } })
      fireEvent.click(screen.getByRole('button', {name: /^login$/i}))
      await act(() => new Promise(r => setTimeout(r, 0)))
      expect(loginHandler).toHaveBeenCalledTimes(1)
    })
    it('should show error message if error is returned from handler', async () => {
      loginHandler.mockImplementationOnce((req, res, ctx) => {
        return res(ctx.status(400), ctx.json({error: 'oh no'}))
      })
      render(<Login />)
      expect(screen.getByText(/Welcome back! Log in below./i)).toBeInTheDocument()
      fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user1' } })
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'banana' } })
      fireEvent.click(screen.getByRole('button', {name: /^login$/i}))
      await act(() => new Promise(r => setTimeout(r, 0)))
      expect(loginHandler).toHaveBeenCalledTimes(1)
      expect(screen.getByText(/oh no/i)).toBeInTheDocument()
    })
    it('should NOT call login endpoint if username is blank', async () => {
      render(<Login />)
      expect(screen.getByText(/Welcome back! Log in below./i)).toBeInTheDocument()
      // fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user1' } })
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'banana' } })
      fireEvent.click(screen.getByRole('button', {name: /^login$/i}))
      await act(() => new Promise(r => setTimeout(r, 0)))
      expect(loginHandler).not.toHaveBeenCalled()
    })
  })
})
