"use client";

import { useState } from "react";

export default function HomePage() {
  const [uploadStatus, setUploadStatus] = useState('');
  const [files, setFiles] = useState([]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadStatus('Uploading...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setUploadStatus(`✅ Upload successful! File: ${result.file.originalName}`);
        setFiles(prev => [...prev, result.file]);
        
        // Auto-start processing
        setUploadStatus(prev => prev + ' | Starting AI processing...');
        
        const sepResponse = await fetch('/api/separate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fileId: result.file.id,
            qualityLevel: 'standard'
          })
        });

        const sepResult = await sepResponse.json();
        
        if (sepResult.success) {
          setUploadStatus(prev => prev + ' | ✅ Processing started!');
          
          // Check status after a delay
          setTimeout(async () => {
            const statusResponse = await fetch(`/api/status?fileId=${result.file.id}`);
            const statusResult = await statusResponse.json();
            
            if (statusResult.success) {
              setUploadStatus(prev => prev + ` | Status: ${statusResult.progress.status}`);
              
              if (statusResult.progress.status === 'completed') {
                setUploadStatus(prev => prev + ' | 🎉 Ready to download!');
              }
            }
          }, 3000);
          
        } else {
          setUploadStatus(prev => prev + ` | ❌ Processing failed: ${sepResult.error}`);
        }
        
      } else {
        setUploadStatus(`❌ Upload failed: ${result.error}`);
      }
    } catch (error) {
      setUploadStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          🎵 AudioSeparator - Voice & Music Separation
        </h1>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">Upload Test</h2>
          
          <div className="mb-6">
            <label className="block text-white mb-2">Select Audio/Video File:</label>
            <input
              type="file"
              accept=".mp3,.wav,.m4a,.mp4,.avi,.mov"
              onChange={handleFileUpload}
              className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>
          
          {uploadStatus && (
            <div className="mb-6 p-4 bg-black/30 rounded-lg">
              <p className="text-white whitespace-pre-wrap">{uploadStatus}</p>
            </div>
          )}
          
          {files.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-white mb-4">Uploaded Files</h3>
              {files.map((file, index) => (
                <div key={index} className="bg-black/20 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-white font-medium">{file.originalName}</h4>
                      <p className="text-gray-300 text-sm">
                        Size: {(file.size / (1024 * 1024)).toFixed(2)} MB | 
                        Status: {file.status} | 
                        Duration: {file.duration}s
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg"
                        onClick={() => alert('Voice download would start here!')}
                      >
                        🎤 Download Voice
                      </button>
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                        onClick={() => alert('Music download would start here!')}
                      >
                        🎵 Download Music
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-8 text-center">
            <p className="text-gray-300 text-sm">
              Supported formats: MP3, WAV, M4A, MP4, AVI, MOV | Max size: 100MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}