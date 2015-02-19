// Invoke 'strict' JavaScript mode
'use strict';

var RandomColor = require('randomcolor');

// Create the configuration
// socketData holds info about trackrooms and users
module.exports = function(io, socket, socketData) {
    
    // Specific socket constants
    var userColor = RandomColor.randomColor({luminosity: 'dark'}); // generate once
    // console.log(userColor);
    

    // Logic for requesting ok to enter room
    socket.on('kEnterTrackRoomOK', function(message) {
        // Here possible to check if i.e. duplicate names in trackroom in future
        if (message.name || message.trackroom) {
            console.log(message.name + " given OK to enter trackroom " + message.trackroom);
            io.emit('kEnterTrackRoomOK', {okToEnter: true});
        } else { // some problem
            console.log("Request to enter trackroom rejected:");
            console.log(message);
            io.emit('kEnterTrackRoomOK', {okToEnter: false, text:"Enter not accepted"});
        }
    });
    
    // Send a xmos messages to all connected sockets when a message is received 
    socket.on('kMessage', function(message) {
        console.log(message);
        message.date = Date.now();
        io.to(message.trackroom).emit('kMessage', message);   
    });

    // Get position update on broadccast it to others in the room
    socket.on('kPosUpdate', function(message) {
        console.log("Got kPosUpdate");
        if (message.trackroom && message.name && message.id && message.longitude && message.latitude) {
            console.log("Room: "+ message.trackroom 
                        + " Name: " + message.name 
                        + " pos update. Lat: " + message.latitude 
                        + " Lon: " + message.longitude);
            message.date = Date.now();
            io.to(message.trackroom).emit('kPosUpdate', message);
            //socket.broadcast.to(message.trackroom).emit('kPosUpdate', message);
            //socket.emit('kPosUpdate', message); // bounce back to creator
        } else {
            console.log("problem in kPosUpdate:");
            console.log(message);
        }
    });

    // Disconnections
    socket.on('disconnect', function() {
        // logic for leaving the server
        leaveMap(socket, io, socketData);
        if (socketData.idNames[socket.id]) {
            delete socketData.idNames[socket.id];
        }
        console.log("Disconnecting id:"+socket.id);
    });
    
    /* 
    * kartta logic
    */
    
    // Enter room
    socket.on('kEnterTrackRoom', function(message) {
        //joinMap(socket, io, message, socketData);
            // Emit the status event when a new socket client is connected
        joinMap(message);
    });
    
    // Leave room
    socket.on('kLeaveTrackRoom', function(message) {
        leaveMap(socket, io, socketData);
    });
    // Destroy angular controller
    /*
    socket.on('kDestroy', function(message) {
        //console.log("Destroy controller");
        //console.log(message);
    });*/
    
	// internal
    
    function joinMap(message) {
        console.log(message.name + " entering trackroom: "+message.trackroom);
        console.log(message);
        var roomKey = message.trackroom;
        // send message for connection
        io.to(message.trackroom).emit('kMessage', {
            type: 'status',
            text: 'connected',
            date: Date.now(),
            name: message.name
        });
        if (!socketData.trackRooms[roomKey]) {// trackroom does not exist yet
            socketData.trackRooms[roomKey] = {}; // create one
        }
        var id_name = message.name;
        socketData.trackRooms[roomKey][socket.id] = {name: id_name, color: userColor};
        socketData.idRooms[socket.id] = roomKey;
        socketData.idNames[socket.id] = id_name; 
        //socketData.isInRoom[socket.id] = true;
        socket.join(roomKey);
        var new_message = {
            name: message.name,
            text: message.name + " joined",
            date: Date.now(),
            roominfo: socketData.trackRooms[roomKey]
        };
        socket.broadcast.to(roomKey).emit('kRoomStatusUpdate', new_message);
        socket.emit('kRoomStatusUpdate', new_message); // also to yourself
        console.log("** ROOMDATA **");
        console.log(socketData.trackRooms[roomKey]);
        //io.emit('karttaTrackRoomStatusUpdate', message);     
	   
    }

// leave the map
	function leaveMap(socket, io, socketData) {
        var roomKey = socketData.idRooms[socket.id];
        //socketData.isInRoom[socket.id] = false;
        //socketData.idRooms[socket.id] = socket.id; // start-room
    	var id_name = socketData.idNames[socket.id] || "unknown";
        socket.broadcast.to(roomKey).emit('karttaRoomStatusUpdate', {
            name: id_name,
            text: id_name + " left",
            date: Date.now(),
            roominfo: socketData.trackRooms[roomKey]
        });          
    	if (roomKey && socketData.trackRooms[roomKey] && socketData.trackRooms[roomKey][socket.id]) {
        	delete socketData.trackRooms[roomKey][socket.id];
        }
        if (socketData.idRooms[socket.id]) {
    		delete socketData.idRooms[socket.id];
        }
        //console.log("Leaving trackroom id:"+socket.id);
        //console.log(socketData.trackRooms);
    }    
    
};

/*
function joinMap(socket, io, message, socketData) {
    console.log("Entering trackroom");
    console.log(message);
    var roomKey = message.trackroom;

    if (!socketData.trackRooms[roomKey]) {// trackroom does not exist yet
        socketData.trackRooms[roomKey] = {};
    }
    var id_name = message.name;
    socketData.trackRooms[roomKey][socket.id] = {name: id_name};
    socketData.idRooms[socket.id] = roomKey;
    socketData.idNames[socket.id] = id_name; 
    socketData.isInRoom[socket.id] = true;
    socket.join(roomKey);
    var new_message = {
        name: message.name,
        text: message.name + " joined",
        created: Date.now(),
        roominfo: socketData.trackRooms[roomKey]
    };
    socket.broadcast.to(roomKey).emit('karttaRoomStatusUpdate', new_message);
    socket.emit('karttaRoomStatusUpdate', new_message); // also to yourself
    console.log("** ROOMDATA **");
    console.log(socketData.trackRooms[roomKey]);
    //io.emit('karttaTrackRoomStatusUpdate', message);     
	   
}
*/



    
    
    
    
    
    
