'use client';

import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';

function DoctorCallListener({ doctorJwt }) {
    const DOCTOR_JWT = doctorJwt || '';
    const DOCTOR_EMAIL = 'testing@example.com';
    const [incomingCall, setIncomingCall] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messageCount, setMessageCount] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const [availabilityStatus, setAvailabilityStatus] = useState('checking');
    const clientRef = useRef(null);
    const subscriptionRef = useRef(null);
    const connectTimeoutRef = useRef(null);

    const setDoctorAvailability = async () => {
        if (!DOCTOR_JWT) {
            console.warn('No doctor token available for setting availability');
            setAvailabilityStatus('error');
            return;
        }

        try {
            setAvailabilityStatus('checking');
            console.log(`${new Date().toLocaleTimeString()}: Setting doctor availability for ${DOCTOR_EMAIL}`);

            const response = await fetch(
                `https://codequantum.in/healthdesk/send/data/set-doctor-availability?key=${encodeURIComponent(DOCTOR_EMAIL)}`,
                {
                    method: 'POST',
                    headers: {
                        'token': `${DOCTOR_JWT}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = await response.json();

            if (data === 302) {
                setAvailabilityStatus('available');
                console.log(`${new Date().toLocaleTimeString()}: Doctor availability set successfully`);
            } else {
                console.error(`${new Date().toLocaleTimeString()}: Failed to set doctor availability. Status: ${response.status}`);
                setAvailabilityStatus('error');
            }
        } catch (error) {
            console.error(`${new Date().toLocaleTimeString()}: Error setting doctor availability:`, error);
            setAvailabilityStatus('error');
        }
    };

    const updateDoctorAvailability = async () => {
        if (!DOCTOR_JWT) {
            console.warn('No doctor token available for setting availability');
            setAvailabilityStatus('error');
            return;
        }

        try {
            setAvailabilityStatus('checking');
            console.log(`${new Date().toLocaleTimeString()}: Setting doctor availability for ${DOCTOR_EMAIL}`);

            const response = await fetch(
                `https://codequantum.in/healthdesk/send/data/update-doctor-availability?key=${encodeURIComponent(DOCTOR_EMAIL)}`,
                {
                    method: 'PATCH',
                    headers: {
                        'token': `${DOCTOR_JWT}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = await response.json();

            if (data === 401) {
                throw new Error('Failed to update availability');
            }

        } catch (error) {
            console.error(`${new Date().toLocaleTimeString()}: Error setting doctor availability:`, error);
            setAvailabilityStatus('error');
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setIsListening(true);
            setTimeout(() => setIsListening(false), 2000);
        }, 10000); // Every 10 seconds

        if (DOCTOR_JWT) {
            setDoctorAvailability();
        }

        return () => clearInterval(interval);
    }, [DOCTOR_JWT]);

    useEffect(() => {

        // const handleTestCall = (event) => {
        //     console.log('Test incoming call triggered:', event.detail);
        //     setIncomingCall(event.detail);
        // };

        // window.addEventListener('testIncomingCall', handleTestCall);

        if (!DOCTOR_JWT) {
            console.warn('No doctor Token provided. STOMP client will not activate.');
            setIsConnected(false);
            // return () => window.removeEventListener('testIncomingCall', handleTestCall);
        }


        const client = new Client({
            brokerURL: 'wss://codequantum.in/healthdesk-ws',
            connectHeaders: {
                token: DOCTOR_JWT,
            },
            debug: (str) => {
                // console.log(`${new Date().toLocaleTimeString()}: DEBUG: ${str}`);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = (frame) => {
            console.log(`${new Date().toLocaleTimeString()}: CONNECTED to WebSocket as Doctor.`);
            // console.log(`${new Date().toLocaleTimeString()}: Session Details: ${frame.headers['message'] || 'No message header'}`);
            // console.log('Doctor JWT:', DOCTOR_JWT ? 'present' : 'missing');
            console.log('Client connected state:', client.connected);
            console.log('Client active state:', client.active);

            setIsConnected(true);

            if (connectTimeoutRef.current) {
                clearTimeout(connectTimeoutRef.current);
                connectTimeoutRef.current = null;
            }

            const subscriptionDestination = '/user/queue/healthdesk/read/videocall-details';
            // console.log(`${new Date().toLocaleTimeString()}: Subscribing to destination: ${subscriptionDestination}`);

            try {
                subscriptionRef.current = client.subscribe(subscriptionDestination, (message) => {
                    setMessageCount(prev => prev + 1);
                    // console.log(`${new Date().toLocaleTimeString()}: Received incoming call with Meeting UUID: ${message.body}`);

                    const body = JSON.parse(message.body);

                    localStorage.setItem('patientNumber', body.patient_phonenumber);

                    setIncomingCall({
                        meetingUuid: body.meeting_uuid,
                        patientName: 'Patient',
                        timestamp: new Date().toISOString()
                    });
                });

                // console.log(`${new Date().toLocaleTimeString()}:  Subscription successful to ${subscriptionDestination}`);
            } catch (subscriptionError) {
                console.error(`${new Date().toLocaleTimeString()}:  Subscription failed:`, subscriptionError);
            }
        };

        client.onDisconnect = () => {
            console.log(`${new Date().toLocaleTimeString()}: 🔌 DISCONNECTED as Doctor.`);
            setIsConnected(false);
        };

        client.onStompError = (frame) => {
            console.log(`${new Date().toLocaleTimeString()}: Broker reported error: ` + (frame?.headers?.message || 'Unknown error'));
            console.log(`${new Date().toLocaleTimeString()}: Additional details: ` + (frame?.body || 'No details'));
            setIsConnected(false);
        };

        client.onWebSocketError = (event) => {
            console.log(`${new Date().toLocaleTimeString()}: WebSocket connection error. Check server status and token.`);
            console.error('WebSocket Error:', event);
            setIsConnected(false);
        };

        clientRef.current = client;

        try {
            console.log(`${new Date().toLocaleTimeString()}: Activating STOMP client...`);
            client.activate();

            connectTimeoutRef.current = setTimeout(() => {
                if (!client.connected) {
                    console.log(`${new Date().toLocaleTimeString()}: Connection timeout - failed to connect within 10 seconds`);
                    console.log('Client state at timeout:', {
                        connected: client.connected,
                        active: client.active,
                        state: client.state
                    });
                    setIsConnected(false);
                }
            }, 10000);

        } catch (activationError) {
            console.error(`${new Date().toLocaleTimeString()}: Error activating STOMP client:`, activationError);
            setIsConnected(false);
        }

        return () => {
            console.log('Cleaning up STOMP client...');
            // window.removeEventListener('testIncomingCall', handleTestCall);

            if (connectTimeoutRef.current) {
                clearTimeout(connectTimeoutRef.current);
                connectTimeoutRef.current = null;
            }

            try {
                if (subscriptionRef.current) {
                    console.log('Unsubscribing from WebSocket...');
                    subscriptionRef.current.unsubscribe();
                    subscriptionRef.current = null;
                }
            } catch (e) {
                console.warn('Error unsubscribing:', e);
            }

            try {
                if (client && client.active) {
                    console.log('Deactivating STOMP client...');
                    client.deactivate();
                }
            } catch (e) {
                console.warn('Error deactivating client:', e);
            }
        };
    }, [DOCTOR_JWT]);


    if (!incomingCall) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <h1 className="text-2xl font-bold text-gray-800">Doctor Portal</h1>
                        {isListening && (
                            <div className="w-3 h-3 bg-[#40E0D0] rounded-full animate-pulse"></div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Connection Status:</span>
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Authentication:</span>
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${DOCTOR_JWT ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm font-medium">{DOCTOR_JWT ? 'Authenticated' : 'Not Authenticated'}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Availability Status:</span>
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${availabilityStatus === 'available' ? 'bg-green-500' :
                                    availabilityStatus === 'checking' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                                }`}></div>
                            <span className="text-sm font-medium">
                                {availabilityStatus === 'available' ? 'Available' :
                                    availabilityStatus === 'checking' ? 'Setting...' : 'Error'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🩺</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No Patient Requests</h2>
                    <p className="text-gray-600 mb-6">
                        You're all set! Waiting for patient consultation requests...
                    </p>
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 inline-block">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700">Requests Received:</span>
                            <span className="bg-[#40E0D0] text-white px-3 py-1 rounded-full text-sm font-bold">{messageCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <h1 className="text-2xl font-bold text-gray-800">Doctor Portal</h1>
                    {isListening && (
                        <div className="w-3 h-3 bg-[#40E0D0] rounded-full animate-pulse"></div>
                    )}
                </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Connection Status:</span>
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Authentication:</span>
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${DOCTOR_JWT ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm font-medium">{DOCTOR_JWT ? 'Authenticated' : 'Not Authenticated'}</span>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Availability Status:</span>
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${availabilityStatus === 'available' ? 'bg-green-500' :
                                availabilityStatus === 'checking' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                            }`}></div>
                        <span className="text-sm font-medium">
                            {availabilityStatus === 'available' ? 'Available' :
                                availabilityStatus === 'checking' ? 'Setting...' : 'Error'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white border-2 border-[#40E0D0] rounded-2xl p-6 shadow-lg">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#40E0D0] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-white text-2xl">📞</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">New Patient Request!</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-bold">P</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800">{incomingCall.patientName || 'Patient'}</h4>
                            <p className="text-gray-600">Requesting consultation</p>
                        </div>
                    </div>

                    {incomingCall.timestamp && (
                        <div className="bg-gray-50 rounded-lg p-3">
                            <span className="text-sm text-gray-600">
                                Request time: {new Date(incomingCall.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                    )}

                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Meeting ID:</span>
                            <span className="font-mono text-sm bg-[#40E0D0] text-white px-2 py-1 rounded">
                                {incomingCall.meetingUuid}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        className="flex-1 bg-[#40E0D0] hover:bg-[#36C7B8] text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
                        onClick={() => {
                            localStorage.setItem('meetingId', incomingCall.meetingUuid);
                            window.open(`/consultation/live-call?meetingId=${incomingCall.meetingUuid}`, '_blank');
                            setIncomingCall(null);
                        }}
                    >
                        Join Call
                    </button>
                    <button
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors duration-200"
                        onClick={() => setIncomingCall(null)}
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DoctorCallListener;