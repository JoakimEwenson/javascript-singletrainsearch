// Row of data for the schedule
class TrainAnnouncementRow {
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

        this.arrivalTechnicalTimeAtLocation = "";
        this.departureTechnicalTimeAtLocation ="";

        this.arrivalTimeAtLocation = "";
        this.departureTimeAtLocation = "";

        this.arrivalDeviation = "";
        this.departureDeviation = "";
        
        this.diffArrival = "";
        this.diffDeparture = "";
    }
}

class TrainScheduleRow {
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

class TrainState {
    constructor() {
        this.trainIdent = "";
        this.technicalTrainIdent = "";
        this.operator = "";
        this.fromLocation = "";
        this.toLocation = "";
        this.scheduledDate = "";
        this.trainInformation = [];
        this.deviations = [];
    }
}

class TrainPosition {
    constructor() {
        this.trainIdent = "";
        this.location = "";
        this.activityType = "";
        this.advertisedTime = "";
        this.technicalTime = "";
        this.actualTime = "";
    }
}

class StationBoardRow {
    constructor() {
        this.trainIdent = "";
        this.endPointLocation = "";
        this.advertisedTime = "";
        this.estimatedTime = "";
        this.actualTime = "";
        this.scheduledDate = "";
        this.trackAtLocation = "";
        this.currentPosition = "";
        this.trainInformation = [];
    }
}

class StationMessage {
    constructor() {
        this.header = "";
        this.reasonCode = "";
        this.startDateTime = "";
        this.updatedDateTime = "";
        this.estimatedEndDateTime = "";
        this.description = "";
    }
}

class TrainStationListRow {
    constructor() {
        this.locationName = "";
        this.locationSignature = "";
    }
}


// Set up a global list for station names
var stationList = [];

// Set up API key
var apiKey = "dfc3b8374d774d5e94655bcd32d7c5c3";

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

function saveData(dataType,saveData,saveDate) {
    switch (dataType) {
        case "location":
            sessionStorage.setItem("locationSignature",saveData);
            break;
        case "train":
            sessionStorage.setItem("searchTrainIdent",saveData);
            sessionStorage.setItem("searchDate",saveDate);
            break;
    }
}

function getStationList() {
    var stationListData = "<REQUEST>" +
            "<LOGIN authenticationkey='" + apiKey + "' />" +
            "<QUERY objecttype='TrainStation' schemaversion='1'>" +
                "<FILTER />" +
                "<INCLUDE>AdvertisedLocationName</INCLUDE>" + 
                "<INCLUDE>LocationSignature</INCLUDE>" +
            "</QUERY>" +
        "</REQUEST>";
    ApiCollector(stationListData,createStationList);
}

function findStationName(loc) {
    var location = stationList.filter(function(list) {
        return list.locationSignature == "G";
    });

    console.log(location);
    return location;
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
            document.getElementById("errorBox").style.display = "none";
        }
        else {
            // Add error handling
            if (document.readyState === "complete") {
                document.getElementById("errorMsg").innerHTML = "Fel vid hämtning av data.";
                document.getElementById("errorBox").style.display = "block";
            }
        }
    };

    xhr.open("POST", "https://api.trafikinfo.trafikverket.se/v2/data.json");
    xhr.setRequestHeader("Content-Type", "text/xml");
    xhr.setRequestHeader("Cache-Control", "no-cache");
    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
    xhr.setRequestHeader("Access-Control-Allow-Origin", "https://www.ewenson.se");
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

function createStationList(obj) {
    if (obj.RESPONSE.RESULT[0].TrainStation) {
        for (var i in obj.RESPONSE.RESULT[0].TrainStation) {
            tslr = new TrainStationListRow();

            tslr.locationName = obj.RESPONSE.RESULT[0].TrainStation[i].AdvertisedLocationName;
            tslr.locationSignature = obj.RESPONSE.RESULT[0].TrainStation[i].LocationSignature;

            stationList.push(tslr);
        }
    }
    //console.log(stationList);
}

