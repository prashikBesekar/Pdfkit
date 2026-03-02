"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Upload,
  Download,
  Check,
  Scissors,
  ArrowLeft,
  FileText,
} from "lucide-react";

export default function SplitPDFPage() {
  // Track page view for analytics
  useEffect(() => {
    console.log("📊 Split PDF page viewed at:", new Date().toLocaleString());
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [splitting, setSplitting] = useState(false);
  const [splitPdfUrl, setSplitPdfUrl] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);

        // Get page count
        try {
          const { PDFDocument } = await import("pdf-lib");
          const arrayBuffer = await selectedFile.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          const pages = pdfDoc.getPageCount();
          setPageCount(pages);
          setEndPage(pages);
        } catch (error) {
          console.error("Error reading PDF:", error);
        }
      }
    }
  };

  const splitPDF = async () => {
    if (!file) return;

    // Validation
    if (startPage < 1 || endPage > pageCount || startPage > endPage) {
      alert(`Please enter valid page numbers (1-${pageCount})`);
      return;
    }

    setSplitting(true);

    try {
      const { PDFDocument } = await import("pdf-lib");

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Create new PDF with selected pages
      const newPdf = await PDFDocument.create();

      // Copy pages (convert to 0-based index)
      for (let i = startPage - 1; i < endPage; i++) {
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(copiedPage);
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setSplitPdfUrl(url);
    } catch (error) {
      console.error("Error splitting PDF:", error);
      alert("Error splitting PDF. Please try again.");
    } finally {
      setSplitting(false);
    }
  };

  const downloadSplitPdf = () => {
    if (!splitPdfUrl) return;

    try {
      const a = document.createElement("a");
      a.href = splitPdfUrl;
      a.download = `split-pages-${startPage}-to-${endPage}.pdf`;
      a.rel = "noopener noreferrer";
      a.style.display = "none";

      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(splitPdfUrl);
      }, 100);
    } catch (error) {
      console.error("Download error:", error);
      alert("Download failed. Please try again.");
    }
  };

  const resetTool = () => {
    setFile(null);
    setSplitPdfUrl(null);
    setPageCount(0);
    setStartPage(1);
    setEndPage(1);
    if (splitPdfUrl) {
      URL.revokeObjectURL(splitPdfUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Noise texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-[1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold font-mono">DocMerge</span>
          </Link>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mb-4">
            <Scissors className="w-8 h-8" />
          </div>
          <h1 className="sm:text-4xl font-bold mb-4 text-3xl ">Split PDF</h1>
          <p className="sm:text-xl text-base text-slate-400">
            Extract specific pages from your PDF
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 backdrop-blur-sm">
          {!splitPdfUrl ? (
            <>
              {!file ? (
                <div className="border-2 border-dashed border-slate-700 hover:border-slate-600 rounded-xl p-12 text-center transition-all">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-slate-500 p-6 sm:p-12" />
                  <p className="text-lg mb-2">
                    Drop your PDF file here or click to browse
                  </p>
                  <p className="text-sm text-slate-500 mb-4">
                    Select which pages to extract
                  </p>
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
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <span className="font-mono text-sm">{file.name}</span>
                      </div>
                      <button
                        onClick={() => setFile(null)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-sm text-slate-400">
                      Total pages: {pageCount}
                    </p>
                  </div>

                  <div className="space-y-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Start Page
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={pageCount}
                        value={startPage}
                        onChange={(e) =>
                          setStartPage(parseInt(e.target.value) || 1)
                        }
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-4 sm:py-3 text-lg sm:text-base focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        End Page
                      </label>
                      <input
                        type="number"
                        min={startPage}
                        max={pageCount}
                        value={endPage}
                        onChange={(e) =>
                          setEndPage(parseInt(e.target.value) || pageCount)
                        }
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors "
                      />
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <p className="text-sm text-blue-300">
                        📄 You'll extract{" "}
                        <strong>{endPage - startPage + 1}</strong> page(s) (from
                        page {startPage} to {endPage})
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={splitPDF}
                    disabled={splitting}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 py-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    {splitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Extracting Pages...
                      </>
                    ) : (
                      <>
                        <Scissors className="w-5 h-5" />
                        Extract Pages
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
              <h3 className="text-2xl font-bold mb-2">
                Pages Extracted Successfully!
              </h3>
              <p className="text-slate-400 mb-6">
                Your new PDF with pages {startPage} to {endPage} is ready
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={downloadSplitPdf}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-8 py-4 rounded-lg font-medium flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Download className="w-5 h-5" />
                  Download Split PDF
                </button>
                <button
                  onClick={resetTool}
                  className="border border-slate-700 hover:border-slate-600 px-8 py-4 rounded-lg font-medium transition-colors"
                >
                  Split Another
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6 text-sm">
          <div className="bg-slate-800/30 rounded-lg p-6">
            <h3 className="font-bold mb-2">✂️ Precise Extraction</h3>
            <p className="text-slate-400">
              Choose exactly which pages you want to keep from your PDF.
            </p>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-6">
            <h3 className="font-bold mb-2">🔒 Privacy First</h3>
            <p className="text-slate-400">
              Your files are processed locally in your browser. Never uploaded.
            </p>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-6">
            <h3 className="font-bold mb-2">⚡ Instant Results</h3>
            <p className="text-slate-400">
              Extract pages in seconds with no waiting or uploading.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
