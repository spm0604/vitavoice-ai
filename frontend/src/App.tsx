import React, { useState } from 'react';
import axios from 'axios';

interface Summary {
  clinical_summary: string;
  patient_summary: string;
}

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [transcript, setTranscript] = useState("");
  const [entities, setEntities] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<Summary | null>(null);

  const handleUpload = async () => {
    if (!file) return setStatus("Select audio file first");
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const response = await axios.post("http://localhost:8000/upload-audio/", formData);
      setStatus(`✅ ${response.data.filename} uploaded!`);
    } catch (error) {
      setStatus("❌ Upload failed");
    }
  };

  const handleTranscribe = async () => {
    try {
      const response = await axios.post("http://localhost:8000/transcribe/", 
        { filename: file?.name });
      setTranscript(response.data.transcript);
      setStatus("✅ Transcription complete!");
    } catch (error) {
      setStatus("❌ Transcription failed");
    }
  };

  const handleExtract = async () => {
    try {
      const response = await axios.post("http://localhost:8000/extract-entities/", 
        { text: transcript });
      setEntities(response.data.entities);
      setStatus("✅ Entities extracted!");
    } catch (error) {
      setStatus("❌ Extraction failed");
    }
  };

  const handleSummarize = async () => {
    try {
      const response = await axios.post("http://localhost:8000/summarize/", 
        { text: transcript, entities });
      setSummaries(response.data);
      setStatus("✅ Summaries generated!");
    } catch (error) {
      setStatus("❌ Summarization failed");
    }
  };

  return (
    <div style={{padding: "20px", maxWidth: "1200px", margin: "0 auto"}}>
      <h1>🩺 VitaVoice AI Consultation Summarizer</h1>
      
      <div style={{border: "1px solid #ccc", padding: "20px", margin: "20px 0", borderRadius: "8px"}}>
        <h3>1. Audio Upload</h3>
        <input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <br/><br/>
        <button onClick={handleUpload} style={{background: "#4CAF50", color: "white", padding: "10px 20px"}}>
          Upload Audio
        </button>
      </div>

      {status && <p style={{color: status.includes("✅") ? "green" : "red"}}>{status}</p>}

      {transcript && (
        <>
          <div style={{border: "1px solid #ccc", padding: "20px", margin: "20px 0"}}>
            <h3>2. Transcript</h3>
            <button onClick={handleExtract}>Extract Medical Entities</button>
            <p>{transcript}</p>
            {entities.length > 0 && (
              <div>
                <h4>Extracted Entities:</h4>
                <ul>{entities.map((e, i) => (
                  <li key={i}><strong>{e.label}:</strong> {e.text}</li>
                ))}</ul>
              </div>
            )}
          </div>

          <button onClick={handleSummarize} style={{background: "#2196F3", color: "white", padding: "10px 20px"}}>
            Generate Summaries
          </button>
        </>
      )}

      {summaries && (
        <div style={{marginTop: "20px"}}>
          <h3>Clinical Summary (Doctor)</h3>
          <pre style={{background: "#f5f5f5", padding: "15px", borderRadius: "4px"}}>
            {summaries.clinical_summary}
          </pre>
          
          <h3>Patient Summary</h3>
          <pre style={{background: "#e8f5e8", padding: "15px", borderRadius: "4px"}}>
            {summaries.patient_summary}
          </pre>
        </div>
      )}
    </div>
  );
};

export default App;
