// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var applicatie = angular.module('starter', ['ionic', 'ngCordova']);

applicatie.config(function($stateProvider, $urlRouterProvider){
    $stateProvider

    .state('home',{
      url:'/home',
      templateUrl:'templates/home.html'
    })
    .state('scanner',{
      url:'/scanner',
      templateUrl:'templates/scanner.html',
      controller:'BarcodeCtrl'
    })
     .state('hulp',{
      url:'/hulp',
      templateUrl:'templates/hulp.html'
    })
     .state('levering',{
      url:'/levering',
      templateUrl:'templates/levering.html',
      controller:'LeveringCtrl'
    })
     .state('leveringen',{
      url:'/leveringen',
      templateUrl:'templates/leveringen.html',
      controller:'LeveringenCtrl'
    });

    $urlRouterProvider.otherwise('/home');
});

applicatie.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

applicatie.controller("HomeCtrl", function(){

});


//  Controller voor de BARCODE pagina
applicatie.controller("BarcodeCtrl", function($scope, $cordovaBarcodeScanner){

    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            alert(imageData.text);
            console.log("Barcode Format -> " + imageData.format);
            console.log("Cancelled -> " + imageData.cancelled);
        }, function(error) {
            console.log("An error happened -> " + error);
        });
    };
    
});


//  Controller voor de LEVERINGEN pagina
applicatie.controller("LeveringenCtrl", function($scope){

    $scope.items = [
      {
      "itemid" : "13",
      "name" : "Soufiane Salama",
      "address" : "Trekschurenstraat 324"
      },
      {
      "itemid" : "22",
      "name" : "Elias Jans",
      "address" : "Luikersteenweg 24 bus2.2"
      }
      ,
      {
      "itemid" : "28",
      "name" : "Michel Banken",
      "address" : "Luikersteenweg 24 bus2.2"
      }
      ,
      {
      "itemid" : "33",
      "name" : "Tom Herten",
      "address" : "Luikersteenweg 24 bus2.2"
      }
    ];
    
});

//  Controller voor de LEVERING pagina
applicatie.controller("LeveringCtrl", function($scope){

    $scope.items = [
      {"title" : '12" BBQ Chicken'},
      {"title" : '10" Cannibale'},
      {"title" : "2* Cheesy bread"},
      {"title" : "Chickenito's + BBQ saus"},
      {"title" : "Pasta Rossa"},
      {"title" : "Box Chicken + Chili saus"},
      {"title" : "1.5L Fanta"},



    ];
    
});