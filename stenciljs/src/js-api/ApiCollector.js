// Row of data for the schedule
export class TrainAnnouncementRow {
    constructor() {
        this.locationSignature = "";
        this.activityType = "";
        this.advertisedTrainIdent = "";

        this.arrivalTrackAtLocation = "";
        this.departureTrackAtLocation = "";

        this.arrivalAdvertisedTimeAtLocation = "";
        this.departureAdvertisedTimeAtLocation = "";

        this.arrivalEstimatedTimeAtLocation = "";
        this.departureEstimatedTimeAtLocation = "";

        this.arrivalTimeAtLocation = "";
        this.departureTimeAtLocation = "";

        this.arrivalDeviation = "";
        this.departureDeviation = "";
        
        this.diffArrival = "";
        this.diffDeparture = "";
    }
}

export class TrainScheduleRow {
    constructor() {
        this.locationSignature = "";
        this.advertisedArrivalTime = "";
        this.advertisedDepartureTime = "";
        this.arrivalTrackAtLocation = "";
        this.departureTrackAtLocation = "";
        this.estimatedArrivalTime = "";
        this.estimatedDepartureTime = "";
        this.actualArrivalTime = "";
        this.actualDepartureTime = "";
        this.diffArrival = "";
        this.diffDeparture = "";
        this.deviations = [];
    }
}

class TrainStationListRow {
    constructor() {
        this.locationName = "";
        this.locationSignature = "";
    }
}


// Set up a global list for station names
var trainStationList = [];

// Set up API key
var apiKey = "dfc3b8374d774d5e94655bcd32d7c5c3";

// Settings for Javascript datetime
var localeOptions = { hour: '2-digit', minute: '2-digit' }

// Function for getting todays date in appropriate format (YYYY-MM-DD)
export function getToday() {
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

export function timestamp() {
    return new Date().toLocaleTimeString("sv-SE");
}

function saveData(dataType,saveData) {
    switch (dataType) {
        case "location":
            sessionStorage.setItem("locationSignature",saveData);
            break;
        case "train":
            sessionStorage.setItem("searchTrainIdent",saveData);
            break;
    }
}

function getStationList() {
    var stationListData = "<REQUEST>" +
            "<LOGIN authenticationkey='" + apiKey + "' />" +
            "<QUERY objecttype='TrainStation' schemaversion='1'>" +
                "<FILTER>" +
                "</FILTER>" +
                "<INCLUDE>AdvertisedLocationName</INCLUDE>" + 
                "<INCLUDE>LocationSignature</INCLUDE>" +
            "</QUERY>" +
        "</REQUEST>";

    ApiCollector(stationListData,createStationList);
}

function findStationName(loc) {
    var location = trainStationList.filter(l => l.locationSignature == loc);

    console.log(location);

    return location.locationName;
}

function getCurrentTrainState(advertisedTimeAtLocation, timeAtLocation) {
    var advertised = new Date(advertisedTimeAtLocation);
    var actual = new Date(timeAtLocation);
    var diff = (advertised - actual);

    return Math.floor((diff / 1000) / 60);
}

export function ApiCollector(data, cbFunction) {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            cbFunction(JSON.parse(this.responseText));
        }
    };

    xhr.open("POST", "https://api.trafikinfo.trafikverket.se/v2/data.json");
    xhr.setRequestHeader("Content-Type", "text/xml");
    xhr.setRequestHeader("Cache-Control", "no-cache");
    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
    xhr.setRequestHeader("Accept", "*/*");

    xhr.send(data);
}

function AnotherApiCollector(data) {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    return new Promise((resolve, reject) => {

        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                resolve(JSON.parse(this.responseText));
            }
        };

        xhr.open("POST", "https://api.trafikinfo.trafikverket.se/v2/data.json");
        xhr.setRequestHeader("Content-Type", "text/xml");
        xhr.setRequestHeader("Cache-Control", "no-cache");

        xhr.send(data);
    });
}

