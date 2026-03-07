"use client";

import React, { useState, useCallback, useEffect } from "react";
import { getCurrentUser, signOut } from '../lib/supabase'
import { canUserPerformOperation, incrementUserOperation } from '../lib/usage'
import UpgradeButton from '../app/components/UpgradeButton'

import {
  Upload,
  FileText,
  Zap,
  Shield,
  Download,
  Check,
  X,
  Menu,
  Scissors,
  User,
  LogOut, 
  Link as LucideLink,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  // Track page view for analytics
  useEffect(() => {
    console.log("📊 Homepage viewed at:", new Date().toLocaleString());
  }, []);

  const [files, setFiles] = useState<File[]>([]);
  const [merging, setMerging] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)


  // Track scroll for header shadow
useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 20)
  }
  
  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}, [])

  // Check if user is logged in
useEffect(() => {
  const checkAuth = async () => {
    const { user } = await getCurrentUser()
    setUser(user)
    setLoading(false)
  }
  checkAuth()
}, [])

const handleSignOut = async () => {
  await signOut()
  setUser(null)
  window.location.reload()
}

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/pdf",
    );
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(
        (file) => file.type === "application/pdf",
      );
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const mergePDFs = async () => {
  if (files.length < 2) {
    alert('Please add at least 2 PDF files to merge')
    return
  }

  // Check authentication
  const { user } = await getCurrentUser()

  if (user) {
    // User is logged in - check usage limits
    const { canPerform, remaining, isPremium } = await canUserPerformOperation(user.id)

   if (!canPerform) {
  const upgrade = window.confirm(
    `Daily limit reached! You have 0 operations remaining today.\n\nUpgrade to Premium for unlimited access?\n\nClick OK to upgrade now, or Cancel to wait until tomorrow.`
  )
  
  if (upgrade) {
    window.location.href = '/#pricing'
  }
  return
}
  }

  setMerging(true)
  
  try {
    const { PDFDocument } = await import('pdf-lib')
    
    const mergedPdf = await PDFDocument.create()
    
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      copiedPages.forEach((page) => mergedPdf.addPage(page))
    }
    
    const mergedPdfBytes = await mergedPdf.save()
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    
    setMergedPdfUrl(url)

    // Increment usage count if user is logged in
    if (user) {
      await incrementUserOperation(user.id)
    }
  } catch (error) {
    console.error('Error merging PDFs:', error)
    alert('Error merging PDFs. Please try again.')
  } finally {
    setMerging(false)
  }
}
  const downloadMergedPdf = () => {
    if (!mergedPdfUrl) return;

    try {
      // Create a temporary link element
      const a = document.createElement("a");
      a.href = mergedPdfUrl;
      a.download = "merged-document.pdf"; // More descriptive name
      a.rel = "noopener noreferrer"; // Security attribute

      // Style it (even though invisible)
      a.style.display = "none";

      // Add to document, click, and remove
      document.body.appendChild(a);
      a.click();

      // Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(mergedPdfUrl); // Free up memory
      }, 100);
    } catch (error) {
      console.error("Download error:", error);
      alert("Download failed. Please try again.");
    }
  };

  const resetTool = () => {
    setFiles([]);
    setMergedPdfUrl(null);
    if (mergedPdfUrl) {
      URL.revokeObjectURL(mergedPdfUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-[1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
<header className={`sticky top-0 z-50 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 transition-shadow ${
  scrolled ? 'shadow-lg shadow-black/20' : ''
}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold font-mono">DocMerge</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8 text-sm">
            <a href="#merge" className="hover:text-cyan-400 transition-colors">
              Merge
            </a>
            <a
              href="/tools/compress"
              className="hover:text-cyan-400 transition-colors"
            >
              Compress
            </a>
            <a
              href="/tools/split"
              className="hover:text-cyan-400 transition-colors"
            >
              Split
            </a>
            <a
              href="#pricing"
              className="hover:text-cyan-400 transition-colors"
            >
              Pricing
            </a>
          </nav>
 <div className="hidden md:flex items-center gap-4">
      {loading ? (
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      ) : user ? (
        <>
          {/* User Info */}
          <Link href="/dashboard" className="flex items-center gap-3 hover:bg-slate-800/50 px-3 py-2 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">{user.user_metadata?.full_name || 'User'}</p>
              <p className="text-xs text-slate-400">Dashboard</p>
            </div>
          </Link>
          
          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </>
      ) : (
        <Link href="/login">
          <button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 px-6 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-cyan-500/30">
            Sign In
          </button>
        </Link>
      )}
    </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm">
            <nav className="px-4 py-4 space-y-4">
              <a
                href="#merge"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 hover:bg-slate-800 rounded-lg transition-colors"
              >
                📄 Merge PDFs
              </a>
              <a
                href="/tools/compress"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 hover:bg-slate-800 rounded-lg transition-colors"
              >
                ⚡ Compress PDF
              </a>
              <a
                href="/tools/split"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 hover:bg-slate-800 rounded-lg transition-colors"
              >
                ✂️ Split PDF
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 hover:bg-slate-800 rounded-lg transition-colors"
              >
                💰 Pricing
              </a>
              {loading ? (
          <div className="px-4 py-3 flex justify-center">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : user ? (
          <>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{user.user_metadata?.full_name || 'User'}</p>
                  <p className="text-xs text-slate-400">Go to Dashboard</p>
                </div>
              </div>
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </>
        ) : (
          <Link href="/login" className="w-full block" onClick={() => setMobileMenuOpen(false)}>
            <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 px-4 py-3 rounded-lg text-sm font-medium transition shadow-lg shadow-cyan-500/30">
              Sign In
            </button>
          </Link>
        )}

            </nav>
          </div>
        )}
      </header>



      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 pt-20 pb-16">
        <section className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-mono text-cyan-300">
              Your files never leave your browser
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            The Easiest Way
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 bg-clip-text text-transparent">
              {" "}
              to Work with PDFs{" "}
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-8 max-w-2xl mx-auto px-4">
            {" "}
            Merge, compress, split, and convert PDFs instantly. Client-side
            processing means your files stay private and processing is lightning
            fast.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center px-4">
            <button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all hover:scale-105 w-full sm:w-auto">
              <Zap className="w-5 h-5" />
              Try Free Now
            </button>
            <button className="border border-slate-700 hover:border-slate-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium transition w-full sm:w-auto">
              View All Tools
            </button>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg">
              Simple, fast, and secure in 3 easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-sky-500 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-10 h-10" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Upload Your Files</h3>
              <p className="text-slate-400">
                Select or drag & drop your PDF files. Works with multiple files
                for merging.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-10 h-10" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Process Instantly</h3>
              <p className="text-slate-400">
                Click the button and watch the magic happen. Processing takes
                just seconds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto">
                  <Download className="w-10 h-10" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Download Result</h3>
              <p className="text-slate-400">
                Download your processed PDF instantly. No waiting, no email
                required.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <a
              href="#merge"
              className="inline-block bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 px-8 py-4 rounded-lg font-medium transition-all hover:scale-105"
            >
              Try It Now - It's Free!
            </a>
          </div>
        </section>

        {/* PDF Merge Tool */}
        <div
          id="merge"
          className="bg-gradient-to-br from-cyan-500/10 to-sky-500/10 border border-cyan-500/20 rounded-2xl p-8 max-w-4xl mx-auto backdrop-blur-sm shadow-xl shadow-cyan-500/10 hover:border-cyan-500/40 transition-all"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-cyan-400" />
              </div>
              Merge PDFs
            </h2>
            <p className="text-slate-400">
              Combine multiple PDF files into one document
            </p>
          </div>

          {!mergedPdfUrl ? (
            <>
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-6 sm:p-12 text-center transition-all ${
                  dragActive
                    ? "border-cyan-500 bg-cyan-500/10"
                    : "border-slate-700 hover:border-slate-600"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-slate-500" />
                <p className="text-base sm:text-lg mb-2">
                  Drop PDF files here or click to browse
                </p>
                <p className="text-xs sm:text-sm text-slate-500 mb-4">
                  Support for multiple files
                </p>
                <input
                  type="file"
                  id="file-input"
                  multiple
                  accept="application/pdf"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <label
                  htmlFor="file-input"
                  className="inline-block bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-lg cursor-pointer transition-colors"
                >
                  Select Files
                </label>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm text-slate-400">
                      {files.length} file(s) selected
                    </p>
                    <button
                      onClick={() => setFiles([])}
                      className="text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>

                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-slate-800/50 rounded-lg p-4 animate-[slideIn_0.3s_ease-out]"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-cyan-400" />
                        <span className="font-mono text-sm">{file.name}</span>
                        <span className="text-xs text-slate-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={mergePDFs}
                    disabled={merging || files.length < 2}
                    className="w-full bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 py-4 rounded-lg font-medium mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    {merging ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Merging PDFs...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Merge {files.length} PDFs
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Success State */
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">
                PDF Merged Successfully!
              </h3>
              <p className="text-slate-400 mb-8">
                Your merged PDF is ready to download
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={downloadMergedPdf}
                  className="bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 px-8 py-4 rounded-lg font-medium flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Download className="w-5 h-5" />
                  Download Merged PDF
                </button>
                <button
                  onClick={resetTool}
                  className="border border-slate-700 hover:border-slate-600 px-8 py-4 rounded-lg font-medium transition-colors"
                >
                  Merge Another
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative z-10 max-w-7xl mx-auto px-4 py-20"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose DocMerge?</h2>
          <p className="text-slate-400 text-lg">
            Built for speed, privacy, and simplicity
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              icon: Zap,
              title: "Lightning Fast",
              description:
                "Client-side processing means instant results. No uploading, no waiting, no servers.",
              color: "blue",
            },
            {
              icon: Shield,
              title: "100% Private",
              description:
                "Your files never leave your browser. We can't see them, nobody can. Complete privacy.",
              color: "purple",
            },
            {
              icon: FileText,
              title: "All Tools Included",
              description:
                "Merge, split, compress, convert, and more. Everything you need for PDF management.",
              color: "pink",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-cyan-500/10 to-sky-500/10 border border-cyan-500/20 rounded-xl p-8 hover:border-cyan-500/40 transition-all hover:shadow-lg hover:shadow-cyan-500/10 group"
            >
              <div
                className={`w-14 h-14 bg-${feature.color}-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className={`w-7 h-7 text-${feature.color}-400`} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* All Tools Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">All PDF Tools</h2>
          <p className="text-slate-400 text-lg">
            Everything you need to work with PDFs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Merge Tool */}
          <Link href="#merge">
            <div className="bg-gradient-to-br from-cyan-500/10 to-sky-500/10 border border-cyan-500/20 rounded-xl p-8 hover:border-cyan-500/40 transition-all hover:scale-[1.02] cursor-pointer group">
              <div className="w-14 h-14 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Merge PDFs</h3>
              <p className="text-slate-400 mb-4">
                Combine multiple PDF files into a single document
              </p>
              <span className="text-cyan-400 text-sm font-medium">
                Try it now →
              </span>
            </div>
          </Link>

          {/* Compress Tool */}
          <Link href="/tools/compress">
            <div className="bg-gradient-to-br from-sky-500/10 to-blue-500/10 border border-sky-500/20 rounded-xl p-8 hover:border-sky-500/40 transition-all hover:scale-[1.02] cursor-pointer group">
              <div className="w-14 h-14 bg-sky-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-sky-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Compress PDF</h3>
              <p className="text-slate-400 mb-4">
                Reduce PDF file size without losing quality
              </p>
              <span className="text-sky-400 text-sm font-medium">
                Try it now →
              </span>
            </div>
          </Link>

          {/* Split Tool - NEW! */}
          <Link href="/tools/split">
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-8 hover:border-orange-500/40 transition-all hover:scale-[1.02] cursor-pointer group">
              <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Scissors className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Split PDF</h3>
              <p className="text-slate-400 mb-4">
                Extract specific pages from your PDF document
              </p>
              <span className="text-orange-400 text-sm font-medium">
                Try it now →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Loved by Thousands</h2>
          <p className="text-slate-400 text-lg">
            See what our users are saying
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400">
                  ⭐
                </span>
              ))}
            </div>
            <p className="text-slate-300 mb-6">
              "Finally, a PDF tool that doesn't upload my files to some random
              server. Fast, private, and actually works!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-full flex items-center justify-center text-xl font-bold">
                S
              </div>
              <div>
                <p className="font-semibold">Sarah Johnson</p>
                <p className="text-sm text-slate-500">Freelance Designer</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400">
                  ⭐
                </span>
              ))}
            </div>
            <p className="text-slate-300 mb-6">
              "I merge PDFs every day for work. This tool saves me so much time
              compared to other solutions. The premium plan is worth every
              penny!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-xl font-bold">
                M
              </div>
              <div>
                <p className="font-semibold">Michael Chen</p>
                <p className="text-sm text-slate-500">Project Manager</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400">
                  ⭐
                </span>
              ))}
            </div>
            <p className="text-slate-300 mb-6">
              "Clean interface, no ads, super fast. Exactly what I was looking
              for. I upgraded to premium after using it once!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-xl font-bold">
                E
              </div>
              <div>
                <p className="font-semibold">Emily Rodriguez</p>
                <p className="text-sm text-slate-500">Student</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="relative z-10 max-w-7xl mx-auto px-4 py-20"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-400 text-lg">
            Start free, upgrade when you need more
          </p>

          {/* Trust Badge */}
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>30-day money back</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto px-4">
          {/* Free Plan */}
          <div className="border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-colors">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-slate-400">Perfect for occasional use</p>
            </div>

            <div className="mb-8">
              <div className="text-5xl font-bold mb-2">$0</div>
              <p className="text-slate-500">Forever free</p>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                "5 operations per day",
                "Max file size: 10MB",
                "All basic tools",
                "Browser-based processing",
                "100% private & secure",
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>

            <button className="w-full border border-slate-700 hover:border-slate-600 py-3 rounded-lg transition-colors font-medium">
              Get Started Free
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-sky-500/10 border border-cyan-500/20 rounded-2xl p-8 relative hover:border-cyan-500/40 transition-all">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-1 rounded-full text-sm font-medium">
              ⭐ Most Popular
            </div>

            <div className="mb-6 mt-4">
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <p className="text-slate-400">For power users</p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">$6</span>
                <span className="text-slate-500">/month</span>
              </div>
              <p className="text-sm text-cyan-400 mt-2">
                or $79/year (save 26%)
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                "Unlimited operations",
                "No file size limits",
                "All tools + advanced features",
                "OCR & batch processing",
                "API access for automation",
                "Priority support",
                "No watermarks",
                "Custom branding (soon)",
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>

            <UpgradeButton text="Start Free Trial" className="w-full" />

            <p className="text-center text-xs text-slate-500 mt-4">
              7-day free trial • No credit card required
            </p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">
            Feature Comparison
          </h3>

          <div className="bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold">Free</th>
                  <th className="px-6 py-4 text-center font-semibold">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {[
                  { name: "Daily operations", free: "5", premium: "Unlimited" },
                  {
                    name: "File size limit",
                    free: "10MB",
                    premium: "No limit",
                  },
                  { name: "PDF Merge", free: "✓", premium: "✓" },
                  { name: "PDF Compress", free: "✓", premium: "✓" },
                  { name: "PDF Split", free: "✓", premium: "✓" },
                  { name: "Batch processing", free: "✗", premium: "✓" },
                  { name: "OCR (text recognition)", free: "✗", premium: "✓" },
                  { name: "API access", free: "✗", premium: "✓" },
                  { name: "Priority support", free: "✗", premium: "✓" },
                ].map((row, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">{row.name}</td>
                    <td className="px-6 py-4 text-center text-slate-400">
                      {row.free}
                    </td>
                    <td className="px-6 py-4 text-center text-cyan-400 font-semibold">
                      {row.premium}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            More Tools Coming Soon! 🚀
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            We're constantly adding new features to make working with PDFs
            easier
          </p>

          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="font-medium mb-1">PDF to Word</p>
              <p className="text-xs text-slate-500">
                Convert PDFs to editable docs
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="font-medium mb-1">Rotate Pages</p>
              <p className="text-xs text-slate-500">Fix page orientation</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="font-medium mb-1">Add Watermark</p>
              <p className="text-xs text-slate-500">Protect your documents</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="font-medium mb-1">Password Protect</p>
              <p className="text-xs text-slate-500">Secure your PDFs</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 text-lg">Everything you need to know</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Are my files safe and private?",
              a: "Absolutely! All PDF processing happens directly in your browser. Your files never leave your device and are never uploaded to our servers. We can't see your files, and nobody else can either. This makes our service not only fast but also completely private and secure.",
            },
            {
              q: "Is it really free?",
              a: "Yes! You can use our basic PDF tools for free with a limit of 5 operations per day. If you need unlimited access and advanced features, you can upgrade to Premium for just $9/month. No hidden fees, no credit card required for free tier.",
            },
            {
              q: "What file size can I upload?",
              a: "Free users can upload files up to 10MB. Premium users have no file size limits. Most PDFs are well under 10MB, so the free tier works great for most people!",
            },
            {
              q: "Do I need to install anything?",
              a: "Nope! Everything works right in your browser. No downloads, no installations, no sign-ups required for basic features. Just visit the website and start using the tools immediately.",
            },
            {
              q: "Which browsers are supported?",
              a: "Our tools work on all modern browsers including Chrome, Firefox, Safari, Edge, and Opera. We recommend using the latest version of your browser for the best experience.",
            },
            {
              q: "How is this different from other PDF tools?",
              a: "Unlike other services that upload your files to their servers, we process everything locally in your browser. This means faster processing, complete privacy, and no waiting for uploads. Plus, we don't plaster ads all over the page!",
            },
            {
              q: "Can I use this for commercial purposes?",
              a: "Yes! Both free and premium users can use our tools for personal and commercial purposes. Process as many documents as you need for your business.",
            },
            {
              q: "What happens if I exceed the free limit?",
              a: "If you reach 5 operations in a day on the free tier, you'll be prompted to either wait until tomorrow or upgrade to Premium for unlimited access. Your previous work is never deleted.",
            },
          ].map((faq, index) => (
            <details
              key={index}
              className="bg-slate-800/30 border border-slate-700 rounded-xl p-4 sm:p-6 hover:border-slate-600 transition-colors group"
            >
              <summary className="cursor-pointer font-semibold text-lg flex items-center justify-between">
                {faq.q}
                <span className="text-cyan-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="mt-4 text-slate-400 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-12 text-center bg-slate-800/30 border border-slate-700 rounded-xl p-8">
          <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
          <p className="text-slate-400 mb-4">We're here to help!</p>

          <a
            href="mailto:support@yoursite.com"
            className="inline-block bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Contact Support
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold font-mono">DocMerge</span>
              </div>
              <p className="text-slate-400 text-sm">
                Fast, private, and powerful PDF tools for everyone.
              </p>
            </div>

            {[
              {
                title: "Tools",
                links: [
                  "Merge PDF",
                  "Split PDF",
                  "Compress PDF",
                  "Convert PDF",
                ],
              },
              {
                title: "Company",
                links: ["About", "Blog", "API", "Pricing"],
              },
              {
                title: "Legal",
                links: ["Privacy", "Terms", "Security", "Contact"],
              },
            ].map((column, index) => (
              <div key={index}>
                <h4 className="font-bold mb-4">{column.title}</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            © 2026 DocMerge. All rights reserved. Built with ❤️ for
            privacy-conscious users.
          </div>
        </div>
      </footer>
    </div>
  );
}
