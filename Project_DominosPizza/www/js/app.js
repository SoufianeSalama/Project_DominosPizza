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
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS leveringen (orderNr text primary key, naam text, adres text, status text, nota text, telefoon text, bedrag text)");
        

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

    $scope.insert = function() {
        //DatabaseService.dropTabel();
        DatabaseService.selectAll();


    }
});


//  Controller voor de BARCODE pagina
applicatie.controller("BarcodeCtrl", function($scope, $cordovaBarcodeScanner,$ionicPopup, $q, LeveringService, DatabaseService){

    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            
            if (!imageData.cancelled && imageData.format=="QR_CODE" ){
                console.log(LeveringService.getKlant());
                var klant = LeveringService.getKlant();
                if (klant["ordernr"] != null){
                  Melding(klant);
                }
                else{
                  console.log(klant);
                }
                
            }

            
            
            
            
        }, function(error) {
            console.log("An error happened -> " + error);
        });
    };

    function Melding(Klant){
      console.log( Klant );
    var confirmPopup = $ionicPopup.confirm({
                  title: 'Order nr ', // String. The title of the popup.
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
                   DatabaseService.setDB(Klant);
                 
                 } else {
                 
                 }
            });

      };
    
});

applicatie.factory('DatabaseService', function($cordovaSQLite){
    return{
            setDB: function(Klant){
              
                var query = "INSERT INTO leveringen (orderNr, naam, adres, status, nota, telefoon, bedrag) VALUES (?,?,?,?,?,?,?)";
                $cordovaSQLite.execute(db, query, [ Klant["ordernr"], Klant["naam"],Klant["adres"],Klant["status"],Klant["nota"],Klant["telefoon"],Klant["bedrag"] ]).then(function(res) {
                  console.log("insertId: " + res.insertId);   // +" "+ String(res.data)
                }, function (err) {
                  console.log(err);
                })
            },
            dropTabel: function(){
               var query = "DROP TABLE leveringen";
                $cordovaSQLite.execute(db, query).then(function(res) {
                  console.log(res);   // +" "+ String(res.data)
                  $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS leveringen (orderNr text primary key, naam text, adres text, status text, nota text, telefoon text, bedrag text)");

                }, function (err) {
                  console.log(err);
                })

            },
            selectAll: function(){
              var leveringen = [];
              var levering = {};
              var query = "SELECT * FROM leveringen";
              $cordovaSQLite.execute(db, query).then(function(res) {
                  
                  for ( i=1; i< res.rows.length; i++){
                    console.log("SELECTED -> " + res.rows.item(i).orderNr + " " + res.rows.item(i).naam + " " + res.rows.item(i).adres+ " " + res.rows.item(i).status+ " " + res.rows.item(i).nota  );

                    levering = {
                      "itemid" : res.rows.item(i).orderNr,
                      "name" : res.rows.item(i).naam,
                      "address" : res.rows.item(i).adres
                    };
                    leveringen.push(levering);
                    console.log(levering);
                  }

                  console.log(leveringen);

                  return leveringen;
              }, function (err) {
                  console.error(err);
              });
            }
          }
});


//  Controller voor de LEVERINGEN pagina
applicatie.controller("LeveringenCtrl", function($scope, DatabaseService){

    // $scope.items = [
    //   {
    //   "itemid" : "13",
    //   "name" : "Soufiane Salama",
    //   "address" : "Trekschurenstraat 324"
    //   },
    //   {
    //   "itemid" : "22",
    //   "name" : "Elias Jans",
    //   "address" : "Luikersteenweg 24 bus2.2"
    //   }
    //   ,
    //   {
    //   "itemid" : "28",
    //   "name" : "Michel Banken",
    //   "address" : "Luikersteenweg 24 bus2.2"
    //   }
    //   ,
    //   {
    //   "itemid" : "33",
    //   "name" : "Tom Herten",
    //   "address" : "Luikersteenweg 24 bus2.2"
    //   }
    // ];
    var test = [
       {
     "itemid" : "13",
     "name" : "Soufiane Salama",
     "address" : "Trekschurenstraat 324"
     }];
     console.log(test);
    $scope.items = DatabaseService.selectAll();
    
    var test = [
       {
     "itemid" : "13",
     "name" : "Soufiane Salama",
     "address" : "Trekschurenstraat 324"
     }];
     console.log(test);
    
});

//  Controller voor de LEVERING pagina
applicatie.controller("LeveringCtrl", function($scope, LeveringService){
    
    $scope.klant =  LeveringService.getKlant();
    $scope.items =  LeveringService.getBestelling();
 
});


applicatie.factory('LeveringService', function($http){
  
  return{
        
        getKlant: function(){
          var Klantinfo = {};
          
          $http.get("js/data2.json")
            .success(function(data) {
              var klant = data['klant'];
              Klantinfo["ordernr"]= klant["ordernr"];
              Klantinfo["bedrag"]= klant["bedrag"];
              Klantinfo["naam"]= klant["naam"];
              Klantinfo["adres"]= klant["adres"];
              Klantinfo["telefoon"]= klant["telefoon"];
              Klantinfo["status"]= klant["status"];
              Klantinfo["nota"]= klant["notas"];
              
            })
            .error(function(data) {
                console.log("ERROR");
            });

          return Klantinfo;
            
        },

        getBestelling: function(){

            var Bestellinginfo = [];

            $http.get("js/data2.json")
            .success(function(data) {
              var order = data['order'];

              var arrayLength = order.length;
              for (var i = 0; i < arrayLength; i++) {
                  Bestellinginfo.push(order[i]);
                  
              }
             
            })
            .error(function(data) {
                console.log("ERROR");
            });
          
           return Bestellinginfo;
        }
    }
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
            console.log(position);
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


