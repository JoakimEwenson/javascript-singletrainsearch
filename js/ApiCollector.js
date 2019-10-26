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
        this.viaLocations = [];
        this.scheduledDate = "";
        this.trainInformation = [];
        this.deviations = [];
        this.webLink = "";
    }
}

class NextStop {
    constructor() {
        this.activity = "";
        this.advertisedTime = "";
        this.estimatedTime = "";
        this.locationSignature = "";
        this.technicalTime = "";
        this.trainIdent = "";
        this.trackAtLocation = "";
    }
}

class TrainPosition {
    constructor() {
        this.trainIdent = "";
        this.location = "";
        this.toLocation = "";
        this.activityType = "";
        this.advertisedTime = "";
        this.technicalTime = "";
        this.actualTime = "";
    }
}

class StationBoardRow {
    constructor() {
        this.locationSignature = "";
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
let stationList = [];

// Set up API key
let apiKey = "dfc3b8374d774d5e94655bcd32d7c5c3";

// Settings for Javascript datetime
let localeOptions = { hour: '2-digit', minute: '2-digit' }

// Function for getting todays date in appropriate format (YYYY-MM-DD)
function getToday() {
    // Set up default date...
    let now = new Date();
    let month = (now.getMonth() + 1);
    let day = now.getDate();
    if (month < 10)
        month = "0" + month;
    if (day < 10)
        day = "0" + day;
    let today = now.getFullYear() + "-" + month + "-" + day;

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
    let stationListData = "<REQUEST>" +
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
    let location = loc;
    for (let i = 0; i < trainStationList.RESPONSE.RESULT[0].TrainStation.length; i++) {
        if (trainStationList.RESPONSE.RESULT[0].TrainStation[i].LocationSignature == loc) {
            location = trainStationList.RESPONSE.RESULT[0].TrainStation[i].AdvertisedLocationName;
        }
    }

    return location;
}

function getCurrentTrainState(advertisedTimeAtLocation, timeAtLocation) {
    let advertised = new Date(advertisedTimeAtLocation);
    let actual = new Date(timeAtLocation);
    let diff = (advertised - actual);

    return Math.floor((diff / 1000) / 60);
}

function ApiCollector(data, cbFunction) {
    let xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            cbFunction(JSON.parse(this.responseText));
            document.getElementById("errorBox").style.display = "none";
        }
        else if (this.readyState == 4 && this.status == 404) {
            console.log("Error: " + this.status);
            document.getElementById("errorMsg").innerHTML = this.status;
            document.getElementById("errorBox").style.display = "block";
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

function createStationList(obj) {
    if (obj.RESPONSE.RESULT[0].TrainStation) {
        for (let i in obj.RESPONSE.RESULT[0].TrainStation) {
            tslr = new TrainStationListRow();

            tslr.locationName = obj.RESPONSE.RESULT[0].TrainStation[i].AdvertisedLocationName;
            tslr.locationSignature = obj.RESPONSE.RESULT[0].TrainStation[i].LocationSignature;

            stationList.push(tslr);
        }
    }
    return stationList;
}

function createStationBoardRow(obj,type) {
    // Create empty array for holding rows
    let stationRows = [];
    // Check that result is not empty
    if (obj.RESPONSE.RESULT[0].TrainAnnouncement) {
        for (let i in obj.RESPONSE.RESULT[0].TrainAnnouncement) {
            sbr = new StationBoardRow();
            sbr.locationSignature = obj.RESPONSE.RESULT[0].TrainAnnouncement[i].LocationSignature;
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
            let infoAndDeviations = [];
            if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Deviation) {
                for (let j in obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Deviation) {
                    infoAndDeviations.push("<b><em>" + obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Deviation[j].Description + "</em></b>");
                }
            }
            if (obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Booking) {
                for (let j in obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Booking) {
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
    let messages = [];
    // Check if result is not empty
    if (obj.RESPONSE.RESULT[0].TrainMessage) {
        for (let i in obj.RESPONSE.RESULT[0].TrainMessage) {
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
        try {
            if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].AdvertisedTrainIdent) {
                ts.trainIdent = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].AdvertisedTrainIdent;
            }
            else {
                ts.trainIdent = "";
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

            let viaLocations = [];
            if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].ViaToLocation) {
                for (let j in obj.RESPONSE.RESULT[0].TrainAnnouncement[0].ViaToLocation) {
                    viaLocations.push(obj.RESPONSE.RESULT[0].TrainAnnouncement[0].ViaToLocation[j].LocationName);
                }
            }
            ts.viaLocations = viaLocations;

            ts.scheduledDate = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].ScheduledDepartureDateTime;

            let trainInfo = [];
            // Check if booking field is alive and if so, iterate through it
            if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Booking) {
                for (let j in obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Booking) {
                    trainInfo.push(obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Booking[j].Description);
                }
            }
            // Check if other information field is alive and if so, iterate through it
            if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].OtherInformation) {
                for (let j in obj.RESPONSE.RESULT[0].TrainAnnouncement[0].OtherInformation) {
                    trainInfo.push(obj.RESPONSE.RESULT[0].TrainAnnouncement[0].OtherInformation[j].Description);
                }
            }
            // Check if service field is alive and if so, iterate through it
            if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Service) {
                for (let j in obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Service) {
                    trainInfo.push(obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Service[j].Description);
                }
            }
            // Check if train composition field is alive and if so, iterate through it
            if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].TrainComposition) {
                for (let j in obj.RESPONSE.RESULT[0].TrainAnnouncement[0].TrainComposition) {
                    trainInfo.push(obj.RESPONSE.RESULT[0].TrainAnnouncement[0].TrainComposition[j].Description);
                }
            }

            ts.trainInformation = trainInfo;

            let deviations = [];
            // Check if deviation field is alive and if so, iterate through it
            if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Deviation) {
                for (let j in obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Deviation) {
                    deviations.push(obj.RESPONSE.RESULT[0].TrainAnnouncement[0].Deviation[j].Description);
                }
            }
            ts.deviations = deviations;

            ts.webLink = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].WebLink;
        }
        catch {
            // TODO: Add proper error handling
        }
    }
    return ts;
}

