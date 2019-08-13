// Settings for Javascript datetime
var localeOptions = { hour: '2-digit', minute: '2-digit' }

// Function for getting todays date in appropriate format (YYYY-MM-DD)
function getToday() {
    // Set up default date...
    var now = new Date();
    var month = (now.getMonth() + 1);
    var day = now.getDate();
    if (month < 10)
        month = "0" + month;
    if (day < 10)
        day = "0" + day;
    var today = now.getFullYear() + "-" + month + "-" + day;

    return today;
}

function getCurrentTrainState(advertisedTimeAtLocation, timeAtLocation) {
    var advertised = new Date(advertisedTimeAtLocation);
    var actual = new Date(timeAtLocation);
    var diff = (advertised - actual);

    return Math.floor((diff / 1000) / 60);
}

function ApiCollector(data, cbFunction) {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            cbFunction(JSON.parse(this.responseText));
        }
    };

    xhr.open("POST", "https://api.trafikinfo.trafikverket.se/v2/data.json");
    xhr.setRequestHeader("Content-Type", "text/xml");

    xhr.send(data);
}

function getTrainState(obj) {
    output = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].LocationSignature + " at " + new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[0].TimeAtLocation).toLocaleTimeString("sv-SE",localeOptions);
    console.log(output);
    return output;
}

function getLocationName(obj) {
    document.getElementById("arrivalLocation").textContent = obj.RESPONSE.RESULT[0].TrainStation[0].AdvertisedLocationName;
    document.getElementById("departureLocation").textContent = obj.RESPONSE.RESULT[0].TrainStation[0].AdvertisedLocationName;
}

function renderStationNameList(obj) {
    output = "<thead>";
    output += "<tr>";
    output += "<th>LocationSignature</th>";
    output += "<th>LocationName</th>"
    output += "</tr>";
    output += "</thead>";
    output += "<tbody>";
    for (var i in obj.RESPONSE.RESULT[0].TrainStation) {
        output += "<tr>";
        output += "<td>" + obj.RESPONSE.RESULT[0].TrainStation[i].LocationSignature + "</td><td>" + obj.RESPONSE.RESULT[0].TrainStation[i].AdvertisedLocationName + "</td>";
        output += "</tr>";
    }
    output += "</tbody>";

    return output;
}

function renderSingleTrainSchedule(obj) {
    output = "";
    output += "<thead>";
    output += "<tr>";
    output += "<th>Plats</th>";
    output += "<th>Spår</th>";
    output += "<th></th>";
    output += "<th>Tid</th>";
    output += "<th>Faktisk</th>";
    output += "<th>Info</th>";
    output += "</tr>";
    output += "</thead>";
    output += "<tbody>";
    for (var i in obj.RESPONSE.RESULT[0].TrainAnnouncement) {
        output += "<tr>";
        output += "<td>" + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].LocationSignature + "</td>";
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TrackAtLocation) {
            output += "<td>" + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TrackAtLocation + "</td>";
        }
        else {
            output += "<td></td>";
        }
        output += "<td>" + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].ActivityType + "</td>";
        output += "<td>";
        output += new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTimeAtLocation).toLocaleTimeString("sv-SE", localeOptions)
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].EstimatedTimeAtLocation) {
            output += " <b><em>" +  new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].EstimatedTimeAtLocation).toLocaleTimeString("sv-SE", localeOptions) + "</em></b>";
        }
        output += "</td>";
        // Check if and what kind of TimeAtLocation data exists
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocationWithSeconds) {
            output += "<td>" + new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocationWithSeconds).toLocaleTimeString("sv-SE", localeOptions) + "</td>";
        }
        else if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocation) {
            output += "<td>" + new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocation).toLocaleTimeString("sv-SE", localeOptions) + "</td>";
        }
        else {
            output += "<td></td>";
        }
        output += "<td>";
        for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Deviation) {
            output += obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Deviation[j].Description + "<br>";
        }
        for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Booking) {
            output += obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Booking[j].Description + "<br>";
        }
        for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Service) {
            output += obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Service[j].Description + "<br>";
        }
        for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TrainComposition) {
            output += obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TrainComposition[j].Description + "<br>";
        }
        for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[i].OtherInformation) {
            output += obj.RESPONSE.RESULT[0].TrainAnnouncement[i].OtherInformation[j].Description + "<br>";
        }
        output += "</td>";
        
        output += "</tr>";
    }
    output += "</tbody>";

    document.getElementById("trainSchedule").innerHTML = output;
    document.getElementById("trainIdentResult").textContent = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].AdvertisedTrainIdent;
    document.getElementById("scheduleTimestamp").textContent = "Senast uppdaterat: " + new Date().toLocaleTimeString("sv-SE");
}

