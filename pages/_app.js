import localFont from 'next/font/local'
import '../styles/globals.css'

const weddingFont = localFont({
  src: [
    { path: '../node_modules/@fontsource-variable/bitter/files/bitter-latin-wght-normal.woff2', weight: '100 900', style: 'normal' },
    { path: '../node_modules/@fontsource-variable/bitter/files/bitter-latin-wght-italic.woff2', weight: '100 900', style: 'italic' },
  ],
  display: 'swap',
  fallback: ['Georgia'],
})

const namesFont = localFont({
  src: '../node_modules/@fontsource-variable/dancing-script/files/dancing-script-latin-wght-normal.woff2',
  weight: '400 700',
  display: 'swap',
  fallback: ['Georgia'],
})

export default function App({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        :root {
          --display: ${weddingFont.style.fontFamily};
          --text: ${weddingFont.style.fontFamily};
          --names: ${namesFont.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  )
}
