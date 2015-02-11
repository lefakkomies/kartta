// Invoke 'strict' JavaScript mode

'use strict';

// Service for Socket.io 
angular.module('karttaMain').service('UserState', ['SocketIO', 
        function(socketio) {
        this.name = "John Doe";
        this.trackroom = "my_secret_map"
        console.log("Service loaded. Name = "+this.name);
		// 'on'
        this.dummyFunc = function(data, callback) {
           callback();
        };
        this.give_name = function() { return name; }
    }
]);	