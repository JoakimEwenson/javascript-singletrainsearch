/**
 * A first try at navigating the Trafikverket Open API using JavaScript/JQuery.
 *
 * @file Main JS-source file for the project
 * @version 0.1
 * @author Joakim Ewenson <joakim@ewenson.se>
 * @license MIT license
 *
 * @description
 * This is my first attempt at using JS for something usefull and I am sure that
 * it is full of bad/improper code and unnecesary functions as well as a few bugs
 * and a TODO-list of future functions and error handling.
 * Please do keep in mind that I've only been coding properly in JavaScript for
 * a few weeks by the time that this was produced.
 */

// API key to access data. Get yours at https://api.trafikinfo.trafikverket.se/
var apiKey = "dfc3b8374d774d5e94655bcd32d7c5c3";

// Settings for the damn JavaScript DateTime...
var localeOptions = { hour: '2-digit', minute: '2-digit' }

// Set up empty global variables for later use
var searchTrainIdent = "";
var searchDate = "";
var trainIdent = "";

// Debug-bool for setting up refresh later
var runDebug = false;

// Fixing the timezone issues coming from the API results
var currentTimestamp = new Date();
var timezoneOffset = currentTimestamp.getTimezoneOffset();
var offset = "";
if (timezoneOffset == -60) {
    offset = "+01:00";
} else if (timezoneOffset == -120) {
    offset = "+02:00";
} else {
    offset = "";
}

// TrainSchedule Object
class TrainSchedule {
    constructor() {
        this.trainIdent = "";
        this.technicalTrainIdent = "";
        this.locationSignature = "";
        this.arrivalTrackAtLocation = "";
        this.departureTrackAtLocation = "";
        this.arrivalAdvertisedTimeAtLocation = "";
        this.departureAdvertisedTimeAtLocation = "";
        this.arrivalTimeAtLocation = "";
        this.departureTimeAtLocation = "";
        this.arrivalTimeAtLocation = "";
        this.departureTimeAtLocation = "";
        this.currentArrivalState = "";
        this.currentDepartureState = "";
        this.deviations = "";
        this.otherInfo = "";
    }
}
// Create new TrainSchedule object
var ts = new TrainSchedule();


// Set up page and AJAX settings
$(document).ready(function () {
    // Load stored train ident from sessionStorage
    if (sessionStorage.getItem('trainIdent')) {
        trainIdent = sessionStorage.getItem('trainIdent');
        document.getElementById("trainIdent").value = trainIdent;
        //getSingleTrainState(trainIdent);
        //getSingleTrainSchedule(trainIdent);
    }
    // Set up Cross domain requests
    $.support.cors = true
    // Collect fields for error data
    var errorCard = document.getElementById("error");
    var errorField = document.getElementById("errorMsg");
    // Set the date input field to todays date in format (YYYY-MM-DD)
    $("#searchDate").val(getToday());
    // Run the AJAX setup
    try {
        $.ajaxSetup({
            url: "https://api.trafikinfo.trafikverket.se/v2/data.json",
            // Async needs to be false for the script to run i proper order
            async: false,
            error: function (msg) {
                if (msg.statusText == "abort") return;
                errorMsg = "Ett fel uppstod: " + msg.statusText + "\n" + msg.responseText;
                errorField.textContent = errorMsg;
                errorCard.style.display = "block";
            }
        });
    }
    catch (e) {
        // TODO: Add proper error handling
        errorMsg = "Ett fel uppstod vid intialisering: " + e;
        errorField.textContent = errorMsg;
        errorCard.style.display = "block";
    }
    // Catch the submit click, collect necesary form data and run the functions
    $("#searchTrain").click(function (event) {
        event.preventDefault();
        trainIdent = document.getElementById("trainIdent").value;
        searchDate = document.getElementById("searchDate").value;
        // Run the functions
        getSingleTrainState(trainIdent);
        getSingleTrainSchedule(trainIdent);
        // Write the Train Ident to the headers
        document.getElementById("currentStateTrainIdent").textContent = trainIdent;
        document.getElementById("scheduleTrainIdent").textContent = trainIdent;
        // Write train ident to sessionStorage to save in browser session
        sessionStorage.setItem('trainIdent',trainIdent);
    });
});

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

