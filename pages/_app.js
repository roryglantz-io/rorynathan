import Head from 'next/head'
import { Toaster } from 'sonner'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Jost:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Component {...pageProps} />
      <Toaster position="bottom-center" />
    </>
  )
}