function createStationBoardRow(obj,type) {
    // Create empty array for holding rows
    var stationRows = [];
    // Check that result is not empty
    if (obj.RESPONSE.RESULT[0].TrainAnnouncement) {
        for (var i in obj.RESPONSE.RESULT[0].TrainAnnouncement) {
            sbr = new StationBoardRow();
            sbr.trainIdent = obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTrainIdent;
            if (type == "dep") {
                sbr.endPointLocation = obj.RESPONSE.RESULT[0].TrainAnnouncement[i].ToLocation[0].LocationName;

            } 
            else if (type == "arr") {
                sbr.endPointLocation = obj.RESPONSE.RESULT[0].TrainAnnouncement[i].FromLocation[0].LocationName;

            }
            sbr.advertisedTime = obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTimeAtLocation;
            if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].EstimatedTimeAtLocation) {
                sbr.estimatedTime = obj.RESPONSE.RESULT[0].TrainAnnouncement[i].EstimatedTimeAtLocation;
            }
            if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocation) {
                sbr.actualTime = obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocation;
            }
            sbr.scheduledDate = obj.RESPONSE.RESULT[0].TrainAnnouncement[i].ScheduledDepartureDateTime;
            sbr.trackAtLocation = obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TrackAtLocation;
            sbr.currentPosition = "";
            var infoAndDeviations = [];
            if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Deviation) {
                for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Deviation) {
                    infoAndDeviations.push("<b><em>" + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Deviation[j].Description + "</em></b>");
                }
            }
            if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Booking) {
                for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Booking) {
                    infoAndDeviations.push(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Booking[j].Description);
                }
            }
            sbr.trainInformation = infoAndDeviations;

            stationRows.push(sbr);
        }
    }
    return stationRows;
}

function createStationMessageList(obj) {
    // Create empty array to hold data later
    var messages = [];
    // Check if result is not empty
    if (obj.RESPONSE.RESULT[0].TrainMessage) {
        for (var i in obj.RESPONSE.RESULT[0].TrainMessage) {
            sm = new StationMessage();

            if (obj.RESPONSE.RESULT[0].TrainMessage[i].Header) {
                sm.header = obj.RESPONSE.RESULT[0].TrainMessage[i].Header;
            }
            else if (obj.RESPONSE.RESULT[0].TrainMessage[i].ReasonCodeText) {
                sm.header = obj.RESPONSE.RESULT[0].TrainMessage[i].ReasonCodeText;
            }
            else {
                sm.header = "";
            }
            sm.reasonCode = obj.RESPONSE.RESULT[0].TrainMessage[i].ReasonCodeText;
            sm.startDateTime = obj.RESPONSE.RESULT[0].TrainMessage[i].StartDateTime;
            if (obj.RESPONSE.RESULT[0].TrainMessage[i].LastUpdateDateTime) {
                sm.updatedDateTime = obj.RESPONSE.RESULT[0].TrainMessage[i].LastUpdateDateTime;
            }
            if (obj.RESPONSE.RESULT[0].TrainMessage[i].PrognosticatedEndDateTimeTrafficImpact) {
                sm.estimatedEndDateTime = obj.RESPONSE.RESULT[0].TrainMessage[i].PrognosticatedEndDateTimeTrafficImpact;
            }
            sm.description = obj.RESPONSE.RESULT[0].TrainMessage[i].ExternalDescription;

            messages.push(sm);
        }
    }
    // Return array of messages from the function
    return messages;
}

