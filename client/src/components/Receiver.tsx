import { useEffect, useRef, useState } from "react";
import '../styles/MediaControls.css';

interface ReceiverProps {
    astrologerId: string;
}

export const Receiver = ({ astrologerId }: ReceiverProps) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isReceiving, setIsReceiving] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const wsUrl = 'wss://astroalert-backend-m1hn.onrender.com/ws';
        const ws = new WebSocket(wsUrl);

        const peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        });

        peerConnection.ontrack = (event) => {
            if (videoRef.current && event.streams[0]) {
                videoRef.current.srcObject = event.streams[0];
                setIsReceiving(true);
            }
        };

        ws.onopen = () => {
            setIsConnected(true);
            ws.send(JSON.stringify({
                type: 'join_call',
                roomId: astrologerId
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
            peerConnection.close();
            ws.close();
        };
    }, [astrologerId]);

    return (
        <div className="media-container">
            <div className="status-bar">
                <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                    {isConnected ? 'Connected' : 'Disconnecting...'}
                </span>
            </div>
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                className="video-preview"
            />
            {!isReceiving && (
                <div className="waiting-overlay">
                    <p>Waiting for connection...</p>
                </div>
            )}
        </div>
    );
};