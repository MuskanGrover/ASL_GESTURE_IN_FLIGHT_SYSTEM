"use client";

import React, { useState } from "react";
import GestureCursor from "./gesture-cursor";
import Link from "next/link";

export default function ClientLayout({ children }) {
  const [useGesture, setUseGesture] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-gray-1000 backdrop-blur-md shadow-md px-6 text-gray-200 py-4">
        <div className="max-w-7xl mx-auto flex h-12 justify-between items-center">
          <div className="flex items-center">
            <img className="h-10 w-10 mr-1" src="logo.png" alt="Logo" />
            <h1 className="text-2xl font-bold">ASL Flight System</h1>
          </div>
          <nav className="space-x-4 flex items-center">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/About" className="hover:underline">About</Link>
            <Link href="/Contacts" className="hover:underline">Contacts</Link>
            <button
              onClick={() => setUseGesture((prev) => !prev)}
              className="ml-4 bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-white text-sm transition"
            >
              {useGesture ? "Disable Gesture" : "Enable Gesture"}
            </button>
          </nav>
        </div>
      </header>

      {/* Enable Gesture */}
      {useGesture && <GestureCursor />}

      {/* Main */}
      <main className="flex-grow px-6 py-8 max-w-7xl mx-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-lightblue text-white text-center text-sm py-4 mt-10">
        <p>&copy; {new Date().getFullYear()} © 2025 ASL Flight System — Built with ❤️ for accessibility</p>
      </footer>
    </div>
  );
}
