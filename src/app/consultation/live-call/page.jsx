"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Loader2 } from "lucide-react";

export default function VideoCall() {

    const jitsiContainer = useRef(null);
    const router = useRouter();

    const remoteAudioTracksRef = useRef([]);
    const localAudioTrackRef = useRef(null);
    const recordingStartTime = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recordingRef = useRef(false);
    const audioChunksRef = useRef([]);
    const jitsiApiRef = useRef(null);
    const uploadInProgressRef = useRef(false);
    const pendingUploadRef = useRef(null);

    const [meetingId, setMeetingId] = useState(null);
    const [recording, setRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcriptionStatus, setTranscriptionStatus] = useState('');

    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [userRole, setUserRole] = useState('');
    const [name, setName] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch('/api/session');
                const data = await response.json();
                setToken(data.session?.token);
                setEmail(data.session?.email);
                setUserRole(data.session?.role);
                setName(data.session?.userName);
                setPhoneNumber(localStorage.getItem('patientNumber'));

                const params = new URLSearchParams(window.location.search);
                const urlMeetingId = params.get('meetingId');
                setMeetingId(urlMeetingId);

            } catch (error) {
                console.error('Failed to fetch session:', error);
            }
        };

        fetchSession();
    }, []);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (uploadInProgressRef.current) {
                e.preventDefault();
                e.returnValue = 'Audio upload is in progress. Leaving now may corrupt the recording. Are you sure?';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const convertToWav = async (audioBlob) => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            const wavBlob = audioBufferToWav(audioBuffer);
            return wavBlob;
        } catch (error) {
            return audioBlob;
        }
    };

    const audioBufferToWav = (audioBuffer) => {
        const numberOfChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;

        const bytesPerSample = bitDepth / 8;
        const blockAlign = numberOfChannels * bytesPerSample;

        const buffer = audioBuffer.getChannelData(0);
        const length = buffer.length;
        const arrayBuffer = new ArrayBuffer(44 + length * bytesPerSample);
        const view = new DataView(arrayBuffer);

        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * bytesPerSample, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, format, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        writeString(36, 'data');
        view.setUint32(40, length * bytesPerSample, true);

        let offset = 44;
        for (let i = 0; i < length; i++) {
            const sample = Math.max(-1, Math.min(1, buffer[i]));
            const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(offset, intSample, true);
            offset += 2;
        }

        return new Blob([arrayBuffer], { type: 'audio/wav' });
    };

    const uploadAudioToBackend = async (audioBlob) => {
        if (!token || !email || !phoneNumber || !meetingId) {
            return false;
        }

        uploadInProgressRef.current = true;
        setIsProcessing(true);

        try {
            const formData = new FormData();
            const isWav = audioBlob.type.includes('wav');
            const fileExtension = isWav ? 'wav' : 'webm';
            const fileName = `conversation_${meetingId}_${Date.now()}.${fileExtension}`;

            const audioFile = new File([audioBlob], fileName, {
                type: audioBlob.type
            });

            formData.append('audio', audioFile);
            formData.append('meetingUuid', meetingId);
            formData.append('phnumber', phoneNumber);
            formData.append('doctor_email', email);
            formData.append('token', token);

            const uploadPromise = fetch('/api/upload-audio', {
                method: 'POST',
                body: formData,
            });

            pendingUploadRef.current = uploadPromise;
            const response = await uploadPromise;

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                return true;
            } else {
                throw new Error(result.message || 'Upload failed');
            }

        } catch (error) {
            return false;
        } finally {
            uploadInProgressRef.current = false;
            pendingUploadRef.current = null;
            setIsProcessing(false);
        }
    };

    const stopRecording = async () => {
        if (!mediaRecorderRef.current || !recordingRef.current) {
            return;
        }

        recordingRef.current = false;
        setRecording(false);

        if (mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    const startRecording = async () => {
        if (userRole !== 'doctor') {
            return;
        }

        if (recordingRef.current) {
            return;
        }

        audioChunksRef.current = [];
        recordingStartTime.current = Date.now();

        try {
            let stream = null;

            try {
                stream = await navigator.mediaDevices.getDisplayMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: false,
                        autoGainControl: false,
                        sampleRate: 48000
                    },
                    video: false
                });

                const audioTracks = stream.getAudioTracks();
                if (audioTracks.length === 0) {
                    throw new Error('No system audio available');
                }
            } catch (systemError) {
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const destination = audioContext.createMediaStreamDestination();

                    let tracksConnected = 0;

                    if (localAudioTrackRef.current) {
                        const localStream = new MediaStream([localAudioTrackRef.current.getTrack()]);
                        const localSource = audioContext.createMediaStreamSource(localStream);
                        const localGain = audioContext.createGain();
                        localGain.gain.value = 0.8;

                        localSource.connect(localGain);
                        localGain.connect(destination);
                        tracksConnected++;
                    }

                    remoteAudioTracksRef.current.forEach((track) => {
                        try {
                            const remoteStream = new MediaStream([track.getTrack()]);
                            const remoteSource = audioContext.createMediaStreamSource(remoteStream);
                            const remoteGain = audioContext.createGain();
                            remoteGain.gain.value = 1.0;

                            remoteSource.connect(remoteGain);
                            remoteGain.connect(destination);
                            tracksConnected++;
                        } catch (trackError) {
                            // Ignore track errors
                        }
                    });

                    if (tracksConnected === 0) {
                        throw new Error('No Jitsi audio tracks available');
                    }

                    stream = destination.stream;

                } catch (mixError) {
                    stream = await navigator.mediaDevices.getUserMedia({
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true,
                            sampleRate: 48000
                        }
                    });
                }
            }

            if (!stream || !stream.getAudioTracks().length) {
                throw new Error('No audio stream available');
            }

            let mimeType;
            const preferredTypes = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/mp4',
                'audio/ogg'
            ];

            mimeType = preferredTypes.find(type => MediaRecorder.isTypeSupported(type));

            if (!mimeType) {
                throw new Error('No supported audio format found');
            }

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType,
                audioBitsPerSecond: 128000
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                if (audioChunksRef.current.length === 0) {
                    alert('No audio was recorded. Please check microphone permissions.');
                    return;
                }

                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

                setTranscriptionStatus('transcripting');
                const convertedBlob = await convertToWav(audioBlob);
                const success = await uploadAudioToBackend(convertedBlob);

                if (success) {
                    setTranscriptionStatus('successful');
                    setTimeout(() => {
                        setTranscriptionStatus('');
                    }, 3000);
                } else {
                    setTranscriptionStatus('');
                }

                stream.getTracks().forEach(track => {
                    track.stop();
                });
            };

            mediaRecorder.onerror = (event) => {
                setRecording(false);
                recordingRef.current = false;
                alert('Recording error: ' + event.error.message);
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start(1000);
            setRecording(true);
            recordingRef.current = true;

        } catch (error) {
            alert(`Recording failed: ${error.message}`);
            setRecording(false);
            recordingRef.current = false;
        }
    };

    // Initialize Jitsi Meet
    useEffect(() => {
        const initJitsi = () => {
            const displayName = name || 'Unknown';
            const roomName = localStorage.getItem('meetingId') || meetingId || 'Medimitra';

            if (window.JitsiMeetExternalAPI && jitsiContainer.current) {
                const api = new window.JitsiMeetExternalAPI("meet.codequantum.in", {
                    roomName: roomName,
                    width: "100%",
                    height: "100vh",
                    parentNode: jitsiContainer.current,
                    userInfo: { displayName: displayName },
                    configOverwrite: {
                        prejoinPageEnabled: false,
                        disableDeepLinking: true,
                        notifications: [],
                        startAudioOnly: false,
                        startWithAudioMuted: false,
                        startWithVideoMuted: false
                    },
                    interfaceConfigOverwrite: {
                        TOOLBAR_BUTTONS: ['microphone', 'camera', 'chat', 'hangup', 'settings', 'tileview'],
                        SHOW_CONFERENCE_NAME: false,
                        SHOW_JITSI_WATERMARK: false,
                        SHOW_WATERMARK_FOR_GUESTS: false,
                        SHOW_POWERED_BY: false,
                        SHOW_PROMOTIONAL_CLOSE_PAGE: false,
                        BRAND_WATERMARK_LINK: '',
                        DEFAULT_LOGO_URL: '',
                        APP_NAME: 'healthdesk',
                        HIDE_INVITE_MORE_HEADER: true,
                        FILMSTRIP_ONLY: false,
                        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                        NATIVE_APP_NAME: 'healthdesk',
                        SHOW_CHROME_EXTENSION_BANNER: false,
                        RECENT_LIST_ENABLED: false
                    }
                });

                jitsiApiRef.current = api;

                api.addEventListeners({
                    audioTrackAdded: (trackEvent) => {
                        if (trackEvent.track.isLocal()) {
                            localAudioTrackRef.current = trackEvent.track;
                        } else {
                            remoteAudioTracksRef.current.push(trackEvent.track);
                        }
                    },

                    audioTrackRemoved: (trackEvent) => {
                        if (trackEvent.track.isLocal()) {
                            localAudioTrackRef.current = null;
                        } else {
                            const index = remoteAudioTracksRef.current.indexOf(trackEvent.track);
                            if (index > -1) {
                                remoteAudioTracksRef.current.splice(index, 1);
                            }
                        }
                    },

                    videoConferenceLeft: async () => {
                        if (userRole === 'doctor' && recordingRef.current) {
                            await stopRecording();
                            if (uploadInProgressRef.current && pendingUploadRef.current) {
                                try {
                                    await pendingUploadRef.current;
                                } catch (error) {
                                    // Upload failed
                                }
                            }
                        }
                        router.replace('/thankyou');
                    },

                    readyToClose: async () => {
                        if (userRole === 'doctor' && recordingRef.current) {
                            await stopRecording();
                            if (uploadInProgressRef.current && pendingUploadRef.current) {
                                try {
                                    await pendingUploadRef.current;
                                } catch (error) {
                                    // Upload failed
                                }
                            }
                        }
                        router.replace('/thankyou');
                    }
                });

                jitsiContainer.current.api = api;
            } else {
                setTimeout(initJitsi, 200);
            }
        };

        if (userRole) {
            initJitsi();
        }

        return () => {
            if (recordingRef.current) {
                stopRecording();
            }
            if (jitsiContainer.current?.api) {
                jitsiContainer.current.api.dispose();
            }
        };

    }, [router, name, userRole, meetingId]);

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <div
                ref={jitsiContainer}
                className="flex-1 w-full h-full bg-black rounded-lg overflow-hidden shadow-2xl"
            />

            {userRole === 'doctor' && (
                <div className="bg-white border-t-4 border-[#40E0D0] p-4 shadow-lg">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-center gap-4 flex-wrap">
                            {recording && (
                                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="text-red-700 font-medium text-sm">Recording...</span>
                                </div>
                            )}

                            {isProcessing && (
                                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                    <Loader2 className="animate-spin text-blue-500" size={16} />
                                    <span className="text-blue-700 font-medium text-sm">Processing...</span>
                                </div>
                            )}

                            {transcriptionStatus === 'transcripting' && (
                                <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                                    <Loader2 className="animate-spin text-yellow-500" size={16} />
                                    <span className="text-yellow-700 font-medium text-sm">Transcripting...</span>
                                </div>
                            )}

                            {transcriptionStatus === 'successful' && (
                                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-green-700 font-medium text-sm">Successful</span>
                                </div>
                            )}

                            {!recording && !isProcessing && transcriptionStatus === '' && (
                                <button
                                    onClick={startRecording}
                                    className="bg-[#40E0D0] hover:bg-[#36C7B8] text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <Mic size={16} />
                                    Start Recording
                                </button>
                            )}

                            {recording && (
                                <button
                                    onClick={stopRecording}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <Square size={16} />
                                    Stop Recording
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}