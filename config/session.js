export default {
  cookieName: "booker_auth_cookie",
  password: process.env.IRON_PASS,
  // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
}