from flask import Flask,Blueprint, request, jsonify
import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image
import mediapipe as mp
from flask_cors import cross_origin
from tensorflow.keras.models import load_model
from sklearn.preprocessing import StandardScaler



emotion_detector_bp = Blueprint("emotion_detector", __name__)

# Load your trained model and scaler parameters
model_path = r"C:\Users\KIIT\oneflight\project\backend\model\emotion_model_with_preprocessing.h5"
model = load_model(model_path)

mean = np.load(r'C:\Users\KIIT\oneflight\project\backend\model\scaler_mean.npy')
scale = np.load(r'C:\Users\KIIT\oneflight\project\backend\model\scaler_scale.npy')
scaler = StandardScaler()
scaler.mean_ = mean
scaler.scale_ = scale

# MediaPipe setup (initialized once globally)
mp_holistic = mp.solutions.holistic
holistic = mp_holistic.Holistic(static_image_mode=True)

EMOTIONS = ['Happy', 'Sad', 'Neutral']
SEQUENCE_LENGTH = 3
DETECTION_THRESHOLD = 0.98

# Persistent sequence buffer to store keypoints for sequence prediction
sequence = []

def extract_keypoints(results):
    pose = np.array([[res.x, res.y, res.z, res.visibility]
                     for res in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(132)
    face = np.array([[res.x, res.y, res.z]
                     for res in results.face_landmarks.landmark]).flatten() if results.face_landmarks else np.zeros(1404)
    lh = np.array([[res.x, res.y, res.z]
                   for res in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(63)
    rh = np.array([[res.x, res.y, res.z]
                   for res in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(63)
    return np.concatenate([pose, face, lh, rh])  # Total = 1662 features

@emotion_detector_bp.route("/detect-emotion", methods=["POST"])
@cross_origin() 
def detect_emotion():
    global sequence

    data = request.json
    if 'image' not in data:
        return jsonify({"error": "No image provided"}), 400

    try:
        base64_image = data['image'].split(',')[1]
        image_bytes = base64.b64decode(base64_image)
        pil_image = Image.open(BytesIO(image_bytes)).convert("RGB")
        frame = np.array(pil_image)
        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
    except Exception as e:
        return jsonify({"error": f"Image decoding failed: {str(e)}"}), 400

    results = holistic.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    keypoints = extract_keypoints(results)

    sequence.append(keypoints)
    sequence[:] = sequence[-SEQUENCE_LENGTH:]

    if len(sequence) < SEQUENCE_LENGTH:
        return jsonify({"emotion": None, "confidence": 0.0})

    input_data = np.array(sequence).reshape(-1, 1662)

    try:
        scaled_input = scaler.transform(input_data).reshape(1, SEQUENCE_LENGTH, 1662)
    except Exception as e:
        return jsonify({"error": f"Scaling failed: {str(e)}"}), 500

    prediction = model.predict(scaled_input)[0]
    predicted_index = np.argmax(prediction)
    predicted_label = EMOTIONS[predicted_index]
    confidence = float(prediction[predicted_index])

    if confidence > DETECTION_THRESHOLD:
        sequence = []  # Reset after confident detection
        return jsonify({"emotion": predicted_label, "confidence": confidence})

    return jsonify({"emotion": None, "confidence": 0.0})