function getTrainState(obj) {
    output = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].LocationSignature + " at " + new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[0].TimeAtLocation).toLocaleTimeString("sv-SE",localeOptions);
    console.log(output);
    return output;
}

async function getLocation(searchLocationSignature) {
    // Set up TrainStationName request
    var trainStationData = "<REQUEST>" +
            "<LOGIN authenticationkey='" + apiKey + "' />" +
            "<QUERY objecttype='TrainStation' schemaversion='1'>" +
                "<FILTER>" +
                    "<EQ name='LocationSignature' value='" + searchLocationSignature + "' />" +
                "</FILTER>" +
                "<INCLUDE>AdvertisedLocationName</INCLUDE>" +
            "</QUERY>" +
        "</REQUEST>";

    var output;
    await AnotherApiCollector(trainStationData).then(res => console.log(res.RESPONSE.RESULT[0].TrainAnnouncement[0].LocationSignature + res.RESPONSE.RESULT[0].TrainAnnouncement[0].TimeAtLocation));

    return await output;
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

function renderSingleTrainState(obj) {
    if (!obj.RESPONSE.RESULT[0].TrainAnnouncement) {
        trainDataOutput = "";
        console.log("Single train state, fail!");
    }
    else {
        trainDataOutput = "";
        trainDataOutput += "<b>Tåg:</b> " + obj.RESPONSE.RESULT[0].TrainAnnouncement[0].ProductInformation[0].Description + " tåg " + obj.RESPONSE.RESULT[0].TrainAnnouncement[0].AdvertisedTrainIdent + " <em>(tekniskt tågnummer: " + obj.RESPONSE.RESULT[0].TrainAnnouncement[0].TechnicalTrainIdent + ")</em><br>";
        trainDataOutput += "<b>Sträcka:</b> " + obj.RESPONSE.RESULT[0].TrainAnnouncement[0].FromLocation[0].LocationName + " - " + obj.RESPONSE.RESULT[0].TrainAnnouncement[0].ToLocation[0].LocationName + "<br>";
        trainDataOutput += "<b>Datum:</b> " + new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[0].ScheduledDepartureDateTime).toLocaleDateString("sv-SE");
    
        document.getElementById("trainData").innerHTML = trainDataOutput;
    
        trainInfoOutput = "<b>Information om avgången:</b><br>";
        // Check if booking field is alive and if so, iterate through it
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Booking) {
            for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Booking) {
                trainInfoOutput += obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Booking[j].Description + "<br>";
            }
        }
        // Check if other information field is alive and if so, iterate through it
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].OtherInformation) {
            for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[0].OtherInformation) {
                trainInfoOutput += obj.RESPONSE.RESULT[0].TrainAnnouncement[0].OtherInformation[j].Description + "<br>";
            }
        }
        // Check if service field is alive and if so, iterate through it
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Service) {
            for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Service) {
                trainInfoOutput += obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Service[j].Description + "<br>";
            }
        }
        // Check if train composition field is alive and if so, iterate through it
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].TrainComposition) {
            for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[0].TrainComposition) {
                trainInfoOutput += obj.RESPONSE.RESULT[0].TrainAnnouncement[0].TrainComposition[j].Description + "<br>";
            }
        }
    
        document.getElementById("trainInfo").innerHTML = trainInfoOutput;
    
        deviationOutput = "<b>Avvikelser:</b><br>";
        // Check if deviation field is alive and if so, iterate through it
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Deviation) {
            for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Deviation) {
                deviationOutput += obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Deviation[j].Description + "<br>";
            }
        }
        document.getElementById("trainDeviations").innerHTML = deviationOutput;

        document.getElementById("trainState").style.display = "block";
    }
}

