# from flask import Flask, request, Response, jsonify
# from flask_cors import CORS
# import torch
# import torch.serialization
# from TTS.utils.radam import RAdam
# from TTS.api import TTS
# import io
# import wave
# import numpy as np
# import logging
# from datetime import datetime

# # Initialize Flask app
# app = Flask(__name__)

# # Enable CORS for all routes
# CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # Add safe globals for torch serialization
# torch.serialization.add_safe_globals([RAdam])

# # Global TTS model instance
# tts_model = None
# MODEL_NAME = "tts_models/en/ljspeech/glow-tts"

# def initialize_tts_model():
#     """Initialize the TTS model"""
#     global tts_model
#     if tts_model is None:
#         try:
#             logger.info(f"Loading TTS model: {MODEL_NAME}")
#             tts_model = TTS(MODEL_NAME)
#             logger.info("TTS model loaded successfully")
#         except Exception as e:
#             logger.error(f"Failed to load TTS model: {e}")
#             raise

# # Initialize model on startup
# initialize_tts_model()

# @app.route('/')
# def index():
#     """Home page with API information"""
#     return jsonify({
#         "message": "TTS (Text-to-Speech) Streaming API",
#         "endpoints": {
#             "/tts": "POST - Stream audio directly without saving",
#             "/health": "GET - Health check"
#         },
#         "model": MODEL_NAME,
#         "streaming": "Audio is generated in memory and streamed directly, no files saved"
#     })

# @app.route('/health', methods=['GET'])
# def health_check():
#     """Simple health check endpoint"""
#     return jsonify({
#         "status": "healthy",
#         "timestamp": datetime.now().isoformat(),
#         "model_loaded": tts_model is not None
#     }), 200

# def numpy_array_to_wav_bytes(audio_array, sample_rate=22050):
#     """Convert numpy array to WAV bytes"""
#     # Ensure audio is in correct format
#     audio_array = (audio_array * 32767).astype(np.int16)
    
#     # Create in-memory WAV file
#     wav_buffer = io.BytesIO()
    
#     with wave.open(wav_buffer, 'wb') as wav_file:
#         wav_file.setnchannels(1)  # Mono
#         wav_file.setsampwidth(2)  # 2 bytes for int16
#         wav_file.setframerate(sample_rate)
#         wav_file.writeframes(audio_array.tobytes())
    
#     return wav_buffer.getvalue()

# @app.route('/tts', methods=['POST', 'OPTIONS'])
# def text_to_speech_stream():
#     """
#     Generate TTS audio in memory and stream it directly
#     No files are saved to disk
#     """
#     if request.method == 'OPTIONS':
#         return '', 200
    
#     if tts_model is None:
#         try:
#             initialize_tts_model()
#         except Exception as e:
#             return jsonify({"error": f"TTS model failed to load: {str(e)}"}), 500
    
#     try:
#         # Get text from request
#         text = ""
        
#         if request.is_json:
#             data = request.get_json()
#             text = data.get('text', '').strip()
#         else:
#             text = request.form.get('text', '').strip()
        
#         if not text:
#             return jsonify({"error": "No text provided"}), 400
        
#         if len(text) > 1000:
#             return jsonify({"error": "Text too long. Maximum 1000 characters allowed."}), 400
        
#         logger.info(f"Generating TTS for text: {text[:50]}...")
        
#         # Method 1: Try to use TTS.tts() method if available
#         try:
#             # Generate audio using tts() method which returns audio array
#             wav = tts_model.tts(text=text)
            
#             # Convert to numpy array if needed
#             if isinstance(wav, list):
#                 wav = np.array(wav)
            
#             # Convert to WAV bytes
#             audio_bytes = numpy_array_to_wav_bytes(wav)
            
#         except (AttributeError, TypeError) as e:
#             logger.warning(f"tts() method failed: {e}, trying alternative method")
            
#             # Method 2: Try to use synthesize method
#             try:
#                 # Some TTS models have synthesize method
#                 wav = tts_model.synthesize(text)
#                 audio_bytes = numpy_array_to_wav_bytes(wav)
#             except Exception as e2:
#                 logger.warning(f"synthesize() method failed: {e2}")
                
#                 # Method 3: Last resort - use temp file but delete immediately
#                 import tempfile
#                 import os
                
#                 with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
#                     temp_path = temp_file.name
                
#                 try:
#                     # Generate to temp file
#                     tts_model.tts_to_file(text=text, file_path=temp_path)
                    
