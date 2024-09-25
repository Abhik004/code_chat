import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socketInit } from "../socket/index";
import { ACTIONS } from "../actions";
import freeice from 'freeice';

export const useWebRTC = (roomId, user) => {
    const [clients, setClients] = useState([]);
    const audioElements = useRef({});
    const connections = useRef({});
    const localMediaStream = useRef(null);
    const socket = useRef(null);
    const navigate = useNavigate();  // New useNavigate hook

    useEffect(() => {
        socket.current = socketInit();
    }, []);

    const addNewClient = (newClient, cb) => {
        const lookingFor = clients.find(client => client.id === newClient.id);
        if (!lookingFor) {
            setClients(existingClients => [...existingClients, newClient], cb);
        }
    };

    useEffect(() => {
        const startCapture = async () => {
            try {
                localMediaStream.current = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });
            } catch (err) {
                console.error('Error accessing media devices.', err);
                // If permission is denied, redirect user
                navigate('/error');  // Navigate to error page
            }
        };

        startCapture().then(() => {
            addNewClient(user, () => {
                const localElement = audioElements.current[user.id];
                if (localElement) {
                    localElement.volume = 0;
                    localElement.srcObject = localMediaStream.current;
                }
                // Emit join event
                socket.current.emit(ACTIONS.JOIN, { roomId, user });
            });
        });

        return () => {
            if (localMediaStream.current) {
                localMediaStream.current.getTracks().forEach(track => track.stop());
            }
            socket.current.emit(ACTIONS.LEAVE, { roomId });
        };
    }, [roomId, user, navigate]);

    useEffect(() => {
        const handleNewPeer = async ({ peerId, createOffer, user: remoteUser }) => {
            if (peerId in connections.current) {
                return console.warn(`You are already connected with ${peerId} (${user.name})`);
            }

            connections.current[peerId] = new RTCPeerConnection({
                iceServers: freeice(),
            });

            connections.current[peerId].onicecandidate = (event) => {
                socket.current.emit(ACTIONS.RELAY_ICE, {
                    peerId,
                    icecandidate: event.candidate,
                });
            };

            connections.current[peerId].ontrack = ({ streams: [remoteStream] }) => {
                addNewClient(remoteUser, () => {
                    if (audioElements.current[remoteUser.id]) {
                        audioElements.current[remoteUser.id].srcObject = remoteStream;
                    } else {
                        let settled = false;
                        const interval = setInterval(() => {
                            if (audioElements.current[remoteUser.id]) {
                                audioElements.current[remoteUser.id].srcObject = remoteStream;
                                settled = true;
                            }
                            if (settled) {
                                clearInterval(interval);
                            }
                        }, 1000);
                    }
                });
            };

            localMediaStream.current.getTracks().forEach(track => {
                connections.current[peerId].addTrack(track, localMediaStream.current);
            });

            if (createOffer) {
                const offer = await connections.current[peerId].createOffer();
                await connections.current[peerId].setLocalDescription(offer);
                socket.current.emit(ACTIONS.RELAY_SDP, {
                    peerId,
                    sessionDescription: offer,
                });
            }
        };

        socket.current.on(ACTIONS.ADD_PEER, handleNewPeer);

        return () => {
            socket.current.off(ACTIONS.ADD_PEER);
        };
    }, [clients, addNewClient]);

    useEffect(() => {
        socket.current.on(ACTIONS.ICE_CANDIDATE, ({ peerId, icecandidate }) => {
            if (icecandidate) {
                connections.current[peerId].addIceCandidate(icecandidate);
            }
        });

        return () => {
            socket.current.off(ACTIONS.ICE_CANDIDATE);
        };
    }, []);

    useEffect(() => {
        const handleRemoteSDP = async ({ peerId, sessionDescription: remoteSessionDescription }) => {
            connections.current[peerId].setRemoteDescription(new RTCSessionDescription(remoteSessionDescription));

            if (remoteSessionDescription.type === 'offer') {
                const connection = connections.current[peerId];
                const answer = await connection.createAnswer();
                connection.setLocalDescription(answer);

                socket.current.emit(ACTIONS.RELAY_SDP, {
                    peerId,
                    sessionDescription: answer,
                });
            }
        };

        socket.current.on(ACTIONS.SESSION_DESCRIPTION, handleRemoteSDP);

        return () => {
            socket.current.off(ACTIONS.SESSION_DESCRIPTION);
        };
    }, []);

    useEffect(() => {
        const handleRemovePeer = ({ peerId }) => {
            if (connections.current[peerId]) {
                connections.current[peerId].close();
            }

            delete connections.current[peerId];
            delete audioElements.current[peerId];

            setClients(list => list.filter(client => client.id !== peerId));
        };

        socket.current.on(ACTIONS.REMOVE_PEER, handleRemovePeer);

        return () => {
            socket.current.off(ACTIONS.REMOVE_PEER);
        };
    }, []);

    const provideRef = (instance, userId) => {
        audioElements.current[userId] = instance;
    };

    return { clients, provideRef };
};