/*
This function return current state, if train is on schedule or not.
It is calculated by comparing the advertised time agains actual time at
location and returns a positive or negative number with no decimals.
*/
function getCurrentTrainState(advertisedTimeAtLocation, timeAtLocation) {
    var advertised = new Date(advertisedTimeAtLocation);
    var actual = new Date(timeAtLocation);
    var diff = (advertised - actual);

    return Math.floor((diff / 1000) / 60);
}

// Collect data from Trafikverket to get current train state
function getSingleTrainState(searchTrainIdent) {
    // Check if date is set and if not, return todays date (YYYY-MM-DD)
    if (searchDate == null) {
        searchDate = getToday();
    }
    if (trainIdent == null) {
        trainIdent = searchTrainIdent;
    }
    // Set up API request
    var xmlRequest = "<REQUEST>" +
        "<LOGIN authenticationkey='" + apiKey + "' />" +
            "<QUERY objecttype='TrainAnnouncement' schemaversion='1.5' limit='1' orderby='TimeAtLocation desc'>" +
                "<FILTER>" +
                    "<EQ name='AdvertisedTrainIdent' value='" + searchTrainIdent + "' />" +
                    "<EQ name='ScheduledDepartureDateTime' value='" + searchDate + "' />" +
                    "<EXISTS name='TimeAtLocation' value='true' />" +
                "</FILTER>" +
                "<INCLUDE>ActivityType</INCLUDE>" +
                "<INCLUDE>AdvertisedTimeAtLocation</INCLUDE>" +
                "<INCLUDE>AdvertisedTrainIdent</INCLUDE>" +
                "<INCLUDE>LocationSignature</INCLUDE>" +
                "<INCLUDE>ScheduledDepartureDateTime</INCLUDE>" +
                "<INCLUDE>TechnicalTrainIdent</INCLUDE>" +
                "<INCLUDE>TimeAtLocation</INCLUDE>" +
            "</QUERY>" +
        "</REQUEST>";
    // Run AJAX request
    $.ajax({
        type: "POST",
        contentType: "text/xml",
        data: xmlRequest
    })
    // If successfull, process data
    .done(function (response) {
        renderSingleTrainState(response.RESPONSE.RESULT[0].TrainAnnouncement);
    })
    // If unsuccessfull, report error in log.
    .fail(function (ex) {
        // TODO: Add proper error handling...
        console.log(ex);
    });
    // Set a repeater
    // TODO: Set a breakpoint for the repeater if final destination is reached
    setTimeout("getSingleTrainState(trainIdent)", 20000);
}

// Collect data from Trafikverket to display train schedule
function getSingleTrainSchedule(searchTrainIdent) {
    // Check if date is set and if not, return todays date (YYYY-MM-DD)
    if (searchDate == null) {
        searchDate = getToday();
    }
    // Set up API request
    var xmlRequest = "<REQUEST>" +
        "<LOGIN authenticationkey='" + apiKey + "' />" +
            "<QUERY objecttype='TrainAnnouncement' schemaversion='1.5' orderby='AdvertisedTimeAtLocation asc, ActivityType asc'>" +
                "<FILTER>" +
                    //"<EQ name='Advertised' value='true' />" +
                    "<EQ name='AdvertisedTrainIdent' value='" + searchTrainIdent + "' />" +
                    "<EQ name='ScheduledDepartureDateTime' value='" + searchDate + "' />" +
                "</FILTER>" +
                "<EXCLUDE>ActivityId</EXCLUDE>" +
                "<EXCLUDE>ViaToLocation</EXCLUDE>" +
                "<EXCLUDE>WebLink</EXCLUDE>" +
                "<EXCLUDE>WebLinkName</EXCLUDE>" +
            "</QUERY>" +
        "</REQUEST>";
    // Run AJAX request
    $.ajax({
        type: "POST",
        contentType: "text/xml",
        data: xmlRequest
    })
    // If successfull, process data
    .done(function (response) {
        renderSingleTrainSchedule(response.RESPONSE.RESULT[0].TrainAnnouncement);
    })
    // If unsuccessfull, report error in log.
    .fail(function (ex) {
        // TODO: Add proper error handling...
        console.log(ex);
    });
    // Check that debug bool is not true to avoid running requests while debuging
    if (!runDebug) {
        // TODO: Set a breakpoint for the repeater if final destination is reached
        setTimeout("getSingleTrainSchedule(trainIdent)", 60000);
    }
}

