// Invoke 'strict' JavaScript mode

'use strict';

// Service for Socket.io 
angular.module('karttaMain').service('SocketIO', ['$location', '$timeout',
        function($location, $timeout) {
        this.socket = io();
		// 'on'
        this.on = function(eventName, callback) {
            if (this.socket) {
                this.socket.on(eventName, function(data) {
                    $timeout(function() {
                        callback(data);
                    });
                });
            }
        };
		// 'emit'
        this.emit = function(eventName, data) {
            if (this.socket) {
                this.socket.emit(eventName, data);
            }
        };
                                            
		// removeListener
        this.removeListener = function(eventName) {
            if (this.socket) {
                this.socket.removeListener(eventName);
            }
        };
    }
]);