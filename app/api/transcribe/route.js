export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    console.log('🎤 Starting OpenAI Whisper transcription...');
    
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    
    if (!audioFile || audioFile.size === 0) {
      return Response.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // OpenAI supports up to 25MB files
    if (audioFile.size > 25 * 1024 * 1024) {
      return Response.json({ 
        error: 'File too large (max 25MB for OpenAI Whisper)' 
      }, { status: 413 });
    }
    
    const fileSizeMB = Math.round(audioFile.size / 1024 / 1024);
    console.log(`📁 Processing: ${audioFile.name}, ${fileSizeMB}MB, ${audioFile.type}`);
    
    // Handle file format conversion for OpenAI compatibility
    const processedFile = await prepareFileForOpenAI(audioFile);
    
    console.log(`🔄 Prepared file: ${processedFile.name}, type: ${processedFile.type}`);
    
    // Single fast request to OpenAI
    const result = await transcribeWithOpenAI(processedFile);
    
    if (result.success) {
      console.log(`✅ OpenAI transcription completed in ${Math.round(result.processingTime/1000)}s`);
      
      return Response.json({
        text: result.text,
        success: true,
        processingTime: result.processingTime,
        method: 'openai-whisper',
        model: 'whisper-1',
        fileSize: fileSizeMB,
        originalFormat: audioFile.type,
        processedFormat: processedFile.type
      });
    } else {
      throw new Error(result.error);
    }
    
  } catch (error) {
    console.error('💥 OpenAI transcription failed:', error.message);
    return Response.json({ 
      error: 'Transcription failed', 
      details: error.message,
      success: false
    }, { status: 500 });
  }
}

// Prepare file for OpenAI API compatibility
async function prepareFileForOpenAI(audioFile) {
  const originalType = audioFile.type;
  const originalName = audioFile.name;
  
  console.log(`🔧 Preparing file: ${originalName} (${originalType})`);
  
  // OpenAI supported formats
  const openAISupportedTypes = {
    'audio/flac': { ext: '.flac', type: 'audio/flac' },
    'audio/x-flac': { ext: '.flac', type: 'audio/flac' },
    'audio/m4a': { ext: '.m4a', type: 'audio/m4a' },
    'audio/x-m4a': { ext: '.m4a', type: 'audio/m4a' },
    'audio/mp3': { ext: '.mp3', type: 'audio/mp3' },
    'audio/mpeg': { ext: '.mp3', type: 'audio/mpeg' },
    'audio/mp4': { ext: '.mp4', type: 'audio/mp4' },
    'audio/mpga': { ext: '.mp3', type: 'audio/mpga' },
    'audio/oga': { ext: '.oga', type: 'audio/oga' },
    'audio/ogg': { ext: '.ogg', type: 'audio/ogg' },
    'audio/wav': { ext: '.wav', type: 'audio/wav' },
    'audio/wave': { ext: '.wav', type: 'audio/wav' },
    'audio/x-wav': { ext: '.wav', type: 'audio/wav' },
    'audio/webm': { ext: '.webm', type: 'audio/webm' }
  };
  
  // Handle AAC files specially (convert to M4A)
  if (originalType === 'audio/aac' || originalType === 'audio/x-aac') {
    console.log('🔄 Converting AAC to M4A format for OpenAI compatibility...');
    
    // Create new file with M4A extension and type
    const newFileName = originalName.replace(/\.aac$/i, '.m4a');
    const fileBuffer = await audioFile.arrayBuffer();
    
    const m4aFile = new File(
      [fileBuffer], 
      newFileName, 
      { 
        type: 'audio/m4a',
        lastModified: audioFile.lastModified 
      }
    );
    
    console.log(`✅ Converted ${originalName} (${originalType}) → ${newFileName} (audio/m4a)`);
    return m4aFile;
  }
  
  // Check if file type is already supported
  if (openAISupportedTypes[originalType]) {
    console.log(`✅ File type ${originalType} is already supported by OpenAI`);
    return audioFile;
  }
  
  // Handle common extensions that might have wrong MIME types
  const fileExtension = originalName.toLowerCase().split('.').pop();
  
  const extensionToType = {
    'flac': 'audio/flac',
    'm4a': 'audio/m4a',
    'mp3': 'audio/mp3',
    'mp4': 'audio/mp4',
    'mpeg': 'audio/mpeg',
    'mpga': 'audio/mpga',
    'oga': 'audio/oga',
    'ogg': 'audio/ogg',
    'wav': 'audio/wav',
    'webm': 'audio/webm',
    'aac': 'audio/m4a'  // Treat AAC as M4A
  };
  
  if (extensionToType[fileExtension]) {
    const correctType = extensionToType[fileExtension];
    console.log(`🔄 Correcting MIME type from ${originalType} to ${correctType} based on extension`);
    
    const fileBuffer = await audioFile.arrayBuffer();
    const correctedFile = new File(
      [fileBuffer], 
      fileExtension === 'aac' ? originalName.replace(/\.aac$/i, '.m4a') : originalName,
      { 
        type: correctType,
        lastModified: audioFile.lastModified 
      }
    );
    
    return correctedFile;
  }
  
  // If we can't identify the format, try as-is but warn
  console.log(`⚠️ Unknown format ${originalType}, attempting to send as-is...`);
  return audioFile;
}

// Core OpenAI Whisper transcription function
async function transcribeWithOpenAI(audioFile) {
  const startTime = Date.now();
  
  try {
    console.log(`🚀 Sending ${audioFile.name} (${audioFile.type}) to OpenAI Whisper API...`);
    
    // Create FormData for OpenAI API
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'json');
    formData.append('temperature', '0'); // More deterministic results
    
    // Auto-detect language or set to specific language
    // formData.append('language', 'en'); // Uncomment to force English
    
    // Create abort controller with reasonable timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error('⏰ OpenAI request timed out after 3 minutes');
      controller.abort();
    }, 180000); // 3 minutes timeout
    
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const processingTime = Date.now() - startTime;
    
    console.log(`📡 OpenAI API responded in ${processingTime}ms with status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ OpenAI API Error:', response.status, errorData);
      
      // Handle specific OpenAI errors
      if (response.status === 400) {
        if (errorData.error?.message?.includes('file format')) {
          throw new Error(`Unsupported audio format. OpenAI supports: FLAC, M4A, MP3, MP4, MPEG, MPGA, OGA, OGG, WAV, WEBM. Your file: ${audioFile.type}`);
        }
        if (errorData.error?.message?.includes('file size')) {
          throw new Error('File too large. Please use a file smaller than 25MB.');
        }
        throw new Error(`Invalid request: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      if (response.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your API key in environment variables.');
      }
      
      if (response.status === 429) {
        throw new Error('OpenAI rate limit exceeded. Please try again in a moment.');
      }
      
      if (response.status === 500) {
        throw new Error('OpenAI server error. Please try again.');
      }
      
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const result = await response.json();
    const transcriptionText = result.text || '';
    
    if (!transcriptionText.trim()) {
      console.log('⚠️ OpenAI returned empty transcription');
      return {
        success: true,
        text: '[No speech detected in audio file]',
        processingTime: processingTime
      };
    }
    
    console.log(`✅ OpenAI transcribed: ${transcriptionText.length} characters in ${Math.round(processingTime/1000)}s`);
    
    return {
      success: true,
      text: transcriptionText.trim(),
      processingTime: processingTime
    };
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out after 3 minutes. Please try with a smaller file.');
    }
    
    console.error(`💥 OpenAI transcription error: ${error.message}`);
    throw new Error(error.message || 'OpenAI transcription failed');
  }
}