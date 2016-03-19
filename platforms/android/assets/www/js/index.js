
function Login() {
    var results;
    $.ajax({
        crossDomain: true,
        dataType: 'jsonp',
        type: "GET",
        async: false,
        data: {
            "username": $("#username").val(),
            "password": $("#password").val()
        },
        url: $("#AUTH").val() + "/get_user_data/",
        dataType: 'JSON',
        success: function (data) {
            try {
                results = data;
                ShowDebugMessage(JSON.stringify(data));
                window.localStorage.setItem('username', $("#username").val());
                window.localStorage.setItem('password', $("#password").val());
                window.localStorage.setItem('data', JSON.stringify(data));
                window.localStorage.setItem('group', data.group);
                window.localStorage.setItem('machinelearning', data.machinelearning);
                window.localStorage.setItem('geospatial', data.geospatial.address);
                window.location = "tracking.html";
            }
            catch(err){  
                alert('Server Error: ' + err); 
            }
        },
        error: function(xhr,errmsg,err) {
            alert(xhr.status,xhr.responseText,errmsg,err);
        }
    });
    return results;
}

function ToggleOptions() {
    if (document.getElementById("options").style.display == "none"){
        document.getElementById("options").style.display = "inline";
    }
    else {
        document.getElementById("options").style.display = "none";
    }
}

function ShowDebugMessage(message) {
    if (document.getElementById("debugOn").checked) {
        alert(message);
    }
}



var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        app.addUIListeners();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        /* Already logged in */
        if (window.localStorage.getItem('data') != "false") {
            window.location = "tracking.html";
        }
    },
    /**
     * @Method AddUIListeners
     * Adds Event Listeners for UI elements
     */
    addUIListeners: function(){
        document.getElementById("Login").addEventListener("touchstart", Login);
        document.getElementById("settings").addEventListener("touchstart", ToggleOptions);
        $(document).on('focus','.inputtextfield', function(){
            $('.footer').hide();
        });
        $(document).on('blur','.inputtextfield', function(){
            $('.footer').show();
        });
    }
};

app.initialize();

