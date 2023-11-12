import Head from "next/head";
import Link from 'next/link';
import styles from "../styles/Favorites.module.css";
import { withIronSessionSsr } from "iron-session/next";
import sessionOptions from "../config/session";
import Header from "../components/header";
import BookList from "../components/bookList";
import db from "../db";

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const user = req.session.user;
    let books
    if (user)
      books = await db.book.getAll(user.id)
    // no books means db.book.getAll failed because user does not exist
    if (!books) {
      req.session.destroy()
      return {
        redirect: {
          destination: '/login',
          permanent: false
        }
      }
    }
    return {
      props: {
        user: req.session.user,
        isLoggedIn: true,
        favoriteBooks: books,
      }
    };
  },
  sessionOptions
);

export default function Favorites(props) {
  return (
    <>
      <Head>
        <title>Booker Favorites</title>
        <meta name="description" content="Your favorite books on Booker" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📚</text></svg>" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>

      <Header isLoggedIn={props.isLoggedIn} />

      <main>
        <h1 className={styles.title}>Favorite Books</h1>
        {props.favoriteBooks.length > 0 ? <BookList books={props.favoriteBooks} /> : <NoBookText />}
      </main>
    </>
  );
}

function NoBookText() {
  return (
    <div className={styles.noBooks}>
      <p><strong>You don't have any books saved to your favorites.</strong></p>
      <p>Why don't you <Link href="/search">go to search</Link> and add some?</p>
    </div>
  )
}