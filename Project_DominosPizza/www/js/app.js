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
      url:'/levering/:orderID',
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
      //cache: false,
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
                  subTitle: 'Voor deze applicatie moet u verbonden zijn met het internet!', // String (optional). The sub-title of the popup.
                  cancelText: 'Afsluiten', // String (default: 'Cancel'). The text of the Cancel button.
                  cancelType: 'button-assertive', // String (default: 'button-default'). The type of the Cancel button.
                  okText: 'Instellingen', // String (default: 'OK'). The text of the OK button.
                  okType: 'button-positive', // String (default: 'button-positive'). The type of the OK button.
              });          

          confirmPopup.then(function(res) {
              if(res) {
                  cordova.plugins.settings.openSetting("settings", function() {
                        console.log('opened settings');
                        ionic.Platform.exitApp();
                  },
                   function () {
                        console.log('failed to open settings');
                        ionic.Platform.exitApp();
                   });
              } else {
                  ionic.Platform.exitApp();
              }
          });
       }
    }
  });
})

applicatie.controller("HomeCtrl", function($scope, $state, $q, UserService, $ionicLoading, $ionicPlatform){
 
  $ionicPlatform.registerBackButtonAction(function (condition) {
    if (condition) {
      //ionic.Platform.exitApp();
    }
  }, 100);


  // This is the success callback from the login method
  var fbLoginSuccess = function(response) {
    if (!response.authResponse){
      fbLoginError("Cannot find the authResponse");
      return;
    }

    var authResponse = response.authResponse;

    getFacebookProfileInfo(authResponse)
    .then(function(profileInfo) {
      // For the purpose of this example I will store user data on local storage
      UserService.setUser({
        authResponse: authResponse,
        userID: profileInfo.id,
        name: profileInfo.name,
        email: profileInfo.email,
        picture : "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
      });
      $ionicLoading.hide();
      $state.go('scanner');
    }, function(fail){
      // Fail get profile info
      console.log('profile info fail', fail);
    });
  };

  // This is the fail callback from the login method
  var fbLoginError = function(error){
    console.log('fbLoginError', error);
    $ionicLoading.hide();
  };

  // This method is to get the user profile info from the facebook api
  var getFacebookProfileInfo = function (authResponse) {
    var info = $q.defer();

    facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
      function (response) {
        console.log(response);
        info.resolve(response);
      },
      function (response) {
        console.log(response);
        info.reject(response);
      }
    );
    return info.promise;
  };

  //This method is executed when the user press the "Login with facebook" button
  $scope.facebookSignIn = function() {
    facebookConnectPlugin.getLoginStatus(function(success){
      if(success.status === 'connected'){
        // The user is logged in and has authenticated your app, and response.authResponse supplies
        // the user's ID, a valid access token, a signed request, and the time the access token
        // and signed request each expire
        console.log('getLoginStatus', success.status);

        // Check if we have our user saved
        var user = UserService.getUser('facebook');

        if(!user.userID){
          getFacebookProfileInfo(success.authResponse)
          .then(function(profileInfo) {
            // For the purpose of this example I will store user data on local storage
            UserService.setUser({
              authResponse: success.authResponse,
              userID: profileInfo.id,
              name: profileInfo.name,
              email: profileInfo.email,
              picture : "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
            });

            $state.go('scanner');
          }, function(fail){
            // Fail get profile info
            console.log('profile info fail', fail);
          });
        }else{
          $state.go('scanner');
        }
      } else {

        console.log('getLoginStatus', success.status);

        $ionicLoading.show({
          template: 'Inloggen...'
        });

        // Ask the permissions you need. You can learn more about
        // FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
        facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
      }
    });
  };
});