function createTrainState(obj) {
    ts = new TrainState();
    if (obj.RESPONSE.RESULT[0].TrainAnnouncement) {
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].AdvertisedTrainIdent) {
            ts.trainIdent = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].AdvertisedTrainIdent;
        }
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].TechnicalTrainIdent) {
            ts.technicalTrainIdent = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].TechnicalTrainIdent
        }
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].ProductInformation[0].Description) {
            ts.operator = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].ProductInformation[0].Description;
        }
        else if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Operator) {
            ts.operator = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Operator;
        }
        ts.fromLocation = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].FromLocation[0].LocationName;
        ts.toLocation = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].ToLocation[0].LocationName;
        ts.scheduledDate = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].ScheduledDepartureDateTime;

        var trainInfo = [];
        // Check if booking field is alive and if so, iterate through it
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Booking) {
            for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Booking) {
                trainInfo.push(obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Booking[j].Description);
            }
        }
        // Check if other information field is alive and if so, iterate through it
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].OtherInformation) {
            for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[0].OtherInformation) {
                trainInfo.push(obj.RESPONSE.RESULT[0].TrainAnnouncement[0].OtherInformation[j].Description);
            }
        }
        // Check if service field is alive and if so, iterate through it
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Service) {
            for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Service) {
                trainInfo.push(obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Service[j].Description);
            }
        }
        // Check if train composition field is alive and if so, iterate through it
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].TrainComposition) {
            for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[0].TrainComposition) {
                trainInfo.push(obj.RESPONSE.RESULT[0].TrainAnnouncement[0].TrainComposition[j].Description);
            }
        }

        ts.trainInformation = trainInfo;

        var deviations = [];
        // Check if deviation field is alive and if so, iterate through it
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Deviation) {
            for (var j in obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Deviation) {
                deviations.push(obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Deviation[j].Description);
            }
        }
        ts.deviations = deviations;
    }
    return ts;
}

function createTrainPosition(obj) {
    tp = new TrainPosition();
    if (obj.RESPONSE.RESULT[0].TrainAnnouncement) {
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0]) {
            tp.trainIdent = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].AdvertisedTrainIdent;
            tp.location = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].LocationSignature;
            tp.activityType = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].ActivityType;
            tp.advertisedTime = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].AdvertisedTimeAtLocation;
            if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].TechnicalDateTime) {
                tp.technicalTime = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].TechnicalDateTime;
            }
            tp.actualTime = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].TimeAtLocation;
        }
    }
    return tp;
}

// Function for creating a list of schedule objects for drawing a correct schedule later
function createSchedule(obj) {
    if (obj.RESPONSE.RESULT[0].TrainAnnouncement) {
        var scheduleBuilder = [];
        for (var i in obj.RESPONSE.RESULT[0].TrainAnnouncement) {
            tar = new TrainAnnouncementRow();

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
                if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TechnicalDateTime) {
                    tar.arrivalTechnicalTimeAtLocation = new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TechnicalDateTime);
                }
                if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocation) {
                    tar.arrivalTimeAtLocation = new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocation).toLocaleTimeString("sv-SE",localeOptions);
                    if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TechnicalDateTime) {
                        if (getCurrentTrainState(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TechnicalDateTime, obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocation) <= 0) {
                            tar.diffArrival = getCurrentTrainState(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TechnicalDateTime, obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocation);
                        }
                        else {
                            tar.diffArrival = getCurrentTrainState(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTimeAtLocation, obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocation);
                        }
                    }
                    else {
                        tar.diffArrival = getCurrentTrainState(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTimeAtLocation, obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocation);
                    }
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
                if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TechnicalDateTime) {
                    tar.departureTechnicalTimeAtLocation = new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TechnicalDateTime);
                }
                if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocation) {
                    tar.departureTimeAtLocation = new Date(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocation).toLocaleTimeString("sv-SE",localeOptions);
                    if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TechnicalDateTime) {
                        if (getCurrentTrainState(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TechnicalDateTime, obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocation) <= 0) {
                            tar.diffDeparture = getCurrentTrainState(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TechnicalDateTime, obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocation);
                        }
                        else {
                            tar.diffDeparture = getCurrentTrainState(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTimeAtLocation, obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocation);
                        }
                    }
                    else {
                        tar.diffDeparture = getCurrentTrainState(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTimeAtLocation, obj.RESPONSE.RESULT[0].TrainAnnouncement[i].TimeAtLocation);
                    }
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
            ts = new TrainScheduleRow();
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
    trainState = createTrainState(obj);

    if (!trainState) {
        trainDataOutput = "";
        console.log("Single train state, fail!");
    }
    else {
        trainDataOutput = "";
        trainDataOutput += "<b>Tåg:</b> " + trainState.operator + " tåg " + trainState.trainIdent;
        if (trainState.technicalTrainIdent && trainState.technicalTrainIdent != trainState.trainIdent) {
            trainDataOutput += " <em>(tekniskt tågnummer: " + trainState.technicalTrainIdent + ")</em>";
        }
        trainDataOutput += "<br>";
        trainDataOutput += "<b>Sträcka:</b> " + trainState.fromLocation + " - " + trainState.toLocation + "<br>";
        trainDataOutput += "<b>Datum:</b> " + new Date(trainState.scheduledDate).toLocaleDateString("sv-SE");
    
        document.getElementById("trainData").innerHTML = trainDataOutput;
    
        if (trainState.trainInformation != 0) {
            trainInfoOutput = "<b>Information om avgången:</b><br>";
            for (var i in trainState.trainInformation) {
                trainInfoOutput += trainState.trainInformation[i] + "<br>";
            }
        
            document.getElementById("trainInfo").innerHTML = trainInfoOutput;    
        } else {
            document.getElementById("trainInfo").innerHTML = "";
        }

        if (trainState.deviations != 0) {
            deviationOutput = "<b>Avvikelser:</b><br>";
            for (var i in trainState.deviations) {
                deviationOutput += trainState.deviations[i] + "<br>";
            }

            document.getElementById("trainDeviations").innerHTML = deviationOutput;
        } else {
            document.getElementById("trainDeviations").innerHTML = "";
        }

        document.getElementById("trainState").style.display = "block";
    }
}

