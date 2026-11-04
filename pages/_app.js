import localFont from 'next/font/local'
import '../styles/globals.css'

const serif = localFont({
  src: '../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2',
  weight: '100 900',
  display: 'swap',
  fallback: ['Georgia'],
})

const script = localFont({
  src: '../node_modules/@fontsource/alex-brush/files/alex-brush-latin-400-normal.woff2',
  weight: '400',
  display: 'swap',
  fallback: ['Georgia'],
})

export default function App({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        :root {
          --font-family: ${serif.style.fontFamily};
          --font-script: ${script.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  )
}
