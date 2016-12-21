// Ionic Domino's Pizza App
// deze app.js maakt gebruik van de gemaakte services "services.js"
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
      url:'/telefoonnummers',
      templateUrl:'templates/telefoonnummers.html',
      controller:'TelefoonCtrl'
    });

    $urlRouterProvider.otherwise('/home');
});

applicatie.run(function($ionicPlatform, $ionicPopup, $cordovaSQLite) {
  // Bij het opstarten van de applicatie wordt de database geopend en gecontroleerd of er een tabel "leveringen" bestaat
  // zoniet maakt hij een tabel aal
  // Ook wordt er bij het opstarten gecontroleerd op verbinding met het internet
  // zoniet wordt er en popup getoond met een knop instelligen die de gebruiker naar de instellingen pagina van het toestel brengt

  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {

      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    if(window.Connection) {
        
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
 // Met de volgende regels zorg ik ervoor dat de hardware back button bij android niks doet bij indrukken
  $ionicPlatform.registerBackButtonAction(function (condition) {
    if (condition) {
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

  //Deze functie wordt gestart als de gebruiker op de knop Inloggen klikt
  // met behulp van de FacebookNative krijg ge de gegevens van de gebruiker als hij ingelogd is met de Facebook App op het toestel
  // Als hij geconnecteerd is, dan worden de faccecbookgegevens van de gebruiker in de local storage(userid, naam, email en link van de profielfoto naar de facebookservers)

  $scope.facebookSignIn = function() {
    facebookConnectPlugin.getLoginStatus(function(success){
      if(success.status === 'connected'){
      
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
  // Functie scanBarcode wordt gestart zodra de gebruiker op de barcode foto klikt.
  // Deze functie maakt gebruik van de native BarcodeScanner en de services LeveringService en DatabaseService
  // De DatabaseServive maakt gebruik van de native SQLite
  // Als de scanner de barcode heeft gescand controleert hij eerst of het van type QR_CODE is
  // Zoja wordt bestelling asynchroon van de server afgehaald met de functie getBestellingAsync, deze functie krijgt de url naar de server die in de barcode zit mee
  // Dan wordt met de getKlantAsync van DatabaseService gecontroleerd of deze bestelling al in de lokale database zit, deze krijgt het id van de bestelling is mee, 
  // Zoniet returnd de functie false, en wordt er een popup getoond met het ordernr en met de vraag of deze bestelling in het systeem moet worden gezet
  // Als de levering al in de lokale database zit wordt er een popup getoond dat hij er al in zit
    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
           
            if (!imageData.cancelled && imageData.format=="QR_CODE" ){
                
                
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
  // Functie init wordt gestart zodra de gebruiker op de telefoonnummers pagina van Instellingen komt.
  // Deze functie maakt gebruik van de native Local Storage(deze is een extra javascript lib zie index.html) en de services LokaleOpslag
  // Deze gaat de input velden vullen (als ze er zijn) met de telefoonnummers die in de localstorage zitten opgeslagen onder de key nummers
  $scope.init = function(){
      $scope.telefoonnummers = LokaleOpslag.getTelefoonnummers();
  }

  // Functie Opslaan wordt gestart zodra de gebruiker op de knop opslaan in de telefoonnummers pagina van Instellingen klikt.
  // Deze functie maakt gebruik van de native Local Storage(deze is een extra javascript lib zie index.html) en de services LokaleOpslag
  // Deze functie gaat de waarde van de input velden in de localstorage opslaan onder de key nummers
  $scope.Opslaan = function(telefoonnummers) {
      LokaleOpslag.setTelefoonnummers(telefoonnummers);
      $state.go("instellingen");
  };
});

//  Controller voor de LEVERINGEN pagina
applicatie.controller("LeveringenCtrl", function($scope, DatabaseService){
  // Deze controller gaat met behulp van de DatabaseServive alle leveringen van vandaag(index=0), gisteren(index=1) en alle leveringen(index=2) ophalen en in de view tonen.
  // De DatabaseServive maakt gebruik van de native SQLite
  // Deze functie gaat de waarde van de input velden in de localstorage opslaan onder de key nummers
    $scope.itemVandaag = DatabaseService.selectDag(0);
    $scope.itemGisteren = DatabaseService.selectDag(1);
    $scope.itemAlle = DatabaseService.selectDag(2);
          
});

//  Controller voor de LEVERING pagina
applicatie.controller("LeveringCtrl", function($scope, LeveringService, $stateParams, DatabaseService ,$q){
  // Deze controller gaat met behulp van de waarde(het orderID van de bestelling) die mee wordt gestuurd in de url 
  // de functie getKlantAsync van de DatabaseService starten en deze gaat alle Klantgegevens(ordernr,naam,adres,bedrag,telefoonnummer) van de bestelling die in de lokale database returnen.
  // de functie getOrderAsync van de DatabaseService starten en deze gaat alle bestelde item(pizza's, side's, drank,...) van de bestelling die in de lokale database returnen.
  
  // De DatabaseServive maakt gebruik van de native SQLite
  // Deze functie gaat de waarde van de input velden in de localstorage opslaan onder de key nummers
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
  // Functie dropTabel wordt gestart zodra de gebruiker op de knop Verwijder Leveringen op de Instellingen pagina klikt.
  // Deze functie maakt gebruik van de DatabaseService en gaat de tabel leveringen verwijderen.
  // De DatabaseServive maakt gebruik van de native SQLite
  // Eerst wordt er een waarschuwing getoond
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

  // Met de volgende regel kan ik de facebookgegevens van de ingelogde gebruiker tonen op de instellingen pagina zoals naam, email en link naar de profielfoto op de facebookservers
    $scope.user = UserService.getUser();


  // Functie showLogOutMenu wordt gestart zodra de gebruiker op de knop Uitloggen op de Instellingen pagina klikt.
  // Deze functie maakt gebruik van de facebook plugin en gaat de ingelogde gebruiker uitloggen
  // De DatabaseServive maakt gebruik van de native SQLite
  // Eerst wordt er een popup getoond
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
     // Deze controller gaat met behulp van de waarde(het adres van de bestelling) die mee wordt gestuurd in de url 
     // een route op de kaart tonen
    var bestemmingsAdres = $stateParams.adres;
    var mapObject;  
    var locatie;
    var bestemmingCoordinaten;
    var watchLocatie;
    var watch;
    var keuze = true;

    //  Async methode om de huidige locatie op te halen
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

        //  Async methode om het bestemmingsadres om te zetten naar coordinaten mbv Google Geocode
        LocatieService.getCoor(bestemmingsAdres).then(function(bestemmingCo){
           
            bestemmingCoordinaten = bestemmingCo;

            //als de coordinaten van het bestemmingsadres binnen zijn, wordt de route op de kaart gezet
            LocatieService.setRoute(mapObject, locatie,bestemmingCo);

            // Markers op de kaart tonen (Winkel, HuidigeLocatie, Klant)
            // In de volgende regel is de 4de parameter(keuze) true, dit zorgt ervoor dat alle markers getoond moeten worden(Winkel, HuidigeLocatie en de Klant)
            // Dit mag alleen de eerste keer, want zodra er een watchpostion wordt afgevuurd mag alleen de marker van de huidige locatie veranderen van positie 
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
             mapObject.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
            // Markers op de kaart tonen (Winkel, HuidigeLocatie, Klant)
            // In de volgende regel is de 4de parameter(keuze) false, dit zorgt ervoor dat alleen marker HuidigeLocatie van positie veranderd
            LocatieService.setMarkers(mapObject, watchLocatie,bestemmingCoordinaten, keuze);
      });
    }

    // als we deze pagina verlaten wordt de watchposition afgesloten en alle markers verwijderd mbv de LocatieService
    $scope.$on('$ionicView.afterLeave', function(){
      watch.clearWatch();
      keuze = true;
      LocatieService.deleteAllMarkers();
    });

}); 

//  Controller voor de LEVERING pagina
applicatie.controller("HulpCtrl", function($scope,  $ionicPopup, $cordovaFlashlight, LocatieService, LokaleOpslag, $state){
  // De volgende regels controleren met behulp van de service LokaleOpslag of er telefoonnummers in de local storage zitten onder de key nummers
  // Als er telefoonnummers beschikbaar zijn worden deze in de <a> tag achter de ng-href="tel: gezet zoals -> ng-href="tel:{{telefoonnummers['telefoonmanager']}}
  // Met dit kan er na het klikken op het nummer gebeld worden.
  // Zoniet wordt er waarschuwing getoond
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
  
  // De functie getLocation wordt gestart als de gebruiker op de knop "waar ben ik?" in de footer klikt
  // Deze gaat mbv de LocatieService en het Google (reverse)Geocoder de huidige coordinaten opzetten naar een adres en tonen in een popup
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
       
  // De functie toggleFlashlight wordt gestart als de gebruiker op de knop Zaklamp in de footer klikt, Hiermee wordt de zaklamp van het toestel aangezet
  // Deze functie maakt gebruik van de native FlashLight
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


