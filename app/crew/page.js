"use client";

import React, { useEffect, useRef } from "react";
import ClientLayout from "../components/client-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

const services = [
  "Special meal assistance",
  "Help with seating and comfort",
  "In-flight medical support",
  "Assistance with entertainment system",
  "Help accessing restroom facilities",
  "Emergency support",
];

export default function CrewAssistance() {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => {
        // Sometimes browsers block autoplay, so handle errors silently
        console.warn("Audio play prevented:", err);
      });
    }
  }, []);

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white px-4 py-20">
        {/* Hidden audio element to play bell sound */}
        <audio ref={audioRef} src="/sound/cabin_chime.mp3" preload="auto" />

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-amber-400 mb-4">Crew Assistance 👩‍✈️</h1>
          <p className="text-lg text-gray-300 pt-7">
            Our crew member has been notified and will be assisting you shortly with the following services:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {services.map((service, idx) => (
            <Card
              key={idx}
              className="bg-gray-900 border border-gray-800 hover:border-amber-400 transition duration-300 rounded-2xl shadow-lg"
            >
              <CardContent className="p-6 flex items-center gap-4">
                <Sparkles className="text-amber-400 w-6 h-6 flex-shrink-0" />
                <span className="text-white font-medium">{service}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ClientLayout>
  );
}