/*
This function is for completing the information when ActivityType is "Ankomst"
to get all necesary schedule information on same table row.
*/
function getSingleTrainScheduleCompletion(searchTrainIdent, searchDate, searchLocation) {
    // Set up API request to get necesary data
    var xmlRequest = "<REQUEST>" +
        "<LOGIN authenticationkey='" + apiKey + "' />" +
            "<QUERY objecttype='TrainAnnouncement' schemaversion='1.5'>" +
                "<FILTER>" +
                    "<EQ name='AdvertisedTrainIdent' value='" + searchTrainIdent + "' />" +
                    "<EQ name='ActivityType' value='Avgang' />" +
                    "<EQ name='LocationSignature' value='" + searchLocation + "' />" +
                    "<EQ name='ScheduledDepartureDateTime' value='" + searchDate + "' />" +
                "</FILTER>" +
                "<INCLUDE>AdvertisedTimeAtLocation</INCLUDE>" +
                "<INCLUDE>AdvertisedTrainIdent</INCLUDE>" +
                "<INCLUDE>LocationSignature</INCLUDE>" +
                "<INCLUDE>TimeAtLocation</INCLUDE>" +
                "<INCLUDE>TrackAtLocation</INCLUDE>" +
            "</QUERY>" +
        "</REQUEST>";
    // Run AJAX request
    $.ajax({
        type: "POST",
        contentType: "text/xml",
        data: xmlRequest
    })
    // If successfull, process data
    .done(function (response) {
        renderCompletion(response.RESPONSE.RESULT[0].TrainAnnouncement);
    })
    // If unsuccessfull, report error in log.
    .fail(function (ex) {
        // TODO: Add proper error handling...
        console.log(ex);
    });
}

function getStationName(searchLocationSignature) {
    var output = "";
    // Set up API request
    var xmlRequest = "<REQUEST>" +
        "<LOGIN authenticationkey='" + apiKey + "' />" +
            "<QUERY objecttype='TrainStation' schemaversion='1'>" +
                "<FILTER>" +
                    "<EQ name='LocationSignature' value='" + searchLocationSignature + "' />" +
                "</FILTER>" +
                "<INCLUDE>AdvertisedLocationName</INCLUDE>" +
            "</QUERY>" +
        "</REQUEST>";

    // Run AJAX request
    $.ajax({
        type: "POST",
        contentType: "text/xml",
        data: xmlRequest
    })
    // If successfull, process data
    .done(function(response) {
        //console.log(response.RESPONSE.RESULT[0].TrainStation[0].AdvertisedLocationName);
        output = response.RESPONSE.RESULT[0].TrainStation[0].AdvertisedLocationName;
    })
    // If unsuccessfull, report error in log
    .fail(function (ex) {
        console.log(ex);
    });

    return output;
}

// Function for completing the TrainSchedule Object
function renderCompletion(announcement) {
    $(announcement).each(function (iterator, item) {
        ts.departureTrackAtLocation = item.TrackAtLocation;
        ts.locationSignature = item.LocationSignature;
        ts.departureAdvertisedTimeAtLocation = new Date(item.AdvertisedTimeAtLocation).toLocaleTimeString("sv-SE", localeOptions);
        ts.departureTimeAtLocation = (item.TimeAtLocation) ? new Date(item.TimeAtLocation).toLocaleTimeString("sv-SE", localeOptions) : "";
        ts.currentDepartureState = getCurrentTrainState(item.AdvertisedTimeAtLocation, item.TimeAtLocation);
        //console.table(ts);
    });
}

