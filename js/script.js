 
var map;
var infoWindow;
var currentInfoWindow = null;
var CLIENT_ID = 'MC1EDQ0FR4F5C4LPHTS4YPSF4FR1RHFLQFEQJLIQPZEHHQJV';
var CLIENT_SECRET = 'UQER4IN53Z2TESVVKFTL20UWIRJJLWPI3CU2OP4N2A5UGLR0';
var content;

var mylocations = [


{
    name: 'Kosovo Museum',
    lat:42.665680,
    lng: 21.165921

  },

  {
    name: 'Spinp Agency',
    lat:42.654914, 
    lng:21.169177

  },

  {
    name: "Marble Cave",
    lat:42.480268, 
    lng:21.206115

  },
  
  {
    name: 'Gërmia Park',
    lat:42.675258,
    lng: 21.211252

  },
  
  {
    name: 'Çarshia e Jupave',
    lat:42.381956,
    lng:20.427666 

  },
  
  {
    name: 'Prizren Castle',
    lat:42.209635,
    lng:20.745442 

  },

  {
    name: 'Shkugëz',
    lat:42.359401, 
    lng: 20.424773


  },

  {
    name: 'Bogë',
    lat: 42.740601, 
    lng:20.054026
  },

  {
    name: 'Brod',
    lat:41.991942, 
    lng: 20.707128

  }

  ];

function MyVM(){
     
      var self = this;
      this.filter = ko.observable('');
      this.locationsArr = ko.observableArray([]);
      this.filterLoc = ko.observable('');
      //Here are stores search box values -> data-bind="value: query, valueUpdate: 'keyup'" 
      this.query = ko.observable('');

      map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: new google.maps.LatLng(42.568741, 20.848180)
      });
      


      // Pushes my locations array into new location list array
      mylocations.forEach(function(locationList){
            self.locationsArr.push( new loadLocations(locationList));
      });
      //console.log(mylocations);

   this.fList = ko.dependentObservable(function() {
        var search = this.query().toLowerCase();
        return ko.utils.arrayFilter(this.locationsArr() ,function(locationList) {
            if (locationList.Lname.indexOf(search) >= 0) {
                        locationList.marker.setVisible(true);
                        return true;
                    } else {
                        locationList.marker.setVisible(false);
                        return false;
                    }
        });
    }, this);
}

var loadLocations = function(myfunc) {
    
    var self = this;
    this.name = myfunc.name;
    //console.log(this.name);
    //this line it's important when user used to search in filter and write there lowercase letters!
    self.Lname = myfunc.name.toLowerCase();
    this.lat = myfunc.lat;
    this.lng = myfunc.lng;
    this.adresa = '';
    this.qyteti = '';
    this.checkins = '';
    this.visible = ko.observable(true);

   //this line presents the url of foursquare api in which are included client_id and client_secret_id which are defined as global!
   var FSurl = 'https://api.foursquare.com/v2/venues/search?ll=' + this.lat + ',' + this.lng + '&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&query=' + this.name + '&v=20180201';
    


    $.getJSON(FSurl).done(function(data) {

       //this line shows all datas from api response
       var loc = data.response.venues[0];
       //console.log(loc);

       //get address of specific location from data response venues
       self.adresa = loc.location.address;
       //check if type of data is undefined and equal it with NULL
       if(typeof self.adresa === 'undefined'){
          self.adresa = 'No address registered for this location!';
       }
      //console.log(self.adresa);

      //get city of specific location from data response venues
       self.qyteti = loc.location.city;
        //check if type of data is undefined and equal it with NULL
       if(typeof self.qyteti === 'undefined'){
          self.qyteti = 'No city registered for this location!';
       }
       //console.log(self.qyteti);

      //get number of checkins of specific location from data response venues
       self.checkins = loc.stats.checkinsCount;
        //check if type of data is undefined and equal it with NULL
       if(typeof self.checkins === 'undefined'){
          self.checkins = 'No checking registered for this location!';
       }

     
      //check if foursquare fails 
     }).fail(function() {
        alert('There was an error to load Foursquare data. Please try again later!');
    });

   this.infoWindow = new google.maps.InfoWindow({content: ''});

   this.marker = new google.maps.Marker({
        map: map,
        position: new google.maps.LatLng(myfunc.lat, myfunc.lng),
        animation: google.maps.Animation.DROP,
        title: myfunc.name

    });

   

   // Display cliked marker
    this.displayMarker = ko.computed(function() {
        if(this.visible() === true) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);

//console.log(this.marker);
 //this code is to trigger event(self.marker), when clicking any of locations in list then that location marker will bounce and open infoWindow
   this.openMarkerbyClickingListItem = function() {
        google.maps.event.trigger(self.marker, 'click');
    };
    
   self.marker.addListener('click', function() {

         //open infoWindow
         self.infoWindow.open(map, self.marker);
         //set animation to that marker which is clicked
         self.marker.setAnimation(google.maps.Animation.BOUNCE);
         //set timeout of animation
         setTimeout(function(){ self.marker.setAnimation(null); }, 2000);
         //content for updating infoWindow of clicked marker (datas are called from foursquare’s api get json function)
         self.contentToDisplay = '<div class="contentString"><h4>Location: '+myfunc.name+'</h4><p class="adresa">Address: '+self.adresa+'</p><p class="qyteti">City: '+self.qyteti+'</p><p class="checkins">Checkins: '+self.checkins+'</p></div>';
         //setting new content to infoWindow which is declared as global in the top of the script
         self.infoWindow.setContent(self.contentToDisplay);
         //reposition map when marker is clicked
         map.panTo(self.marker.position);
         
        });

  };


function errorMessage() {
  alert("Something went wrong with loading Google Map!");
}

function initMapVM() {
    ko.applyBindings(new MyVM());
}