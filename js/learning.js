
var user_info,
    learnCounter = 0,
    progress     = 0.0,
    learnLimit   = 150,
    ffp          = findFingerPrinting();

function checkLimit(response) {
    var message = JSON.stringify({
        "response": response,
        "type": typeof(response)
    });
    $("#messages").html(message);

    try {
        learnCounter += 1;
        if(learnCounter > learnLimit) {
            TrackWifiOff();
            learnCounter = 0;
            $('#progress').html(0.0);
            alert("Location learning complete!!!");
        }
        else {
            progress = learnCounter/learnLimit;
            $('#progress').html(progress * 100);
        }
    }
    catch(err){
        alert(JSON.stringify({
            "data": {
                "response": response,
                "type": typeof(response),
            },
            "error": err,
            "function": "checkLimit"
        }));
    }
}

function TrackWifiOff() {
    try {
        document.getElementById('wifiOn').setAttribute('style','display:none;');
        document.getElementById('wifiOff').setAttribute('style','display:block;');
        ffp.stop();
        $('#progress').html(0.0);
    }
    catch(err) {
        alert(JSON.stringify({
            "data": null,
            "error": err,
            "function": "TrackWifiOff"
        }));
    }
}

function TrackWifiOn() {
    TrackWifiOff();
    try {
        document.getElementById('wifiOn').setAttribute('style','display:block;');
        document.getElementById('wifiOff').setAttribute('style','display:none;');
        ffp.learn(
            checkLimit, 
            $("#rooms").val(),
            $("#floors").val()
        );
    }
    catch(err) {
        alert(JSON.stringify({
            "data": null,
            "error": err,
            "function": "TrackWifiOn"
        }));
    }
}

function BuildRoomSelector() {
    var x = document.getElementById("rooms");
    while (x.length > 0) {
        x.remove(x.length-1);
    }
    layer = user_info.layers[document.getElementById("floors").value];
    for (var r = 0; r < layer.features.length; r++) {
        var rooms = document.getElementById("rooms");
        var option = document.createElement("option");
        option.text = layer.features[r].name;
        option.value = layer.features[r].k;
        rooms.add(option);
    }
}

function BuildFloorSelector() {
    var x = document.getElementById("floors");
    while (x.length > 0) {
        x.remove(x.length-1);
    }
    for (var l in user_info.layers){
        var floors = document.getElementById("floors");
        var option = document.createElement("option");
        option.text = user_info.layers[l].name;
        option.value = l;
        floors.add(option);
    }
    BuildRoomSelector();
}

function ToggleOptions() {
    if (document.getElementById("options").style.display == "none"){
        document.getElementById("options").style.display = "inline";
    }
    else {
        document.getElementById("options").style.display = "none";
    }
}

function Sync() {
    $("#messages").html("sync");
    $.ajax({
        crossDomain: true,
        dataType: 'jsonp',
        type: "GET",
        async: false,
        data: {
            "username": window.localStorage.getItem('username'),
            "password": window.localStorage.getItem('password')
        },
        url: window.localStorage.getItem('auth') + "/get_user_data/",
        dataType: 'JSON',
        success: function (data) {
            try {
                results = data;
                window.localStorage.setItem('data', JSON.stringify(data));
                window.localStorage.setItem('group', data.group);
                window.localStorage.setItem('machinelearning', data.machinelearning);
                window.localStorage.setItem('geospatial', data.geospatial.address);
                user_info = data;
                $("#messages").html(user_info);
                BuildFloorSelector();
            }
            catch(err){  
                alert('Server Error: ' + err); 
            }
        },
        error: function(xhr,errmsg,err) {
            alert(xhr.status,xhr.responseText,errmsg,err);
        }
    });
}

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        app.addUIListeners();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        /* Already logged in */
        if (window.localStorage.getItem('data')) {
            user_info = JSON.parse(window.localStorage.getItem('data'));
            BuildFloorSelector();
        }
    },
    /**
     * @Method AddUIListeners
     * Adds Event Listeners for UI elements
     */
    addUIListeners: function(){
        var isMobile = (/(android|ipad|iphone|ipod)/i.test(navigator.userAgent));
        var press = isMobile ? 'touchstart' : 'mousedown';
        document.getElementById("on").addEventListener(press, TrackWifiOn);
        document.getElementById("off").addEventListener(press, TrackWifiOff);
        document.getElementById("floors").addEventListener("change", BuildRoomSelector);
        document.getElementById("settings").addEventListener(press, ToggleOptions);
        document.getElementById("logout").addEventListener(press, function(){
            window.localStorage.setItem('data', false)
            TrackWifiOff();
            window.location = "index.html";
        });
        document.getElementById("sync").addEventListener(press, Sync);
        document.getElementById("tracking").addEventListener(press, function(){
            window.location = "tracking.html";
        });
    }
};

app.initialize();

document.addEventListener('deviceready', function () {
    // Android customization
    cordova.plugins.backgroundMode.setDefaults({ text:'FIND is running.'});
    // Enable background mode
    cordova.plugins.backgroundMode.disable();
    // cordova.plugins.backgroundMode.enable(); 
    // Called when background mode has been activated
    cordova.plugins.backgroundMode.onactivate = function () {
    }
}, false);
