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
        message.type = 'message';
        message.created = Date.now();
        message.username = 'dummy';
        message.kartta_response_text = "received: "+message.text;
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