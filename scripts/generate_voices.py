"""
This script uses Coqui TTS (XTTS-v2) to pre-generate audio files for the Kids Literacy App.
It requires a Python environment with torch and TTS installed:
`pip install torch TTS`

Usage:
1. Provide a reference audio file (e.g., 'reference_voice.wav') in the same directory.
   The reference audio should be a clear, high-quality recording of a pleasant, child-friendly voice (e.g., a teacher or energetic narrator) speaking Portuguese for about 5-10 seconds.
2. Run this script: `python generate_voices.py`
3. The generated .wav files will be placed in `../src/shared/assets/audio/`
"""

import os
import torch
from TTS.api import TTS

# Prepare Output Directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
output_dir = os.path.join(BASE_DIR, "..", "public", "audio")
os.makedirs(output_dir, exist_ok=True)

# Define Vocabulary
vocabulary = [
    ##{"id": "I", "text": "Í de Igreja"},
    #{"id": "G", "text": "Gê de gaato"},
]

# Initialize XTTS-v2
# NOTE: This will download the model weights (~2GB) on the first run.
print("Loading Model...")
device = "cpu" # Forced CPU due to PyTorch missing sm_120 (RTX 5080) support
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)
print(f"Model loaded on {device}")

# Define the reference speaker wav (MUST exist before running)
# You need to provide a sample of the voice you want to clone.
reference_wav = os.path.join(BASE_DIR, "reference_voice.wav")

if not os.path.exists(reference_wav):
    print(f"ERROR: You must provide a reference audio file named '{reference_wav}' in this directory.")
    print("This is required by XTTS-v2 to clone the voice characteristics.")
    exit(1)

# Generate Audio
for item in vocabulary:
    output_path = os.path.join(output_dir, f"{item['id'].lower()}.wav")
    print(f"Generating audio for: {item['text']} -> {output_path}")
    
    tts.tts_to_file(
        text=item["text"], 
        speaker_wav=reference_wav, 
        language="pt", # Portuguese
        file_path=output_path
    )

print("Audio generation complete! All files saved to the assets folder.")