function createTrainPosition(obj) {
    tp = new TrainPosition();
    if (obj.RESPONSE.RESULT[0].TrainAnnouncement) {
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0]) {
            tp.trainIdent = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].AdvertisedTrainIdent;
            tp.location = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].LocationSignature;
            tp.toLocation = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].ToLocation ? obj.RESPONSE.RESULT[0].TrainAnnouncement[0].ToLocation[0].LocationName : "" ;
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

function createNextStopInformation(obj) {
    ns = new NextStop();
    if (obj.RESPONSE.RESULT[0].TrainAnnouncement.length > 0) {
        ns.activity = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].ActivityType;
        ns.advertisedTime = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].AdvertisedTimeAtLocation;
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].EstimatedTimeAtLocation != null) {
            ns.estimatedTime = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].EstimatedTimeAtLocation;
        }
        ns.locationSignature = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].LocationSignature;
        if (obj.RESPONSE.RESULT[0].TrainAnnouncement[0].TechnicalDateTime != null) {
            ns.technicalTime = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].TechnicalDateTime;
        }
        ns.trainIdent = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].AdvertisedTrainIdent;
        ns.trackAtLocation = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].TrackAtLocation;
    }

    return ns;
}

// Function for creating a list of schedule objects for drawing a correct schedule later
function createSchedule(obj) {
    if (obj.RESPONSE.RESULT[0].TrainAnnouncement) {
        let scheduleBuilder = [];
        for (let i in obj.RESPONSE.RESULT[0].TrainAnnouncement) {
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
                    let deviations = [];
                    for (let j in obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Deviation) {
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
                    let deviations = [];
                    for (let j in obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Deviation) {
                         deviations.push(obj.RESPONSE.RESULT[0].TrainAnnouncement[i].Deviation[j].Description);
                    }
                    tar.departureDeviation = deviations;
                }
            }

            scheduleBuilder.push(tar);
        }

        let location;
        let schedule = []
        for (let j in scheduleBuilder) {
            let deviations = [];
            ts = new TrainScheduleRow();
            ts.locationSignature = scheduleBuilder[j].locationSignature;
            ts.advertisedTrainIdent = scheduleBuilder[j].advertisedTrainIdent;
            if (scheduleBuilder[j].activityType == "Ankomst") {
                let departureData = scheduleBuilder.filter(s => s.locationSignature === scheduleBuilder[j].locationSignature);
                
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

function renderStationList(obj) {
    let list = createStationList(obj);
    console.table(list);
    output = "<table class='table'>";
    output += "<thead class='thead-dark'>";
    output += "<tr>";
    output += "<th>Plats</th>";
    output += "<th>Signatur</th>"
    output += "</tr>";
    output += "</thead>";
    output += "<tbody>";
    for (let i in list) {
        output += "<tr>";
        output += "<td><a href='station.html' onclick='saveData(\"location\",\"" + list[i].locationSignature + "\");'>" + list[i].locationName + "</a></td>";
        output += "<td><a href='station.html' onclick='saveData(\"location\",\"" + list[i].locationSignature + "\");'>" + list[i].locationSignature + "</a></td>"
        output += "</tr>";
    }
    output += "</tbody>";
    output += "</table>";

    document.getElementById("stationListDiv").innerHTML = output;
}

function renderSingleTrainState(obj) {
    trainState = createTrainState(obj);

    if (trainState.trainIdent == "") {
        document.getElementById("trainData").innerHTML = "";
        document.getElementById("trainState").style.display = "none";
    }
    else {
        trainDataOutput = "";
        trainDataOutput += "<a href='" + trainState.webLink + "'>" + trainState.operator + "</a> tåg " + trainState.trainIdent;
        if (trainState.technicalTrainIdent && trainState.technicalTrainIdent != trainState.trainIdent) {
            trainDataOutput += " <em>(tekniskt tågnummer: " + trainState.technicalTrainIdent + ")</em>";
        }
        trainDataOutput += ", ";
        trainDataOutput += "" + findStationName(trainState.fromLocation) + " mot " + findStationName(trainState.toLocation) + " ";
        if (trainState.viaLocations != "") {
            trainDataOutput += "via ";
            for (let j in trainState.viaLocations) {
                if (j >= 1) {
                    prefix = ", ";
                } else {
                    prefix = "";
                }
                trainDataOutput += prefix + findStationName(trainState.viaLocations[j]);
            }
            trainDataOutput += ".<br>";
        }
        trainDataOutput += "Datum " + new Date(trainState.scheduledDate).toLocaleDateString("sv-SE");
    
        document.getElementById("trainData").innerHTML = trainDataOutput;
    
        if (trainState.trainInformation.length > 0) {
            trainInfoOutput = "<b>Information om avgången:</b><br>";
            for (let i in trainState.trainInformation) {
                trainInfoOutput += trainState.trainInformation[i] + "<br>";
            }
        
            document.getElementById("trainInfo").innerHTML = trainInfoOutput;    
        } else {
            document.getElementById("trainInfo").innerHTML = "";
        }

        if (trainState.deviations != 0) {
            deviationOutput = "<b>Avvikelser:</b><br>";
            for (let i in trainState.deviations) {
                deviationOutput += trainState.deviations[i] + "<br>";
            }

            document.getElementById("trainDeviations").innerHTML = deviationOutput;
        } else {
            document.getElementById("trainDeviations").innerHTML = "";
        }
        document.getElementById("trainIdentHeader").innerHTML = trainState.operator + " " + trainState.trainIdent;
        document.getElementById("trainState").style.display = "block";
    }
}

function renderSingleTrainPosition(obj) {
    trainPosition = createTrainPosition(obj);

    if (trainPosition.trainIdent == "") {
        output = "";
        //console.log("Render single train position, fail!");
        document.title = "Tågläge";
    }
    else {
        if (trainPosition.technicalTime != "") {
            if (getCurrentTrainState(trainPosition.technicalTime, trainPosition.actualTime) <= 0) {
                currentState = getCurrentTrainState(trainPosition.technicalTime, trainPosition.actualTime);
            }
            else {
                currentState = getCurrentTrainState(trainPosition.advertisedTime, trainPosition.actualTime);
            }
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
        output += activity + " " + findStationName(trainPosition.location) + " kl. " + new Date(trainPosition.actualTime).toLocaleTimeString("sv-SE",localeOptions) + ", " + stateOutput;
        
        document.title = "Tåg " + trainPosition.trainIdent + " " + activity.toLowerCase() + " " + findStationName(trainPosition.location) + stateOutput;

        // Check if current position is train destination and if so, remove refresh function
        if (trainPosition.location == trainPosition.toLocation) {
            clearInterval(myTimer);
        }
    }

    document.getElementById("currentPosition").innerHTML = output;
    
}

// TODO: Add check against estimated time for correct calculations
function renderNextStation(obj) {
    let ns = createNextStopInformation(obj);
    if (ns.locationSignature != "") {
        let timeUntilEvent = getCurrentTrainState(ns.advertisedTime, new Date())
        if (ns.estimatedTime != "") {
            timeUntilEvent = getCurrentTrainState(ns.estimatedTime, new Date());
        }
        else {
            timeUntilEvent = getCurrentTrainState(ns.advertisedTime, new Date())
        }

        if (timeUntilEvent < 0) {
            timeUntilEvent = 0;
        }
    
        if (timeUntilEvent == 1) {
            suffix = " minut";
        }
        else {
            suffix = " minuter";
        }
    
        output = "<b>Nästa uppehåll:</b><br>";
        if (ns.activity == "Avgang") {
            if (ns.estimatedTime != "") {
                output += "Tåg " + ns.trainIdent + " beräknas avgå " + findStationName(ns.locationSignature) + ", spår " + ns.trackAtLocation + ", om " + timeUntilEvent + " " + suffix + ", <b>kl. " + new Date(ns.estimatedTime).toLocaleTimeString("sv-SE",localeOptions) + "</b> <em>(ordinarie tid " + new Date(ns.advertisedTime).toLocaleTimeString("sv-SE",localeOptions) + ")</em>";              
            }
            else {
                output += "Tåg " + ns.trainIdent + " beräknas avgå " + findStationName(ns.locationSignature) + ", spår " + ns.trackAtLocation + ", om " + timeUntilEvent + " " + suffix + ", kl. " + new Date(ns.advertisedTime).toLocaleTimeString("sv-SE",localeOptions);
            }
        }
        else {
            if (ns.estimatedTime != "") {
            output += "Tåg " + ns.trainIdent + " beräknas ankomma " + findStationName(ns.locationSignature) + ", spår " + ns.trackAtLocation + ", om " + timeUntilEvent + " " + suffix + ", <b>kl. " + new Date(ns.estimatedTime).toLocaleTimeString("sv-SE", localeOptions) + "</b> <em>(ordinarie tid " + new Date(ns.advertisedTime).toLocaleTimeString("sv-SE",localeOptions) + ")</em>";
            }
            else {
                output += "Tåg " + ns.trainIdent + " beräknas ankomma " + findStationName(ns.locationSignature) + ", spår " + ns.trackAtLocation + ", om " + timeUntilEvent + " " + suffix + ", kl. " + new Date(ns.advertisedTime).toLocaleTimeString("sv-SE", localeOptions);
            }
        }
    
        document.getElementById("nextPosition").innerHTML = output;    
    }
    else {
        document.getElementById("nextPosition").innerHTML = "";
    }
}

function renderTrainSchedule(obj) {
    let schedule = createSchedule(obj);

    output = "";
    output += "<table class='table table-sm'>";
    output += "<thead class='thead-dark'>";
    output += "<tr>";
    output += "<th>Plats</th>";
    output += "<th>Spår</th>";
    output += "<th>Ank.</th>";
    output += "<th>Avg.</th>";
    output += "<th>Info</th>";
    output += "</tr>";
    output += "</thead>";
    output += "<tbody>";
    
    for (let i in schedule) {
        let trackAtLocation;
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
        output += "<td><a href='station.html' onclick='saveData(\"location\",\"" + schedule[i].locationSignature + "\");'>" + findStationName(schedule[i].locationSignature) + "</a></td>";
        output += "<td>" + trackAtLocation + "</td>";
        output += "<td>";
        output += schedule[i].advertisedArrivalTime + "";
        if (schedule[i].estimatedArrivalTime || schedule[i].actualArrivalTime) {
            if (schedule[i].actualArrivalTime) {
                output += "<br><em>" + schedule[i].actualArrivalTime + " (" + schedule[i].diffArrival + ")</em>";
            }
            else {
                output += "<br><b>Ny tid: " + schedule[i].estimatedArrivalTime + "</b>";
            }
        } 
        output += "</td>";
        output += "<td>";
        output += schedule[i].advertisedDepartureTime + "";
        if (schedule[i].estimatedDepartureTime || schedule[i].actualDepartureTime) {
            if (schedule[i].actualDepartureTime) {
                output += "<br><em>" + schedule[i].actualDepartureTime + " (" + schedule[i].diffDeparture + ")</em>";
            } 
            else {
                output += "<br><b>Ny tid: " + schedule[i].estimatedDepartureTime + "</b>";
            }
        }
        output += "</td>";
        output += "<td>";
        for (let j in schedule[i].deviations) {
         output += schedule[i].deviations[j] + "<br>";
        }
        output += "</td>";
        output += "</tr>";
    }
    output += "</table>";
    output += "<p class='text-muted text-right' style='font-size: 6pt !important'><em>Senast uppdaterat: " + new Date().toLocaleTimeString("sv-SE"); + "</em></p>";

    document.getElementById("trainSchedule").innerHTML = output;
    document.getElementById("trainIdentResult").textContent = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].AdvertisedTrainIdent;
}

function renderTrainScheduleForPrint(obj) {
    let schedule = createSchedule(obj);
    console.log(schedule);

    output = "";
    output += "<table class=''>";
    output += "<thead>";
    output += "<tr>";
    output += "<th>Plats</th>";
    output += "<th>Planerat spår</th>";
    output += "<th>Ankomsttid</th>";
    output += "<th>Avg&aring;ngstid</th>";
    output += "<th>Info</th>";
    output += "</tr>";
    output += "</thead>";
    output += "<tbody>";
    
    for (let i in schedule) {
        let trackAtLocation;
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
        output += "<td><a href='station.html' onclick='saveData(\"location\",\"" + schedule[i].locationSignature + "\");'>" + findStationName(schedule[i].locationSignature) + "</a></td>";
        output += "<td>" + trackAtLocation + "</td>";
        output += "<td>";
        output += schedule[i].advertisedArrivalTime;
        if (schedule[i].arrivalTechnicalTimeAtLocation) {
            output += "<br><em>" + schedule[i].arrivalTechnicalTimeAtLocation + "</em>";
        } 
        output += "</td>";
        output += "<td>";
        output += schedule[i].advertisedDepartureTime;
        if (schedule[i].departureTechnicalTimeAtLocation) {
            output += "<br><em>" + schedule[i].departureTechnicalTimeAtLocation + "</em>";
        }
        output += "</td>";
        output += "<td>";
        for (let j in schedule[i].deviations) {
         output += schedule[i].deviations[j] + "<br>";
        }
        output += "</td>";
        output += "</tr>";
    }
    output += "</table>";
    output += "<p class='text-right text-muted' style='font-size: 6pt !important'><em>Senast uppdaterat: " + new Date().toLocaleTimeString("sv-SE"); + "</em></p>";

    document.getElementById("trainSchedule").innerHTML = output;
    document.getElementById("trainIdentResult").textContent = obj.RESPONSE.RESULT[0].TrainAnnouncement[0].AdvertisedTrainIdent;
}

function renderArrivalBoard(obj) {
    let arrivals = createStationBoardRow(obj,"arr");

    output = "";
    output += "<table class='table table-sm'>";
    output += "<thead class='thead-dark'>";
    output += "<tr>";
    output += "<th style='width: 10%'>Tåg</th>";
    output += "<th style='width: 20%'>Från</th>";
    output += "<th style='width: 20%'>Ank.tid</th>";
    output += "<th style='width: 10%'>Spår</th>";
    output += "<th style='width: 40%'>Info</th>";
    output += "</tr>";
    output += "</thead>";
    output += "<tbody>";
    for (let i in arrivals) {
        output += "<tr>";
        output += "<td><a href='train.html' onclick='saveData(\"train\",\"" + arrivals[i].trainIdent + "\",\"" + new Date(arrivals[i].scheduledDate).toLocaleDateString("sv-SE") + "\");'>" + arrivals[i].trainIdent + "</a></td>";
        output += "<td><a href='station.html' onclick='saveData(\"location\",\"" + arrivals[i].endPointLocation + "\");'>" + findStationName(arrivals[i].endPointLocation) + "</a></td>";
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
        for (let j in arrivals[i].trainInformation) {
            output += "" + arrivals[i].trainInformation[j] + "<br>";
        }
        output += "</td>";
        output += "</tr>";
    }
    output += "</tbody>";
    output += "</table>";
    output += "<p class='text-right text-muted' style='font-size: 6pt !important'><em>Senast uppdaterat: " + new Date().toLocaleTimeString("sv-SE"); + "</em></p>";

    document.getElementById("arrivalLocation").innerHTML = findStationName(arrivals[0].locationSignature);
    document.getElementById("arrivalBoard").innerHTML = output;
    document.title = "Stationsvy " + findStationName(arrivals[0].locationSignature);

}

function renderDepartureBoard(obj) {
    let departures = createStationBoardRow(obj,"dep");

    output = "";
    output += "<table class='table table-sm'>";
    output += "<thead class='thead-dark'>";
    output += "<tr>"
    output += "<th style='width: 10%'>Tåg</th>";
    output += "<th style='width: 20%'>Till</th>";
    output += "<th style='width: 20%'>Avg.tid</th>";
    output += "<th style='width: 10%'>Spår</th>";
    output += "<th style='width: 40%'>Info</th>";
    output += "</tr>";
    output += "</thead>";
    output += "<tbody>";
    for (let i in departures) {
        output += "<tr>";
        output += "<td><a href='train.html' onclick='saveData(\"train\",\"" + departures[i].trainIdent + "\",\"" + new Date(departures[i].scheduledDate).toLocaleDateString("sv-SE") + "\");'>" + departures[i].trainIdent + "</a></td>";
        output += "<td><a href='station.html' onclick='saveData(\"location\",\"" + departures[i].endPointLocation + "\");'>" + findStationName(departures[i].endPointLocation) + "</a></td>";
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
        for (let j in departures[i].trainInformation) {
            output += "" + departures[i].trainInformation[j] + "<br>";
        }
        output += "</td>";
        output += "</tr>";
    }
    output += "</tbody>";
    output += "</table>";
    output += "<p class='text-right text-muted' style='font-size: 6pt !important'><em>Senast uppdaterat: " + new Date().toLocaleTimeString("sv-SE"); + "</em></p>";

    document.getElementById("departureLocation").innerHTML = findStationName(departures[0].locationSignature);
    document.getElementById("departureBoard").innerHTML = output;
}

function renderStationMessages(obj) {
    let message = createStationMessageList(obj);
    output = "";
    for (let i in message) {
        output += "<div class='card mb-3'>"
        output += "<div class='card-header'><i class='fas fa-exclamation-circle'></i>&nbsp;&nbsp;" + message[i].header + "</div>";
        output += "<div class='card-body'>";
        output += "<p>" + message[i].description + "</p>";
        if (message[i].startDateTime != "") {
            output += "<small class='text-muted'>";
            output += "<i class='far fa-clock'></i> Starttid: " + new Date(message[i].startDateTime).toLocaleString("sv-SE");
            if (message[i].estimatedEndDateTime != "") {
                output += "<br><i class='far fa-clock'></i> Beräknat klart: " + new Date(message[i].estimatedEndDateTime).toLocaleString("sv-SE");
            }
            if (message[i].updatedDateTime != "") {
                output += "<br><i class='far fa-clock'></i> Senast uppdaterat: " + new Date(message[i].updatedDateTime).toLocaleString("sv-SE");
            }
            output += "</small>";
        }
        output += "</div>";
        output += "</div>";
    }

    if (message.length > 0) {
        document.getElementById("stationMessages").innerHTML = output;
        document.getElementById("messageBoard").style.display = "block";
    } else {
        document.getElementById("messageBoard").style.display = "none";
    }
}