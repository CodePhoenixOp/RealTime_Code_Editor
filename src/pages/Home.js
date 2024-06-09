import React, { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const [roomId, setRoomId] = useState(''); //Used to control the state of roomId field of form
    const [username, setUsername] = useState(''); //Used to control the state of Username field of form
    
    //Called when room button is called to create new room id
    const createNewRoom = (e) => {
        e.preventDefault(); //Since room is an anchor tag it will load a page. To prevent this default behaviour of tag we use this
        const id = uuidV4(); //Package to create a random room id
        setRoomId(id); //Using useState() function to dynamically change the input field in the form. 
        toast.success('Created a new room');
    };

    //Triggered when join button is pressed
    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error('ROOM ID & username is required');
            return;
        }

    // Navigate to other url defined in BrowserRouter
        navigate(`/editor/${roomId}`, {
            state: {
                username,
            },
        });
    };

    //To give functionaity to enter key
    const handleInputEnter = (e) => {
        if (e.code === 'Enter') { // === operator do not performs type coersion. e.code returns the kay pressed. e.key returns the character pressed.
            joinRoom();
        }
    };
    return (
        <div className="homePageWrapper">

            <div className="formWrapper">
                <img className="homePageLogo" src="/code-sync.png" alt="code-sync-logo"/>
                <h4 className="mainLabel">Paste Invitation Room ID</h4>

                <div className="inputGroup">
                    <input type="text" className="inputBox" placeholder="Room ID" onChange={(e) => setRoomId(e.target.value)} value={roomId} onKeyUp={handleInputEnter}/>
                    <input type="text" className="inputBox" placeholder="Username" onChange={(e) => setUsername(e.target.value)} value={username} onKeyUp={handleInputEnter}/>
                    <button className="btn joinBtn" onClick={joinRoom}>Join</button>
                    <span className="createInfo">If you do not have an invite, then create &nbsp;<a onClick={createNewRoom} href="" className="createNewBtn">new room</a></span>
                </div>

            </div>

            <footer>
                <h4></h4>
            </footer>
            
        </div>
    );
};

export default Home;