//  Controller voor de BARCODE pagina
applicatie.controller("BarcodeCtrl", function($scope, $cordovaBarcodeScanner,$ionicPopup, $ionicLoading, LeveringService, DatabaseService, $state){
    var substring
    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
           
            if (!imageData.cancelled && imageData.format=="QR_CODE" ){
                
                console.log(imageData);
                LeveringService.getBestellingAsync(imageData.text).then(function(levering){ 

                  DatabaseService.getKlantAsync(levering["orderid"]).then(function(result){ 
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

  $scope.init = function(){
      $scope.telefoonnummers = LokaleOpslag.getTelefoonnummers();
  }

  $scope.Opslaan = function(telefoonnummers) {
      LokaleOpslag.setTelefoonnummers(telefoonnummers);
      $state.go("instellingen");
  };
});

//  Controller voor de LEVERINGEN pagina
applicatie.controller("LeveringenCtrl", function($scope, DatabaseService){
    $scope.itemVandaag = DatabaseService.selectDag(0);
    $scope.itemGisteren = DatabaseService.selectDag(1);
    $scope.itemAlle = DatabaseService.selectDag(2);
          
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
applicatie.controller("InstellingenCtrl", function($scope, DatabaseService,$ionicPopup, UserService , UserService, $ionicActionSheet, $state, $ionicLoading){
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
        
  };
  $scope.user = UserService.getUser();
  console.log(UserService.getUser());

  $scope.showLogOutMenu = function() {

   var confirmPopup = $ionicPopup.confirm({
     title: 'Uitloggen',
     template: 'Bent u zeker dat u wilt uitloggen?',
      cancelText: 'Annuleer',
                  cancelType: 'button-assertive', 
                   okText: 'Uitloggen',
                  okType: 'button-positive',
   });

   confirmPopup.then(function(res) {
     if(res) {
       $ionicLoading.show({
          template: 'Uitloggen...'
        });

        facebookConnectPlugin.logout(function(){
          $ionicLoading.hide();
          $state.go('home');
        },
        function(fail){
          $ionicLoading.hide();
        });
     } 
   });
 
  };
});

//  Controller voor de Google Maps pagina
applicatie.controller("MapCtrl", function($scope, $cordovaGeolocation, $stateParams, LocatieService, $ionicPopup){
    var bestemmingsAdres = $stateParams.adres;
    var mapObject;  
    var locatie;
    var bestemmingCoordinaten;
    var watchLocatie;
    var watch;
    var keuze = true;

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

        //  Async methode om het bestemmingsadres om te zetten naar coordinater mbv geocode
        LocatieService.getCoor(bestemmingsAdres).then(function(bestemmingCo){
           
            bestemmingCoordinaten = bestemmingCo;

            //als de coordinaten van het bestemmingsadres binnen zijn, wordt de route op de kaart gezet
            LocatieService.setRoute(mapObject, locatie,bestemmingCo);

            //Markers op de kaart tonen (Winkel, HuidigeLocatie, Klant)
            LocatieService.setMarkers(mapObject, locatie,bestemmingCo, keuze);
            keuze = false;
            startWatchPosition();

        })
        .catch(function(response){
           var alertPopup = $ionicPopup.alert({
                 title: 'Kan locatie van bestemming niet vinden'
                 //template: response
            });
        }); 
    })
    .catch(function(response){
       var alertPopup = $ionicPopup.alert({
             title: 'Locatie niet gevonden'
             //template: response
        });
    }); 

    function startWatchPosition(){

      var watchOptions = {
        timeout : 10000,
        enableHighAccuracy: false // may cause errors if true
      };

      watch = $cordovaGeolocation.watchPosition(watchOptions);
      watch.then(
        null,
        function(error) {
          console.log(error)
        },
        function(position) {
            LocatieService.deleteMarkers();

             watchLocatie = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            // Markers op de kaart tonen (Winkel, HuidigeLocatie, Klant)
            LocatieService.setMarkers(mapObject, watchLocatie,bestemmingCoordinaten, keuze);
      });
    }

    $scope.$on('$ionicView.afterLeave', function(){
      watch.clearWatch();
      keuze = true;
      LocatieService.deleteAllMarkers();
    });

}); 

//  Controller voor de LEVERING pagina
applicatie.controller("HulpCtrl", function($scope,  $ionicPopup, $cordovaFlashlight, LocatieService, LokaleOpslag, $state){

    if (LokaleOpslag.getTelefoonnummers() !== undefined){
      $scope.telefoonnummers = LokaleOpslag.getTelefoonnummers();
    }
    else{
      var alertPopup = $ionicPopup.alert({
         title: 'Geen telefoonnummers in het systeem!',
         template: 'Ga naar de instellingen pagina om telefoonnummers toe te voegen.',
         okText: 'OK', 
       });

       alertPopup.then(function(res) {
        
       });
    }
  
    $scope.getLocation = function(){
        LocatieService.getAdres().then(function(res){
               
            var alertPopup = $ionicPopup.alert({
                    title: 'U bent in de buurt van:',
                    template: res.formatted_address
            });
        })
        .catch(function(response){
           var alertPopup = $ionicPopup.alert({
                 title: 'Kan uw locatie niet vinden!'
                 //template: response
            });
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


