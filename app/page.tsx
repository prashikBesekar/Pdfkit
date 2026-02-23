'use client'

import React, { useState, useCallback } from 'react'
// ... rest of the component code

const HomePage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl font-bold">Welcome to PDFKit App</h1>
            <p className="mt-4 text-lg">This is a Next.js application using PDFKit and Tailwind CSS.</p>
        </div>
    );
};

export default HomePage;