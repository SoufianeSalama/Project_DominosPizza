// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var applicatie = angular.module('starter', ['ionic', 'ngCordova']);
var db = null;

applicatie.config(function($stateProvider, $urlRouterProvider){
    $stateProvider

    .state('home',{
      url:'/home',
      templateUrl:'templates/home.html',
      controller: "HomeCtrl"
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
      url:'/levering/:orderID', //
      templateUrl:'templates/levering.html',
      controller:'LeveringCtrl'
    })
     .state('leveringen',{
      url:'/leveringen',
      templateUrl:'templates/leveringen.html',
      controller:'LeveringenCtrl'
    })
     .state('map',{
      url:'/map/:adres',
      templateUrl:'templates/map.html',
      controller:'MapCtrl'
    });

    $urlRouterProvider.otherwise('/home');
});

applicatie.run(function($ionicPlatform, $ionicPopup, $cordovaSQLite) {
  

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


    if(window.Connection) {
        console.log("app.run controle");
        db = $cordovaSQLite.openDB({ name: "project.db", location: 'default' });
            $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS leveringen ( orderid integer primary key ,ordernr text, bedrag text, naam text, adres text, telefoon text, nota text, betaling text, timestamp text, bestelling text)");
        
        
        

            if(navigator.connection.type == Connection.NONE) {
              var confirmPopup = $ionicPopup.confirm({
                  title: 'Fout!', // String. The title of the popup.
                  cssClass: '', // String, The custom CSS class name
                  subTitle: 'Voor deze applicatie moeten Internet en Locatie aan staan!', // String (optional). The sub-title of the popup.
                  template: '', // String (optional). The html template to place in the popup body.
                  templateUrl: '', // String (optional). The URL of an html template to place in the popup   body.
                  cancelText: 'Afsluiten', // String (default: 'Cancel'). The text of the Cancel button.
                  cancelType: 'button-assertive', // String (default: 'button-default'). The type of the Cancel button.
                  okText: 'Instellingen', // String (default: 'OK'). The text of the OK button.
                  okType: 'button-positive', // String (default: 'button-positive'). The type of the OK button.
              });

             confirmPopup.then(function(res) {
                 if(res) {
                   //console.log('You are sure');
                    cordova.plugins.settings.openSetting("settings", function() {
                            console.log('opened settings');
                            ionic.Platform.exitApp();
                        },
                        function () {
                            console.log('failed to open settings');
                            ionic.Platform.exitApp();
                        });
                 } else {
                   //console.log('You are not sure');
                   ionic.Platform.exitApp();
                 }
             });
          }
    }
    
  });
})

applicatie.controller("HomeCtrl", function($scope, $cordovaSQLite, DatabaseService){

    $scope.drop = function() {
        //DatabaseService.dropTabel();
        DatabaseService.dropTabel();


    }

    $scope.show = function() {
        //DatabaseService.dropTabel();
        DatabaseService.selectAll();


    }
});


applicatie.factory('LeveringService', function($http, $q){
  
  return{
        
        // getKlant: function(){
        //   var Klantinfo = {};
          
        //   $http.get("js/data2.json")
        //     .success(function(data) {
        //       var klant = data['klant'];
        //       Klantinfo = klant;
              
        //     })
        //     .error(function(data) {
        //         console.log("ERROR");
        //     });

        //   return Klantinfo;
            
        // },

        // getBestelling: function(){

        //     var Bestellinginfo = [];

        //     $http.get("js/data2.json")
        //     .success(function(data) {
        //       var order = data['order'];

        //       var arrayLength = order.length;
        //       for (var i = 0; i < arrayLength; i++) {
        //           Bestellinginfo.push(order[i]);
                  
        //       }
             
        //     })
        //     .error(function(data) {
        //         console.log("ERROR");
        //     });
          
        //    return Bestellinginfo;
        // },

        getBestellingAsync : function() {
          var Bestellinginfo = {};
            var deferred = $q.defer();
            $http.get('js/data2.json')
            .then(function(response){
              var bestelling = response["data"];
              
              console.log(bestelling);
              deferred.resolve(bestelling);
            })
            .catch(function(response){
              deferred.reject(response);
            });

            return deferred.promise;
        }
    }
});