function renderSingleTrainPosition(obj) {
    trainPosition = createTrainPosition(obj);

    if (trainPosition.trainIdent == "") {
        output = "";
        //console.log("Render single train position, fail!");
    }
    else {
        if (trainPosition.technicalTime != "") {
            currentState = getCurrentTrainState(trainPosition.technicalTime, trainPosition.actualTime);
        }
        else {
            currentState = getCurrentTrainState(trainPosition.advertisedTime, trainPosition.actualTime);
        }

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
    
        if (trainPosition.activityType == "Ankomst") {
            activity = "Ankom";
        }
        else {
            activity = "Avgick"
        }
        output = "<b>Nuvarande position:</b><br>";
        output += activity + " " + trainPosition.location + " kl " + new Date(trainPosition.actualTime).toLocaleTimeString("sv-SE",localeOptions) + ", " + stateOutput;
        
        document.title = "Tåg " + trainPosition.trainIdent + " " + activity.toLowerCase() + " " + trainPosition.location + stateOutput;
    }

    document.getElementById("currentPosition").innerHTML = output;
    
}

function renderNextStop(obj) {
    output = "<b>Nästa uppehåll:</b><br>";
    output += "<em>Ännu inte implementerat</em>";

    document.getElementById("nextPosition").innerHTML = output;
}