function renderArrivalBoard(obj) {
    output = "";
    output += "<thead>";
    output += "<tr>";
    output += "<th>Tåg</th>";
    output += "<th>Avg.tid</th>";
    output += "<th>Spår</th>";
    output += "<th>Från</th>";
    output += "<th>Avvikelse</th>";
    output += "<th>Info</th>";
    output += "<th>Servering</th>";
    output += "<th>Vagnsordning</th>";
    output += "<th>Övrigt</th>";
    output += "</tr>";
    output += "</thead>";
    output += "<tbody>";
    for (var i in obj.RESPONSE.RESULT[0].TrainAnnouncement) {
        output += "<tr>";
        output += "<td>" + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTrainIdent + "</td>";
        output += "<td>";
        output += new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTimeAtLocation).toLocaleTimeString("sv-SE", localeOptions)
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].EstimatedTimeAtLocation) {
            output += "<br><em><b>" + new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].EstimatedTimeAtLocation).toLocaleTimeString("sv-SE", localeOptions) + "</b></em>";
        }
        output += "</td>";
        output += "<td>" + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TrackAtLocation + "</td>";
        output += "<td>" + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].FromLocation[0].LocationName + "</td>";
        output += "<td>";
        for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Deviation) {
            output += obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Deviation[j].Description + "<br>";
        }
        output += "</td>";
        output += "<td>";
        for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Booking) {
            output += obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Booking[j].Description + "<br>";
        }
        output += "</td>";
        output += "<td>";
        for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Service) {
            output += obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Service[j].Description + "<br>";
        }
        output += "</td>";
        output += "<td>";
        for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TrainComposition) {
            output += obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TrainComposition[j].Description + "<br>";
        }
        output += "</td>";
        output += "<td>"
        for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[i].OtherInformation) {
            output += obj.RESPONSE.RESULT[0].TrainAnnouncement[i].OtherInformation[j].Description + "<br>";
        }
        output += "</td>";
        output += "</tr>";
    }
    output += "</tbody>";

    document.getElementById("arrivalBoard").innerHTML = output;
    document.getElementById("arrivalTimestamp").textContent = new Date().toLocaleTimeString("sv-SE");

}

function renderDepartureBoard(obj) {
    output = "";
    output += "<thead>";
    output += "<tr>"
    output += "<th>Tåg</th>";
    output += "<th>Avg.tid</th>";
    output += "<th>Spår</th>";
    output += "<th>Till</th>";
    output += "<th>Avvikelse</th>";
    output += "<th>Info</th>";
    output += "<th>Servering</th>";
    output += "<th>Vagnsordning</th>";
    output += "<th>Övrigt</th>";
    output += "</tr>";
    output += "</thead>";
    output += "<tbody>";
    for (var i in obj.RESPONSE.RESULT[0].TrainAnnouncement) {
        output += "<tr>";
        output += "<td>" + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTrainIdent + "</td>";
        output += "<td>";
        output += new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTimeAtLocation).toLocaleTimeString("sv-SE", localeOptions);
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].EstimatedTimeAtLocation) {
            output += "<br><em><b>" + new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].EstimatedTimeAtLocation).toLocaleTimeString("sv-SE", localeOptions) + "</b></em>";
        }
        output += "</td>";
        
        output += "<td>" + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TrackAtLocation + "</td>";
        output += "<td>" + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].ToLocation[0].LocationName + "</td>";
        output += "<td>";
        for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Deviation) {
            output += obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Deviation[j].Description + "<br>";
        }
        output += "</td>";
        output += "<td>";
        for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Booking) {
            output += obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Booking[j].Description + "<br>";
        }
        output += "</td>";
        output += "<td>";
        for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Service) {
            output += obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Service[j].Description + "<br>";
        }
        output += "</td>";
        output += "<td>";
        for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TrainComposition) {
            output += obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TrainComposition[j].Description + "<br>";
        }
        output += "</td>";
        output += "<td>"
        for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[i].OtherInformation) {
            output += obj.RESPONSE.RESULT[0].TrainAnnouncement[i].OtherInformation[j].Description + "<br>";
        }
        output += "</td>";
        output += "</tr>";
    }
    output += "</tbody>";

    document.getElementById("departureBoard").innerHTML = output;
    document.getElementById("departureTimestamp").textContent = new Date().toLocaleTimeString("sv-SE");
}