from fastapi import FastAPI, File, UploadFile
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="VitaVoice AI")

# Create audio_files directory if not exists
os.makedirs("../audio_files", exist_ok=True)
app.mount("/audio", StaticFiles(directory="../audio_files"), name="audio")

@app.post("/upload-audio/")
async def upload_audio(file: UploadFile = File(...)):
    contents = await file.read()
    filepath = f"../audio_files/{file.filename}"
    with open(filepath, "wb") as f:
        f.write(contents)
    return {"filename": file.filename, "status": "uploaded"}