function renderTrainSchedule(obj) {
    var schedule = createSchedule(obj);

    output = "";
    output += "<table class='w3-table w3-bordered w3-striped'>";
    output += "<thead>";
    output += "<tr>";
    output += "<th>Plats</th>";
    output += "<th>Spår</th>";
    output += "<th>Ank.</th>";
    output += "<th>Avg.</th>";
    output += "<th>Diff ank.</th>";
    output += "<th>Diff avg.</th>";
    output += "<th>Info</th>";
    output += "</tr>";
    output += "</thead>";
    output += "<tbody>";
    
    for (var i in schedule) {
        var trackAtLocation;
        if (schedule[i].arrivalTrackAtLocation != "" && schedule[i].arrivalTrackAtLocation != "x") {
            trackAtLocation = schedule[i].arrivalTrackAtLocation;
        }
        else if (schedule[i].departureTrackAtLocation != "" && schedule[i].departureTrackAtLocation != "x") {
            trackAtLocation = schedule[i].departureTrackAtLocation;
        }
        else if (schedule[i].arrivalTrackAtLocation != schedule[i].departureTrackAtLocation && schedule[i].arrivalTrackAtLocation != "" && schedule[i].departureTrackAtLocation != "") {
            trackAtLocation = "Ank: " + schedule[i].arrivalTrackAtLocation + "<br>Avg: " + schedule[i].departureTrackAtLocation;
        }
        else {
            trackAtLocation = "";
        }
        output += "<tr>";
        output += "<td><a href='station.html' onclick='saveData(\"location\",\"" + schedule[i].locationSignature + "\");'>" + schedule[i].locationSignature + "</a></td>";
        output += "<td>" + trackAtLocation + "</td>";
        output += "<td>";
        output += schedule[i].advertisedArrivalTime + "<br>";
        if (schedule[i].estimatedArrivalTime || schedule[i].actualArrivalTime) {
            if (schedule[i].actualArrivalTime) {
                output += "<em>" + schedule[i].actualArrivalTime + "</em>";
            }
            else {
                output += "<b>Ny tid: " + schedule[i].estimatedArrivalTime + "</b>";
            }
        } 
        output += "</td>";
        output += "<td>";
        output += schedule[i].advertisedDepartureTime + "<br>";
        if (schedule[i].estimatedDepartureTime || schedule[i].actualDepartureTime) {
            if (schedule[i].actualDepartureTime) {
                output += "<em>" + schedule[i].actualDepartureTime + "</em>";
            } 
            else {
                output += "<b>Ny tid: " + schedule[i].estimatedDepartureTime + "</b>";
            }
        }
        output += "</td>";
        output += "<td>" + schedule[i].diffArrival + "</td>";
        output += "<td>" + schedule[i].diffDeparture + "</td>";
        output += "<td>";
        for (var j in schedule[i].deviations) {
         output += schedule[i].deviations[j] + "<br>";
        }
        output += "</td>";
        output += "</tr>";
    }
    output += "</table>";
    output += "<p class='w3-tiny w3-right w3-margin' style='font-size: 6pt !important'><em>Senast uppdaterat: " + new Date().toLocaleTimeString("sv-SE"); + "</em></p>";

    document.getElementById("trainSchedule").innerHTML = output;
    document.getElementById("trainIdentResult").textContent = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].AdvertisedTrainIdent;
}

function renderCurrentState() {
    var currentLocation = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].AdvertisedTrainIdent + " " + obj.RESPONSE.RESULT[0].TrainAnnouncement[0].LocationSignature + " " + getCurrentTrainState(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].AdvertisedTimeAtLocation, obj.RESPONSE.RESULT[0].TrainAnnouncement[0].TimeAtLocation);
    document.title = "Status " + currentLocation;
}

function renderArrivalBoard(obj) {
    var arrivals = createStationBoardRow(obj,"arr");

    output = "";
    output += "<table class='w3-table w3-bordered w3-striped'>";
    output += "<thead>";
    output += "<tr class='w3-center'>";
    output += "<th>Tåg</th>";
    output += "<th>Från</th>";
    output += "<th>Ank.tid</th>";
    output += "<th>Spår</th>";
    output += "<th>Info</th>";
    output += "</tr>";
    output += "</thead>";
    output += "<tbody>";
    for (var i in arrivals) {
        output += "<tr>";
        output += "<td><a href='train.html' onclick='saveData(\"train\",\"" + arrivals[i].trainIdent + "\",\"" + new Date(arrivals[i].scheduledDate).toLocaleDateString("sv-SE") + "\");'>" + arrivals[i].trainIdent + "</a></td>";
        output += "<td><a href='station.html' onclick='saveData(\"location\",\"" + arrivals[i].endPointLocation + "\");'>" + arrivals[i].endPointLocation + "</a></td>";
        output += "<td class=''><i class='far fa-clock'></i> ";
        output += new Date(arrivals[i].advertisedTime).toLocaleTimeString("sv-SE", localeOptions)
        if (arrivals[i].actualTime) {
            output += "<br><em>Ank. " + new Date(arrivals[i].actualTime).toLocaleTimeString("sv-SE", localeOptions) + "</em>";
        }
        else if (arrivals[i].estimatedTime) {
            output += "<br><em><b>Ny tid: " + new Date(arrivals[i].estimatedTime).toLocaleTimeString("sv-SE", localeOptions) + "</b></em>";
        }
        output += "</td>";
        output += "<td>" + arrivals[i].trackAtLocation + "</td>";
        output += "<td>";
        for (var j in arrivals[i].trainInformation) {
            output += "" + arrivals[i].trainInformation[j] + "<br>";
        }
        output += "</td>";
        output += "</tr>";
    }
    output += "</tbody>";
    output += "</table>";
    output += "<p class='w3-tiny w3-right w3-margin' style='font-size: 6pt !important'><em>Senast uppdaterat: " + new Date().toLocaleTimeString("sv-SE"); + "</em></p>";

    document.getElementById("arrivalBoard").innerHTML = output;
    document.title = "Stationsvy " + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].LocationSignature;

}

