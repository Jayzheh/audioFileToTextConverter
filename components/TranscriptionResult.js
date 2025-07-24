'use client'

import { useState } from 'react'
import { Copy, Download, Check, Trash2 } from 'lucide-react'
import jsPDF from 'jspdf'

export default function TranscriptionResult({ transcription, onClear }) {
  const [copied, setCopied] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transcription)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        // Auto-clear after copy for privacy
        if (onClear) {
          setTimeout(() => onClear(), 1000)
        }
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    const margin = 20
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    const textWidth = pageWidth - 2 * margin
    
    doc.setFontSize(16)
    doc.text('Audio Transcription', margin, margin + 10)
    
    doc.setFontSize(12)
    const splitText = doc.splitTextToSize(transcription, textWidth)
    let y = margin + 30
    
    splitText.forEach((line) => {
      if (y > pageHeight - margin) {
        doc.addPage()
        y = margin
      }
      doc.text(line, margin, y)
      y += 7
    })
    
    doc.save('transcription.pdf')
    
    // Show downloaded state and auto-clear for privacy
    setDownloaded(true)
    setTimeout(() => {
      setDownloaded(false)
      if (onClear) {
        onClear()
      }
    }, 2000)
  }

  const handleClearResults = () => {
    if (onClear && confirm('Are you sure you want to clear the transcription results?')) {
      onClear()
    }
  }

  if (!transcription) return null

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Transcription Result</h2>
          <div className="flex space-x-3">
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              disabled={copied}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              onClick={downloadPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              disabled={downloaded}
            >
              {downloaded ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
            <button
              onClick={handleClearResults}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>
        
        <div className="prose max-w-none">
          <div className="bg-gray-50 rounded-md p-4 border">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {transcription}
            </p>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Privacy:</strong> Your transcription will be automatically cleared after copying or downloading. 
            No data is stored on the server.
          </p>
        </div>
      </div>
    </div>
  )
}