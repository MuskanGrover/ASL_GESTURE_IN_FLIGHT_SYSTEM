"use client";

import React, { useEffect, useRef, useState } from "react";
import ClientLayout from "../components/client-layout";

export default function FeedbackPage() {
  const [detectedMood, setDetectedMood] = useState("");
  const [currentPrediction, setCurrentPrediction] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [isTryingToDetect, setIsTryingToDetect] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const lastSpokenPredictionRef = useRef("");

  const moods = [
    { label: "😊", value: "happy" },
    { label: "😐", value: "neutral" },
    { label: "😞", value: "sad" },
  ];

  const speak = (text) => {
    if (!text || lastSpokenPredictionRef.current === text) return;

    lastSpokenPredictionRef.current = text;
    console.log("Speaking:", text);

    // Delay speech slightly to avoid blocking
    setTimeout(() => {
      window.speechSynthesis.cancel(); // cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1;
      utterance.onend = () => console.log("Speech finished");
      utterance.onerror = (e) => console.error("Speech error", e);
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        speak("Keep performing ASL gestures. The model is trying to detect your emotion.");
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureFrameAndSend = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    setIsTryingToDetect(true);

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        console.error("Could not capture frame blob");
        setIsTryingToDetect(false);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Image = reader.result;

        try {
          const response = await fetch("http://localhost:5000/api/detect-emotion", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ image: base64Image }),
            mode:'cors'
          });

          if (!response.ok) {
            console.error("Backend error:", response.statusText);
            setCurrentPrediction("Backend error");
            return;
          }

          const result = await response.json();
          console.log("Emotion detection result:", result);

          if (result?.emotion) {
            const emotion = result.emotion.toLowerCase();
            setCurrentPrediction(emotion);
            speak(`I feel ${emotion}`);

            if (result.confidence > 0.98) {
              setDetectedMood(emotion);
              stopDetection();
            }
          } else {
            setCurrentPrediction("No emotion detected");
          }
        } catch (error) {
          console.error("Error detecting emotion:", error);
          setCurrentPrediction("Detection error");
        } finally {
          setIsTryingToDetect(false);
        }
      };
    }, "image/jpeg");
  };

  const startDetection = async () => {
    setDetectedMood("");
    setCurrentPrediction("");
    lastSpokenPredictionRef.current = "";
    setIsDetecting(true);

    await startCamera();

    intervalRef.current = setInterval(() => {
      captureFrameAndSend();
    }, 2000);
  };

  const stopDetection = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopCamera();
    setIsDetecting(false);
    window.speechSynthesis.cancel();
  };

  useEffect(() => {
    return () => stopDetection();
  }, []);

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white px-4 py-16">
        <h1 className="text-5xl font-bold text-center text-amber-400 mb-12">
          Passenger Feedback 📝
        </h1>

        <div className="flex flex-col items-center gap-6">
          {!isDetecting ? (
            <button
              onClick={startDetection}
              className="px-6 py-3 bg-amber-500 text-black text-xl font-bold rounded-lg hover:bg-amber-400 transition"
            >
              Start ASL Detection
            </button>
          ) : (
            <button
              onClick={stopDetection}
              className="px-6 py-3 bg-red-500 text-white text-xl font-bold rounded-lg hover:bg-red-400 transition"
            >
              Stop Detection
            </button>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-80 rounded-lg"
            style={{ display: isDetecting ? "block" : "none" }}
          />

          <canvas ref={canvasRef} style={{ display: "none" }} />

          <div className="flex justify-center gap-8 mt-6">
            {moods.map((mood) => (
              <div
                key={mood.value}
                className={`text-6xl p-4 rounded-full transition ${
                  detectedMood === mood.value
                    ? "scale-125 bg-amber-500 text-black shadow-xl"
                    : "bg-gray-800 hover:scale-110"
                }`}
              >
                {mood.label}
              </div>
            ))}
          </div>

          <p className="text-lg mt-4 text-amber-300 text-center max-w-md">
            {!isDetecting && !detectedMood && "Click Start to begin ASL emotion detection."}
            {isDetecting && isTryingToDetect && `Trying to detect: ${currentPrediction || "..."}`}
            {isDetecting && !isTryingToDetect && `Detecting emotion: ${currentPrediction || "..."}`}
            {!isDetecting && detectedMood && `✅ Final Detected Emotion: ${detectedMood}`}
          </p>
        </div>
      </div>
    </ClientLayout>
  );
}
