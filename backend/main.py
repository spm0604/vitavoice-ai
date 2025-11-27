from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import openai
import spacy
import os
from typing import Dict, List

app = FastAPI(title="VitaVoice AI Consultation Summarizer")

# Initialize models
nlp = spacy.load("en_core_med7_lg")
openai.api_key = os.getenv("OPENAI_API_KEY", "your-key-here")

class Transcript(BaseModel):
    text: str

class Entities(BaseModel):
    entities: List[Dict]

# Create directories
os.makedirs("../audio_files", exist_ok=True)
app.mount("/audio", StaticFiles(directory="../audio_files"), name="audio")

@app.post("/upload-audio/")
async def upload_audio(file: UploadFile = File(...)):
    contents = await file.read()
    filepath = f"../audio_files/{file.filename}"
    with open(filepath, "wb") as f:
        f.write(contents)
    return {"filename": file.filename, "status": "uploaded"}

@app.post("/transcribe/")
async def transcribe_audio(filename: str):
    audio_file = open(f"../audio_files/{filename}", "rb")
    transcript = openai.Audio.transcribe("whisper-1", audio_file)
    return {"transcript": transcript["text"]}

@app.post("/extract-entities/")
async def extract_entities_endpoint(transcript: Transcript):
    doc = nlp(transcript.text)
    entities = [{"text": ent.text, "label": ent.label_} for ent in doc.ents]
    return {"entities": entities}

@app.post("/summarize/")
async def summarize_consultation(transcript: Transcript, entities: Entities):
    prompt_doctor = f"""Clinical Summary:
Transcript: {transcript.text}
Medical Entities: {entities.entities}
Generate professional clinical summary:"""
    
    prompt_patient = f"""Patient-friendly Summary:
Transcript: {transcript.text}
Medical Entities: {entities.entities}
Explain in simple language with bullet points:"""
    
    clinical = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt_doctor}]
    ).choices[0].message.content
    
    patient = openai.ChatCompletion.create(
        model="gpt-4o-mini", 
        messages=[{"role": "user", "content": prompt_patient}]
    ).choices[0].message.content
    
    return {"clinical_summary": clinical, "patient_summary": patient}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
