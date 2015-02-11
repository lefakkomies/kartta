// Invoke 'strict' JavaScript mode
'use strict';

// Create the chat configuration
module.exports = function(io, socket) {
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

    // Emit the status event when a socket client is disconnected
    socket.on('disconnect', function() {
        io.emit('xmosMessage', {
            type: 'status',
            text: 'disconnected',
            created: Date.now(),
            username: 'dummy'
        });
    });
};