// Settings for Javascript datetime
var localeOptions = { hour: '2-digit', minute: '2-digit' }

function ApiCollector(returnType,data) {
    console.log("Senast uppdaterat: " + new Date().toLocaleTimeString("sv-SE"));
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            //console.log(this.responseText);
            switch(returnType) {
                case "stationNameList":
                    document.getElementById("temporaryContent").innerHTML = renderStationNameList(JSON.parse(this.responseText));
                    break;
                case "singleTrainSchedule":
                    document.getElementById("trainSchedule").innerHTML = renderSingleTrainState(JSON.parse(this.responseText));
                    break;
                case "arrivalBoard":
                    document.getElementById("arrivalBoard").innerHTML = renderArrivalBoard(JSON.parse(this.responseText));
                    break;
                case "departureBoard":
                    document.getElementById("departureBoard").innerHTML = renderDepartureBoard(JSON.parse(this.responseText));
                    break;
            }
        }
    });

    xhr.open("POST", "https://api.trafikinfo.trafikverket.se/v2/data.json");
    xhr.setRequestHeader("Content-Type", "text/xml");

    xhr.send(data);

    return xhr.responseText;
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

function renderSingleTrainState(obj) {
    output = "";
    output += "<thead>";
    output += "<tr>";
    output += "<th>LocationSignature</th>";
    output += "<th>TrackAtLocation</th>";
    output += "<th>ActivityType</th>";
    output += "<th>Advertised</th>";
    output += "<th>Canceled</th>";
    output += "<th>AdvertisedTimeAtLocation</th>"
    output += "<th>TimeAtLocation</th>"
    output += "</tr>";
    output += "</thead>";
    output += "<tbody>";
    for (var i in obj.RESPONSE.RESULT[0].TrainAnnouncement) {
        output += "<tr>";
        output += "<td>" + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].LocationSignature + "</td>";
        output += "<td>" + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TrackAtLocation + "</td>";
        output += "<td>" + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].ActivityType + "</td>";
        output += "<td>" + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Advertised + "</td>";
        output += "<td>" + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Canceled + "</td>";
        output += "<td>" + new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTimeAtLocation).toLocaleTimeString("sv-SE", localeOptions) + "</td>";
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
        
        output += "</tr>";
    }
    output += "</tbody>";

    return output;
}

function renderArrivalBoard(obj) {
    output = "";
    output += "<thead>";
    output += "<tr>";
    output += "<th>AdvertisedTimeAtLocation</th>";
    output += "<th>TrackAtLocation</th>";
    output += "<th>FromLocation</th>";
    output += "<th>AdvertisedTrainIdent</th>";
    output += "<th>Deviation</th>";
    output += "<th>Booking</th>";
    output += "<th>Service</th>";
    output += "<th>TrainComposition</th>";
    output += "<th>Other information</th>";
    output += "</tr>";
    output += "</thead>";
    output += "<tbody>";
    for (var i in obj.RESPONSE.RESULT[0].TrainAnnouncement) {
        output += "<tr>";
        output += "<td>";
        output += new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTimeAtLocation).toLocaleTimeString("sv-SE", localeOptions)
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].EstimatedTimeAtLocation) {
            output += "<br><em><b>" + new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].EstimatedTimeAtLocation).toLocaleTimeString("sv-SE", localeOptions) + "</b></em>";
        }
        output += "</td>";
        output += "<td>" + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TrackAtLocation + "</td>";
        output += "<td>" + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].FromLocation[0].LocationName + "</td>";
        output += "<td>" + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].ProductInformation[0].Description + "<br>Tåg " + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTrainIdent + "</td>";
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

    return output;
}

function renderDepartureBoard(obj) {
    output = "";
    output += "<thead>";
    output += "<tr>";
    output += "<th>AdvertisedTimeAtLocation</th>";
    output += "<th>TrackAtLocation</th>";
    output += "<th>ToLocation</th>";
    output += "<th>AdvertisedTrainIdent</th>";
    output += "<th>Deviation</th>";
    output += "<th>Booking</th>";
    output += "<th>Service</th>";
    output += "<th>TrainComposition</th>";
    output += "<th>Other information</th>";
    output += "</tr>";
    output += "</thead>";
    output += "<tbody>";
    for (var i in obj.RESPONSE.RESULT[0].TrainAnnouncement) {
        output += "<tr>";
        output += "<td>";
        output += new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTimeAtLocation).toLocaleTimeString("sv-SE", localeOptions);
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].EstimatedTimeAtLocation) {
            output += "<br><em><b>" + new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].EstimatedTimeAtLocation).toLocaleTimeString("sv-SE", localeOptions) + "</b></em>";
        }
        output += "</td>";
        
        output += "<td>" + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TrackAtLocation + "</td>";
        output += "<td>" + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].ToLocation[0].LocationName + "</td>";
        output += "<td>" + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].ProductInformation[0].Description + "<br>Tåg " + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTrainIdent + "</td>";
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

    return output;
}