import Head from "next/head";
import Link from "next/link";
import { withIronSessionSsr } from "iron-session/next";
import sessionOptions from "../config/session";
import { useState } from "react";
import styles from "../styles/Login.module.css";
import { useRouter } from "next/router";
import Header from '../components/header'

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const { user } = req.session;
    const props = {};
    if (user) {
      props.user = req.session.user;
    }
    props.isLoggedIn = !!user;
    return { props };
  },
  sessionOptions
);

export default function Signup(props) {
  const router = useRouter();
  const [
    { username, password, "confirm-password": confirmPassword },
    setForm,
  ] = useState({
    username: "",
    password: "",
    "confirm-password": "",
  });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({
      username,
      password,
      "confirm-password": confirmPassword,
      ...{ [e.target.name]: e.target.value.trim() },
    });
  }
  async function handleCreateAccount(e) {
    e.preventDefault();
    if (!username.trim()) return setError("Must include username");
    if (!password.trim())
      return setError("Must include password");
    if (!confirmPassword.trim())
      return setError("Please confirm password");
    if (password !== confirmPassword) return setError("Passwords must Match");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (res.status === 200) return router.push("/search");
      const { error: message } = await res.json();
      setError(message);
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <>
      <Head>
        <title>Booker Signup</title>
        <meta name="description" content="Create an account on Booker" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📚</text></svg>" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>

      <Header isLoggedIn={props.isLoggedIn} />

      <main className={styles.main}>
        <h1>
          Create an account below:
        </h1>

        <form
          className={[styles.card, styles.form].join(" ")}
          onSubmit={handleCreateAccount}
        >
          <label htmlFor="username">Username: </label>
          <input
            type="text"
            name="username"
            id="username"
            onChange={handleChange}
            value={username}
          />
          <label htmlFor="password">Password: </label>
          <input
            type="password"
            name="password"
            id="password"
            onChange={handleChange}
            value={password}
          />
          <label htmlFor="confirm-password">Confirm Password: </label>
          <input
            type="password"
            name="confirm-password"
            id="confirm-password"
            onChange={handleChange}
            value={confirmPassword}
          />
          <button>Submit</button>
          {error && <p>{error}</p>}
        </form>
        <Link href="/login">
          <p>Login instead?</p>
        </Link>
      </main>
    </>
  );
}
