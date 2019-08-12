function ApiCollector(returnType,data) {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            //console.log(this.responseText);
            if (returnType == "stationNames") {
                document.getElementById("temporaryContent").innerHTML = renderStationNameList(JSON.parse(this.responseText));
            }
            if (returnType == "singleTrainState") {
                document.getElementById("temporaryContent").innerHTML = renderSingleTrainState(JSON.parse(this.responseText));
            }
        }
    });

    xhr.open("POST", "https://api.trafikinfo.trafikverket.se/v2/data.json");
    xhr.setRequestHeader("Content-Type", "text/xml");

    xhr.send(data);

    return xhr.responseText;
}

function renderStationNameList(obj) {
    output = "<table class='w3-table w3-bordered w3-striped'>";
    output += "<thead>";
    output += "<tr>";
    output += "<th>LocationSignature</th>";
    output += "<th>LocationName</th>"
    output += "</tr>";
    output += "</thead>";
    for (var i in obj.RESPONSE.RESULT[0].TrainStation) {
        output += "<tr>";
        output += "<td>" + obj.RESPONSE.RESULT[0].TrainStation[i].LocationSignature + "</td><td>" + obj.RESPONSE.RESULT[0].TrainStation[i].AdvertisedLocationName + "</td>";
        output += "</tr>";
    }
    output += "</table>";

    return output;
}

function renderSingleTrainState(obj) {
    output = "<table class='w3-table w3-bordered w3-striped'>";
    output += "<thead>";
    output += "<tr>";
    output += "<th>LocationSignature</th>";
    output += "<th>AdvertisedTimeAtLocation</th>"
    output += "<th>TimeAtLocation</th>"
    output += "</tr>";
    output += "</thead>";
    output += "<tbody>";
    for (var i in obj.RESPONSE.RESULT[0].TrainAnnouncement) {
        output += "<tr>";
        output += "<td>" + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].LocationSignature + "</td>"
        output += "<td>" + new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTimeAtLocation).toLocaleTimeString("sv-SE") + "</td>";
        output += "<td>" + new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocation).toLocaleTimeString("sv-SE") + "</td>";
        output += "</tr>";
    }
    output += "</tbody>";
    output += "</table>";

    return output;
}