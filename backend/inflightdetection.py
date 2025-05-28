import cv2
import numpy as np
from tensorflow.keras.models import load_model
import mediapipe as mp
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import base64
from io import BytesIO
from PIL import Image
from collections import deque

inflight_detection_bp = Blueprint("inflight_detection", __name__)

# Constants
SEQUENCE_LENGTH = 30
CONFIDENCE_THRESHOLD = 0.90
LABELS = ['movie', 'music', 'book']

model = load_model(r'C:\Users\KIIT\oneflight\project\backend\model\final_model.h5')

mp_holistic = mp.solutions.holistic
sequence = deque(maxlen=SEQUENCE_LENGTH)
last_prediction = None  # To prevent repeated outputs

def extract_keypoints(results):
    lh = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten() \
        if results.left_hand_landmarks else np.zeros(63)
    rh = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten() \
        if results.right_hand_landmarks else np.zeros(63)
    return np.concatenate([lh, rh])

def decode_base64_image(base64_string):
    try:
        base64_string = base64_string.split(',')[1]  # Remove header
        decoded = base64.b64decode(base64_string)
        image = Image.open(BytesIO(decoded))
        return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    except Exception as e:
        print("Image decoding failed:", e)
        return None

@inflight_detection_bp.route('/detect-section', methods=['POST'])
@cross_origin() 
def detect_section():
    global sequence, last_prediction
    data = request.get_json()
    if 'image' not in data:
        return jsonify({'error': 'No image provided'}), 400

    image = decode_base64_image(data['image'])
    if image is None:
        return jsonify({'error': 'Invalid image'}), 400

    with mp_holistic.Holistic(
        static_image_mode=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ) as holistic:

        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = holistic.process(rgb_image)

        keypoints = extract_keypoints(results)
        sequence.append(keypoints)

        if len(sequence) == SEQUENCE_LENGTH:
            input_data = np.expand_dims(sequence, axis=0)
            predictions = model.predict(input_data)
            predicted_label_index = np.argmax(predictions)
            confidence = float(predictions[0][predicted_label_index])

            if confidence > CONFIDENCE_THRESHOLD:
                prediction = LABELS[predicted_label_index]

                if prediction != last_prediction:
                    last_prediction = prediction
                    sequence.clear()
                    return jsonify({
                        'prediction': prediction,
                        'confidence': confidence
                    })
                else:
                    return jsonify({
                        'prediction': '',
                        'confidence': 0.0
                    })

    return jsonify({
        'prediction': '',
        'confidence': 0.0
    })
