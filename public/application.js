'use strict';

// Declare app level module which depends on views, and components
// karttaApp is the application
var mainApplicationModuleName = 'karttaApp';
angular.module(mainApplicationModuleName, ['ngResource','ngRoute','uiGmapgoogle-maps','karttaMain']).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.
  otherwise({redirectTo: '/'});
}]).
config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
});

// Manually bootstrap the AngularJS application
angular.element(document).ready(function() {
angular.bootstrap(document, [mainApplicationModuleName]);
});