function renderSingleTrainPosition(obj) {
    if (!obj.RESPONSE.RESULT[0].TrainAnnouncement[0]) {
        output = "";
        console.log("Render single train position, fail!");
    }
    else {
        currentState = getCurrentTrainState(obj.RESPONSE.RESULT[0].TrainAnnouncement[0].AdvertisedTimeAtLocation, obj.RESPONSE.RESULT[0].TrainAnnouncement[0].TimeAtLocation);

        if (currentState < 0) {
            if (currentState == -1) {
                suffix = " minut";
            }
            else {
                suffix = " minuter";
            }
    
            stateOutput = " " + Math.abs(currentState) + suffix + " sent";
        }
        else if (currentState > 0) {
            if (currentState == 1) {
                suffix = " minut";
            }
            else {
                suffix = " minuter";
            }
            stateOutput = " " + currentState + suffix + " tidigt";
        }
        else {
            stateOutput = " i rätt tid";
        }
    
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].ActivityType == "Ankomst") {
            activity = "Ankom";
        }
        else {
            activity = "Avgick"
        }
        output = "<b>Nuvarande position:</b><br>";
        output += activity + " " + obj.RESPONSE.RESULT[0].TrainAnnouncement[0].LocationSignature + " kl " + new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[0].TimeAtLocation).toLocaleTimeString("sv-SE",localeOptions) + ", " + stateOutput;
    }

    document.getElementById("currentPosition").innerHTML = output;
    document.title = "Tåg " + obj.RESPONSE.RESULT[0].TrainAnnouncement[0].AdvertisedTrainIdent + " " + activity.toLowerCase() + " " + obj.RESPONSE.RESULT[0].TrainAnnouncement[0].LocationSignature + stateOutput;
}

function renderNextStop(obj) {
    output = "<b>Nästa uppehåll:</b><br>";
    output += "<em>Ännu inte implementerat</em>";

    document.getElementById("nextPosition").innerHTML = output;
}

function createStationList(obj) {
    if (obj.RESPONSE.RESULT[0].TrainStation) {
        for (var i in obj.RESPONSE.RESULT[0].TrainStation) {
            tslr = new TrainStationListRow();

            tslr.locationName = obj.RESPONSE.RESULT[0].TrainStation[i].AdvertisedLocationName;
            tslr.locationSignature = obj.RESPONSE.RESULT[0].TrainStation[i].LocationSignature;

            trainStationList.push(tslr);
        }
    }
}

