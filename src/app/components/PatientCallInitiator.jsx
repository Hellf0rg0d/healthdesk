'use client';

import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';

function PatientCallInitiator({ patientJwt }) {

    const PATIENT_JWT = patientJwt || '';
    const WEBSOCKET_URL = 'wss://codequantum.in/healthdesk-ws';

    const clientRef = useRef(null);
    const connectTimeoutRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [doctorAvailable, setDoctorAvailable] = useState(null);
    const [availabilityLoading, setAvailabilityLoading] = useState(true);

    const doctorData = {
        email: 'testing@example.com',
        name: 'tester',
        role: 'physician'
    };

    const checkDoctorAvailability = async (doctorEmail) => {
        setAvailabilityLoading(true);
        try {
            const response = await fetch(
                `https://codequantum.in/healthdesk/read/data/get-doctor-availability?key=${encodeURIComponent(doctorEmail)}`,
                {
                    method: 'GET',
                    headers: {
                        'token': `${PATIENT_JWT}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const res = await response.json();

            if (res === 302) {
                setDoctorAvailable(true);
                console.log(`${new Date().toLocaleTimeString()}: Doctor ${doctorEmail} is available`);
            } else if (res === 404) {
                setDoctorAvailable(false);
                console.log(`${new Date().toLocaleTimeString()}: Doctor ${doctorEmail} is not available`);
            } else {
                console.warn(`${new Date().toLocaleTimeString()}: Unexpected response status ${response.status} for doctor availability`);
                setDoctorAvailable(false);
            }
        } catch (error) {
            console.error(`${new Date().toLocaleTimeString()}: Error checking doctor availability:`, error);
            setDoctorAvailable(false);
        } finally {
            setAvailabilityLoading(false);
        }
    };


    useEffect(() => {

        if (!PATIENT_JWT) {
            console.warn('No patient Token provided. STOMP client will not activate.');
            setIsConnected(false);
            return;
        }

        checkDoctorAvailability(doctorData.email);

        const client = new Client({
            brokerURL: WEBSOCKET_URL,
            connectHeaders: {
                token: PATIENT_JWT,
            },
            debug: (str) => {
                // console.log(`${new Date().toLocaleTimeString()}: DEBUG: ${str}`);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = (frame) => {
            console.log(`${new Date().toLocaleTimeString()}: CONNECTED to WebSocket as Patient.`);
            // console.log(`${new Date().toLocaleTimeString()}: Session Details: ${frame.headers['message'] || 'No message header'}`);
            // console.log('Patient JWT:', PATIENT_JWT ? 'present' : 'missing');
            console.log('Client connected state:', client.connected);
            console.log('Client active state:', client.active);


            setIsConnected(true);

            if (connectTimeoutRef.current) {
                clearTimeout(connectTimeoutRef.current);
                connectTimeoutRef.current = null;
            }
        };

        client.onDisconnect = () => {
            console.log(`${new Date().toLocaleTimeString()}: 🔌 DISCONNECTED as Patient.`);
            setIsConnected(false);
        };

        client.onStompError = (frame) => {
            console.log(`${new Date().toLocaleTimeString()}: Broker reported error: ` + frame.headers['message']);
            console.log(`${new Date().toLocaleTimeString()}: Additional details: ` + frame.body);
            setIsConnected(false);
        };

        client.onWebSocketError = (event) => {
            console.log(`${new Date().toLocaleTimeString()}: WebSocket connection error. Check server status and token.`);
            console.error('WebSocket Error:', event);
            setIsConnected(false);
        };

        clientRef.current = client;

        try {
            // console.log(`${new Date().toLocaleTimeString()}: Activating STOMP client...`);
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

        } catch (e) {
            console.error(`${new Date().toLocaleTimeString()}: Error activating STOMP client:`, e);
            setIsConnected(false);
        }

        return () => {
            console.log('Deactivating STOMP client...');
            if (connectTimeoutRef.current) {
                clearTimeout(connectTimeoutRef.current);
                connectTimeoutRef.current = null;
            }

            try {
                if (client && client.active) {
                    client.deactivate();
                }
            } catch (e) {
                console.warn('Error deactivating client:', e);
            }
        };

    }, [PATIENT_JWT]);


    const handleAppointmentRequest = async (doctorEmail, meetingId) => {

        const client = clientRef.current;

        if (!client || !client.connected) {
            console.log(`${new Date().toLocaleTimeString()}: Cannot send message, not connected.`);
            console.log('Client state:', {
                exists: !!client,
                connected: client ? client.connected : 'N/A',
                active: client ? client.active : 'N/A'
            });
            throw new Error('Cannot send message, not connected.');
        }

        const payload = {
            doctorEmail: doctorEmail,
            meetingUuid: meetingId
        };

        const destination = '/app/healthdesk/videocall/create';

        try {
            client.publish({
                destination: destination,
                body: JSON.stringify(payload)
            });

            // console.log(`${new Date().toLocaleTimeString()}: Sent call request to ${destination}`);
            // console.log(`${new Date().toLocaleTimeString()}: Payload: ${JSON.stringify(payload)}`);

        } catch (err) {
            console.log(`${new Date().toLocaleTimeString()}: Failed to send message: ${err}`);
            throw new Error(`Failed to send call request: ${err.message}`);
        }
    };

    async function generateId() {
        const characters = 'abcdefghijklmnopqrstuvwxyz1234567890';
        let result = '';
        for (let i = 0; i < 10; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }
        return result;
    }

    const handleTakeAppointment = async () => {
        if (!isConnected) {
            alert('Cannot send appointment request. Patient not connected to service.');
            return;
        }

        setLoading(true);
        try {

            const meetingId = await generateId();
            localStorage.setItem('meetingId', meetingId);

            await handleAppointmentRequest(doctorData.email, meetingId);

            console.log(`${new Date().toLocaleTimeString()}: Call request sent successfully`);

            const callUrl = `/consultation/live-call?meetingId=${meetingId}`;
            // console.log(`${new Date().toLocaleTimeString()}: Opening call URL: ${callUrl}`);

            setTimeout(() => {
                window.open(callUrl, '_blank');
            }, 100);

        } catch (err) {
            console.error('Take appointment error:', err);
            alert(`Failed to send appointment request: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Available Doctors</h1>
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
                        <div className={`w-3 h-3 rounded-full ${PATIENT_JWT ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm font-medium">{PATIENT_JWT ? 'Authenticated' : 'Not Authenticated'}</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <span className="bg-[#40E0D0] text-white px-3 py-1 rounded-full text-sm font-medium">
                            {doctorData.role}
                        </span>
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${availabilityLoading ? 'bg-yellow-500 animate-pulse' :
                                    doctorAvailable ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                            <span className="text-sm font-medium">
                                {availabilityLoading ? 'Checking...' :
                                    doctorAvailable ? 'Available' : 'Unavailable'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-[#40E0D0] rounded-full flex items-center justify-center">
                            <span className="text-white text-xl font-bold">
                                {doctorData.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-gray-800">{doctorData.name}</h4>
                            <p className="text-gray-600">{doctorData.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleTakeAppointment}
                        disabled={loading || !isConnected || !doctorAvailable || availabilityLoading}
                        className={`w-full py-3 px-6 rounded-xl font-bold transition-all duration-200 ${(!isConnected || !doctorAvailable || availabilityLoading)
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-[#40E0D0] hover:bg-[#36C7B8] text-white shadow-lg hover:shadow-xl'
                            }`}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Sending...
                            </div>
                        ) : availabilityLoading ? (
                            'Checking Availability...'
                        ) : !isConnected ? (
                            'Offline - Refresh and Try'
                        ) : !doctorAvailable ? (
                            'Doctor Unavailable'
                        ) : (
                            'Take Consultation'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PatientCallInitiator;