/*
This is the main train schedule function.
It will collect necesary data from the API and fill the TrainSchedule object with it.
When complete, it will run a function that render the table row and outputs it within the table.
*/
function renderSingleTrainSchedule(announcement) {
    // Set up variables for use in output
    var currentLocationSignature;
    var outputMsg = "";

    // Collect data and fill the TrainSchedule object
    $(announcement).each(function (iterator, item) {
        // Reset object data
        ts.trainIdent = "";
        ts.technicalTrainIdent = "";
        ts.locationSignature = "";
        ts.arrivalTrackAtLocation = "";
        ts.departureTrackAtLocation = "";
        ts.arrivalAdvertisedTimeAtLocation = "";
        ts.departureAdvertisedTimeAtLocation = "";
        ts.arrivalTimeAtLocation = "";
        ts.departureTimeAtLocation = "";
        ts.arrivalTimeAtLocation = "";
        ts.departureTimeAtLocation = "";
        ts.currentArrivalState = "";
        ts.currentDepartureState = "";
        ts.deviations = "";
        ts.otherInfo = "";

        // Collect new data and start filling the object
        ts.trainIdent = item.AdvertisedTrainIdent;
        ts.technicalTrainIdent = item.TechnicalTrainIdent;
        ts.locationSignature = item.LocationSignature;

        // Get deviations
        ts.deviations = "";
        // Check if there is any new estimated times and put that into deviations column.
        if (item.EstimatedTimeAtLocation != null) {
            var estimatedTimeAtLocation = "" + item.EstimatedTimeAtLocation;
            estimatedTimeAtLocation = new Date(estimatedTimeAtLocation);
            ts.deviations += "<b>Ny tid: " + estimatedTimeAtLocation.toLocaleTimeString("sv-SE", localeOptions) + "</b><br>";
        }
        // Collect any other deviations if available
        $(item.Deviation).each(function (i, deviation) {
            ts.deviations += deviation.Description + "<br>";
        });

        // Collect any other info if available
        $(item.OtherInformation).each(function (i, otherInfo) {
            ts.deviations += otherInfo.Description + "<br>";
        })

        // Check if activity type is ankomst or avgang and fill the data accordingly
        if (item.ActivityType == "Ankomst") {
            ts.arrivalTrackAtLocation = (item.TrackAtLocation) ? item.TrackAtLocation : ""; // TODO: Create logic to handle different arrival/departure tracks
            ts.arrivalAdvertisedTimeAtLocation = new Date(item.AdvertisedTimeAtLocation).toLocaleTimeString("sv-SE", localeOptions);
            ts.arrivalTimeAtLocation = (item.TimeAtLocation) ? new Date(item.TimeAtLocation).toLocaleTimeString("sv-SE", localeOptions) : "";
            ts.currentArrivalState = getCurrentTrainState(item.AdvertisedTimeAtLocation, item.TimeAtLocation);

            // Run the completion function to collect missing data from matching "Avgang"-return
            getSingleTrainScheduleCompletion(ts.trainIdent, item.ScheduledDepartureDateTime, ts.locationSignature);

            // Check if track is set
            if (!ts.arrivalTrackAtLocation) {
                ts.arrivalTrackAtLocation = "";
            }
            if (!ts.departureTrackAtLocation) {
                ts.departureTrackAtLocation = "";
            }

            // Check if currentState is a number or not
            if (isNaN(ts.currentArrivalState)) {
                ts.currentArrivalState = "";
            }
            if (isNaN(ts.currentDepartureState)) {
                ts.currentDepartureState = "";
            }
            // Render table row
            renderScheduleTable();
        }
        // Check if activity type is "Avgang" and not the same location as previous row
        else if (item.ActivityType == "Avgang" && item.LocationSignature != currentLocationSignature) {
            ts.departureTrackAtLocation = (item.TrackAtLocation) ? item.TrackAtLocation : "";
            ts.departureAdvertisedTimeAtLocation = new Date(item.AdvertisedTimeAtLocation).toLocaleTimeString("sv-SE", localeOptions);
            ts.departureTimeAtLocation = (item.TimeAtLocation) ? new Date(item.TimeAtLocation).toLocaleTimeString("sv-SE", localeOptions) : "";
            ts.currentDepartureState = getCurrentTrainState(item.AdvertisedTimeAtLocation, item.TimeAtLocation);
            // Check if currentState is a number or not
            if (isNaN(ts.currentDepartureState)) {
                ts.currentDepartureState = "";
            }
            // Check if track is set
            if (!ts.departureTrackAtLocation) {
                ts.departureTrackAtLocation = "";
            }
            // Render table row
            renderScheduleTable();
        }

        // This is the function that renders table rows when TrainSchedule object
        // is full.
        function renderScheduleTable() {
            // Check if arrival track and departure track differ
            var trackAtLocation = "";
            if (ts.arrivalTrackAtLocation) {
                if (!ts.departureTrackAtLocation) {
                    trackAtLocation = ts.arrivalTrackAtLocation;
                }
                else if (ts.departureTrackAtLocation == "x") {
                    trackAtLocation = ts.arrivalTrackAtLocation;
                }
                else if (ts.departureTrackAtLocation == ts.arrivalTrackAtLocation) {
                    trackAtLocation = ts.arrivalTrackAtLocation;
                }
            }
            if (ts.departureTrackAtLocation) {
                if (!ts.arrivalTrackAtLocation) {
                    trackAtLocation = ts.departureTrackAtLocation;
                }
                else if (ts.arrivalTrackAtLocation == "x") {
                    trackAtLocation = ts.departureTrackAtLocation;
                }
                else if (ts.arrivalTrackAtLocation == ts.departureTrackAtLocation) {
                    trackAtLocation = ts.departureTrackAtLocation;
                }
            }
            // Fill output string
            outputMsg += "<tr>";
            outputMsg += "<td>" + getStationName(ts.locationSignature) + "</td>";
            outputMsg += "<td>" + trackAtLocation + "</td>";
            outputMsg += "<td>" + ts.arrivalAdvertisedTimeAtLocation + "<br><i>" + ts.arrivalTimeAtLocation + "</i></td>";
            outputMsg += "<td>" + ts.departureAdvertisedTimeAtLocation + "<br><i>" + ts.departureTimeAtLocation + "</i></td>";
            outputMsg += "<td>" + ts.currentArrivalState + "</td>";
            outputMsg += "<td>" + ts.currentDepartureState + "</td>";
            outputMsg += "<td>" + ts.deviations + "</td>";
            outputMsg += "</tr>";
            // Write to page
            document.getElementById("singleTrainSchedule").innerHTML = outputMsg;
            document.getElementById("scheduleUpdated").textContent = new Date().toLocaleTimeString("sv-SE", localeOptions);
            document.getElementById("schedule").style.display = "block";
        }

        // Set up the location signature used in each iteration for comparison in next
        currentLocationSignature = item.LocationSignature;
    });
}

