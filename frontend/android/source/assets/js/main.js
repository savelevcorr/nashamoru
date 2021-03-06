$(document).ready(function () {
	
	var map = L.map('js-map').setView([43.121, 131.923], 13);
	

	// Connect to firebase
	var ref = new Firebase('https://toshamora.firebaseio.com/nashamoru/');

	// Init map
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
		maxZoom: 18,
		id: 'savelevcorr.cieznawwh00pgtbm1kqpsucl5',
		accessToken: 'pk.eyJ1Ijoic2F2ZWxldmNvcnIiLCJhIjoiY2llem5heHA2MDBxNHQ0bTRsMW55eXdjbiJ9.lgwTaEKIr1Fxc-L57JRFOQ'
	}).addTo(map);

	var markers = new L.FeatureGroup();

	// Variables for cookies
	var passenger = "psg";
	var driver = "drvr";

	var cookieOptions = {
		expire: 3600,
		path: '/',
		secure: false
	};

	//Caching jq elements
	var driverLink = $(".js-driver-link");
	var passengerLink = $(".js-passenger-link");

	/**
	 * Get Cookie by name
	 * @param name {string}
	 * @returns {*}
	 */
	var getCookie = function (name) {
		var matches = document.cookie.match(new RegExp(
			"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
		));
		return matches ? decodeURIComponent(matches[1]) : undefined;
	};

	/**
	 *
	 * @param name {string}
	 * @param value {string|object}
	 * @param options {object|undefined}
	 */
	var setCookie = function (name, value, options) {
		options = options || {};

		var expires = options.expires;

		if (typeof expires == "number" && expires) {
			var d = new Date();
			d.setTime(d.getTime() + expires * 1000);
			expires = options.expires = d;
		}
		if (expires && expires.toUTCString) {
			options.expires = expires.toUTCString();
		}

		value = encodeURIComponent(value);

		var updatedCookie = name + "=" + value;

		for (var propName in options) {
			updatedCookie += "; " + propName;
			var propValue = options[propName];
			if (propValue !== true) {
				updatedCookie += "=" + propValue;
			}
		}

		document.cookie = updatedCookie;
	};

	var deleteCookie = function (name) {
	  setCookie(name, "", {
	    expires: -1
	  });
	};

	/**
	* 
	* return {number}
	*/
	var generateUserId = function () {
		return Math.floor((Math.random() * 10000))
	};

	// Set icom on the map by click
	var setIcon = function (position) {
			L.marker([position.lat, position.lng], {icon: myIcon}).addTo(map);
	};

	// Save geo and bio info to database
	var saveUserData = function (data, callback) {
		return ref.push(data, callback());
	};

	var getUserData = function (id, callback) {
		var data,
	    	position;

		ref.on("value", function(snapshot) {
			return snapshot.forEach(function(childSnapshot) {
			   data = childSnapshot.val();

			    if (data.id === id) {
			    	callback(data.position);
			    }

			});
		});
	};

	// getting all the markers at once
	var getAllMarkers = function () {

	    map.removeLayer(markers);

	}

	var setNewPlace = function (e) {
		var currentPosition = e.latlng;
		var that = this;
		map.removeLayer(that);
	};

	// Create icon template
	var myIcon = L.divIcon({className: 'my-div-icon', iconSize: L.point(32, 32)});
	var marker=[];

	if ( getCookie(passenger) ){
		var userData = JSON.parse( getCookie(passenger) );
		console.log(userData.id);
		getUserData(userData.id, function (position) {

			var marker = L.marker([position.lat.toFixed(3), position.lng.toFixed(3)], {icon: myIcon});
			markers.addLayer(marker);
			/*.on('click', setNewPlace);*/

		});

		console.log("WE HAVE COOKIE");
	} else {
		/* checkout to driver and get all data */
		ref.on("value", function(snapshot) {
		
		
		
		snapshot.forEach(function(childSnapshot) {

				  // foreach for child element 'shamora'
				  var key = childSnapshot.key();
				  // childData will be the actual contents of the child
				  var childData = childSnapshot.val();
				  

				  marker.push(L.marker([childData.position.lat, childData.position.lng], {
				  icon: myIcon				  
				  }).bindPopup("<div>"+ childData.id +"</div>").addTo(map));

			  });
		  
		});
	}

	var cnt;
	// Remove all icons from map
	$(passengerLink).on('click', function (e) {

		var allMarkers = L.layerGroup(marker);
		console.log(allMarkers);
		
		for(i=0;i<marker.length;i++) {
			map.removeLayer(marker[i]);
		}  
		e.preventDefault();

		

		/*$('.my-div-icon').remove();*/
		map.removeLayer(markers);
		
		setCookie(passenger, JSON.stringify({"id": generateUserId()}));


		if(typeof cnt === 'undefined') {
			map.once('click', function (e) {
				var position = e.latlng;
				var userId = JSON.parse( getCookie(passenger) )
				var userData = {
					"id":  userId.id,
					"position": position
				}

				setIcon(position);
				saveUserData(userData, function () {
					console.log("SEAVED");
				});
			});

			cnt = 1;

			console.log("IN THE IF STATEMENT", cnt);
		} else {
			map.off('click');
		}

		e.preventDefault();
	});
});