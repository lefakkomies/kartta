// Invoke 'strict' JavaScript mode
'use strict';


// Create  'karttaMain' controller
angular.module('karttaMain').controller('karttaMainController', ['$scope', '$location','SocketIO','uiGmapGoogleMapApi','UserState',
    function($scope, $location, SocketIO,uiGmapGoogleMapApi,UserState) {
        
        var mainCtrl = this; // reference of everything instead of $scope
        
        mainCtrl.userstate = UserState; // service to hold name, room, ...
        mainCtrl.messages = []; // messages present to user
        mainCtrl.userinfo = {}; // info of users in the curret trackroom
        mainCtrl.watchID = 0; // brower geolocation watch if
        
        mainCtrl.showPosText = "SHOW POSITION";
        
        var hash2IntId = {};
        var counter = 1;
        var positionMessageCounter = 0; // for looking how many pos messages sent
        var _maps; // handle to google maps
        
        mainCtrl.userMarkers = []; // holds info of markers
        var _userMarkers = []; // for populating
        
        /*  Socket messages
         *  =================
         *  'kEnterTrackRoom'   ->  : tell server entering the room
         *  'kLeaveTrackRoom'   ->  : tell server leaving the room
         *  'kMessage'          ->  : general text message to server
         *                          : types: 'textMessage', 
         *  'kPosUpdate'        ->  : message to update position
         *  'kRoomStatusUpdate' <-  : something changed in the room and info updated
         * 
         */
        
        // Post actual enter into TrackRoom
        SocketIO.emit('kEnterTrackRoom', {name: UserState.name, trackroom: UserState.trackroom});
        
        // General listener to 'karttaMessage' event        
        SocketIO.on('kMessage', function(message) {
            console.log(message);
            //$scope.messages.push(message);
            mainCtrl.messages.splice(0, 0, message);
            if (mainCtrl.messages.length > 20) mainCtrl.messages.splice(-1, 1);
            /*
            // does the message include position information
            if (message.markerinfo) {
                updateMarker(message.markerinfo);
			}*/      
            //console.log(mainCtrl.messages);
        });
        
        // Server notifies changes in trackroom users
        SocketIO.on('kRoomStatusUpdate', function(message) {
            //console.log(message);
            mainCtrl.userinfo = message.roominfo;
            if (mainCtrl.userinfo[SocketIO.socket.id]) {
            	mainCtrl.userstate.color = mainCtrl.userinfo[SocketIO.socket.id].color;
                }
            console.log("Trackroom user info");
            console.log(mainCtrl.userinfo);
            mainCtrl.messages.splice(0, 0, message);
            if (mainCtrl.messages.length > 20) mainCtrl.messages.splice(-1, 1);
        });
        
        // respond to position update
        SocketIO.on('kPosUpdate', function(message) {
            console.log("Position update of :" + message.name);
            console.log(message);
            updateMarker(message);
        });
        
        /*
         *   Callbacks from buttons etc.
         */
        
        // user button pressed (test)
        mainCtrl.userButtonPressed = function(id) {
            console.log("User button pressed with id:" + id + "and username " + mainCtrl.userinfo[id].name);
        };
        
        // returns to start page
        mainCtrl.returnToStart = function () {
        console.log("leaving page...");
        navigator.geolocation.clearWatch(mainCtrl.watchID); // stop watching pos
        SocketIO.emit('kLeaveTrackRoom', {name: UserState.name, trackroom: UserState.trackroom});
        //removeMarker(SocketIO.socket.id);
		$location.path("/");
 		};
        
        // Send text message to server
        mainCtrl.sendMessage = function() {
        	// Create a new message object
            var message = {
                text: mainCtrl.messageText,
                type: 'textMessage',
                name: UserState.name,
                trackroom: UserState.trackroom,
                id : SocketIO.socket.id 
                //messageLongitude: mainCtrl.messageLongitude,
                //messageLatitude: mainCtrl.messageLatitude
            };
            //console.log(message);
            // Emit a 'karttaMessage' message event
            SocketIO.emit('kMessage', message);
            
            // Clear the message text
            this.messageText = '';
        };
        
        // Toggle tracking on or off
        mainCtrl.toggleTracking = function() {
            if (mainCtrl.watchID === 0) {         
            if (navigator.geolocation) {
        		mainCtrl.watchID = navigator.geolocation.watchPosition(function(position){
                    var lat = position.coords.latitude+Math.random()*0.01;
                    var lon = position.coords.longitude+Math.random()*0.01;
                    /*
                    var info = {
                    	latitude: lat, // add random to make visible in debug
                    	longitude: lon,
                    	text: "Update position",
                    	id: SocketIO.socket.id, 
                        number: positionMessageCounter,
                       };*/
                    positionMessageCounter++;
                    // Send position information
                    SocketIO.emit('kPosUpdate', {
                    	latitude : lat,
                    	longitude : lon,
                        trackroom: UserState.trackroom,
                    	name : UserState.name,
                        id : SocketIO.socket.id });
                });
                console.log("Start tracking ID: " + mainCtrl.watchID);
                mainCtrl.showPosText = "HIDE POSITION"; // button text
    			}
            } else {
            navigator.geolocation.clearWatch(mainCtrl.watchID); // stop watching
            mainCtrl.watchID = 0; 
            console.log("Stop tracking");
            mainCtrl.showPosText = "SHOW POSITION"; // button text
        }
        };

        // Remove the event listener when the controller instance is destroyed
        $scope.$on('$destroy', function() {           
		SocketIO.removeListener('kMessage');   
        SocketIO.removeListener('kRoomStatusUpdate');
        });
        

        // uiGmapGoogleMapApi is a promise.
    	// The "then" callback function provides the google.maps object.
        uiGmapGoogleMapApi.then(function(maps) {
            mainCtrl.map = { center: { latitude: 60.26, longitude: 24.84 }, zoom: 12 };
            //$scope.options = {scrollwheel: false};
            //$scope.options = customMapStyleOptions;
            mainCtrl.options = {
                		scrollwheel: false,
   						styles: customMapStyleOptions
            };
            //console.log($scope.options);
			mainCtrl.karttaMarkers = [];
            _maps = maps; // save reference
        });
        
        // for test changing map position
        mainCtrl.testMap = function() {
                //$scope.map = { center: { latitude: 55, longitude: -73 }, zoom: 6 };
            	mainCtrl.map = { center: { latitude: 60, longitude: 24 }, zoom: 11 };
              };
                                                                 
    // Removes marker
        /*
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
        	mainCtrl.userMarkers = _userMarkers;
            }
            */
        
    // update or create marker for some user that's position is updated
    function updateMarker(markerinfo) {
                // find if hash has marker and update
        		if (hash2IntId[markerinfo.id]) { // marker for given hash exist
                   var markerColor = mainCtrl.userinfo[markerinfo.id].color;
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
                        //console.log(element);
                        return true; // found
                    }
                    return false; // not found this iteration
                })) { // found
                	_userMarkers[foundIndex] = markerinfo;
                    _userMarkers[foundIndex].idKey = markerIntID;
                    _userMarkers[foundIndex].icon = {
      						path: _maps.SymbolPath.CIRCLE,
      						scale: 10,
                        	strokeWeight:2,
                        	fillColor: markerColor,
                    		strokeColor: markerColor,
                    		fillOpacity:0.4}
                   }
                } else { // given id does not have marker            
                       hash2IntId[markerinfo.id] = counter; // save integer counter
                       markerinfo.idKey = counter;
                       markerinfo.icon = {
      						path: _maps.SymbolPath.CIRCLE,
      						scale: 10,
                        	strokeWeight:2,
                        	fillColor: markerColor,
                    		strokeColor: markerColor,
                    		fillOpacity:0.4};
                       counter++;
                       _userMarkers.push(markerinfo);
                               }
        mainCtrl.userMarkers = _userMarkers; // make the update
        mainCtrl.userMarkers = _userMarkers; // make the update
                                 	}                                                          
    }]); 


