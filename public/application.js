'use strict';

// Declare app level module which depends on views, and components
// karttaApp is the application
var mainApplicationModuleName = 'karttaApp';
angular.module(mainApplicationModuleName, ['ngResource','ngRoute','karttaMain']).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.
  otherwise({redirectTo: '/'});
}]);

// Manually bootstrap the AngularJS application
angular.element(document).ready(function() {
angular.bootstrap(document, [mainApplicationModuleName]);
});