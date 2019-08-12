function ApiCollector() {
    var apiKey = "dfc3b8374d774d5e94655bcd32d7c5c3";

    var data = "<REQUEST>" +
            "<LOGIN authenticationkey='" + apiKey + "' />" +
            "<QUERY objecttype='TrainStation' schemaversion='1' limit='10'>" +
            "<FILTER>" +
            "</FILTER>" +
            "<INCLUDE>AdvertisedLocationName</INCLUDE>" +
            "<INCLUDE>LocationSignature</INCLUDE>" +
            "</QUERY>" +
        "</REQUEST>";

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(this.responseText);
            /*
            var obj = JSON.parse(this.responseText);
            for (var i in obj.RESPONSE.RESULT[0].TrainStation) {
                //console.log(obj.RESPONSE.RESULT[0].TrainStation[i].LocationSignature + " = " + obj.RESPONSE.RESULT[0].TrainStation[i].AdvertisedLocationName);
                output += obj.RESPONSE.RESULT[0].TrainStation[i].LocationSignature + " = " + obj.RESPONSE.RESULT[0].TrainStation[i].AdvertisedLocationName + "\n";
            }
            */
        }
    });

    xhr.open("POST", "https://api.trafikinfo.trafikverket.se/v2/data.json");
    xhr.setRequestHeader("Content-Type", "text/xml");

    xhr.send(data);

    return xhr.responseText;
}