function renderDepartureBoard(obj) {
    var departures = createStationBoardRow(obj,"dep");

    output = "";
    output += "<table class='w3-table w3-bordered w3-striped'>";
    output += "<thead>";
    output += "<tr class='w3-center'>"
    output += "<th>Tåg</th>";
    output += "<th>Till</th>";
    output += "<th>Avg.tid</th>";
    output += "<th>Spår</th>";
    output += "<th>Info</th>";
    output += "</tr>";
    output += "</thead>";
    output += "<tbody>";
    for (var i in departures) {
        output += "<tr>";
        output += "<td><a href='train.html' onclick='saveData(\"train\",\"" + departures[i].trainIdent + "\",\"" + new Date(departures[i].scheduledDate).toLocaleDateString("sv-SE") + "\");'>" + departures[i].trainIdent + "</a></td>";
        output += "<td><a href='station.html' onclick='saveData(\"location\",\"" + departures[i].endPointLocation + "\");'>" + departures[i].endPointLocation + "</a></td>";
        output += "<td><i class='far fa-clock'></i> ";
        output += new Date(departures[i].advertisedTime).toLocaleTimeString("sv-SE", localeOptions);
        if (departures[i].actualTime) {
            output += "<br><em>Avg. " + new Date(departures[i].actualTime).toLocaleTimeString("sv-SE", localeOptions) + "</em>";
        }
        else if (departures[i].estimatedTime) {
            output += "<br><em><b>Ny tid: " + new Date(departures[i].estimatedTime).toLocaleTimeString("sv-SE", localeOptions) + "</b></em>";
        }
        output += "</td>";
        
        output += "<td>" + departures[i].trackAtLocation + "</td>";
        output += "<td>";
        for (var j in departures[i].trainInformation) {
            output += "" + departures[i].trainInformation[j] + "<br>";
        }
        output += "</td>";
        output += "</tr>";
    }
    output += "</tbody>";
    output += "</table>";
    output += "<p class='w3-tiny w3-right w3-margin' style='font-size: 6pt !important'><em>Senast uppdaterat: " + new Date().toLocaleTimeString("sv-SE"); + "</em></p>";

    document.getElementById("departureBoard").innerHTML = output;
    document.getElementById("departureTimestamp").textContent = "";
}

function renderStationMessages(obj) {
    var message = createStationMessageList(obj);
    output = "";
    for (var i in message) {
        output += "<p style='text-transform: none'><b>" + message[i].header + "</b><br>";
        if (message[i].startDateTime != "") {
            output += "<em>";
            output += "<i class='far fa-clock'></i> Starttid: " + new Date(message[i].startDateTime).toLocaleString("sv-SE");
            if (message[i].updatedDateTime != "") {
                output += " <i class='far fa-clock'></i> Senast uppdaterat: " + new Date(message[i].updatedDateTime).toLocaleString("sv-SE");
    
            }
            if (message[i].estimatedEndDateTime != "") {
                output += " <i class='far fa-clock'></i> Beräknat klart: " + new Date(message[i].estimatedEndDateTime).toLocaleString("sv-SE");
            }
            output += "</em></p>";
        }
        output += "<p>" + message[i].description + "</p>";
    }

    document.getElementById("stationMessages").innerHTML = output;
}