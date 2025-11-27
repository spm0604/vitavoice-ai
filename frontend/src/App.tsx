import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  const handleUpload = async () => {
    if (!file) return setStatus("Select audio file first");
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const response = await axios.post("http://localhost:8000/upload-audio/", formData);
      setStatus(`Success: ${response.data.filename} uploaded!`);
    } catch (error) {
      setStatus("Upload failed");
    }
  };

  return (
    <div style={{padding: "20px"}}>
      <h1>🩺 VitaVoice AI Consultation Summarizer</h1>
      <input 
        type="file" 
        accept="audio/*" 
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <br/><br/>
      <button onClick={handleUpload}>Upload Audio</button>
      <p>{status}</p>
    </div>
  );
}

export default App;
