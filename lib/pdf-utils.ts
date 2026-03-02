import { PDFDocument } from 'pdf-lib'

/**
 * Merge multiple PDF files into one
 * @param files Array of PDF File objects
 * @returns Merged PDF as Uint8Array
 */
export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create()
  
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    copiedPages.forEach((page) => mergedPdf.addPage(page))
  }
  
  return await mergedPdf.save()
}

/**
 * Compress a PDF file by removing metadata and optimizing
 * @param file PDF File object
 * @returns Compressed PDF as Uint8Array
 */
export async function compressPDF(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(arrayBuffer)
  
  // Remove metadata to reduce file size
  pdfDoc.setTitle('')
  pdfDoc.setAuthor('')
  pdfDoc.setSubject('')
  pdfDoc.setKeywords([])
  pdfDoc.setProducer('')
  pdfDoc.setCreator('')
  
  return await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  })
}

/**
 * Split a PDF file into multiple PDFs based on page ranges
 * @param file PDF File object
 * @param pageRanges Array of [start, end] page numbers (1-indexed)
 * @returns Array of split PDFs as Uint8Array
 */
export async function splitPDF(
  file: File, 
  pageRanges: number[][]
): Promise<Uint8Array[]> {
  const arrayBuffer = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(arrayBuffer)
  const results: Uint8Array[] = []
  
  for (const range of pageRanges) {
    const newPdf = await PDFDocument.create()
    const [start, end] = range
    
    for (let i = start - 1; i < end; i++) {
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [i])
      newPdf.addPage(copiedPage)
    }
    
    results.push(await newPdf.save())
  }
  
  return results
}

/**
 * Extract specific pages from a PDF
 * @param file PDF File object
 * @param pageNumbers Array of page numbers to extract (1-indexed)
 * @returns New PDF with extracted pages as Uint8Array
 */
export async function extractPages(
  file: File,
  pageNumbers: number[]
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(arrayBuffer)
  const newPdf = await PDFDocument.create()
  
  for (const pageNum of pageNumbers) {
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum - 1])
    newPdf.addPage(copiedPage)
  }
  
  return await newPdf.save()
}

/**
 * Get information about a PDF file
 * @param file PDF File object
 * @returns Object with PDF metadata and info
 */
export async function getPDFInfo(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(arrayBuffer)
  
  return {
    pageCount: pdfDoc.getPageCount(),
    title: pdfDoc.getTitle(),
    author: pdfDoc.getAuthor(),
    subject: pdfDoc.getSubject(),
    creator: pdfDoc.getCreator(),
    producer: pdfDoc.getProducer(),
    creationDate: pdfDoc.getCreationDate(),
    modificationDate: pdfDoc.getModificationDate(),
  }
}

/**
 * Download a PDF file
 * @param pdfBytes PDF as Uint8Array
 * @param filename Name for the downloaded file
 */
export function downloadPDF(pdfBytes: Uint8Array, filename: string) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Format file size in human-readable format
 * @param bytes File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

