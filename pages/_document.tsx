import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preconnect critical origins */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preload primary font */}
        <link
          rel="preload"
          href="/fonts/cinzel/Cinzel-VariableFont_wght.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Preload LCP teaser image */}
        <link rel="preload" as="image" href="/images/teaser-dungeon.png" imagesrcset="/images/teaser-dungeon.png 1280w" imagesizes="(min-width: 768px) 50vw, 100vw" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
