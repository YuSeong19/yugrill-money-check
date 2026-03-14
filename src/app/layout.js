import './globals.css'

export const metadata = {
  title: 'YuGrill ระบบบันทึกเงิน',
  description: 'ระบบบันทึกเงินสด YuGrill',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&family=Cinzel:wght@600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/icon-192.png" type="image/png"/>
        <link rel="apple-touch-icon" href="/icon-192.png"/>
        <link rel="manifest" href="/manifest.json"/>
        <meta name="theme-color" content="#e07b2a"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
      </head>
      <body>{children}</body>
    </html>
  )
}
