import { useEffect, useRef, useState } from "react"
import '../styles/MediaControls.css'

interface SenderProps {
    astrologerId: string;
    autoStart?: boolean;
}

export const Sender = ({ astrologerId, autoStart = false }: SenderProps) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [pc, setPC] = useState<RTCPeerConnection | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isMicOn, setIsMicOn] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        const wsUrl = 'wss://astroalert-backend-m1hn.onrender.com/ws';
        
        console.log('Connecting to:', wsUrl);
        const ws = new WebSocket(wsUrl);
        setSocket(ws);

        const peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        });
        setPC(peerConnection);

        ws.onopen = () => {
            console.log('WebSocket Connected');
            setIsConnected(true);
            ws.send(JSON.stringify({
                type: 'join_call',
                roomId: astrologerId,
                userId: localStorage.getItem('userId'),
                role: localStorage.getItem('userRole')
            }));
        };

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                ws.send(JSON.stringify({
                    type: 'ice_candidate',
                    candidate: event.candidate,
                    roomId: astrologerId
                }));
            }
        };

        ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            try {
                switch (data.type) {
                    case 'offer':
                        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
                        const answer = await peerConnection.createAnswer();
                        await peerConnection.setLocalDescription(answer);
                        ws.send(JSON.stringify({
                            type: 'answer',
                            answer: answer,
                            roomId: astrologerId
                        }));
                        break;
                    case 'answer':
                        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
                        break;
                    case 'ice_candidate':
                        if (data.candidate) {
                            await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
                        }
                        break;
                }
            } catch (err) {
                console.error("Error handling message:", err);
            }
        };

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            peerConnection.close();
            ws.close();
        };
    }, [astrologerId]);

    useEffect(() => {
        if (autoStart) {
            startStream();
        }
    }, [autoStart]);

    const startStream = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setStream(mediaStream);
            setIsCameraOn(true);
            setIsMicOn(true);
        } catch (err) {
            console.error('Error accessing media devices:', err);
        }
    };

    const toggleCamera = async () => {
        if (stream) {
            stream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsCameraOn(!isCameraOn);
        }
    };

    const toggleMic = async () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMicOn(!isMicOn);
        }
    };

    const initiateConn = async () => {
        if (!socket || !pc) {
            alert("Connection not ready");
            return;
        }

        try {
            // First notify astrologer
            socket.send(JSON.stringify({
                type: 'call_request',
                astrologerId: astrologerId,
                userId: localStorage.getItem('userId'),
                userName: localStorage.getItem('userName')
            }));

            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: true,
                audio: true 
            });
            setStream(mediaStream);
            setIsCameraOn(true);
            setIsMicOn(true);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

            mediaStream.getTracks().forEach((track) => {
                pc.addTrack(track, mediaStream);
            });

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.send(JSON.stringify({
                type: 'createOffer',
                sdp: pc.localDescription
            }));
        } catch (err) {
            console.error("Error setting up connection:", err);
            alert("Failed to setup connection");
        }
    }

    return (
        <div className="media-container">
            <div className="status-bar">
                <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                </span>
            </div>
            
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="video-preview"
            />

            <div className="controls">
                <button 
                    onClick={toggleCamera} 
                    className={`control-btn ${isCameraOn ? 'active' : ''}`}
                    disabled={!stream}
                >
                    {isCameraOn ? '🎥' : '❌'} Camera
                </button>
                <button 
                    onClick={toggleMic} 
                    className={`control-btn ${isMicOn ? 'active' : ''}`}
                    disabled={!stream}
                >
                    {isMicOn ? '🎤' : '🔇'} Mic
                </button>
                <button 
                    onClick={initiateConn}
                    className="start-btn"
                    disabled={!isConnected || stream !== null}
                >
                    Start Streaming
                </button>
            </div>
        </div>
    )
}