#                     # Read the audio
#                     with open(temp_path, 'rb') as f:
#                         audio_bytes = f.read()
                        
#                     logger.info("Used temp file method")
                    
#                 finally:
#                     # Delete temp file immediately
#                     if os.path.exists(temp_path):
#                         os.unlink(temp_path)
#                         logger.info(f"Deleted temp file: {temp_path}")
        
#         # Create response with audio bytes
#         response = Response(
#             audio_bytes,
#             mimetype='audio/wav',
#             headers={
#                 'Content-Disposition': 'inline; filename=speech.wav',
#                 'Content-Length': str(len(audio_bytes)),
#                 'Cache-Control': 'no-cache, no-store, must-revalidate',
#                 'Pragma': 'no-cache',
#                 'Expires': '0'
#             }
#         )
        
#         logger.info(f"Generated {len(audio_bytes)} bytes of audio (no files saved)")
#         return response
        
#     except Exception as e:
#         logger.error(f"Error generating speech: {e}", exc_info=True)
#         return jsonify({"error": str(e)}), 500

# # Alternative simpler approach using the Coqui TTS API directly
# @app.route('/tts/simple', methods=['POST'])
# def text_to_speech_simple():
#     """Simple endpoint using TTS API directly"""
#     try:
#         text = request.form.get('text', '').strip()
#         if not text:
#             return jsonify({"error": "No text provided"}), 400
        
#         logger.info(f"Generating TTS (simple) for: {text[:50]}...")
        
#         # Create a temporary file path
#         import tempfile
#         import os
        
#         with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
#             temp_path = temp_file.name
        
#         try:
#             # Generate audio
#             tts_model.tts_to_file(text=text, file_path=temp_path)
            
#             # Read and immediately delete
#             with open(temp_path, 'rb') as f:
#                 audio_bytes = f.read()
            
#             # Delete immediately
#             os.unlink(temp_path)
            
#             return Response(
#                 audio_bytes,
#                 mimetype='audio/wav',
#                 headers={'Content-Length': str(len(audio_bytes))}
#             )
            
#         except Exception as e:
#             # Clean up on error
#             if os.path.exists(temp_path):
#                 os.unlink(temp_path)
#             raise e
            
#     except Exception as e:
#         logger.error(f"Error in simple endpoint: {e}")
#         return jsonify({"error": str(e)}), 500

# # Minimal endpoint with automatic cleanup
# @app.route('/tts/clean', methods=['POST'])
# def text_to_speech_clean():
#     """Minimal endpoint with automatic cleanup"""
#     try:
#         text = request.form.get('text', '').strip()
#         if not text:
#             return {"error": "No text provided"}, 400
        
#         # Create and use temp file with context manager
#         import tempfile
#         import os
        
#         with tempfile.NamedTemporaryFile(suffix='.wav', delete=True) as temp_file:
#             # Generate audio to temp file
#             tts_model.tts_to_file(text=text, file_path=temp_file.name)
            
#             # Read the content
#             temp_file.seek(0)
#             audio_bytes = temp_file.read()
        
#         # File is automatically deleted when context exits
#         return Response(
#             audio_bytes,
#             mimetype='audio/wav',
#             headers={'Content-Length': str(len(audio_bytes))}
#         )
        
#     except Exception as e:
#         logger.error(f"Error: {e}")
#         return {"error": str(e)}, 500

# if __name__ == '__main__':
#     logger.info("Starting Flask TTS Streaming Server")
#     logger.info("Primary endpoint: POST /tts - Generates audio in memory")
#     logger.info("No audio files are permanently saved to disk")
#     app.run(host='0.0.0.0', port=5000, debug=True)

#updated code with tts
from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import torch
import torch.serialization
from TTS.utils.radam import RAdam
from TTS.api import TTS
import whisper

import io
import wave
import numpy as np
import logging
import tempfile
import os
from datetime import datetime

# -------------------------
# Flask App Setup
# -------------------------
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------------
# Torch safe globals
# -------------------------
torch.serialization.add_safe_globals([RAdam])

# -------------------------
# Models (Global)
# -------------------------
tts_model = None
asr_model = None

# -------------------------
# Model Config
# -------------------------
TTS_MODEL_NAME = "tts_models/en/ljspeech/glow-tts"

WHISPER_MODELS_DIR = r"E:\whisper-models"
ASR_MODEL_NAME = "small.en"   # folder name inside whisper-models

