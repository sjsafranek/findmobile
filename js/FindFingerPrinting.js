
function FindFingerPrinting() {

	this.options = {
		frequency: 2 * 1000,
	},

	this._scanningInterval = null,

	this._ipIntToString = function(ip) {
		var str = "";
		for(var i=0; i<4; i++) {
			str += ip % 256;
			ip = Math.floor(ip / 256);
			if(i < 3) str += '.';
		}
		return str;
	},

	this.sendFingerprint = function(route, callback, room, floor) {
		var self = this;
		if(window.plugins && window.plugins.WifiAdmin) {
			// Enable background mode
			if (cordova.plugins.backgroundMode.isEnabled() == false) {
				cordova.plugins.backgroundMode.enable();			
			}

			var wf = window.plugins.WifiAdmin;
			wf.getWifiInfo(function(wifi_data){
				// console.log( JSON.stringify(data) );
				
				var wifiConnected = wifi_data['activity'];
				var wifiList = wifi_data['available'];
				
				// window.plugins.WifiAdmin.enableWifi(true);

				var network_data = [];
				while(wifiList.length > 0) {
					var item = wifiList.shift();
					network_data.push({"mac": item['BSSID'],"rssi": item['level']});
				}

				// Never send empty wifi-fingerprint
				if (network_data.length == 0) {
					alert("No mac addresses!");
					alert(JSON.stringify(wifi_data));
					self.stop();
					return;
				}

				var data = {
					"group": window.localStorage.getItem('group'),
					"username": window.localStorage.getItem('username'),
					"location": room,
					"floor": floor,
					"time": Date.now(),
					"wifi-fingerprint": network_data
				}

				$.ajax({
					type: "POST",
					url: window.localStorage.getItem('machinelearning') + route,
					dataType: "json",
					data: JSON.stringify(data),
					success: function(results) {
						callback(JSON.stringify(results));
					},
			        error: function(xhr,errmsg,err) {
	            		self.stop();
	            		salert(xhr.status,xhr.responseText,errmsg,err);
				        alert(JSON.stringify({
				            "data": null,
				            "error": e.message,
				            "function": "sendFingerprint"
				        }));
					}
				});

			// });
			}, function(){});
		}
		else {
			alert("Cannot find WifiAdmin plugin!")
		}
	},

	this.learn = function(callback, room, floor) {
		var self = this;
		this._scanningInterval = setInterval(
			function() { 
				self.sendFingerprint( "/learn", callback, room, floor );
			}, 
			self.options.frequency
		);
	},

	this.track = function(callback) {
		var self = this;
		this._scanningInterval = setInterval(
			function() { 
				self.sendFingerprint("/track", callback); 
			}, 
			self.options.frequency
		);
	},

	this.stop = function() {
		clearInterval(this._scanningInterval);
		if (cordova.plugins.backgroundMode.isEnabled() == true) {
			cordova.plugins.backgroundMode.disable();			
		}
	},

	this.calculate = function() {
	    $.ajax({
	        crossDomain: true,
	        dataType: 'jsonp',
	        type: "GET",
	        async: false,
	        data: {
	            "group": window.localStorage.getItem('group')
	        },
	        url: window.localStorage.getItem('machinelearning') + "/calculate",
	        dataType: 'JSON',
	        success: function (data) {
	            alert(JSON.stringify(data));
	        },
	        error: function(xhr,errmsg,err) {
	            alert(xhr.status,xhr.responseText,errmsg,err);
	        }
	    });
	}	

}

function findFingerPrinting() {
	return new FindFingerPrinting();
}
