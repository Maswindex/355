var storage;

function init() {
    document.addEventListener("deviceready", onDeviceReady, false);
    storage = window.localStorage;
}

function initMap() {
    var $park = $("#park").on("click", function () {
        setParkingLocation();
    });
    var $retrieve = $("#retrieve").on("click", function () {
        alert("get Parking location.");
    });

    var $gotIt = $("#gotIt").on('click', function () {
        $('#instructions').hide();
    });

    var BAU = {lat: 41.0421, lng: 29.0090};

    var mapDiv = new google.maps.Map(
        document.getElementById('map'), {
            zoom: 12,
            center: BAU
        });
}

function onDeviceReady() {

    if (cordova.platformid == 'ios') {

        $('head').append('<link rel="stylesheet" ' +
            'href="css/park-it-ios.css" type="text/css" />');

        //prevent status bar from overlaying
        window.StatusBar.overlaysWebView(false);
        window.StatusBar.styleDefault();
    }
    else {

        console.log('android styles selected...');
        $('head').append('<link rel="stylesheet" ' +
            'href="css/park-it-android.css" type="text/css"/>');

        window.StatusBar.backgroundColorByHexString("#1565C0");
        // window.StatusBar.backgroundColorByHexString("#C0C0C0");
    }
}

function setParkingLocation() {
    navigator.geolocation.getCurrentPosition(setParkingLocationSuccess,
        setParkingLocationError, {enableHighAccuracy: true});
}

function getParkingLocation() {
    navigator.geolocation.getCurrentPosition(
        getParkingLocationSuccess,
        getParkingLocationError,
        {enableHighAccuracy: true}
    )
}

function getParkingLocationSuccess(position) {
    currentLatitude = position.coords.latitude;
    currentLongitude = position.coords.longitude;

    parkedLatitude = storage.getItem("parkedLatitude");
    parkedLongitude = storage.getItem("parkedLongitude");

    showDirecions();
}

function showDirections() {
    var dRenderer = new google.maps.DirectionRenderer;
    var dService = new google.maps.DirectionService;
    var curLatLong = new google.maps.LatLng(currentLatitude, currentLongitude);
    var parkedLatLong = new google.maps.LatLng(parkedLatitude, parkedLongitude)

    var map = new google.maps.Map(document.getElementById('map'));

    map.setZoom(16);
    map.setCenter(curLatLong);

    dRenderer.setMap(map);
    dService.route({
        origin: curLatLong,
        destination: parkedLatLong,
        travelMode: 'DRIVING'
    }, function (response, status) {
        if (status == 'OK') {
            dRenderer.setDirections(response);
            $('#directions').html('');
            dRenderer.setPanel(document.getElementById('directions'));
        } else {
            navigator.notification.alert("Directions failed: " + status);
        }
    });

    $("#map").show();
    $("#directions").show();
    $("#instructions").hide();
}

function setParkingLocationSuccess(position) {
    latitude = position.coords.latitude;
    storage.setItem("parkedLatitude", latitude);

    longitude = position.coords.longitude;
    storage.setItem("parkedLongitude", longitude);

    showParkingLocation();
}

function setParkingLocationError(error) {
    navigator.notification.alert("Error code: " + error.code
        + "\nError Message: " + error.message);
}


function getParkingLocationError(error) {
    navigator.notification.alert(
        "Error Code: " + error.code +
        "\nError Message: " + error.message);
}

function showParkingLocation() {
    // navigator.notification.alert("Parking Location Saved: Lat(" +
    //     storage.getItem("parkedLatitude", latitude) +
    //     ") Long(" + storage.getItem("parkedLatitude", latitude) + ")");

    latitude = storage.getItem("parkedLatitude", latitude);
    longitude = storage.getItem("parkedLongitude", longitude);


    $('#directions').hide();
    $('#instructions').hide();

    var latLong = new google.maps.LatLng(latitude, longitude);
    var map = new google.maps.Map(document.getElementById('map'));

    map.setZoom(16);
    map.setCenter(latLong);

    var marker = new google.maps.Marker({
        position: latLong,
        map: map
    });
}

$("document").ready(init);