// Invoke 'strict' JavaScript mode
'use strict';


// Create  'karttaMain' controller
angular.module('karttaMain').controller('karttaMainController', ['$scope', '$location','SocketIO','uiGmapGoogleMapApi','UserState',
    function($scope, $location, SocketIO,uiGmapGoogleMapApi,UserState) {
        // Store messages
        $scope.userstate = UserState;
        $scope.messages = [];
        $scope.userinfo = {};
        var counter = 0;
        // Add an event listener to the 'karttaMessage' event
        // /#/
        
        SocketIO.on('karttaMessage', function(message) {
            console.log(message);
            //$scope.messages.push(message);
            $scope.messages.splice(0, 0, message);
            if (message.messageLatitude || message.messageLongitude) {
                var info = {
                    latitude: message.messageLatitude,
                    longitude: message.messageLongitude,
                    title: "Hello there",
                    id: counter 
                       }
                if (counter==0) {
                $scope.karttaMarkers.push(info);
                    counter += 0.1;
                } else {
                $scope.karttaMarkers[0] =  info;   
                }
            }
        });
        
        SocketIO.on('karttaRoomStatusUpdate', function(message) {
            console.log(message);
            $scope.userinfo = message.roominfo;
            console.log("DATAA");
            console.log($scope.userinfo);
            console.log($scope.userinfo);
            //$scope.messages.push(message);
            $scope.messages.splice(0, 0, message);
        });
        
        // user button pressed
        $scope.userButtonPressed = function(id) {
            console.log("User button pressed with id:"+id+"and username "+$scope.userinfo[id].name);
        }
        
        // returns to start page
        $scope.returnToStart = function () {
        console.log("leaving page...");
        SocketIO.emit('karttaLeaveTrackRoom', {name: UserState.name, trackroom: UserState.trackroom});
		$location.path("/");
 		}
        
        // go to TrackRoom
        $scope.goTrackRoom = function () {
        console.log(UserState.name+" goes to trackRoom "+UserState.trackroom);
        SocketIO.emit('karttaEnterTrackRoom', {name: UserState.name, trackroom: UserState.trackroom});
		$location.path("/kartta");
 		}
        
        
        // Create a controller method for sending messages
        $scope.sendMessage = function() {
        	// Create a new message object
            var message = {
                text: $scope.messageText,
                messageLongitude: $scope.messageLongitude,
                messageLatitude: $scope.messageLatitude
            };
            console.log(message);
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
            SocketIO.emit('karttaDestroy', {name: UserState.name, trackroom: UserState.trackroom});
            SocketIO.removeListener('karttaMessage');
        });

        // uiGmapGoogleMapApi is a promise.
    	// The "then" callback function provides the google.maps object.
        uiGmapGoogleMapApi.then(function(maps) {
            $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
			$scope.karttaMarkers = [];
        	console.log('map: ', maps);
			console.log("loaded googlemaps api");
            $scope.marker = {
              id: "101",
              coords: {
                    latitude: 45.0,
                    longitude: -73.0
                  },
              options: { draggable: false },
              events: {
                    dragend: function (marker, eventName, args) {
                        $log.log('marker dragend');
                        var lat = marker.getPosition().lat();
                        var lon = marker.getPosition().lng();
                        $log.log(lat);
                        $log.log(lon);
            			}
      				}
    	};
        });
        
        // for test changing map position
        $scope.testMap = function() {
                //$scope.map = { center: { latitude: 55, longitude: -73 }, zoom: 6 };
            	$scope.map = { center: { latitude: 55, longitude: -73 }, zoom: 8 };
              };
        	
		
   
    }
]); 

// Controller for enter view
//
angular.module('karttaMain').controller('karttaEnterRoomController', ['$scope', '$location','SocketIO','UserState',
    function($scope, $location, SocketIO, UserState) {
        // Store messages
        $scope.userstate = UserState;
        $scope.messages = [];

        // go to TrackRoom
        $scope.goTrackRoom = function () {
        console.log(UserState.name+" goes to trackRoom "+UserState.trackroom);
        SocketIO.emit('karttaEnterTrackRoom', {name: UserState.name, trackroom: UserState.trackroom});
		$location.path("/kartta");
 		}
        
        
        
        
    }]);