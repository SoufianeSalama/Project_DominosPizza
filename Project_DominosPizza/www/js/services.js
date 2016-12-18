var services = angular.module('Services', ['ionic', 'ngCordova']);

services.factory('LeveringService', function($http, $q){
  
  return{
        getBestellingAsync : function(urlApi) {
          var Bestellinginfo = {};
            var deferred = $q.defer();
            $http.get("http://"+urlApi)
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

services.factory('LokaleOpslag', function($localStorage){
  
  return{
        getTelefoonnummers : function() {
          return $localStorage.nummers;
        },

        setTelefoonnummers: function(telefoonnummers) {
          $localStorage.nummers = telefoonnummers;
        }
    }
});


services.factory('DatabaseService', function($cordovaSQLite, $q){
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
            selectDag: function(index){

              var date = new Date();
              var dag1;
              var dag2;
              var timestamp1 = 0;
              var timestamp2 = 0;


              if (index == 0){
                // alle leveringen van vandaag
                dag1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                dag2 = new Date(date.getFullYear(), date.getMonth(), date.getDate()+1);
                timestamp1 = dag1 / 1000; 
                timestamp2 = dag2 / 1000; 
                var query = "SELECT * FROM leveringen WHERE timestamp BETWEEN " +timestamp1+ " AND " +timestamp2 +  " ORDER BY timestamp DESC";


              }
              else if (index == 1){
                // alle leveringen van gisteren
                dag1 = new Date(date.getFullYear(), date.getMonth(), date.getDate()-1);
                dag2 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                timestamp1 = dag1 / 1000; 
                timestamp2 = dag2 / 1000; 
                var query = "SELECT * FROM leveringen WHERE timestamp BETWEEN " +timestamp1+ " AND " +timestamp2 +  " ORDER BY timestamp DESC";


              }
              else{
                // alle leveringen
                var query = "SELECT * FROM leveringen ORDER BY timestamp DESC";

              }

              var leveringen = [];
              var levering = {};
              console.log(query);
              //var query = "SELECT * FROM leveringen WHERE timestamp BETWEEN " +timestampVandaag+ " AND " +timestampMorgen +  " ORDER BY timestamp DESC";
              //var query = "SELECT * FROM leveringen WHERE timestamp BETWEEN 1482015600 AND 1482102000 ORDER BY timestamp DESC";
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

                    
                  } else {
                      // console.log("No results found");
                      klant = false;  
                  }

                  deferred.resolve(klant);
              }, function (err) {
                  console.error(err);
                  var error = false;
                  deferred.reject(error);
              }); 

              return deferred.promise;
              
            },

            getOrderAsync: function(orderID){
              var deferred = $q.defer();
              var order = [];
              var query = "SELECT bestelling FROM leveringen WHERE orderid = ?";
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

services.factory('LocatieService', function($q, $cordovaGeolocation){
  
  var markers = [];
  return{
        getLocatie : function(){
          var deferred = $q.defer();
          var options = {timeout: 10000, enableHighAccuracy: true};
 
          $cordovaGeolocation.getCurrentPosition(options).then(function(position){
              deferred.resolve(position);

          }, function(error){
            deferred.reject(error);
          });
          return deferred.promise;
        },

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
        },
        getAdres: function(){ //mapObject, startCo, bestemmingCo
          var deferred = $q.defer();
          var options = {timeout: 10000, enableHighAccuracy: true};
 
          $cordovaGeolocation.getCurrentPosition(options).then(function(position){
              var geocoder = new google.maps.Geocoder;
              var latlng = {lat: position.coords.latitude, lng: position.coords.longitude};
              geocoder.geocode({'location': latlng}, function(results, status) {
                if (status === 'OK') {

                    if (results[1]) {
                      deferred.resolve(results[1]);
                       
                    } else {
                     deferred.reject(status);
                    }

                } else {
                 deferred.reject(status);
                }
              });

          }, function(error){
            deferred.reject(error);
          });

          return deferred.promise;
        },

        setRoute: function(mapObject, startCo,bestemmingCo){
          var directionsService = new google.maps.DirectionsService();
          var directionsRequest = {
            origin: startCo,
            destination: bestemmingCo,
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
        },

        setMarkers: function(mapObject, huidigePos,bestemmingCo, keuze){

            var shopIconUrl = "img/logoSmall.png";
            var positionIconUrl="img/deliveryIcon.png";
            var destinationIconUrl="img/destinationIcon.png";
          if (keuze){

            var winkelMarker = new google.maps.Marker({
                map: mapObject,
                animation: google.maps.Animation.DROP,
                position: new google.maps.LatLng(50.930997, 5.328689),
                icon: shopIconUrl
            });   
           
            var bestemmingMarker = new google.maps.Marker({
                map: mapObject,
                animation: google.maps.Animation.DROP,
                position:  bestemmingCo,
                icon: destinationIconUrl
            }); 

             var positieMarker = new google.maps.Marker({
                map: mapObject,
                animation: google.maps.Animation.DROP,
                position: huidigePos,
                icon: positionIconUrl
            }); 
             markers.push(winkelMarker);
             markers.push(bestemmingMarker);
             markers.push(positieMarker);
          }
          else{

             var positieMarker = new google.maps.Marker({
                map: mapObject,
                animation: google.maps.Animation.DROP,
                position: huidigePos,
                icon: positionIconUrl
            }); 

             markers.push(positieMarker);
          }
        },

        deleteMarkers: function(){
          console.log(markers);
           for (var i = 0; i < markers.length; i++) {
              if (i>1){
                markers[i].setMap(null);
              }
            }
        },

         deleteAllMarkers: function(){
          markers = [];
          console.log(markers);
          
        }
    } 
});

services.service('UserService', function() {
  // For the purpose of this example I will store user data on ionic local storage but you should save it on a database
  var setUser = function(user_data) {
    window.localStorage.starter_facebook_user = JSON.stringify(user_data);
  };

  var getUser = function(){
    return JSON.parse(window.localStorage.starter_facebook_user || '{}');
  };

  return {
    getUser: getUser,
    setUser: setUser
  };
});