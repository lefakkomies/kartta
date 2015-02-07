// Invoke 'strict' JavaScript mode
'use strict';

// Create  'karttaMain' controller
angular.module('karttaMain').controller('karttaMainController', ['$scope', 'SocketIO',
    function($scope, SocketIO) {
        // Store messages
        $scope.messages = [];
        
        // Add an event listener to the 'karttaMessage' event
        SocketIO.on('karttaMessage', function(message) {
            //$scope.messages.push(message);
            $scope.messages.splice(0, 0, message);
        });
        
        // Create a controller method for sending messages
        $scope.sendMessage = function() {
        	// Create a new message object
            var message = {
                text: this.messageText,
            };
            
            // Emit a 'karttaMessage' message event
            SocketIO.emit('karttaMessage', message);
            
            // Clear the message text
            this.messageText = '';
        }
        // test for sending LED toggle command
        $scope.testMessage = function() {
                SocketIO.emit('karttaMessage', "This is a test message");
        }

        // Remove the event listener when the controller instance is destroyed
        $scope.$on('$destroy', function() {
            SocketIO.removeListener('karttaMessage');
        })

    }
]); 