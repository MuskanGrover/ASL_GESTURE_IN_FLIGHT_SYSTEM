from flask import Flask
from flask_cors import CORS
import os

# Import blueprints from your modules
from inflightdetection import inflight_detection_bp
from inflightvending  import inflight_vending_bp
from webcampredictor import webcam_predictor_bp
from emotiondetector import emotion_detector_bp

app = Flask(__name__)
CORS(app, supports_credentials=True)  # Enable CORS globally (adjust for production)

# Register blueprints with URL prefixes
app.register_blueprint(inflight_detection_bp, url_prefix='/api')
app.register_blueprint(inflight_vending_bp, url_prefix='/api')
app.register_blueprint(webcam_predictor_bp, url_prefix='/api')
app.register_blueprint(emotion_detector_bp, url_prefix='/api')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