// Function for creating a list of schedule objects for drawing a correct schedule later
export function createSchedule(obj) {
    if (obj.RESPONSE.RESULT[0].TrainAnnouncement) {
        var scheduleBuilder = [];
        for (var i in obj.RESPONSE.RESULT[0].TrainAnnouncement) {
            let tar = {}; //new TrainAnnouncementRow();

            tar.locationSignature = obj.RESPONSE.RESULT[0].TrainAnnouncement[i].LocationSignature;
            tar.activityType = obj.RESPONSE.RESULT[0].TrainAnnouncement[i].ActivityType;
            tar.advertisedTrainIdent = obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTrainIdent;

            if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].ActivityType == "Ankomst") {
                if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TrackAtLocation) {
                    tar.arrivalTrackAtLocation = obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TrackAtLocation;
                }
                else {
                    tar.arrivalTrackAtLocation = "";
                }

                if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTimeAtLocation) {
                    tar.arrivalAdvertisedTimeAtLocation = new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTimeAtLocation).toLocaleTimeString("sv-SE",localeOptions);
                }
                if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].EstimatedTimeAtLocation) {
                    tar.arrivalEstimatedTimeAtLocation = new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].EstimatedTimeAtLocation).toLocaleTimeString("sv-SE",localeOptions);

                }
                if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocation) {
                    tar.arrivalTimeAtLocation = new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocation).toLocaleTimeString("sv-SE",localeOptions);
                    tar.diffArrival = getCurrentTrainState(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTimeAtLocation, obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocation);
                }
                
                if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Deviation) {
                    var deviations = [];
                    for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Deviation) {
                         deviations.push(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Deviation[j].Description);
                    }
                    tar.arrivalDeviation = deviations;
                }
            }
            else {
                if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TrackAtLocation) {
                    tar.departureTrackAtLocation = obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TrackAtLocation;
                }
                else {
                    tar.departureTrackAtLocation = "";
                }

                if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTimeAtLocation) {
                    tar.departureAdvertisedTimeAtLocation = new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTimeAtLocation).toLocaleTimeString("sv-SE",localeOptions);

                }
                if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].EstimatedTimeAtLocation) {
                    tar.departureEstimatedTimeAtLocation = new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].EstimatedTimeAtLocation).toLocaleTimeString("sv-SE",localeOptions);

                }
                if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocation) {
                    tar.departureTimeAtLocation = new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocation).toLocaleTimeString("sv-SE",localeOptions);
                    tar.diffDeparture = getCurrentTrainState(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTimeAtLocation, obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocation);
                }

                if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Deviation) {
                    var deviations = [];
                    for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Deviation) {
                         deviations.push(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Deviation[j].Description);
                    }
                    tar.departureDeviation = deviations;
                }
            }

            scheduleBuilder.push(tar);
        }

        var location;
        var schedule = []
        for (var j in scheduleBuilder) {
            var deviations = [];
            let ts = {} ;// new TrainScheduleRow();
            ts.locationSignature = scheduleBuilder[j].locationSignature;
            ts.advertisedTrainIdent = scheduleBuilder[j].advertisedTrainIdent;
            if (scheduleBuilder[j].activityType == "Ankomst") {
                var departureData = scheduleBuilder.filter(s => s.locationSignature === scheduleBuilder[j].locationSignature);
                
                ts.advertisedArrivalTime = scheduleBuilder[j].arrivalAdvertisedTimeAtLocation;
                ts.arrivalTrackAtLocation = scheduleBuilder[j].arrivalTrackAtLocation;
                ts.estimatedArrivalTime = scheduleBuilder[j].arrivalEstimatedTimeAtLocation;
                ts.actualArrivalTime = scheduleBuilder[j].arrivalTimeAtLocation;
                ts.diffArrival = scheduleBuilder[j].diffArrival;
                if (scheduleBuilder[j].arrivalDeviation) {
                    //deviations.push(scheduleBuilder[j].arrivalDeviation);
                }

                if (departureData[1]) {
                    location = departureData[1].locationSignature;
                    ts.advertisedDepartureTime = departureData[1].departureAdvertisedTimeAtLocation;
                    ts.departureTrackAtLocation = departureData[1].departureTrackAtLocation;
                    ts.estimatedDepartureTime = departureData[1].departureEstimatedTimeAtLocation;
                    ts.actualDepartureTime = departureData[1].departureTimeAtLocation;
                    ts.diffDeparture = departureData[1].diffDeparture;
                    if (departureData[1].departureDeviation) {
                        ts.deviations = departureData[1].departureDeviation;
                        //deviations.push(departureData[1].departureDeviation);
                    }
                }                
            }
            else if (scheduleBuilder[j].activityType == "Avgang" && scheduleBuilder[j].locationSignature != location) {
                ts.advertisedDepartureTime = scheduleBuilder[j].departureAdvertisedTimeAtLocation;
                ts.departureTrackAtLocation = scheduleBuilder[j].departureTrackAtLocation;
                ts.estimatedDepartureTime = scheduleBuilder[j].departureEstimatedTimeAtLocation;
                ts.actualDepartureTime = scheduleBuilder[j].departureTimeAtLocation;
                ts.diffDeparture = scheduleBuilder[j].diffDeparture;
                ts.deviations = scheduleBuilder[j].departureDeviation;
            }
            else {
                continue;
            }
            
            schedule.push(ts);

            //console.log(ts.locationSignature + ": ank. " + ts.advertisedArrivalTime + " - avg. " + ts.advertisedDepartureTime);
        }
        return schedule;
    }
}