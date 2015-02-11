// Invoke 'strict' JavaScript mode
'use strict';
// Configure the 'karttaMain' module routes
angular.module('karttaMain').config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/kartta', {
        	templateUrl: 'karttaMain/karttaMain.client.view.html'
        }).
        when('/', {templateUrl: 'main.client.view.html'});
    }
]); 