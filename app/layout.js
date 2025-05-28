import './globals.css';
import React from 'react';



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className='bg-black'>
        {children} {/* Only server-rendered stuff here */}
      </body>
    </html>
  );
}
