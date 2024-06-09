import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket'; //Importing initSocket function that initializes WebSocket to backend server.js
import {useLocation, useNavigate, Navigate, useParams} from 'react-router-dom';

const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation(); //To get the state data passed by home.js
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket(); //initSocket() function returns a promise which is assigned to object current value. .on function is inbuild. It is an event listener. We sends the inbuild provided events as parameters. initSocket() function connects a client to the backend socket server
            socketRef.current.on('connect_error', (err) => handleErrors(err)); //Checking for error.
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            //Called when error is encountered
            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed...');
                reactNavigator('/');
            }


            //When the page load emit the join event with object containing roomId and username to the server so that it can join us in the room with the roomId sent.
            socketRef.current.emit(ACTIONS.JOIN, { 
                roomId,
                username: location.state?.username,
            });

            // Listening for joined event passed by server.js
            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, username, socketId }) => { //Getting my socketId
                    if (username !== location.state?.username) { //Sending the message to the users that a person joined the room
                        toast.success(`${username} joined the room.`);
                        console.log(`${username} joined`);
                    }
                    setClients(clients); //Changing the value of clients object dynamically.

                    socketRef.current.emit(ACTIONS.SYNC_CODE, { //Emitting event for syncing the code with the socketId of the person just connected in my room and current code value 
                        code: codeRef.current,
                        socketId,
                    });
                }
            );

            // Listening for disconnected
            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    setClients((prev) => {
                        return prev.filter(
                            (client) => client.socketId !== socketId
                        );
                    });
                }
            );
        };
        init();
        return () => { //Clean up functions
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        };
    }, []);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId); //Copying room ID
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }

    function leaveRoom() {
        reactNavigator('/');
    }

    if (!location.state) { //A case of error
        return <Navigate to="/" />;
    }

    return (
        <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        <img className="logoImage" src="/code-sync.png" alt="logo"/>
                    </div>
                    <h3>Members</h3>
                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client key={client.socketId} username={client.username}/>
                        ))}
                    </div>
                </div>
                <button className="btn copyBtn" onClick={copyRoomId}>Copy Room ID</button>
                <button className="btn leaveBtn" onClick={leaveRoom}>Leave</button>
            </div>
            <div className="editorWrap">
                <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code) => {
                        codeRef.current = code;
                    }}
                />
            </div>
        </div>
    );
};

export default EditorPage;