//  Controller voor de BARCODE pagina
applicatie.controller("BarcodeCtrl", function($scope, $cordovaBarcodeScanner,$ionicPopup, $ionicLoading, LeveringService, DatabaseService){

    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
           
            if (!imageData.cancelled && imageData.format=="QR_CODE" ){
                
                LeveringService.getBestellingAsync().then(function(Levering){
                 
                  Melding(Levering);
                  console.log(Levering);
                 })
                 .catch(function(response){
                    console.log(response.status);
                 }); 
                
            }
          }, function(error) {
            console.log("An error happened -> " + error);
        });
    };

    function Melding(levering){
      console.log( levering );
      var confirmPopup = $ionicPopup.confirm({
                  title: 'Order nr ' + levering["klant"]["ordernr"], // String. The title of the popup.
                  cssClass: '', // String, The custom CSS class name
                  subTitle: 'Bent u zeker dat u deze levering wilt toevoegen?', // String (optional). The sub-title of the popup.
                  template: '', // String (optional). The html template to place in the popup body.
                  templateUrl: '', // String (optional). The URL of an html template to place in the popup   body.
                  cancelText: 'Annuleer', // String (default: 'Cancel'). The text of the Cancel button.
                  cancelType: 'button-assertive', // String (default: 'button-default'). The type of the Cancel button.
                  okText: 'Toevoegen', // String (default: 'OK'). The text of the OK button.
                  okType: 'button-positive', // String (default: 'button-positive'). The type of the OK button.
              });

             confirmPopup.then(function(res) {
                 if(res) {
                   DatabaseService.insertDB(levering);
                 
                 }
            });

      };
    
});

applicatie.factory('DatabaseService', function($cordovaSQLite, $q){
    return{
            insertDB: function(levering){
                var klant = {};
                var bestelling = [];
                
                klant = levering["klant"];
                bestelling = angular.toJson(levering["order"]);
                
                var query = "INSERT INTO leveringen (orderid, ordernr, bedrag, naam, adres, telefoon, nota, betaling, timestamp, bestelling) VALUES (?,?,?,?,?,?,?,?,?,?)";
                $cordovaSQLite.execute(db, query, [levering["orderid"], klant["ordernr"], klant["bedrag"],klant["naam"],klant["adres"],klant["telefoon"],klant["nota"],klant["betaling"], klant["timestamp"], bestelling ]).then(function(res) {
                  console.log("insertId: " + res.insertId);   // +" "+ String(res.data)
                }, function (err) {
                  console.log(err);
                })
            },
            dropTabel: function(){
               var query = "DROP TABLE leveringen";
                $cordovaSQLite.execute(db, query).then(function(res) {
                  console.log(res);   // +" "+ String(res.data)
                 $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS leveringen ( orderid integer primary key ,ordernr text, bedrag text, naam text, adres text, telefoon text, nota text, betaling text, timestamp text, bestelling text)");
                  

                }, function (err) {
                  console.log(err);
                })

            },
            selectAll: function(){
              var leveringen = [];
              var levering = {};
              var query = "SELECT * FROM leveringen";
              $cordovaSQLite.execute(db, query).then(function(res) {

                  for ( i=0; i< res.rows.length; i++){
                    console.log("SELECTED -> " + res.rows.item(i).ordernr + " " + res.rows.item(i).naam + " " + res.rows.item(i).adres+ " " + res.rows.item(i).betaling+ " " + res.rows.item(i).nota + " " + res.rows.item(i).bestelling);

                    levering = {
                      "orderid" : res.rows.item(i).orderid,
                      "ordernr" : res.rows.item(i).ordernr,
                      "naam" : res.rows.item(i).naam,
                      "adres" : res.rows.item(i).adres
                    };
                    leveringen.push(levering);
                    console.log(levering);
                  }

                  console.log(leveringen);

              }, function (err) {
                  console.error(err);
              });

              return leveringen;
            },

            getKlantAsync: function(orderID){
              var deferred = $q.defer();
              var klant = {};
              var query = "SELECT  ordernr, bedrag, naam, adres, telefoon, nota, betaling, timestamp FROM leveringen WHERE orderid = ?";
              $cordovaSQLite.execute(db, query, [orderID]).then(function(res) {
                  if(res.rows.length > 0) {
                      console.log("SELECTED -> " + res.rows.item(0).ordernr + " " + res.rows.item(0).naam);

                      klant = {
                      //"orderid" : res.rows.item(0).orderid,
                      "ordernr" : res.rows.item(0).ordernr,
                      "naam" : res.rows.item(0).naam,
                      "bedrag" : res.rows.item(0).bedrag,
                      "adres" : res.rows.item(0).adres,
                      "telefoon" : res.rows.item(0).telefoon,
                      "betaling" : res.rows.item(0).betaling,
                      "nota" : res.rows.item(0).nota
                    };

                    deferred.resolve(klant);
                  } else {
                      console.log("No results found");
                  }
              }, function (err) {
                  console.error(err);
                  deferred.reject(err);
              }); 

              return deferred.promise;
              
            },

            getOrderAsync: function(orderID){
              var deferred = $q.defer();
              var order = [];
              var query = "SELECT  bestelling FROM leveringen WHERE orderid = ?";
              $cordovaSQLite.execute(db, query, [orderID]).then(function(res) {
                  if(res.rows.length > 0) {
                      console.log("SELECTED -> " + res.rows.item(0).bestelling);

                      order = angular.fromJson(res.rows.item(0).bestelling);

                    deferred.resolve(order);
                  } else {
                      console.log("No results found");
                  }
              }, function (err) {
                  console.error(err);
                  deferred.reject(err);
              }); 

              return deferred.promise;
              
            }
          }
});


