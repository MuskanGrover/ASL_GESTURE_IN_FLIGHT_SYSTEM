"use client";

import ClientLayout from "../components/client-layout";

export default function Contact() {
  return (
    <ClientLayout>
    <div className="min-h-screen flex flex-col items-center justify-center mt-10 px-8 py-18 bg-gray-950 text-gray-100 text-center">
      <div className="max-w-3xl w-full">
        <h1 className="text-5xl font-extrabold mb-6 text-blue-500 drop-shadow-md">
          Contact Us
        </h1>

        <p className="text-lg md:text-xl mb-10 text-gray-300 leading-relaxed">
          We'd love to hear from you! Whether you have questions, feedback, or just want to
          connect—our team is ready to help.
        </p>

        <div className="space-y-6 text-left text-gray-300 bg-gray-900 p-8 rounded-2xl shadow-lg">
          <div>
            <h2 className="text-2xl font-bold text-blue-400 mb-1">Email</h2>
            <p>
              <a href="mailto:support@aslflightsystem.com" className="underline hover:text-blue-300">
                support@aslflightsystem.com
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-blue-400 mb-1">Phone</h2>
            <p>+1 (555) 123-4567</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-blue-400 mb-1">Address</h2>
            <p>
              ASL Flight System Headquarters<br />
              123 Innovation Ave,<br />
              SkyCity, SC 54321
            </p>
          </div>
        </div>

        <p className="text-sm mt-10 text-gray-400">
          Prefer forms? Visit our{" "}
          <a href="/ContactForm" className="text-blue-400 underline hover:text-blue-300">
            Contact Form page
          </a>.
        </p>
      </div>
    </div>
    </ClientLayout>
  );
}
