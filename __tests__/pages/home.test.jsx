import Home, { getServerSideProps } from '../../pages'
import { render, screen } from '@testing-library/react'
import { createRequest, createResponse } from 'node-mocks-http'

describe('Home page', () => {
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
    it('should render title', () => {
      render(<Home />)
      expect(screen.getByText(/Welcome to Booker 📚/i)).toBeInTheDocument()
    })
  })
})