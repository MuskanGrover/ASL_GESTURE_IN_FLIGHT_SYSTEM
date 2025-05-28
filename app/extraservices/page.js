"use client";

import React, { useEffect } from "react";
import ClientLayout from "../components/client-layout";
import { CheckCircle } from "lucide-react";

const services = [
  "Wheelchair assistance on boarding and deboarding",
  "Priority check-in and boarding",
  "Seat selection near aisle or lavatory",
  "Braille safety cards and menus",
  "Onboard sign language support via AI",
  "Assistance with in-flight meals",
  "In-flight entertainment with captions & audio descriptions",
  "Dedicated crew support during the flight",
  "Assistance with stowing and retrieving carry-on items",
  "Special medical support and oxygen if needed",
];

export default function ExtraServices() {
  useEffect(() => {
    const bell = new Audio("/sound/cabin_chime.mp3");
    bell.play().catch((err) => console.warn("🔇 Auto-play blocked:", err));
  }, []);

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white px-4 py-16">
        <h1 className="text-5xl font-bold text-center text-amber-400 mb-12">
          Extra Services for Specially Abled 🧡
        </h1>

        <div className="max-w-4xl mx-auto grid gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="flex items-center gap-4 bg-gray-900 border border-gray-800 p-4 rounded-xl shadow hover:border-amber-400 transition duration-200"
            >
              <CheckCircle className="text-amber-400 w-6 h-6" />
              <span className="text-lg">{service}</span>
            </div>
          ))}
        </div>
      </div>
    </ClientLayout>
  );
}
