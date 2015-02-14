// Invoke 'strict' JavaScript mode
'use strict';

// Create the configuration
// socketData holds info about trackrooms and users
module.exports = function(io, socket, socketData) {
    // Emit the status event when a new socket client is connected
    io.emit('karttaMessage', {
        type: 'status',
        text: 'connected',
        created: Date.now(),
        username: 'dummy'
    });

    // Send a xmos messages to all connected sockets when a message is received 
    socket.on('karttaMessage', function(message) {
        console.log(message);
        message.type = 'message';
        message.created = Date.now();
        message.username = 'dummy';
        if (message.messageLatitude || message.messageLongitude) {
        message.kartta_response_text = "r: "+message.text+
        " Lat:"+message.messageLatitude.toString()+
        " Lon:"+message.messageLongitude.toString(); 
        } else {
        message.kartta_response_text = "did not get you :(";
        }
        io.emit('karttaMessage', message);   
    });


    // Disconnections
    socket.on('disconnect', function() {
        console.log("Disconnecting id:"+socket.id);
    });
    
    // kartta logic
    // Enter room
    socket.on('karttaEnterTrackRoom', function(message) {
        console.log("Entering trackroom");
        console.log(message);
        var roomKey = message.trackroom;
        
        if (!socketData.trackRooms[roomKey]) {// trackroom does not exist yet
            socketData.trackRooms[roomKey] = {};
        }
        socketData.trackRooms[roomKey][socket.id] = {name: message.name};
        socketData.idRooms[socket.id] = roomKey;
        socketData.isInRoom[socket.id] = true;
        socket.join(roomKey);
        socket.broadcast.to(roomKey).emit('karttaRoomUpdateMessage', {
            name: message.name,
            text: message.name + " joined",
            created: Date.now()
        });
        console.log(socketData.trackRooms[roomKey]);
        
        io.emit('karttaEnterTrackRoomStatus', message); 
    });
    // Leave room
    socket.on('karttaLeaveTrackRoom', function(message) {
        var roomKey = message.trackroom;
        if (roomKey && socketData.trackRooms[roomKey] && socketData.trackRooms[roomKey][socket.id]) {
        	delete socketData.trackRooms[roomKey][socket.id];
        	}
        socketData.isInRoom[socket.id] = false;
        socketData.idRooms[socket.id] = "this_is_no_room_sdfhakjhfbvjh"; // dummy string
                socket.broadcast.to(roomKey).emit('karttaRoomUpdateMessage', {
            name: message.name,
            text: message.name + " left",
            created: Date.now()
        });
        //console.log("Leaving trackroom id:"+socket.id);
        //console.log(socketData.trackRooms);
    });
    // Destroy angular controller
    socket.on('karttaDestroy', function(message) {
        //console.log("Destroy controller");
        //console.log(message);
    });
};