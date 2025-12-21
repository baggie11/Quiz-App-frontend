from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import torch
import torch.serialization
from TTS.utils.radam import RAdam
from TTS.api import TTS
import io
import wave
import numpy as np
import logging
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add safe globals for torch serialization
torch.serialization.add_safe_globals([RAdam])

# Global TTS model instance
tts_model = None
MODEL_NAME = "tts_models/en/ljspeech/glow-tts"

def initialize_tts_model():
    """Initialize the TTS model"""
    global tts_model
    if tts_model is None:
        try:
            logger.info(f"Loading TTS model: {MODEL_NAME}")
            tts_model = TTS(MODEL_NAME)
            logger.info("TTS model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load TTS model: {e}")
            raise

# Initialize model on startup
initialize_tts_model()

@app.route('/')
def index():
    """Home page with API information"""
    return jsonify({
        "message": "TTS (Text-to-Speech) Streaming API",
        "endpoints": {
            "/tts": "POST - Stream audio directly without saving",
            "/health": "GET - Health check"
        },
        "model": MODEL_NAME,
        "streaming": "Audio is generated in memory and streamed directly, no files saved"
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": tts_model is not None
    }), 200

def numpy_array_to_wav_bytes(audio_array, sample_rate=22050):
    """Convert numpy array to WAV bytes"""
    # Ensure audio is in correct format
    audio_array = (audio_array * 32767).astype(np.int16)
    
    # Create in-memory WAV file
    wav_buffer = io.BytesIO()
    
    with wave.open(wav_buffer, 'wb') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 2 bytes for int16
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_array.tobytes())
    
    return wav_buffer.getvalue()

@app.route('/tts', methods=['POST', 'OPTIONS'])
def text_to_speech_stream():
    """
    Generate TTS audio in memory and stream it directly
    No files are saved to disk
    """
    if request.method == 'OPTIONS':
        return '', 200
    
    if tts_model is None:
        try:
            initialize_tts_model()
        except Exception as e:
            return jsonify({"error": f"TTS model failed to load: {str(e)}"}), 500
    
    try:
        # Get text from request
        text = ""
        
        if request.is_json:
            data = request.get_json()
            text = data.get('text', '').strip()
        else:
            text = request.form.get('text', '').strip()
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        if len(text) > 1000:
            return jsonify({"error": "Text too long. Maximum 1000 characters allowed."}), 400
        
        logger.info(f"Generating TTS for text: {text[:50]}...")
        
        # Method 1: Try to use TTS.tts() method if available
        try:
            # Generate audio using tts() method which returns audio array
            wav = tts_model.tts(text=text)
            
            # Convert to numpy array if needed
            if isinstance(wav, list):
                wav = np.array(wav)
            
            # Convert to WAV bytes
            audio_bytes = numpy_array_to_wav_bytes(wav)
            
        except (AttributeError, TypeError) as e:
            logger.warning(f"tts() method failed: {e}, trying alternative method")
            
            # Method 2: Try to use synthesize method
            try:
                # Some TTS models have synthesize method
                wav = tts_model.synthesize(text)
                audio_bytes = numpy_array_to_wav_bytes(wav)
            except Exception as e2:
                logger.warning(f"synthesize() method failed: {e2}")
                
                # Method 3: Last resort - use temp file but delete immediately
                import tempfile
                import os
                
                with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                    temp_path = temp_file.name
                
                try:
                    # Generate to temp file
                    tts_model.tts_to_file(text=text, file_path=temp_path)
                    
                    # Read the audio
                    with open(temp_path, 'rb') as f:
                        audio_bytes = f.read()
                        
                    logger.info("Used temp file method")
                    
                finally:
                    # Delete temp file immediately
                    if os.path.exists(temp_path):
                        os.unlink(temp_path)
                        logger.info(f"Deleted temp file: {temp_path}")
        
        # Create response with audio bytes
        response = Response(
            audio_bytes,
            mimetype='audio/wav',
            headers={
                'Content-Disposition': 'inline; filename=speech.wav',
                'Content-Length': str(len(audio_bytes)),
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        )
        
        logger.info(f"Generated {len(audio_bytes)} bytes of audio (no files saved)")
        return response
        
    except Exception as e:
        logger.error(f"Error generating speech: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Alternative simpler approach using the Coqui TTS API directly
@app.route('/tts/simple', methods=['POST'])
def text_to_speech_simple():
    """Simple endpoint using TTS API directly"""
    try:
        text = request.form.get('text', '').strip()
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        logger.info(f"Generating TTS (simple) for: {text[:50]}...")
        
        # Create a temporary file path
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
            temp_path = temp_file.name
        
        try:
            # Generate audio
            tts_model.tts_to_file(text=text, file_path=temp_path)
            
            # Read and immediately delete
            with open(temp_path, 'rb') as f:
                audio_bytes = f.read()
            
            # Delete immediately
            os.unlink(temp_path)
            
            return Response(
                audio_bytes,
                mimetype='audio/wav',
                headers={'Content-Length': str(len(audio_bytes))}
            )
            
        except Exception as e:
            # Clean up on error
            if os.path.exists(temp_path):
                os.unlink(temp_path)
            raise e
            
    except Exception as e:
        logger.error(f"Error in simple endpoint: {e}")
        return jsonify({"error": str(e)}), 500

# Minimal endpoint with automatic cleanup
@app.route('/tts/clean', methods=['POST'])
def text_to_speech_clean():
    """Minimal endpoint with automatic cleanup"""
    try:
        text = request.form.get('text', '').strip()
        if not text:
            return {"error": "No text provided"}, 400
        
        # Create and use temp file with context manager
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=True) as temp_file:
            # Generate audio to temp file
            tts_model.tts_to_file(text=text, file_path=temp_file.name)
            
            # Read the content
            temp_file.seek(0)
            audio_bytes = temp_file.read()
        
        # File is automatically deleted when context exits
        return Response(
            audio_bytes,
            mimetype='audio/wav',
            headers={'Content-Length': str(len(audio_bytes))}
        )
        
    except Exception as e:
        logger.error(f"Error: {e}")
        return {"error": str(e)}, 500

if __name__ == '__main__':
    logger.info("Starting Flask TTS Streaming Server")
    logger.info("Primary endpoint: POST /tts - Generates audio in memory")
    logger.info("No audio files are permanently saved to disk")
    app.run(host='0.0.0.0', port=5000, debug=True)