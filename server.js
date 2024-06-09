const express = require('express');
const app = express(); //Creating express app and getting an instance
const http = require('http'); 
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');

const server = http.createServer(app); //Creating the server and binding express to http server. It means now express is the part of that server and any functions of express() will be called using server object.
const io = new Server(server); //Creating a websocket server at the same http server. (Making http server a socket server which will listen to socket events)

//Declaring build folder as static folder
app.use(express.static('build'));
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


const userSocketMap = {}; 

function getAllConnectedClients(roomId){
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(//io.sockets.adapter.rooms returns all the rooms active on the server. .get(roomId) returns the socket.id of all the users connected in a particular room
        (socketId) => {
            return { //Returning the array of objects each containing the socketId and username of client connected to a particular room
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

io.on('connection', (socket) => { //It will be triggered when connection to socket will be made.
    console.log('socket connected', socket.id); //A specific id is returned as a client connects to the backend server. Each client has its own socket id. As the initSocket() function is triggered a client is connected to socket and get a unique id.
    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = username;// Adding all the users connected to the server in an object regardless of whether they are in a particular room or not 
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => { //Emitting an event to each socketId connected in a particular room.
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients, //Array of connected users in a room
                username, //Username of person connected
                socketId: socket.id, //socket id of person connected
            });
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => { //Listening for code change event emitted by Editor.js
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code }); //Emitting the event to everyone in the room.
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => { //Emitting a code change event which will be listened by Editor.js imported in EditorPage.js of the person just connected
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on('disconnecting', () => { //In build event listener which listens to disconnecting event. It is not io.on but socket.on because socket. events listens to events particular to a particular socket id not the whole server. io. listens to events particular to whole server. Since we are the one who are disconnecting and not the server being disconnected.
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id]; //Remove user from userSocketMap
        socket.leave();
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));