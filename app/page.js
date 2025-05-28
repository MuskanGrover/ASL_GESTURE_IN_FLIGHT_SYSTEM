"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ClientLayout from "./components/client-layout";

export default function Home() {
  const cardSectionRef = useRef(null);
  const router = useRouter();

  const videoRef = useRef(null);
  const lastNavigatedRoute = useRef(null);
  const isNavigating = useRef(false);

  const [detectionActive, setDetectionActive] = useState(false);
  const [status, setStatus] = useState("Click Start ASL Detection");

  // 🔊 Helper to speak text
  const speak = (text) => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
  };

  // Scroll to cards section
  const scrollToCards = () => {
    if (cardSectionRef.current) {
      cardSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 🎥 Stop webcam
  function stopWebcam() {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setStatus("Webcam stopped");
    }
  }
  useEffect(() => {
  if (!detectionActive) {
    stopWebcam();
    lastNavigatedRoute.current = null;
    isNavigating.current = false;
    return;
  }

  isNavigating.current = false;
  lastNavigatedRoute.current = null;

  let framesProcessed = 0;
  let speakInterval;

  async function startWebcam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStatus("Webcam started, detecting...");
      speak("Keep performing ASL gestures until detected.");

      // 🔁 Repeat the speech every 9 seconds
      speakInterval = setInterval(() => {
        speak("Keep performing ASL gestures until detected.");
      }, 9000);
    } catch (error) {
      console.error("Webcam start error:", error);
      setStatus("Error starting webcam");
      speak("Error starting webcam.");
    }
  }

  startWebcam();

  const interval = setInterval(() => {
    captureAndSendFrame(framesProcessed);
    framesProcessed++;
  }, 100);

  return () => {
    clearInterval(interval);
    clearInterval(speakInterval); // 🛑 Stop repeating speech
    stopWebcam();
    lastNavigatedRoute.current = null;
    isNavigating.current = false;
  };
}, [detectionActive]);


  
  async function captureAndSendFrame(framesProcessed) {
    if (!videoRef.current || isNavigating.current) return;

    if (framesProcessed < 2) {
      try {
        const dataUrl = getCanvasDataUrlFromVideo(videoRef.current);
        const prediction = await getPredictionFromServer(dataUrl);
        setStatus(`✅ Detected: ${prediction} (warming up...)`);
      } catch (error) {
        console.error("Prediction warm-up error:", error);
        setStatus("Error during prediction");
      }
      return;
    }

    try {
      const dataUrl = getCanvasDataUrlFromVideo(videoRef.current);
      const prediction = await getPredictionFromServer(dataUrl);

      setStatus(`✅ Detected: ${prediction}`);

      const backendToRouteMap = {
        Food: "/food",
        Assist: "/crew",
        Feedback: "/feedback",
        Fun: "/inflightfun",
        Services: "/extraservices",
      };

      const route = backendToRouteMap[prediction];

      if (route) {
        if (lastNavigatedRoute.current !== route) {
          lastNavigatedRoute.current = route;
          isNavigating.current = true;

          const speakText = `Moving over to ${prediction} section`;
          speak(speakText);
          setStatus(speakText);

          stopWebcam();
          setDetectionActive(false);
          router.push(route);

          setTimeout(() => {
            isNavigating.current = false;
          }, 1500);
        }
      } else {
        console.log("Unknown prediction:", prediction);
      }
    } catch (error) {
      console.error("Prediction error:", error);
      setStatus("Error during prediction");
    }
  }

  function getCanvasDataUrlFromVideo(video) {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg");
  }

  async function getPredictionFromServer(dataUrl) {
    try {
      const res = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("Server error response:", text);
        throw new Error(`Server error: ${res.status}`);
      }
      const data = await res.json();
      return data.prediction;
    } catch (err) {
      console.error("Fetch error:", err);
      throw err;
    }
  }

  const cards = [
    {
      title: "Inflight Entertainment",
      description: "Enjoy movies, books, music, and games — all ASL-accessible!",
      content: "Relax with entertainment designed for deaf and hard-of-hearing travelers.",
      path: "/inflightfun",
    },
    {
      title: "Crew Assistance",
      description: "Need help? Use sign language to connect with our crew instantly.",
      content: "Accessible communication ensures you’re supported at all times.",
      path: "/crew",
    },
    {
      title: "Food",
      description: "Order meals easily using sign language recognition.",
      content: "Your favorite inflight meals, now just a gesture away.",
      path: "/food",
    },
    {
      title: "Feedback",
      description: "Share your experience using ASL-based feedback tools.",
      content: "Help us improve with quick, sign-friendly feedback options.",
      path: "/feedback",
    },
    {
      title: "Extra Services",
      description: "From wheelchair access to special requests — all through ASL.",
      content: "Our services are built for inclusion and convenience.",
      path: "/extraservices",
    },
  ];

  return (
  <ClientLayout>
    <section className="flex rounded-2xl flex-col items-center justify-center text-gray-400 h-screen bg-gradient-to-b from-gray-900 text-center p-10 space-y-4">

      <h1 className="pt-15 text-5xl font-bold mb-4">
        Fly Freely with Gesture & ASL Control
      </h1>
      <p className="text-lg text-gray-500 max-w-xl mt-1 mb-6">
        Experience seamless inflight interaction powered by{" "}
        <strong>AI-based Gesture Control</strong>,{" "}
        <strong>American Sign Language (ASL) recognition</strong>, and{" "}
        <strong>standard touch inputs</strong>. Our inclusive system is designed
        for accessibility, comfort, and ease of use — for everyone.
      </p>

      {detectionActive ? (
        // WHEN DETECTION IS ACTIVE: show video + buttons below
        <div className="flex flex-col items-center space-y-4">
          <video
            ref={videoRef}
            width="400"
            height="300"
            autoPlay
            muted
            className="rounded-lg shadow-lg"
          ></video>
          <p className="text-white font-semibold">{status}</p>

          {/* Buttons BELOW the video */}
          <div className="flex space-x-4">
            <button
              onClick={scrollToCards}
              className="bg-blue-700 text-white px-6 py-3 rounded-full shadow hover:bg-blue-800 transition-all"
            >
              Airplane Mode: ON ✈️
            </button>

            <button
              onClick={() => setDetectionActive(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-full shadow hover:bg-green-700 transition-all"
              disabled={detectionActive}
              title={detectionActive ? "ASL Detection Running" : "Start ASL Detection"}
            >
              Start ASL Detection
            </button>

            {detectionActive && (
              <button
                onClick={() => setDetectionActive(false)}
                className="bg-red-600 text-white px-6 py-3 rounded-full shadow hover:bg-red-700 transition-all"
              >
                Stop ASL Detection
              </button>
            )}
          </div>
        </div>
      ) : (
        // WHEN DETECTION IS INACTIVE: show buttons at top (or wherever you want)
        <div className="flex space-x-4 mb-6">
          <button
            onClick={scrollToCards}
            className="bg-blue-700 text-white px-6 py-3 rounded-full shadow hover:bg-blue-800 transition-all"
          >
            Airplane Mode: ON ✈️
          </button>

          <button
            onClick={() => setDetectionActive(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-full shadow hover:bg-green-700 transition-all"
            disabled={detectionActive}
            title={detectionActive ? "ASL Detection Running" : "Start ASL Detection"}
          >
            Start ASL Detection
          </button>
        </div>
      )}

    </section>

    {/* Cards section remains unchanged */}
    <div
      id="carddiv"
      ref={cardSectionRef}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 px-4 max-w-6xl mx-auto py-6"
    >
      {cards.map((card, index) => (
        <Card
          key={index}
          className="bg-gradient-to-br mt-20 from-gray-550 to-gray-700 text-white shadow-xl border border-gray-600 rounded-2xl w-full h-full backdrop-blur-md mx-auto p-6 flex flex-col justify-between"
          onClick={() => router.push(card.path)}
          tabIndex={0}
          role="button"
          aria-label={`Navigate to ${card.title}`}
        >
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold">{card.title}</CardTitle>
            <CardDescription className="text-gray-300">{card.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">{card.content}</CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="text-black h-13 w-47 bg-amber-500 hover:bg-amber-600 pointer active:scale-80"
            >
              Go to {card.title}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  </ClientLayout>
);

}
