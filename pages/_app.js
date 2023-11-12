import { Open_Sans } from '@next/font/google'
import { BookProvider } from '../context/book'
import '../styles/globals.css'

const openSans = Open_Sans({
  weight: ['300', '400', '800'],
  style: ['normal', 'italic'],
  subsets: ['latin']
})

function MyApp({ Component, pageProps }) {
  return (
    <BookProvider>
      <div className={openSans.className}>
        <Component {...pageProps} />
      </div>
    </BookProvider>
  )
}

export default MyApp