# -------------------------
# Model Initializers
# -------------------------
def initialize_tts_model():
    global tts_model
    if tts_model is None:
        logger.info(f"Loading TTS model: {TTS_MODEL_NAME}")
        tts_model = TTS(TTS_MODEL_NAME)
        logger.info("TTS model loaded successfully")


def initialize_asr_model():
    global asr_model
    if asr_model is None:
        # model_path = os.path.join(WHISPER_MODELS_DIR)

        # logger.info(f"Loading ASR model from local path: {model_path}")

        # if not os.path.exists(model_path):
        #     raise FileNotFoundError(
        #         f"Whisper model not found at {model_path}. "
        #         f"Ensure the model exists inside E:\\whisper-models"
        #     )

        # device="cuda" if torch.cuda.is_available() else "cpu"
        asr_model = whisper.load_model(ASR_MODEL_NAME, download_root = "E:\\whisper-models")
        logger.info("ASR model loaded successfully")


# Initialize models at startup
initialize_tts_model()
initialize_asr_model()

# -------------------------
# Utils
# -------------------------
def numpy_to_wav_bytes(audio, sample_rate=22050):
    audio = np.clip(audio, -1.0, 1.0)
    audio = (audio * 32767).astype(np.int16)

    buffer = io.BytesIO()
    with wave.open(buffer, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(audio.tobytes())

    return buffer.getvalue()

# -------------------------
# Routes
# -------------------------
@app.route('/')
def index():
    return jsonify({
        "message": "TTS + ASR Streaming API",
        "endpoints": {
            "/tts": "POST - Text to Speech (WAV)",
            "/asr": "POST - Speech to Text (JSON)",
            "/health": "GET - Health check"
        },
        "models": {
            "tts": TTS_MODEL_NAME,
            "asr": ASR_MODEL_NAME,
            "asr_path": WHISPER_MODELS_DIR
        }
    })


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "tts_loaded": tts_model is not None,
        "asr_loaded": asr_model is not None,
        "timestamp": datetime.now().isoformat()
    })

