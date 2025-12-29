'use client';

import { useState, useEffect, useRef, use } from 'react';
import { Wifi, WifiOff, Video, Mic, Upload, Loader2, MessageSquare, CheckCircle, AlertCircle, FileVideo, Play } from 'lucide-react';

const SUBMIT_URL = "https://akenzz-health-desk-ai.hf.space/medreach/submit";

export default function Mainpart({ typeId }) {

  const [networkQuality, setNetworkQuality] = useState('unknown');
  const [networkStatus, setNetworkStatus] = useState('Detecting...');
  const [isGoodNetwork, setIsGoodNetwork] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [transcript, setTranscript] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [apiError, setApiError] = useState('');
  const [videoPreview, setVideoPreview] = useState(null);
  const [audioBlobExtracted, setAudioBlobExtracted] = useState(null);

  const [patientPhone, setPatientPhone] = useState('');
  const [token, setToken] = useState('');

  const fileInputRef = useRef(null);
  const videoPreviewRef = useRef(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {

        const response = await fetch('/api/session');
        const data = await response.json();
        setToken(data.session?.token);
        // setEmail(data.session?.email);
        // setUserRole(data.session?.role);
        // setName(data.session?.userName);
        setPatientPhone(data.session?.phone);

        console.log("phone", data.session.phone);

      } catch (error) {
        console.error('Failed to fetch session:', error);
      }
    };

    fetchSession();
  }, []);

  const extractAudio = async (file) => {
    try {
      setProcessingStage('Loading FFmpeg...');

      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { fetchFile, toBlobURL } = await import('@ffmpeg/util');

      const ffmpeg = new FFmpeg();

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      setProcessingStage('Extracting audio from video...');

      await ffmpeg.writeFile('input.mp4', await fetchFile(file));

      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vn',
        '-acodec', 'pcm_s16le',
        '-ar', '16000',
        '-ac', '1',
        'output.wav'
      ]);

      const audioData = await ffmpeg.readFile('output.wav');
      const audioBlob = new Blob([audioData.buffer], { type: 'audio/wav' });

      setProcessingStage('Audio extraction complete');
      return audioBlob;

    } catch (error) {
      console.error('Audio extraction error:', error);
      throw new Error(`Failed to extract audio from video: ${error.message}`);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    try {
      setProcessingStage('Loading Whisper model...');

      const { pipeline, env } = await import('@huggingface/transformers');

      env.allowRemoteModels = true;
      env.allowLocalModels = false;

      setProcessingStage('Initializing transcription...');

      const transcriber = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-tiny.en',
        {
          revision: 'main',
          dtype: 'fp32'
        }
      );

      setProcessingStage('Transcribing audio...');

      const audioUrl = URL.createObjectURL(audioBlob);

      const result = await transcriber(audioUrl, {
        chunk_length_s: 30,
        stride_length_s: 5
      });

      URL.revokeObjectURL(audioUrl);

      setProcessingStage('Transcription complete');

      if (result && result.text) {
        return result.text.trim();
      } else {
        throw new Error('No transcription result received');
      }

    } catch (error) {
      throw new Error(`Transcription failed: ${error.message}`);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setApiError('Please select a valid video file.');
      return;
    }

    setSelectedFile(file);
    setApiError('');
    setUploadComplete(false);
    setTranscript('');

    const videoUrl = URL.createObjectURL(file);
    setVideoPreview(videoUrl);
  };

  const processVideo = async () => {
    if (!selectedFile) {
      setApiError('Please select a video file first.');
      return;
    }

    setIsProcessing(true);
    setApiError('');

    try {

      const audioBlob = await extractAudio(selectedFile);
      setAudioBlobExtracted(audioBlob);


      const transcriptionText = await transcribeAudio(audioBlob);
      setTranscript(transcriptionText);


      await submitToBackend(transcriptionText);

    } catch (error) {
      setApiError(error.message || 'Failed to process video');
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  const submitToBackend = async (transcriptionText) => {
    setIsUploading(true);
    setUploadProgress(0);
    setProcessingStage('Uploading to server...');

    const formData = new FormData();

    formData.append('patient_phone', patientPhone);
    formData.append('doctor_speciality', typeId);

    formData.append('transcript', transcriptionText);

    if (isGoodNetwork && selectedFile) {
      formData.append('video', selectedFile, selectedFile.name);
    }

    try {
      const response = await fetch(SUBMIT_URL, {
        method: 'POST',
        headers: {
          'authorization': token
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Server responded with ${response.status}`);
      }

      const result = await response.json();
      console.log('Submission successful, AI analysis complete:', result);

      setUploadProgress(100);
      setTimeout(() => {
        setUploadComplete(true);
        setIsUploading(false);
        setTimeout(resetState, 2000);
      }, 500);

    } catch (error) {
      console.error('Error submitting data:', error);
      setApiError(`Failed to submit: ${error.message}`);
      setIsUploading(false);
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setVideoPreview('');
    setTranscript('');
    setProcessingStage('');
    setUploadProgress(0);
    setIsProcessing(false);
    setIsUploading(false);
    setUploadComplete(false);
    setApiError('');
    setAudioBlobExtracted(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const detectNetworkQuality = (connection) => {
    const downlink = connection?.downlink || 0;
    let quality = 'poor', status = 'Poor', isGood = false;
    if (downlink >= 10) {
      quality = 'excellent'; status = 'Excellent'; isGood = true;
    } else if (downlink >= 2.5) {
      quality = 'good2'; status = 'Good'; isGood = true;
    } else if (downlink >= 1.5) {
      quality = 'fair'; status = 'Fair'; isGood = false;
    }
    return { quality, status, isGood };
  };

  const updateNetworkStatus = () => {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      const { quality, status, isGood } = detectNetworkQuality(connection);
      setNetworkQuality(quality); setNetworkStatus(status); setIsGoodNetwork(isGood);
    } else {
      setNetworkStatus('Network API unavailable'); setIsGoodNetwork(false);
    }
  };

  const getProcessingButtonText = () => {
    if (uploadComplete) return 'Complete!';
    if (isUploading) return 'Uploading...';
    if (isProcessing) return processingStage || 'Processing...';
    if (selectedFile) return 'Process Video';
    return 'Select Video';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    updateNetworkStatus();
    if ('connection' in navigator) {
      const connection = navigator.connection;
      connection.addEventListener('change', updateNetworkStatus);
      return () => connection.removeEventListener('change', updateNetworkStatus);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-gray-200">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">MedReach Consultation</h1>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${isGoodNetwork
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
              }`}>
              {isGoodNetwork ? <Wifi size={16} /> : <WifiOff size={16} />}
              <span>{networkStatus}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isProcessing || isUploading}
            />

            <button
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl ${selectedFile
                  ? 'bg-[#40E0D0] hover:bg-[#36C7B8] text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } ${(isProcessing || isUploading) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              onClick={() => selectedFile ? processVideo() : fileInputRef.current?.click()}
              disabled={isProcessing || isUploading}
            >
              {isProcessing || isUploading ? <Loader2 size={20} className="animate-spin" /> :
                uploadComplete ? <CheckCircle size={20} /> :
                  selectedFile ? <Play size={20} /> : <Upload size={20} />}
              <span>{getProcessingButtonText()}</span>
            </button>
          </div>
        </div>

        {(isUploading || isProcessing) && (
          <div className="p-6 border-b border-gray-200 bg-blue-50">
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div
                className="bg-[#40E0D0] h-3 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span className="text-sm text-blue-700 font-medium">
              {processingStage || 'Processing...'}
            </span>
          </div>
        )}

        {apiError && (
          <div className="p-4 bg-red-50 border-b border-gray-200">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle size={20} />
              <span className="flex-1">{apiError}</span>
              <button
                onClick={() => setApiError('')}
                className="text-red-500 hover:text-red-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="p-6">
          {selectedFile && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#40E0D0] rounded-xl flex items-center justify-center">
                    <FileVideo size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{selectedFile.name}</h3>
                    <p className="text-gray-600 text-sm">{formatFileSize(selectedFile.size)}</p>
                    <div className="mt-1">
                      {isGoodNetwork ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Will upload: Video + Transcript
                        </span>
                      ) : (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                          Will upload: Transcript only
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={resetState}
                  className="text-gray-400 hover:text-red-500 text-xl font-bold p-2"
                  disabled={isProcessing || isUploading}
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {videoPreview && (
            <div className="mb-6">
              <div className="bg-black rounded-xl overflow-hidden shadow-lg">
                <video
                  ref={videoPreviewRef}
                  src={videoPreview}
                  controls
                  className="w-full h-auto max-h-96"
                />
              </div>
            </div>
          )}

          {!selectedFile && (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl mb-6">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload size={32} className="text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Upload Video for Consultation</h2>
                <p className="text-gray-600 mb-4">Select a video file from your device to generate transcript and consultation</p>

                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-4 ${isGoodNetwork
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                  }`}>
                  {isGoodNetwork ? <Video size={18} /> : <MessageSquare size={18} />}
                  <span>
                    {isGoodNetwork
                      ? 'Good network: Video + transcript will be uploaded'
                      : 'Limited network: Only transcript will be uploaded'
                    }
                  </span>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#40E0D0] hover:bg-[#36C7B8] text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
                >
                  <Upload size={20} />
                  Choose Video File
                </button>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 text-gray-700">
                <MessageSquare size={20} />
                <span className="font-medium">Generated Transcript</span>
              </div>
              {isProcessing && processingStage.includes('Transcribing') && (
                <div className="flex items-center gap-2 text-[#40E0D0]">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm font-medium">Transcribing...</span>
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="bg-white rounded-lg p-4 min-h-32 border border-gray-200">
                <div className="text-gray-700 leading-relaxed">
                  {transcript || (selectedFile ? 'Process the video to generate transcript' : 'Upload a video file to generate transcript')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}