// app/not-found.js
import Link from "next/link";
import React from "react";
import ClientLayout from "./components/client-layout";

export default function NotFound() {
  return (
    <ClientLayout>
    <div className="flex flex-col items-center justify-center h-screen text-center px-4 relative overflow-hidden text-amber-50">
      {/* Airplane Emoji Animation */}
      <div className="absolute top-20 left-[-100px] animate-plane text-5xl">
        ✈️
      </div>

      <h1 className="text-6xl font-bold mb-4 z-10 text-white">404</h1>
      <p className="text-2xl mb-6 z-10 text-gray-500">Oops! Page not found.</p>
      <p className="text-lg mb-8 text-gray-400 z-10">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="z-10 bg-lightblue hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition"
      >
        Return to Home
      </Link>
    </div>
    </ClientLayout>
  );
}
