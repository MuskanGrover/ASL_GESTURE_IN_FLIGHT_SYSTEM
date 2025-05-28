import cv2
import numpy as np
import mediapipe as mp
from tensorflow.keras.models import load_model
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from collections import deque
import base64
import threading

webcam_predictor_bp = Blueprint('webcam_predictor', __name__)

# Load model once
MODEL_PATH = r"C:\Users\KIIT\oneflight\project\backend\model\sign_language_model_30frameaccurate.h5"
print(f"🧠 Loading model from: {MODEL_PATH}")
model = load_model(MODEL_PATH)

# Mediapipe holistic setup
mp_holistic = mp.solutions.holistic
holistic = mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5)

# Action labels
ACTIONS = ['Assist', 'Feedback', 'Food', 'Fun', 'Services']

# Buffer to store recent keypoints
sequence_buffer = deque(maxlen=5)  # smaller for faster prediction

# For stabilizing predictions
last_prediction = None
repeat_counter = 0
REPEAT_LIMIT = 3

# Lock for thread safety
lock = threading.Lock()

def extract_keypoints(results):
    lh = np.array([[lm.x, lm.y, lm.z] for lm in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21 * 3)
    rh = np.array([[lm.x, lm.y, lm.z] for lm in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21 * 3)
    return np.concatenate([lh, rh])

def decode_base64_image(data_url):
    header, encoded = data_url.split(",", 1)
    data = base64.b64decode(encoded)
    np_arr = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    return img

@webcam_predictor_bp.route('/predict', methods=['POST', 'OPTIONS'])
@cross_origin()
def predict():
    global last_prediction, repeat_counter

    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({'error': 'No image provided'}), 400

    try:
        frame = decode_base64_image(data['image'])
    except Exception as e:
        return jsonify({'error': f'Invalid image format: {str(e)}'}), 400

    frame = cv2.flip(frame, 1)
    image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    with lock:
        results = holistic.process(image_rgb)
        keypoints = extract_keypoints(results)
        sequence_buffer.append(keypoints)

        if len(sequence_buffer) < 5:
            return jsonify({'prediction': 'collecting', 'frames_collected': len(sequence_buffer)})

        # Prepare sequence input for model (shape: 1, 5, 126)
        input_seq = np.expand_dims(np.array(sequence_buffer), axis=0)

        try:
            prediction_probs = model.predict(input_seq)[0]
            max_prob = np.max(prediction_probs)
            predicted_action = ACTIONS[np.argmax(prediction_probs)]

            if max_prob > 0.80:
                if last_prediction == predicted_action:
                    repeat_counter += 1
                    if repeat_counter < REPEAT_LIMIT:
                        return jsonify({'prediction': 'collecting', 'frames_collected': len(sequence_buffer)})

                last_prediction = predicted_action
                repeat_counter = 0
                sequence_buffer.clear()  # Clear after stable prediction

                return jsonify({'prediction': predicted_action, 'confidence': float(max_prob)})
            else:
                return jsonify({'prediction': 'unknown', 'confidence': float(max_prob)})

        except Exception as e:
            return jsonify({'error': f'Prediction error: {str(e)}'}), 500
