"use client";

import ClientLayout from "../components/client-layout";

export default function About() {
  return (
    <ClientLayout>
    <div className="min-h-screen flex flex-col items-center justify-center mt-10 px-10 py-20 bg-gray-950 text-gray-100 text-center">
      <div className="max-w-4xl">
        <h1 className="text-5xl font-extrabold mb-6 text-blue-500 drop-shadow-md">
          About ASL Flight System
        </h1>

        <p className="text-lg md:text-xl mb-8 leading-relaxed text-gray-300">
          ASL Flight System is a next-generation accessibility platform built for air travel.
          We harness the power of gesture recognition and sign language to make the flying
          experience more inclusive for everyone—especially the deaf and hard-of-hearing
          community.
        </p>

        <p className="text-lg md:text-xl mb-8 leading-relaxed text-gray-300">
          Our intuitive interface allows users to interact with in-flight services using
          natural ASL gestures. Whether you're ordering food, requesting assistance, or
          enjoying entertainment, everything is just a gesture away.
        </p>

        <p className="text-lg md:text-xl mb-8 leading-relaxed text-gray-300">
          Built with care, inclusivity, and advanced AI, the ASL Flight System is committed to
          transforming how we experience accessibility in the skies.
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-4 text-blue-400">Our Vision</h2>
        <p className="text-lg md:text-xl mb-8 text-gray-300">
          To break communication barriers in aviation and create a future where air travel is
          empowering for all passengers, regardless of their ability to hear or speak.
        </p>

        <h2 className="text-3xl font-bold mb-4 text-blue-400">Get in Touch</h2>
        <p className="text-lg md:text-xl text-gray-300">
          We'd love to hear from you. Reach out via our{" "}
          <a href="/Contact" className="text-blue-500 underline hover:text-blue-300">
            Contact page
          </a>{" "}
          or email us at{" "}
          <a href="mailto:support@aslflightsystem.com" className="text-blue-500 underline hover:text-blue-300">
            support@aslflightsystem.com
          </a>.
        </p>
      </div>
    </div>
    </ClientLayout>
  );
}
