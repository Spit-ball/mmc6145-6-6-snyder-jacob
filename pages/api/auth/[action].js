import { withIronSessionApiRoute } from "iron-session/next";
import sessionOptions from "../../../config/session"
import db from '../../../db'

// this file handles /api/auth/:action with any request method (GET, POST, etc)
export default withIronSessionApiRoute(
  function handler(req, res) {
    // console.log(req.query.action)
    // console.log(req.method)
    // TODO: implement POST /api/auth/login
    // TODO: implement POST /api/auth/logout
    // TODO: implement POST /api/auth/signup
    if (req.method !== 'POST')
      return res.status(404).end()
    switch (req.query.action) {
      case 'login':
        return login(req, res)
      case 'logout':
        return logout(req, res)
      case 'signup':
        return signup(req, res)
      default:
        return res.status(404).end()
    }
  },
  sessionOptions
)



async function login(req, res) {
  const { username, password } = req.body
  try {
    const user = await db.auth.login(username, password)
    req.session.user = {
      username: user.username,
      id: user.id
    }
    await req.session.save()
    res.status(200).end()
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

async function logout(req, res) {
  await req.session.destroy()
  res.status(200).end()
}

async function signup(req, res) {
  try {
    const { username, password } = req.body
    const user = await db.user.create(username, password)
    req.session.user = {
      username: user.username,
      id: user.id
    }
    await req.session.save()
    res.redirect('/search')
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}