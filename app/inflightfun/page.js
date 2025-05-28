"use client";
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ClientLayout from "../components/client-layout";

const speak = (text) => {
  const synth = window.speechSynthesis;
  synth.cancel(); // cancel all current utterances
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 1;
  synth.speak(utter);
};

const inflightContent = {
  movie: [
    {
      title: "The Silent Sky",
      img: "/images/Thesilentsky.jpg",
      link: "https://www.youtube.com/watch?v=QEfiqteRBDU",
    },
    {
      title: "28 Days",
      img: "/images/28days.jpg",
      link: "https://hollywoodsuite.ca/movies/28-days/",
    },
    {
      title: "9 TO 5",
      img: "/images/9to5.webp",
      link: "https://hollywoodsuite.ca/movies/9-to-5/",
    },
  ],
  book: [
    {
      title: "Verity",
      img: "/images/verity.jpg",
      link: "https://online.fliphtml5.com/uxpec/vnoy/#p=1",
    },
    {
      title: "The Summer I Turned Pretty",
      img: "/images/THESUMMER.jpg",
      link: "https://www.overdrive.com/media/504761/the-summer-i-turned-pretty",
    },
    {
      title: "Reminders Of Him",
      img: "/images/reminders-of-him.webp",
      link: "https://www.swifdoo.com/free-ebooks/reminders-of-him",
    },
  ],
  music: [
    {
      title: "EVERYTHING - A$AP Rocky",
      img: "/images/songone.jpg",
      link: "https://www.youtube.com/watch?v=O5knL9cWuEg",
    },
    {
      title: "KEEP IT GOLD - SURFACES",
      img: "/images/sontwo.webp",
      link: "https://www.youtube.com/watch?v=2AVqpMYmnmA",
    },
    {
      title: "ANGEL - AKON",
      img: "/images/songthree.jpg",
      link: "https://www.youtube.com/watch?v=hpbPjRVK5OE",
    },
  ],
};

export default function InflightFun() {
  const [clickedItems, setClickedItems] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const captureIntervalRef = useRef(null);
  const speechIntervalRef = useRef(null);
  const isRedirectingRef = useRef(false);

  const captureImage = () => {
    const video = videoRef.current;
    if (!video) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg");
  };

  const startRepeatingSpeech = () => {
    const message =
      "The model is trying to detect. Keep performing ASL gesture until detected anything.";
    speak(message);
    speechIntervalRef.current = setInterval(() => {
      speak(message);
    }, 8000);
  };

  const stopRepeatingSpeech = () => {
    if (speechIntervalRef.current) {
      clearInterval(speechIntervalRef.current);
      speechIntervalRef.current = null;
    }
    window.speechSynthesis.cancel();
  };

  const stopCameraAndDetection = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    stopRepeatingSpeech();
    setShowCamera(false);
    isRedirectingRef.current = false;
  };

  const startCameraAndDetect = async () => {
    isRedirectingRef.current = false;
    stopRepeatingSpeech();
    setShowCamera(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      startRepeatingSpeech();

      captureIntervalRef.current = setInterval(async () => {
        if (isRedirectingRef.current) return;

        const image = captureImage();
        if (!image) return;

        try {
          const res = await fetch("http://localhost:5000/api/detect-section", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image }),
          });

          const data = await res.json();
          console.log("Detection response:", data);

          if (data.prediction && data.confidence > 0.9) {
            if (isRedirectingRef.current) return;

            isRedirectingRef.current = true;

            const sectionName = data.prediction;
            const target = inflightContent[sectionName]?.[0];

            if (target?.link) {
              stopRepeatingSpeech();
              clearInterval(captureIntervalRef.current);

              speak(`Moving to ${sectionName} section.`);
              setTimeout(() => {
                stopCameraAndDetection();
                window.location.href = target.link;
              }, 2000);
            } else {
              console.warn("No matching section found");
              isRedirectingRef.current = false;
            }
          }
        } catch (err) {
          console.error("Detection API error:", err);
        }
      }, 300);
    } catch (err) {
      alert("Webcam access denied or not available.");
      stopCameraAndDetection();
    }
  };

  const handleClick = (title) => {
    if (!clickedItems.includes(title)) {
      setClickedItems((prev) => [...prev, title]);
    }
  };

  useEffect(() => {
    return () => {
      stopCameraAndDetection();
    };
  }, []);

  return (
    <ClientLayout>
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white px-4 py-16">
      <h1 className="text-5xl font-bold text-center mb-6">
        Inflight Entertainment 🛫
      </h1>

      <div className="flex flex-col items-center mb-8 gap-4">
        <button
          onClick={startCameraAndDetect}
          className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-6 rounded-xl transition-all duration-300"
          disabled={showCamera}
        >
          🎥 Start ASL Detection
        </button>

        {showCamera && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-72 h-52 object-cover rounded-xl border-4 border-amber-400"
          />
        )}
      </div>

      {Object.entries(inflightContent).map(([section, items]) => (
        <div key={section} className="mb-20 p-4 rounded-xl">
          <h2 className="text-4xl text-center font-bold mb-6 text-amber-300">
            {section}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {items.map((item, index) => {
              const isClicked = clickedItems.includes(item.title);
              return (
                <a
                  href={item.link}
                  key={index}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleClick(item.title)}
                  className="transition duration-300 transform hover:scale-105"
                >
                  <Card className="rounded-xl overflow-hidden border shadow-md bg-gray-900 border-gray-800 text-white">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-60 object-cover"
                    />
                    <CardContent className="p-2">
                      <h3
                        className={`text-lg font-bold text-center transition-colors duration-200 ${
                          isClicked
                            ? "text-yellow-300 underline"
                            : "hover:text-amber-400 hover:underline"
                        }`}
                      >
                        {item.title}
                      </h3>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
    </ClientLayout>
  );
}
