import './globals.css'

export const metadata = {
  title: 'Audio Transcription App',
  description: 'Convert audio files to text using AI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}