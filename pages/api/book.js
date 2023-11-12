import { withIronSessionApiRoute } from "iron-session/next";
import sessionOptions from "../../config/session"
import db from '../../db'

// this handler runs for /api/book with any request method (GET, POST, etc)
export default withIronSessionApiRoute(
  async function handler(req, res) {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    switch (req.method) {
      case 'POST':
        try {
          const addBook = JSON.parse(req.body)
          const addedBook = await db.book.add(req.session.user.id, addBook)
          if (addedBook === null) {
            req.session.destroy();
            return res.status(401).json({ error: 'Unauthorized' })
          }
          return res.status(200).json(addBook)
        } catch (err) {
          return res.status(400).json({ error: err.message })
        }

      case 'DELETE':
        try {
          const removeBook = JSON.parse(req.body)
          const removedBook = await db.book.remove(req.session.user.id, removeBook.id)

          if (removedBook === null) {
            req.session.destroy();
            return res.status(401).json({ error: 'Unauthorized' })
          }
          return res.status(200).json(removeBook)
        } catch (err) {
          return res.status(400).json({ error: err.message })
        }
      default:
        return res.status(404).end()
    }
  },
  sessionOptions
)

// TODO: On a POST request, add a book using db.book.add with request body (must use JSON.parse)
// TODO: On a DELETE request, remove a book using db.book.remove with request body (must use JSON.parse)
// TODO: Respond with 404 for all other requests
// User info can be accessed with req.session
// No user info on the session means the user is not logged in