// This function is for rendering simple status message with last known position
// of the train. Also setting the page title and header using this data.
function renderSingleTrainState(announcement) {
    // Set up variables for later use in output
    var currentPosition = "Sök enskilt tåg";
    var outputMsg = "";
    var prefix = "";
    var trainIdent = "";

    $(announcement).each(function (iterator, item) {
        trainIdent = item.AdvertisedTrainIdent;
        // Check if ActivityType is "Ankomst" and then prefix the time with * to indicate it in output
        if (item.ActivityType == "Ankomst") {
            prefix = "*";
        }
        // Create a string for where the last known position of the train
        currentPosition = "Status tåg " + item.AdvertisedTrainIdent + ": " + item.LocationSignature + " " + prefix + getCurrentTrainState(item.AdvertisedTimeAtLocation, item.TimeAtLocation);
        // Get and output the scheduled date for the train (YYYY-MM-DD)
        var date = new Date(item.ScheduledDepartureDateTime);
        outputMsg += "<b>Datum:</b> " + date.toLocaleDateString("sv-SE") + "<br>";
        // Check if there is a technical train ident and if so, output it.
        if (item.TechnicalTrainIdent) {
            outputMsg += "<b>Tekniskt tågnummer:</b> " + item.TechnicalTrainIdent + "<br>";
        }
        // Add to the output string the last known position, the current state and lataste update time.
        outputMsg += "<b>Aktuell position:</b> " + getStationName(item.LocationSignature) + " " + prefix + getCurrentTrainState(item.AdvertisedTimeAtLocation, item.TimeAtLocation) + "<br>";
        outputMsg += "<b>Senast uppdaterat:</b> " + new Date().toLocaleTimeString("sv-SE", localeOptions);
    });
    // Write to page/title
    document.title = currentPosition;
    document.getElementById("singleTrainState").innerHTML = outputMsg;
    document.getElementById("status").style.display = "block";
    document.getElementById("lastUpdated").style.display = "none";
}