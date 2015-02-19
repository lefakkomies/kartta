// Invoke 'strict' JavaScript mode

'use strict';

// Service for state of user and the current trackroom
angular.module('karttaMain').service('UserState', ['SocketIO', 
        function(socketio) {
        this.name = "Matti Meikäläinen";  // initial name 
        this.trackroom = "my_secret_map"; // initial trackroom
        this.color = "#FFFFFF"; // dummy first color
        //console.log("Service loaded. Name = "+this.name);

            
            
        this.dummyFunc = function(data, callback) {
           callback();
        };
        this.give_name = function() { return name; }
        
        
        
        
        
    }
]);	