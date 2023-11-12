import Link from "next/link"
import BookPreview from "../bookPreview"
import styles from './style.module.css'

export default function BookList({books}) {
  return (
    <div className={styles.list}>
      {books.map(book => <Link key={book.googleId} href={`/book/${book.googleId}`} style={{textDecoration: 'none'}}>
        <BookPreview {...book} />
      </Link>)}
    </div>
  )
}