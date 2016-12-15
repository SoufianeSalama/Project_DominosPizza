// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var applicatie = angular.module('starter', ['ionic', 'ngCordova', 'Services', 'ngStorage']);
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
    })
     .state('instellingen',{
      url:'/instellingen',
      templateUrl:'templates/instellingen.html',
      controller:'InstellingenCtrl'

    })
     .state('telefoonnummers',{
      url:'/telefoonnummers',
      templateUrl:'templates/telefoonnummers.html',
      controller:'TelefoonCtrl'
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

});

//  Controller voor de BARCODE pagina
applicatie.controller("BarcodeCtrl", function($scope, $cordovaBarcodeScanner,$ionicPopup, $ionicLoading, LeveringService, DatabaseService, $state){

    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
           
            if (!imageData.cancelled && imageData.format=="QR_CODE" ){
                
                console.log(imageData);
                LeveringService.getBestellingAsync(imageData.text).then(function(levering){ 

                  DatabaseService.getKlantAsync(levering["orderid"]).then(function(result){ 
                      console.log(result);
                      if (result == false){
                        MeldingToevoegen(levering);
                      }
                      else{
                        MeldingAlert(levering);
                      }
                  })
                  .catch(function(response){
                          console.log(response.status);
                  });
                })
                .catch(function(response){
                            console.log(response.status);
                });

                
            }
          }, function(error) {
            console.log("An error happened -> " + error);
        });
    };


    function MeldingToevoegen(levering){
      console.log( levering );
      var confirmPopup = $ionicPopup.confirm({
                  title: 'Order nr ' + levering["klant"]["ordernr"], 
                  subTitle: 'Bent u zeker dat u deze levering wilt toevoegen?',
                  cancelText: 'Annuleer',
                  cancelType: 'button-assertive', 
                  okText: 'Toevoegen',
                  okType: 'button-positive',
              });

             confirmPopup.then(function(res) {
                 if(res) {
                    DatabaseService.insertDB(levering);
                 }
            });

    };

    function MeldingAlert(levering){
        var alertPopup = $ionicPopup.alert({
             title: 'Order nr ' + levering["klant"]["ordernr"],
             template: 'Deze levering zit al in het systeem'
           });

    };
    
});


//  Controller voor de Telefoonnummers pagina
applicatie.controller("TelefoonCtrl", function($scope, $localStorage, LokaleOpslag, $state){

  $scope.Opslaan = function(telefoonnummers) {
      console.log(telefoonnummers);
       // $localStorage.test = telefoonnummers;
       LokaleOpslag.setTelefoonnummers(telefoonnummers);
        $state.go("instellingen");
  };

  $scope.init = function(){
     // $scope.telefoonnummers = $localStorage.test;
     $scope.telefoonnummers = LokaleOpslag.getTelefoonnummers();
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
                 
      $scope.klant = res;
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

//  Controller voor de INSTELLINGEN pagina
applicatie.controller("InstellingenCtrl", function($scope, DatabaseService,$ionicPopup ){
  $scope.dropTabel = function() {

       var confirmPopup = $ionicPopup.confirm({
          title: 'Waarschuwing',
          subTitle: 'Bent u zeker dat u alle leveringen wilt verwijderen?',
          cancelText: 'Annuleer',
      
          okText: 'Verwijderen',
          okType: 'button-assertive',
       });
        
        confirmPopup.then(function(res) {
            if(res) {
               DatabaseService.dropTabel();
            }
        });
        
  }
});

//  Controller voor de Google Maps pagina
applicatie.controller("MapCtrl", function($scope, $cordovaGeolocation, $stateParams, LocatieService, $ionicPopup){
   
    var mapObject="";  
    var locatie="";
    var bestemmingCoordinaten = "";
    var watchLocatie ="";

    //  Async methode om de locatie op te halen
    LocatieService.getLocatie().then(function(position){
        //Map tonen
        locatie = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var mapOptions = {
          center: locatie,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: true
        };
 
        mapObject = new google.maps.Map(document.getElementById("map"), mapOptions);
        $scope.map = mapObject;


        var bestemmingsAdres = $stateParams.adres;
        //  Async methode om het bestemmingsadres om te zetten naar coordinater mbv geocode
        LocatieService.getCoor(bestemmingsAdres).then(function(bestemmingCo){
            bestemmingCoordinaten = bestemmingCo;
            //als de coordinaten van het bestemmingsadres binnen zijn, wordt de route op de kaart gezet
            LocatieService.setRoute(mapObject, locatie,bestemmingCo);

            //Markers op de kaart tonen (Winkel, HuidigeLocatie, Klant)
            LocatieService.setMarkers(mapObject, locatie,bestemmingCo, true);

            startWatchPosition();

        })
        .catch(function(response){
           var alertPopup = $ionicPopup.alert({
                 title: 'Kan locatie van bestemming niet vinden',
                 template: response
            });
        }); 
    })
    .catch(function(response){
       var alertPopup = $ionicPopup.alert({
             title: 'Locatie niet gevonden',
             template: response
        });
    }); 

    function startWatchPosition(){

      var watchOptions = {
        timeout : 20000,
        enableHighAccuracy: false // may cause errors if true
      };

      var watch = $cordovaGeolocation.watchPosition(watchOptions);
      watch.then(
        null,
        function(err) {
          console.log(error)
        },
        function(position) {
            console.log("change: " + position);
            LocatieService.deleteMarkers();

             watchLocatie = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            // Markers op de kaart tonen (Winkel, HuidigeLocatie, Klant)
            LocatieService.setMarkers(mapObject, watchLocatie,bestemmingCoordinaten, false);
      });
    }

    $scope.$on('$ionicView.afterLeave', function(){
      watch.clearWatch();
    });

}); 

//  Controller voor de LEVERING pagina
applicatie.controller("HulpCtrl", function($scope,  $ionicPopup, $cordovaFlashlight, LocatieService, LokaleOpslag, $state){

    $scope.getLocation = function(){
        LocatieService.getAdres().then(function(res){
               
            var alertPopup = $ionicPopup.alert({
                    title: 'U bent in de buurt van:',
                    template: res.formatted_address
            });
        })
        .catch(function(response){
            console.log(response.status);
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

    if (LokaleOpslag.getTelefoonnummers() !== undefined){
      $scope.telefoonnummers = LokaleOpslag.getTelefoonnummers();
    }
    else{
      var alertPopup = $ionicPopup.alert({
         title: 'Fout!',
         template: 'Geen telefoonnummers in het systeem!',
         okText: 'Instellingen', 
       });

       alertPopup.then(function(res) {
        if (res){
          $state.go("telefoonnummers");
        }
       });
    }
  
});


