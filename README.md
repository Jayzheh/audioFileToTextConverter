# 🎤 Audio Transcription App

**Personal Project - Not for Commercial Use**

Convert your audio files to text using OpenAI's powerful Whisper AI. Simple, fast, and accurate transcription in seconds!

## ⚠️ Important Notice

This project is for **personal use only**. The code is **not available for reuse, modification, or commercial purposes**. All rights reserved.

**Created by HalfbloodPrince** ⚡

## ✨ What It Does

- Converts audio files to text using AI
- Supports all major audio formats (MP3, WAV, AAC, M4A, etc.)
- Handles files up to 25MB
- No registration required - just upload and transcribe!

## 🚀 Quick Setup

### You'll Need
- [Node.js](https://nodejs.org/) (version 18 or newer)
- An [OpenAI API key](https://platform.openai.com/api-keys) (costs ~$0.006 per minute of audio)

### Get Started in 3 Steps

1. **Download and install:**
   ```bash
   git clone [repository-url]
   cd audio-transcription-app
   npm install
   ```

2. **Add your OpenAI key:**
   Create a file called `.env.local` and add:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

3. **Start the app:**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 in your browser!

## 📁 Supported Files

Works with: MP3, WAV, FLAC, M4A, MP4, OGG, WEBM, and AAC files

**AAC files are automatically converted** to work with OpenAI - no extra steps needed!

## 💰 Cost

OpenAI charges about $0.006 per minute of audio:
- 5-minute file ≈ 3 cents
- 30-minute podcast ≈ 18 cents
- 1-hour meeting ≈ 36 cents

## 🔒 Privacy

- Your audio files are never stored on our servers
- Files are sent directly to OpenAI for processing
- Transcriptions are only shown to you
- Everything is deleted after processing

## 🛠️ Technical Details

Built with:
- **Next.js** - React framework
- **OpenAI Whisper API** - AI transcription
- **Tailwind CSS** - Styling

### Project Structure
```
├── app/
│   ├── api/transcribe/route.js    # Main API endpoint
│   └── page.js                    # Main page
├── components/
│   ├── FileUpload.js              # File upload interface
│   └── TranscriptionResult.js     # Results display
└── .env.local                     # Your API key (create this)
```

### Development Commands
```bash
npm run dev      # Start development
npm run build    # Build for production
npm run start    # Run production build
```

## 🐛 Common Issues

**"Invalid API key"** → Check your `.env.local` file and make sure your OpenAI key is correct

**"File too large"** → Use files under 25MB, or compress your audio first

**"Request timeout"** → Large files take 2-3 minutes to process - be patient!

## 📄 License & Usage

**© 5 HalfbloodPrince. All rights reserved.**

This project is for **personal use only**. The following are **strictly prohibited**:

❌ **Commercial use**  
❌ **Code redistribution**  
❌ **Modification for public release**  
❌ **Selling or licensing**  
❌ **Creating derivative works**  

This software is provided as-is for personal use only.

---

**Made with by HalfbloodPrince**

*Personal Audio Transcription Tool - 2025*