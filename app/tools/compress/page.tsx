'use client'

import React, { useState, useEffect } from 'react'
import { Upload, Download, Check, Minimize2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CompressPDFPage() {
  // Track page view for analytics
  useEffect(() => {
    console.log('📊 Compress PDF page viewed at:', new Date().toLocaleString())
  }, [])

  const [file, setFile] = useState<File | null>(null)
  const [compressing, setCompressing] = useState(false)
  const [compressedPdfUrl, setCompressedPdfUrl] = useState<string | null>(null)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile)
        setOriginalSize(selectedFile.size)
      }
    }
  }

  const compressPDF = async () => {
    if (!file) return

    setCompressing(true)
    
    try {
      const { PDFDocument } = await import('pdf-lib')
      
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      
      // Remove metadata to reduce size
      pdfDoc.setTitle('')
      pdfDoc.setAuthor('')
      pdfDoc.setSubject('')
      pdfDoc.setKeywords([])
      pdfDoc.setProducer('')
      pdfDoc.setCreator('')
      
      const compressedPdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      })
      
      setCompressedSize(compressedPdfBytes.length)
      
      const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      setCompressedPdfUrl(url)
    } catch (error) {
      console.error('Error compressing PDF:', error)
      alert('Error compressing PDF. Please try again.')
    } finally {
      setCompressing(false)
    }
  }

  const downloadCompressedPdf = () => {
  if (!compressedPdfUrl) return
  
  try {
    const a = document.createElement('a')
    a.href = compressedPdfUrl
    a.download = 'compressed-document.pdf'
    a.rel = 'noopener noreferrer'
    a.style.display = 'none'
    
    document.body.appendChild(a)
    a.click()
    
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(compressedPdfUrl)
    }, 100)
    
  } catch (error) {
    console.error('Download error:', error)
    alert('Download failed. Please try again.')
  }
}
  const resetTool = () => {
    setFile(null)
    setCompressedPdfUrl(null)
    setOriginalSize(0)
    setCompressedSize(0)
    if (compressedPdfUrl) {
      URL.revokeObjectURL(compressedPdfUrl)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const compressionPercentage = originalSize > 0 
    ? Math.round(((originalSize - compressedSize) / originalSize) * 100) 
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
            <Minimize2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Compress PDF</h1>
          <p className="text-base sm:text-xl text-slate-400">Reduce PDF file size without losing quality</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 backdrop-blur-sm">
          {!compressedPdfUrl ? (
            <>
              {!file ? (
                <div className="border-2 border-dashed border-slate-700 hover:border-slate-600 rounded-xl p-6 sm:p-12 text-center transition-all">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                  <p className="text-lg mb-2">Drop your PDF file here or click to browse</p>
                  <p className="text-sm text-slate-500 mb-4">Maximum file size: 10MB</p>
                  <input
                    type="file"
                    id="file-input"
                    accept="application/pdf"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-input"
                    className="inline-block bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-lg cursor-pointer transition-colors"
                  >
                    Select File
                  </label>
                </div>
              ) : (
                <div>
                  <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono text-sm mb-1">{file.name}</p>
                        <p className="text-xs text-slate-400">Original size: {formatFileSize(file.size)}</p>
                      </div>
                      <button
                        onClick={() => setFile(null)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={compressPDF}
                    disabled={compressing}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    {compressing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Compressing...
                      </>
                    ) : (
                      <>
                        <Minimize2 className="w-5 h-5" />
                        Compress PDF
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">PDF Compressed Successfully!</h3>
              <p className="text-slate-400 mb-6">Your compressed PDF is ready to download</p>
              
              <div className="bg-slate-800/50 rounded-lg p-6 mb-8 max-w-md mx-auto">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">Original size:</span>
                  <span className="font-mono">{formatFileSize(originalSize)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">Compressed size:</span>
                  <span className="font-mono text-green-400">{formatFileSize(compressedSize)}</span>
                </div>
                <div className="border-t border-slate-700 mt-4 pt-4 flex justify-between">
                  <span className="text-slate-400">Space saved:</span>
                  <span className="font-mono text-green-400 font-bold">{compressionPercentage}%</span>
                </div>
              </div>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={downloadCompressedPdf}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-lg font-medium flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Download className="w-5 h-5" />
                  Download Compressed PDF
                </button>
                <button
                  onClick={resetTool}
                  className="border border-slate-700 hover:border-slate-600 px-8 py-4 rounded-lg font-medium transition-colors"
                >
                  Compress Another
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6 text-sm">
          <div className="bg-slate-800/30 rounded-lg p-6">
            <h3 className="font-bold mb-2">🔒 Private & Secure</h3>
            <p className="text-slate-400">Files are processed in your browser. Never uploaded to any server.</p>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-6">
            <h3 className="font-bold mb-2">⚡ Lightning Fast</h3>
            <p className="text-slate-400">Instant compression with no waiting for uploads or processing.</p>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-6">
            <h3 className="font-bold mb-2">✨ No Quality Loss</h3>
            <p className="text-slate-400">Optimized compression maintains document quality and readability.</p>
          </div>
        </div>
      </div>
    </div>
  )
}