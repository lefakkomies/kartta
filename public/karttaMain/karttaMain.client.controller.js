// Invoke 'strict' JavaScript mode
'use strict';


// Create  'karttaMain' controller
angular.module('karttaMain').controller('karttaMainController', ['$scope', 'SocketIO','uiGmapGoogleMapApi',
    function($scope, SocketIO,uiGmapGoogleMapApi) {
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
        // for sending test command
        $scope.testMessage = function() {
                SocketIO.emit('karttaMessage', {text: "This is a test message"});
        }

        // Remove the event listener when the controller instance is destroyed
        $scope.$on('$destroy', function() {
            SocketIO.removeListener('karttaMessage');
        });

        // uiGmapGoogleMapApi is a promise.
    	// The "then" callback function provides the google.maps object.
        uiGmapGoogleMapApi.then(function(maps) {
            $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
        	console.log('map: ', maps);
			console.log("loaded googlemaps api");
        });
        // for test changing map position
        $scope.testMap = function() {
                $scope.map = { center: { latitude: 55, longitude: -73 }, zoom: 6 };
        }

    }
]); 