// Controller for enter view
//
angular.module('karttaMain').controller('karttaEnterRoomController', ['$scope', '$location','SocketIO','UserState',
    function($scope, $location, SocketIO, UserState) {
        // take reference
        var enterRoom = this;
        // Store messages
        this.userstate = UserState;
        this.messages = [];

        // Check from server that is ok to go to trackroom and if ok -> go "/kartta"
        this.goTrackRoom = function () {
            SocketIO.emit('kEnterTrackRoomOK', {name: UserState.name, trackroom: UserState.trackroom });
            SocketIO.on('kEnterTrackRoomOK', function(message) {
                if (message.okToEnter || message.okToEnter === true) {
                    console.log(UserState.name + " goes to trackRoom " + UserState.trackroom);
                    SocketIO.removeListener('kEnterTrackRoomOK'); 
                    $location.path("/kartta");
                } else { // not ok, stay in "lobby"
                    console.log("Not ok to go to room. Message from server:"+message.text);
                }

            });
  
        }
    }]);

// save test style
var customMapStyleOptions = [
  {
    "stylers": [
      { "visibility": "on" }
    ]
  },{
    "featureType": "landscape",
    "stylers": [
      { "hue": "#00ffcc" }
    ]
  },{
    "featureType": "road",
    "stylers": [
      { "hue": "#ff0000" },
      { "gamma": 0.16 },
      { "lightness": 23 }
    ]
  },{
    "featureType": "road.local",
    "stylers": [
      { "hue": "#ff0000" },
      { "gamma": 1.79 }
    ]
  },{
    "featureType": "poi.business",
    "stylers": [
      { "lightness": 73 },
      { "visibility": "off" }
    ]
  },{
    "elementType": "labels.text",
    "stylers": [
      { "weight": 0.1 },
      { "visibility": "simplified" }
    ]
  }
];