# -------------------------
# TTS Endpoint
# -------------------------
@app.route('/tts', methods=['POST', 'OPTIONS'])
def tts():
    if request.method == 'OPTIONS':
        return '', 200

    try:
        if request.is_json:
            text = request.json.get("text", "").strip()
        else:
            text = request.form.get("text", "").strip()

        if not text:
            return jsonify({"error": "No text provided"}), 400

        if len(text) > 1000:
            return jsonify({"error": "Text too long (max 1000 chars)"}), 400

        logger.info(f"TTS request: {text[:60]}")

        try:
            wav = tts_model.tts(text=text)
            wav = np.array(wav) if isinstance(wav, list) else wav
            audio_bytes = numpy_to_wav_bytes(wav)

        except Exception:
            # Fallback to file-based generation
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as tmp:
                tts_model.tts_to_file(text=text, file_path=tmp.name)
                tmp.seek(0)
                audio_bytes = tmp.read()

        return Response(
            audio_bytes,
            mimetype="audio/wav",
            headers={
                "Content-Disposition": "inline; filename=speech.wav",
                "Content-Length": str(len(audio_bytes)),
                "Cache-Control": "no-store"
            }
        )

    except Exception as e:
        logger.error(f"TTS error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# -------------------------
# ASR Endpoint
# -------------------------
@app.route('/asr', methods=['POST', 'OPTIONS'])
def asr():
    if request.method == 'OPTIONS':
        return '', 200

    temp_file_path = None
    temp_file_handle = None
    
    try:
        print(f"=== ASR REQUEST RECEIVED ===")
        print(f"Headers: {dict(request.headers)}")
        
        if 'audio' not in request.files:
            print("ERROR: No 'audio' key in request.files")
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        
        if audio_file.filename == '':
            print("ERROR: Empty filename")
            return jsonify({"error": "No audio file selected"}), 400
        
        print(f"Audio file: {audio_file.filename}, Content-Type: {audio_file.content_type}")
        
        # Read the audio data into memory
        audio_bytes = audio_file.read()
        print(f"Audio bytes read: {len(audio_bytes)} bytes")
        
        if len(audio_bytes) < 100:
            print("ERROR: Audio too small")
            return jsonify({"error": "Audio file too small"}), 400
        
        # METHOD 1: Try to use BytesIO directly (no temp file)
        try:
            print("Attempting to transcribe from memory using BytesIO...")
            import io
            
            # Create a BytesIO object from the audio data
            audio_stream = io.BytesIO(audio_bytes)
            
            # Whisper can handle BytesIO in some versions, but let's try a different approach
            # First, let's check the audio format
            if audio_file.filename.endswith('.wav') or audio_file.content_type == 'audio/wav':
                print("Audio is WAV format, proceeding...")
                # Save to a proper temp file with context manager
                import tempfile
                import os
                
                # Create a named temporary file WITH delete=False and proper permissions
                temp_file_handle = tempfile.NamedTemporaryFile(
                    suffix='.wav',
                    delete=False,  # Don't delete automatically
                    mode='wb'
                )
                temp_file_path = temp_file_handle.name
                
                # Write the audio data
                temp_file_handle.write(audio_bytes)
                temp_file_handle.close()  # Close the file handle
                
                print(f"Saved temporary WAV file: {temp_file_path}")
                
            else:
                # For non-WAV formats, we might need to convert
                print(f"Non-WAV format detected: {audio_file.content_type}")
                # Try to save as webm and let Whisper handle it
                temp_file_handle = tempfile.NamedTemporaryFile(
                    suffix='.webm',
                    delete=False,
                    mode='wb'
                )
                temp_file_path = temp_file_handle.name
                temp_file_handle.write(audio_bytes)
                temp_file_handle.close()
                print(f"Saved temporary WEBM file: {temp_file_path}")
            
            # Verify file was created
            if not os.path.exists(temp_file_path):
                raise Exception(f"Temp file not created: {temp_file_path}")
            
            file_size = os.path.getsize(temp_file_path)
            print(f"Temp file size: {file_size} bytes")
            
            # Check if ASR model is loaded
            if asr_model is None:
                print("ERROR: ASR model is not loaded")
                return jsonify({"error": "ASR model not initialized"}), 500
            
            # Transcribe using Whisper
            print("Starting Whisper transcription...")
            result = asr_model.transcribe(
                temp_file_path,
                language='en',
                task='transcribe',
                fp16=False
            )
            
            transcription = result.get("text", "").strip()
            print(f"Transcription: '{transcription}'")
            
            return jsonify({
                "text": transcription,
                "language": result.get("language", "en"),
                "segments": result.get("segments", [])
            })
            
        except Exception as transcribe_error:
            print(f"Transcription attempt failed: {transcribe_error}")
            import traceback
            traceback.print_exc()
            
            # METHOD 2: Alternative approach - use a different temp directory
            try:
                print("Trying alternative method with user temp directory...")
                
                # Create a temp file in the current working directory instead
                import uuid
                import os
                
                # Use current directory or a dedicated temp folder
                temp_dir = os.path.join(os.getcwd(), 'temp_audio')
                os.makedirs(temp_dir, exist_ok=True)
                
                temp_filename = f"asr_{uuid.uuid4().hex}.webm"
                temp_file_path = os.path.join(temp_dir, temp_filename)
                
                print(f"Saving to: {temp_file_path}")
                
                with open(temp_file_path, 'wb') as f:
                    f.write(audio_bytes)
                
                # Transcribe
                result = asr_model.transcribe(temp_file_path)
                transcription = result.get("text", "").strip()
                
                print(f"Alternative method transcription: '{transcription}'")
                
                return jsonify({
                    "text": transcription,
                    "language": result.get("language", "en"),
                    "method": "alternative_temp"
                })
                
            except Exception as alt_error:
                print(f"Alternative method also failed: {alt_error}")
                raise alt_error
        
    except Exception as e:
        print(f"ASR endpoint error: {str(e)}")
        import traceback
        error_traceback = traceback.format_exc()
        print("Traceback:")
        print(error_traceback)
        
        return jsonify({
            "error": f"ASR processing failed: {str(e)}",
            "traceback": error_traceback[:500]  # Limit traceback size
        }), 500
    
    finally:
        # Clean up temp files if they exist
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                # Close the file handle if it's still open
                if temp_file_handle and not temp_file_handle.closed:
                    temp_file_handle.close()
                
                # Wait a bit before deleting (Windows sometimes locks files)
                import time
                time.sleep(0.1)
                
                os.unlink(temp_file_path)
                print(f"Cleaned up temp file: {temp_file_path}")
            except Exception as cleanup_error:
                print(f"Warning: Could not clean up temp file {temp_file_path}: {cleanup_error}")
                # Don't fail the request because of cleanup issues

# -------------------------
# Run Server
# -------------------------
if __name__ == "__main__":
    logger.info("Starting TTS + ASR Flask Server")
    app.run(host="0.0.0.0", port=5000, debug=True)
