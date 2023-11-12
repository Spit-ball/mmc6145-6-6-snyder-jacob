import { act } from 'react-dom/test-utils'
import Signup, { getServerSideProps } from '../../pages/signup'
import { render, screen, fireEvent } from '@testing-library/react'
import { signupHandler } from '../util/mocks/handlers'
import { createRequest, createResponse } from 'node-mocks-http'

describe('Signup page', () => {
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
    it('should pass { props: { isLoggedIn: false } } only if user is NOT logged in', async () => {
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
      render(<Signup />)
      expect(screen.getByText(/Create an account below:/i)).toBeInTheDocument()
    })
    it('should call create account endpoint if submit is clicked', async () => {
      render(<Signup />)
      expect(screen.getByText(/Create an account below:/i)).toBeInTheDocument()
      fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user1' } })
      fireEvent.change(screen.getByLabelText(/^password:$/i), { target: { value: 'banana' } })
      fireEvent.change(screen.getByLabelText(/^confirm password:$/i), { target: { value: 'banana' } })
      fireEvent.click(screen.getByRole('button', {name: /^submit$/i}))
      await act(() => new Promise(r => setTimeout(r, 0)))
      expect(signupHandler).toHaveBeenCalledTimes(1)
    })
    it('should show error message if returned from handler', async () => {
      signupHandler.mockImplementationOnce((req, res, ctx) => {
        return res(ctx.status(400), ctx.json({error: 'oh no'}))
      })
      render(<Signup />)
      expect(screen.getByText(/Create an account below:/i)).toBeInTheDocument()
      fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user1' } })
      fireEvent.change(screen.getByLabelText(/^password:$/i), { target: { value: 'banana' } })
      fireEvent.change(screen.getByLabelText(/^confirm password:$/i), { target: { value: 'banana' } })
      fireEvent.click(screen.getByRole('button', {name: /^submit$/i}))
      await act(() => new Promise(r => setTimeout(r, 0)))
      expect(signupHandler).toHaveBeenCalledTimes(1)
      expect(screen.getByText(/oh no/i)).toBeInTheDocument()
    })
    it('should NOT call create account endpoint if username is blank', async () => {
      render(<Signup />)
      expect(screen.getByText(/Create an account below:/i)).toBeInTheDocument()
      // fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user1' } })
      fireEvent.change(screen.getByLabelText(/^password:$/i), { target: { value: 'banana' } })
      fireEvent.change(screen.getByLabelText(/^confirm password:$/i), { target: { value: 'banana' } })
      fireEvent.click(screen.getByRole('button', {name: /^submit$/i}))
      await act(() => new Promise(r => setTimeout(r, 0)))
      expect(signupHandler).not.toHaveBeenCalled()
      expect(screen.getByText(/must include username/i)).toBeInTheDocument()
    })
    it('should NOT call create account endpoint if password fields are blank', async () => {
      render(<Signup />)
      expect(screen.getByText(/Create an account below:/i)).toBeInTheDocument()
      fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user1' } })
      // fireEvent.change(screen.getByLabelText(/^password:$/i), { target: { value: 'banana' } })
      // fireEvent.change(screen.getByLabelText(/^confirm password:$/i), { target: { value: 'banana' } })
      fireEvent.click(screen.getByRole('button', {name: /^submit$/i}))
      await act(() => new Promise(r => setTimeout(r, 0)))
      expect(signupHandler).not.toHaveBeenCalled()
      expect(screen.getByText(/Must include password/i)).toBeInTheDocument()
    })
    it('should NOT call create account endpoint if password is blank', async () => {
      render(<Signup />)
      expect(screen.getByText(/Create an account below:/i)).toBeInTheDocument()
      fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user1' } })
      // fireEvent.change(screen.getByLabelText(/^password:$/i), { target: { value: 'banana' } })
      fireEvent.change(screen.getByLabelText(/^confirm password:$/i), { target: { value: 'banana' } })
      fireEvent.click(screen.getByRole('button', {name: /^submit$/i}))
      await act(() => new Promise(r => setTimeout(r, 0)))
      expect(signupHandler).not.toHaveBeenCalled()
      expect(screen.getByText(/Must include password/i)).toBeInTheDocument()
    })
    it('should NOT call create account endpoint if confirm password is blank', async () => {
      render(<Signup />)
      expect(screen.getByText(/Create an account below:/i)).toBeInTheDocument()
      fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user1' } })
      fireEvent.change(screen.getByLabelText(/^password:$/i), { target: { value: 'banana' } })
      // fireEvent.change(screen.getByLabelText(/^confirm password:$/i), { target: { value: 'banana' } })
      fireEvent.click(screen.getByRole('button', {name: /^submit$/i}))
      await act(() => new Promise(r => setTimeout(r, 0)))
      expect(signupHandler).not.toHaveBeenCalled()
      expect(screen.getByText(/please confirm password/i)).toBeInTheDocument()
    })
    it('should NOT call create account endpoint if passwords do not match', async () => {
      render(<Signup />)
      expect(screen.getByText(/Create an account below:/i)).toBeInTheDocument()
      fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user1' } })
      fireEvent.change(screen.getByLabelText(/^password:$/i), { target: { value: 'banana' } })
      fireEvent.change(screen.getByLabelText(/^confirm password:$/i), { target: { value: 'not banana' } })
      fireEvent.click(screen.getByRole('button', {name: /^submit$/i}))
      await act(() => new Promise(r => setTimeout(r, 0)))
      expect(signupHandler).not.toHaveBeenCalled()
      expect(screen.getByText(/passwords must match/i)).toBeInTheDocument()
    })
  })
})