'use client';
import React, { useState, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import TranscriptionResult from '../components/TranscriptionResult';

export default function Home() {
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState({ 
    stage: '', 
    percentage: 0
  });

  useEffect(() => {
    console.log(`
                                
    ██   ██ ██████              
    ██   ██ ██   ██             
    ███████ ██████              
    ██   ██ ██                  
    ██   ██ ██                  
    HALFBLOODPRINCE
    `);
  }, []);

  const handleFileSelect = async (file) => {
    if (!file) return;
    
    console.log('🎯 File selected:', file.name, `${Math.round(file.size/1024/1024)}MB`);
    
    const fileSizeMB = Math.round(file.size / 1024 / 1024);
    if (fileSizeMB > 25) {
      setError('File too large for OpenAI Whisper (max 25MB). Please use a smaller file.');
      return;
    }
    
    if (file.type === 'audio/aac' || file.name.toLowerCase().endsWith('.aac')) {
      console.log('🔄 AAC file detected - will be converted to M4A for OpenAI compatibility');
    }
    
    setLoading(true);
    setError('');
    setTranscription('');
    
    let formatInfo = '';
    if (file.type === 'audio/aac' || file.name.toLowerCase().endsWith('.aac')) {
      formatInfo = ' (converting AAC to M4A)';
    }
    
    setProgress({ 
      stage: `Processing ${fileSizeMB}MB file with OpenAI Whisper${formatInfo}...`, 
      percentage: 10
    });

    const formData = new FormData();
    formData.append('audio', file);

    try {
      setProgress({ stage: 'Preparing file format...', percentage: 20 });
      const timeoutMs = 200000;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('🚨 Frontend timeout reached');
        controller.abort();
      }, timeoutMs);

      setProgress({ stage: 'Uploading to OpenAI...', percentage: 30 });

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      setProgress({ stage: 'OpenAI processing audio...', percentage: 70 });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Transcription failed');
      }

      if (data.success && data.text) {
        console.log('✅ OpenAI transcription successful!');
        console.log(`📊 Processing time: ${Math.round(data.processingTime/1000)}s`);
        console.log(`🔄 Format conversion: ${data.originalFormat} → ${data.processedFormat}`);
        
        setTranscription(data.text);
        
        let successMessage = `Complete! Processed in ${Math.round(data.processingTime/1000)}s`;
        if (data.originalFormat !== data.processedFormat) {
          successMessage += ` (${data.originalFormat} → ${data.processedFormat})`;
        }
        
        setProgress({ stage: successMessage, percentage: 100 });
        setTimeout(() => setProgress({ stage: '', percentage: 0 }), 4000);
      } else {
        throw new Error(data.details || 'No transcription received');
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timeout. OpenAI took too long to process your file.');
      } else {
        console.error('💥 Frontend error:', err);
        setError(err.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
      if (progress.percentage !== 100) {
        setProgress({ stage: '', percentage: 0 });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 relative">
      {/* Social Links - Top Left */}
      <div className="absolute top-4 left-4 z-50 flex space-x-3">
        <a 
          href="https://github.com/Jayzheh" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-gray-50 group border border-gray-200"
          title="GitHub"
        >
            <svg className="w-5 h-5 text-black group-hover:text-gray-700 transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <a 
            href="https://www.linkedin.com/in/dan-lyn-bayan-medou-614404190" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-gray-50 group border border-gray-200"
            title="LinkedIn"
          >
            <svg className="w-5 h-5 text-black group-hover:text-gray-700 transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold mb-4">Audio Transcription</h1>
          <p className="text-gray-600 mb-2">
            Powered by OpenAI Whisper - Fast & Reliable (Max 25MB)
          </p>
          <p className="text-sm text-green-600 mb-6">
            ✅ Supports: MP3, WAV, FLAC, M4A, MP4, OGG, WEBM, and AAC (auto-converted)
          </p>
        </div>
        
        <FileUpload onFileSelect={handleFileSelect} isLoading={loading} />
        
        {loading && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">
                {progress.stage || 'Processing with OpenAI...'}
              </span>
              <span className="text-sm text-green-600">{progress.percentage}%</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-green-600 mt-2">
              ⚡ OpenAI automatically handles format conversion and processing
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
            {error.includes('format') && (
              <div className="mt-2 text-sm text-red-600">
                Supported formats: MP3, WAV, FLAC, M4A, MP4, OGG, WEBM, AAC
              </div>
            )}
            {error.includes('API key') && (
              <div className="mt-2 text-sm text-red-600">
                Please check your OpenAI API key in the environment variables.
              </div>
            )}
          </div>
        )}

        {transcription && (
          <TranscriptionResult 
            transcription={transcription} 
            onClear={() => setTranscription('')}
          />
        )}
      </div>
    </div>
  );
}
