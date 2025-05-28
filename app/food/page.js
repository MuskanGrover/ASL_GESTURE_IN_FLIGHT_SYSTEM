"use client";

import React, { useState, useEffect, useRef } from "react";
import ClientLayout from "../components/client-layout";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

const foodItems = [
  { name: "Potato Chips", img: "/images/Chips.jpg", key: "Chips" },
  { name: "Cookie", img: "/images/biscuit.jpg", key: "Biscuit" },
  { name: "Fruit Bowl", img: "/images/bowl.jpg", key: "Fruit" },
  { name: "Coffee", img: "/images/coffee.jpg", key: "Coffee" },
  { name: "Masala Tea", img: "/images/tea.jpg", key: "Tea" },
  { name: "Sandwich", img: "/images/sandwich.jpg", key: "Sandwich" },
];

export default function FoodPage() {
  const [cart, setCart] = useState([]);
  const [detecting, setDetecting] = useState(false);
  const [message, setMessage] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const speakIntervalRef = useRef(null);

 const speak = (text) => {
  // Cancel any ongoing or queued speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";

  window.speechSynthesis.speak(utterance);
};

  const addToCart = (itemKey) => {
    const found = foodItems.find((f) => f.key === itemKey);
    if (found && !cart.includes(found.key)) {
      setCart((prev) => [...prev, found.key]);
      const speechText = `${found.name} added to your cart`;
      setMessage(`✅ ${speechText}`);
      console.log(`🛒 ${speechText}`);
      speak(speechText);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const startRepeatedSpeech = () => {
    speak("Model is trying to detect. Please keep performing ASL gestures.");
    speakIntervalRef.current = setInterval(() => {
      speak("Model is trying to detect. Please keep performing ASL gestures.");
    }, 9000);
  };

  const stopRepeatedSpeech = () => {
    if (speakIntervalRef.current) {
      clearInterval(speakIntervalRef.current);
      speakIntervalRef.current = null;
    }
  };

  const captureFrameAndSend = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) {
      console.warn("🚫 Missing canvas or video element.");
      return;
    }

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg")
    );

    if (!blob) {
      console.error("❌ Failed to convert frame to blob.");
      return;
    }

    const formData = new FormData();
    formData.append("frame", blob);
    console.log("📤 Frame captured and sending to backend...");

    try {
      const res = await fetch("http://localhost:5000/api/detect-food", {
        method: "POST",
        body: formData,
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("❌ Expected JSON, received HTML/text:", text);
        return;
      }

      const data = await res.json();
      console.log("✅ Received from backend:", data);

      if (data.prediction && data.confidence > 0.95) {
        console.log(`🎯 Detected: ${data.prediction} (${data.confidence})`);
        addToCart(data.prediction);
        setDetecting(false);
        stopRepeatedSpeech();
        stopCamera();
      } else {
        console.log(
          `🤏 Low confidence or unknown: ${data.prediction} (${data.confidence})`
        );
      }
    } catch (err) {
      console.error("❌ Error sending frame or parsing response:", err);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        console.log("📷 Camera started.");
      }
    } catch (error) {
      console.error("❌ Error accessing camera:", error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      console.log("🛑 Camera stopped.");
    }
  };

  useEffect(() => {
    let frameInterval;

    if (detecting) {
      console.log("🚀 ASL Detection started.");
      startRepeatedSpeech();
      startCamera();
      frameInterval = setInterval(() => {
        console.log("📸 Capturing frame...");
        captureFrameAndSend();
      }, 500);
    } else {
      console.log("🛑 ASL Detection stopped.");
      stopCamera();
      stopRepeatedSpeech();
      if (frameInterval) clearInterval(frameInterval);
    }

    return () => {
      stopRepeatedSpeech();
      if (frameInterval) clearInterval(frameInterval);
    };
  }, [detecting]);

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-amber-400">
            Inflight Food Vending 🍽️
          </h1>
          <div className="relative">
            <ShoppingCart className="w-8 h-8 text-amber-400" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 rounded-full px-2 text-xs">
                {cart.length}
              </span>
            )}
          </div>
        </div>

        <Button
          onClick={() => {
            setDetecting((prev) => !prev);
            console.log(`🟢 Toggle detection: ${!detecting}`);
          }}
          className="mb-6 bg-amber-500 hover:bg-amber-600 text-black font-bold"
        >
          {detecting ? "🛑 Stop ASL Detection" : "✋ Start ASL Detection"}
        </Button>

        {message && (
          <div className="mb-4 text-green-400 text-lg font-semibold">{message}</div>
        )}

        {detecting && (
          <div className="flex flex-col items-center mb-8">
            <video
              ref={videoRef}
              className="w-96 border border-gray-700 rounded-lg"
              autoPlay
              muted
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <p className="text-yellow-400 mt-4">
              ⏳ Sending 30 frames for detection.Will Take Some Time. Please keep performing ASL gestures...
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {foodItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-gray-900 border border-gray-800 rounded-xl shadow-md hover:border-amber-400 transform hover:scale-105 transition duration-300"
            >
              <img
                src={item.img}
                alt={item.name}
                className="w-full h-48 object-cover rounded-t-xl"
              />
              <div className="p-4 text-center">
                <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
                <Button
                  onClick={() => {
                    console.log(`🖱️ Manually selected: ${item.key}`);
                    addToCart(item.key);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-md"
                >
                  Select
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ClientLayout>
  );
}
