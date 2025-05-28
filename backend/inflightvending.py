import cv2
import numpy as np
import os
import mediapipe as mp
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from tensorflow.keras.models import load_model
import traceback

# Create blueprint
inflight_vending_bp = Blueprint('inflight_vending', __name__)

# Load model
model_path = r'C:\Users\KIIT\oneflight\project\backend\model\sign_language_lstm_model.h5'
print(f"🧠 Loading model from: {model_path}")
model = load_model(model_path)

# Hardcoded labels
LABELS = ['Biscuit', 'Chips', 'Coffee', 'Fruit', 'Sandwich', 'Tea']
print(f"🏷️ Using labels: {LABELS}")

# Constants
SEQUENCE_LENGTH = 30
CONFIDENCE_THRESHOLD = 0.75

# MediaPipe setup
mp_holistic = mp.solutions.holistic
holistic = mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5)

# Global sequence buffer
sequence = []

def extract_keypoints(results):
    lh = np.zeros(21 * 3)
    rh = np.zeros(21 * 3)

    if results.left_hand_landmarks:
        lh = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten()
    if results.right_hand_landmarks:
        rh = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten()

    return np.concatenate([lh, rh])

@inflight_vending_bp.route("/detect-food", methods=["POST"])
@cross_origin() 
def detect_food():
    global sequence
    try:
        if "frame" not in request.files:
            print("❌ No 'frame' file found in request.")
            return jsonify({"error": "No frame sent"}), 400

        # Decode the uploaded image
        file = request.files["frame"]
        img_array = np.frombuffer(file.read(), np.uint8)
        frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        if frame is None:
            print("❌ Unable to decode image frame.")
            return jsonify({"error": "Failed to decode frame"}), 400

        print("📸 Frame received and decoded.")

        # Process image with MediaPipe
        image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = holistic.process(image_rgb)
        keypoints = extract_keypoints(results)

        # Add to sequence buffer
        sequence.append(keypoints)
        if len(sequence) > SEQUENCE_LENGTH:
            sequence = sequence[-SEQUENCE_LENGTH:]

        print(f"🔢 Sequence length: {len(sequence)}")

        if len(sequence) == SEQUENCE_LENGTH:
            input_data = np.expand_dims(sequence, axis=0)
            probs = model.predict(input_data)[0]
            pred_label = np.argmax(probs)
            confidence = probs[pred_label]

            print(f"🤖 Prediction: {LABELS[pred_label]} ({confidence:.2f})")

            if confidence > CONFIDENCE_THRESHOLD:
                predicted_word = LABELS[pred_label]
                sequence = []  # Clear for next detection
                return jsonify({
                    "prediction": predicted_word,
                    "confidence": float(confidence)
                })

        # If not enough frames or low confidence
        return jsonify({"prediction": None, "confidence": 0.0})

    except Exception as e:
        print("🔥 Exception occurred:", traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500
