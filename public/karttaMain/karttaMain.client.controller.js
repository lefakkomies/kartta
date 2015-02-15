// Invoke 'strict' JavaScript mode
'use strict';


// Create  'karttaMain' controller
angular.module('karttaMain').controller('karttaMainController', ['$scope', '$location','SocketIO','uiGmapGoogleMapApi','UserState',
    function($scope, $location, SocketIO,uiGmapGoogleMapApi,UserState) {
        // Store messages
        $scope.userstate = UserState;
        $scope.messages = [];
        $scope.userinfo = {}; // info on users in the curret trackroom
        $scope.watchID = 0;
        var hash2IntId = {};
        var counter = 1;
        var positionMessageCounter = 0; // for looking how many messages sent
        
        $scope.userMarkers = []; // holds info of markers
        var _userMarkers = []; // for populating
        
        // General listener to 'karttaMessage' event        
        SocketIO.on('karttaMessage', function(message) {
            //console.log(message);
            //$scope.messages.push(message);
            $scope.messages.splice(0, 0, message);
            if ($scope.messages.length > 20) $scope.messages.splice(-1, 1);
            // does the message include position information
            if (message.markerinfo) {
                updateMarker(message.markerinfo);
			}        
        });
        
        SocketIO.on('karttaRoomStatusUpdate', function(message) {
            console.log(message);
            $scope.userinfo = message.roominfo;
            console.log("DATAA");
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
		// TODO remove marker
        navigator.geolocation.clearWatch($scope.watchID); // stop watching pos
        SocketIO.emit('karttaLeaveTrackRoom', {name: UserState.name, trackroom: UserState.trackroom});
		$location.path("/");
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
        $scope.toggleTracking = function() {
            if ($scope.watchID === 0) {         
            if (navigator.geolocation) {
        		$scope.watchID = navigator.geolocation.watchPosition(function(position){
                    var lat = position.coords.latitude+Math.random()*0.01;
                    var lon = position.coords.longitude+Math.random()*0.01;
                    var info = {
                    	latitude: lat, // add random to make visible in debug
                    	longitude: lon,
                    	text: "Update position",
                    	id: SocketIO.socket.id, 
                        number: positionMessageCounter
                       };
                    positionMessageCounter++;
                    /*
                    if (counter==0) {
                		$scope.karttaMarkers.push(info);
                    	counter += 0.1;
                	} else {
                		$scope.karttaMarkers[0] = info;   
                	} 
                    */
                    // Send position information
                    SocketIO.emit('karttaMessage', {
                    	messageLongitude:lat,
                    	messageLatitude:lon,
                    	text: "Update pos of name:"+UserState.name,
                    	markerinfo: info});
                });
                console.log("Start tracking ID:"+$scope.watchID);
    			}
            } else {
            navigator.geolocation.clearWatch($scope.watchID); // stop watching
            $scope.watchID = 0; 
            console.log("Stop tracking");
        }
        }

        // Remove the event listener when the controller instance is destroyed
        $scope.$on('$destroy', function() {           
		SocketIO.removeListener('karttaMessage');   
        SocketIO.removeListener('karttaRoomStatusUpdate');
        });
        

        // uiGmapGoogleMapApi is a promise.
    	// The "then" callback function provides the google.maps object.
        uiGmapGoogleMapApi.then(function(maps) {
            $scope.map = { center: { latitude: 60.26, longitude: 24.84 }, zoom: 12 };
            $scope.options = {scrollwheel: false};
			$scope.karttaMarkers = [];
        	//console.log('map: ', maps);
			//console.log("loaded googlemaps api");
            /*
            $scope.marker = {
              id: "101",
              coords: {
                    latitude: 60.2,
                    longitude: 24.8
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
    	};*/
        });
        
        // for test changing map position
        $scope.testMap = function() {
                //$scope.map = { center: { latitude: 55, longitude: -73 }, zoom: 6 };
            	$scope.map = { center: { latitude: 60, longitude: 24 }, zoom: 11 };
              };
                                                                 
    // Removes marker                                                            
    function removeMarker(id) {
        	var markerIntID = hash2intId[id];
            var foundIndex = -1;
            _userMarkers.some(function(element, index, array) {
                if (element.idKey === markerIntID) { // does exist
                    element = message.markerinfo;
                    console.log("Will remove marker id:"+id+" at index "+index);
                    foundIndex = index;
                    return true; // found
                }
                return false; // not found this iteration
            });
            if (foundIndex > -1) {
                 _userMarkers.splice(foundIndex, 1); // remove
            	}
        	$scope.userMarkers = _userMarkers;
            }
        
    // update or create marker
    function updateMarker(markerinfo) {
                // find if hash has marker and update
        		if (hash2IntId[markerinfo.id]) { // marker for given hash exist
                   var markerIntID = hash2IntId[markerinfo.id];
                   console.log("Usermarkers");
                   console.log(_userMarkers);
                    var foundIndex = -1;
                   if (_userMarkers.some(function(element, index, array) {
                    if (element.idKey === markerIntID) { // does exist
                        foundIndex = index;
                        element = markerinfo;
                        element.idKey = markerIntID;
                        console.log("found marker in update. ID: "+element.idKey);
                        console.log(element);
                        return true; // found
                    }
                    return false; // not found this iteration
                })) { // found
                	_userMarkers[foundIndex] = markerinfo;
                    _userMarkers[foundIndex].idKey = markerIntID;
                   }
                } else { // given id does not have marker            
                       hash2IntId[markerinfo.id] = counter; // save integer counter
                       markerinfo.idKey = counter;
                       counter++;
                       _userMarkers.push(markerinfo);
                               }
        $scope.userMarkers = _userMarkers; // make the update
                                 	}
                                                                 
    }]); 


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
        //$scope.userstate.id = SocketIO.socket.id; // take directly
		$location.path("/kartta");
 		}
        
        
        
        
    }]);