//  Controller voor de LEVERINGEN pagina
applicatie.controller("LeveringenCtrl", function($scope, DatabaseService){
    $scope.items = DatabaseService.selectAll();
});

//  Controller voor de LEVERING pagina
applicatie.controller("LeveringCtrl", function($scope, LeveringService, $stateParams, DatabaseService ,$q){
    var orderID = $stateParams.orderID;  
    
    DatabaseService.getKlantAsync(orderID).then(function(res){
                 
      $scope.klant =res;
    })
    .catch(function(response){
        console.log(response.status);
     });  

    
    DatabaseService.getOrderAsync(orderID).then(function(res){
                 
      $scope.items = res;
    })
    .catch(function(response){
        console.log(response.status);
     });               
                  
});



applicatie.factory('LocatieService', function($q){
  
  return{
        
        getCoor: function(adres){
          var deferred = $q.defer();
          var coordinaten = "";
          var geocoder = new google.maps.Geocoder;
          geocoder.geocode( { 'address': adres}, function(results, status) {
            if (status == 'OK') {
              coordinaten = results[0].geometry.location;
              console.log(coordinaten);
              deferred.resolve(coordinaten);

            } else {
              //alert('Geocode was not successful for the following reason: ' + status);
              deferred.reject(status);
            }
          });

          return deferred.promise;
        }
          
    } 
});

//  Controller voor de Google Maps pagina
applicatie.controller("MapCtrl", function($scope, $cordovaGeolocation, $stateParams, LocatieService){
    var coordinaten = "";
    var bestemmingsAdres = $stateParams.adres;
   
    LocatieService.getCoor(bestemmingsAdres).then(function(res){
               
      coordinaten = res;

    })
    .catch(function(response){
        console.log(response.status);
     });               
  
  var options = {timeout: 10000, enableHighAccuracy: true};
 
  $cordovaGeolocation.getCurrentPosition(options).then(function(position){
 
    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var shopLatLng = new google.maps.LatLng(50.930997, 5.328689);   //stationsplein 11, HASSELT
    var exDestLatLng = coordinaten;   //Example destination
    
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
            destination: coordinaten,
            travelMode: google.maps.DirectionsTravelMode.DRIVING, //BICYCLING 
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
                alert("Kan geen route vinden");
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
        position:  coordinaten,
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
            console.log(position);
            var geocoder = new google.maps.Geocoder;
            var latlng = {lat: position.coords.latitude, lng: position.coords.longitude};
            geocoder.geocode({'location': latlng}, function(results, status) {
              if (status === 'OK') {
                if (results[1]) {
                    var alertPopup = $ionicPopup.alert({
                    title: 'U bent in de buurt van:',
                    template: results[1].formatted_address
                  });

                } else {
                  alert('Geen resultaten gevonden');
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


