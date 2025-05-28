"use client";

import React, { useEffect, useRef } from "react";
import "@mediapipe/hands";
import "@mediapipe/camera_utils";

//In this context, videoElement is used to capture the live webcam feed, which is then passed into MediaPipe Hands for hand tracking.
export default function GestureCursor() {
  const videoRef = useRef(null);
  const cursorRef = useRef(null);
  const clickCooldown = useRef(false);
  const clickSoundRef = useRef(null);
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const cameraRef = useRef(null);
  const animationFrameId = useRef(null);

  //Smoothly moves current cursor position closer to target position (lerp = linear interpolation).

//This makes cursor movement smooth instead of jumping instantly.


  const lerp = (start, end, factor = 0.3) => start + (end - start) * factor;

  useEffect(() => {
    const createCursor = () => {
      const cursor = document.createElement("img");
      cursor.src = "https://cdn-icons-png.flaticon.com/512/684/684908.png";
      cursor.style.position = "absolute";
      cursor.style.width = "40px";
      cursor.style.height = "40px";
      cursor.style.zIndex = "9999";
      cursor.style.pointerEvents = "none";
      document.body.appendChild(cursor);
      cursorRef.current = cursor;
    };

    const loadClickSound = () => {
      clickSoundRef.current = new Audio("/mixkit-modern-technology-select-3124.wav");
    };

    //This function simulateClick(x, y) is designed to simulate a user mouse click at the coordinates where the index finger is pointing, using hand gesture input. Here's a step-by-step explanation:


    const simulateClick = (x, y) => {
        document.elementFromPoint(x, y - window.scrollY)
// This gets the HTML element located directly under the (x, y) position.

// The subtraction of window.scrollY is important because:

// x and y are relative to the whole page (not just the visible part).

// elementFromPoint() expects coordinates relative to the viewport (the visible window).

// So, this line figures out what DOM element your finger is "touching".

// js
// Copy code

      const elem = document.elementFromPoint(x, y - window.scrollY);

//       elem exists — There is an element under your finger.

// clickCooldown.current is false — This prevents accidental multiple clicks in a short time.
      if (elem && !clickCooldown.current) {
        if (clickSoundRef.current) {
          clickSoundRef.current.currentTime = 0;
          clickSoundRef.current.play();
        }
        if (elem.tagName === "BUTTON" || elem.classList.contains("clickable")) {
          elem.classList.add("scale-90");
          setTimeout(() => elem.classList.remove("scale-90"), 150);
        }
        //This line triggers a real programmatic mouse click on the detected element.
//So, if the element has an onClick handler or any behavior when clicked — it will be executed.

//After a click is simulated, it sets clickCooldown.current = true to block more clicks.

//After 1 second, the cooldown resets to false, allowing clicks again.

//This avoids the user accidentally clicking too many times if their finger stays still.


        elem.click();
        clickCooldown.current = true;
        setTimeout(() => (clickCooldown.current = false), 1000);
      }
    };

    const areFingersExtended = (landmarks) => {
      return (
        landmarks[8].y < landmarks[6].y && // index
        landmarks[12].y < landmarks[10].y && // middle
        landmarks[16].y < landmarks[14].y && // ring
        landmarks[20].y < landmarks[18].y && // pinky
        landmarks[4].x > landmarks[2].x // thumb
      );
    };

    const animateCursor = () => {
        //If the cursor element is not available in the DOM (or hasn't been created yet), it exits early to avoid errors.
      if (!cursorRef.current) return;
// Uses the lerp function (linear interpolation) to move the current cursor position a little closer to the target position.
// lerp(start, end, factor) returns a value between start and end based on factor (0.2 means it moves 20% closer each time).
// This creates a smooth, gradual animation effect instead of the cursor jumping abruptly.


      currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, 0.2);
      currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, 0.2);

      //Sets the CSS left and top properties of the cursor element to the new (smoothed) position in pixels, moving it on the screen.

      cursorRef.current.style.left = `${currentPos.current.x}px`;
      cursorRef.current.style.top = `${currentPos.current.y}px`;
//         Uses requestAnimationFrame to call animateCursor again on the next browser repaint.

// This creates a continuous loop that keeps updating the cursor position smoothly.


      animationFrameId.current = requestAnimationFrame(animateCursor);
    };

    const setup = async () => {
      createCursor();
      loadClickSound();

      //Sets both the target and current cursor positions to the center of the window initially.


      targetPos.current = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };
      currentPos.current = { ...targetPos.current };

      animateCursor();

//       This is a reference to the actual <video> DOM node.

// It gets passed into Camera() from MediaPipe to start webcam streaming and frame capture.
      const videoElement = videoRef.current;
      if (!videoElement) return;
//Hands: This is the hand landmark detection model from MediaPipe.

//Camera: Utility to access and stream the webcam video feed.

//✅ Using await import(...) allows dynamic loading only when needed, improving page load performance.
      const { Hands } = await import("@mediapipe/hands");
      const { Camera } = await import("@mediapipe/camera_utils");
//locateFile: Tells MediaPipe where to load its WASM and model files from — here, using a CDN.
      const hands = new Hands({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

//       maxNumHands: Detect only one hand to simplify interaction.

// modelComplexity: Controls the model depth; 1 is high quality.

// minDetectionConfidence: Only return results if detection confidence > 0.7.

// minTrackingConfidence: Keep tracking a hand if the confidence is > 0.7.



      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      hands.onResults((results) => {
        if (
            //This runs every time the model processes a frame.

//multiHandLandmarks: Contains 21 keypoints for each detected hand.

//landmarks[8]: The index finger tip (used to control cursor).


          results.multiHandLandmarks &&
          results.multiHandLandmarks.length > 0
        ) {
          const landmarks = results.multiHandLandmarks[0];
          const indexTip = landmarks[8];
        //Converts normalized values (0–1) from model to actual screen x/y in pixels.

//Updates targetPos, which is the goal position for the gesture cursor.
          const x = indexTip.x * window.innerWidth;
          const y = indexTip.y * window.innerHeight + window.scrollY;

          targetPos.current = { x, y };

          // Auto-scroll zones
          const scrollZone = 0.2;
          const scrollSpeed = 15;

          //indexTip.y is a normalized value between 0 and 1, representing the vertical position of the index fingertip in the video frame:

//0 → Top of the screen

//1 → Bottom of the screen
          if (indexTip.y < scrollZone) {
            window.scrollBy({ top: -scrollSpeed, behavior: "auto" });
          } else if (indexTip.y > 1 - scrollZone) {
            window.scrollBy({ top: scrollSpeed, behavior: "auto" });
          }

          if (areFingersExtended(landmarks)) {
            simulateClick(x, y);
          }
        }
      });

      cameraRef.current = new Camera(videoElement, {
        onFrame: async () => {
          await hands.send({ image: videoElement });
        },
        width: 640,
        height: 480,
      });

      cameraRef.current.start();
    };

    setup();

    return () => {
      // Cleanup: remove cursor from DOM
      if (cursorRef.current) {
        cursorRef.current.remove();
        cursorRef.current = null;
      }

      // Stop camera
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }

      // Cancel animation frame
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  //SBSE PEHLE THIS VIDEO ELEMENT IS CREATED WHICH CAPTURES THE LIVE WEBCAM nd even though the <video> is hidden, it is still running in the background and processing the live video stream for gesture recognition.
  return <video ref={videoRef} className="hidden" autoPlay playsInline />;
}
//targetPos
// Represents the desired position of the gesture-controlled cursor.

// It's updated based on the detected position of your index finger tip from the webcam feed.


//current pos
// currentPos
// Represents the actual position of the cursor currently on screen.

// It smoothly follows targetPos using interpolation (lerping), so the movement looks fluid instead of jumpy.