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
      templateUrl:'templates/hulp.html',
      controller :'HulpCtrl'
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
    })
     .state('map',{
      url:'/map',
      templateUrl:'templates/map.html',
      controller:'MapCtrl'
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
      {"title" : "1.5L Fanta"}
    ];
    
});

//  Controller voor de Google Maps pagina
applicatie.controller("MapCtrl", function($scope, $cordovaGeolocation){
  var options = {timeout: 10000, enableHighAccuracy: true};
 
  $cordovaGeolocation.getCurrentPosition(options).then(function(position){
 
    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var shopLatLng = new google.maps.LatLng(50.930997, 5.328689);   //stationsplein 11, HASSELT
    var exDestLatLng = new google.maps.LatLng(50.932459, 5.350911);   //Example destination
    
    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
 
    var mapObject = new google.maps.Map(document.getElementById("map"), mapOptions);
    $scope.map = mapObject;


    var directionsService = new google.maps.DirectionsService();
          var directionsRequest = {
            origin: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
            destination: new google.maps.LatLng(50.932459, 5.350911),
            travelMode: google.maps.DirectionsTravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC
          };
          directionsService.route(
            directionsRequest,
            function(response, status)
            {
              if (status == google.maps.DirectionsStatus.OK)
              {
                new google.maps.DirectionsRenderer({
                  map: mapObject,
                  directions: response,
                  suppressMarkers:true
                });
              }
              else
                $("#error").append("Unable to retrieve your route<br />");
            }
          );


    var shopIconUrl = "img/logoSmall.png";
    var positionIconUrl="img/deliveryIcon.png";
    var destinationIconUrl="img/destinationIcon.png";

    var shopMarker = new google.maps.Marker({
        map: $scope.map,
        animation: google.maps.Animation.DROP,
        position: new google.maps.LatLng(50.930997, 5.328689),
        icon: shopIconUrl
    });   
    var marker = new google.maps.Marker({
        map: $scope.map,
        animation: google.maps.Animation.DROP,
        position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
        icon: positionIconUrl
    }); 
    var marker = new google.maps.Marker({
        map: $scope.map,
        animation: google.maps.Animation.DROP,
        position:  new google.maps.LatLng(50.932459, 5.350911),
        icon: destinationIconUrl
    }); 

  }, function(error){
    alert.log("Uw locatie niet gevonden!");
  });


}); 

//  Controller voor de LEVERING pagina
applicatie.controller("HulpCtrl", function($scope, $cordovaGeolocation, $ionicPopup, $cordovaFlashlight){

    $scope.getLocation = function(){

        var options = {timeout: 10000, enableHighAccuracy: true};
 
        $cordovaGeolocation.getCurrentPosition(options).then(function(position){
          
            var geocoder = new google.maps.Geocoder;
            var latlng = {lat: position.coords.latitude, lng: position.coords.longitude};
            geocoder.geocode({'location': latlng}, function(results, status) {
              if (status === 'OK') {
                if (results[1]) {
                  // map.setZoom(11);
                  // var marker = new google.maps.Marker({
                  //   position: latlng,
                  //   map: map
                  // });
                  // infowindow.setContent(results[1].formatted_address);
                  // infowindow.open(map, marker);
                  console.log(results[1].address_components[1]); 
                  console.log(results[1].address_components[2]);    //results[1].formatted_address => Hasselt, Belgie
                  console.log(results[1].address_components[3]); 
                  console.log(results[1].address_components[0]); 
                  console.log(results[1]); 

                  var alertPopup = $ionicPopup.alert({
                     title: 'U bent in de buurt van:',
                     template: results[1].formatted_address
                  });

                } else {
                  window.alert('No results found');
                }
              } else {
                window.alert('Geocoder failed due to: ' + status);
              }
            });

        }, function(error){
          alert.log("Uw locatie niet gevonden!");
        });
 
    };

    $scope.toggleFlashlight = function(){
      $cordovaFlashlight.toggle()
      .then(
          function (success) { /* success */ 
          },
          function (error) { /* error */ 
          }
        );
    };


    
});


