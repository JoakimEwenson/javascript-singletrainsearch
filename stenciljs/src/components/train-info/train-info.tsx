import { Component, h, State } from '@stencil/core';
import * as api from '../../js-api/ApiCollector';

@Component({
  tag: 'train-info',
  styleUrl: 'train-info.css',
})

export class TrainInfo {
  apiKey = "dfc3b8374d774d5e94655bcd32d7c5c3";

  // Set up variables for later
  @State() searchTrainIdent;
  @State() searchDate = api.getToday();
  @State() myTimer;
  @State() trainSchedule = [];
  @State() trainPositionData: any = {};

  componentWillLoad() {
    if (sessionStorage.getItem("searchTrainIdent")) {
      this.searchTrainIdent = sessionStorage.getItem("searchTrainIdent");
      this.searchDate = sessionStorage.getItem("searchDate");
      // document.getElementById("trainIdent").value = searchTrainIdent;
      // document.getElementById("searchDate").value = searchDate;
      console.log("Train ident:" + sessionStorage.getItem("searchTrainIdent"));
      console.log("Date: " + sessionStorage.getItem("searchDate"));
      this.getTrainSchedule();
      this.getTrainPosition(this.searchTrainIdent, this.searchDate);
    }
  }


  getTrainSchedule() {
    clearInterval(this.myTimer);

    // searchTrainIdent = document.getElementById("trainIdent").value;
    // if (document.getElementById("searchDate").value) {
    //   searchDate = document.getElementById("searchDate").value;
    // }
    // else {
    //   searchDate = getToday();
    // }

    // Set up SingleTrain request
    var trainAnnouncementData = "<REQUEST>" +
      "<LOGIN authenticationkey='" + this.apiKey + "' />" +
      "<QUERY objecttype='TrainAnnouncement' schemaversion='1.5' orderby='AdvertisedTimeAtLocation asc, ActivityType asc'>" +
      "<FILTER>" +
      //"<EQ name='Advertised' value='true' />" +
      "<EQ name='AdvertisedTrainIdent' value='" + this.searchTrainIdent + "' />" +
      "<EQ name='ScheduledDepartureDateTime' value='" + this.searchDate + "' />" +
      "</FILTER>" +
      "</QUERY>" +
      "</REQUEST>";

    // Populate page with return
    api.ApiCollector(trainAnnouncementData, (data) => { this.trainSchedule = api.createSchedule(data) });
    // getTrainState(searchTrainIdent, searchDate);
    // getTrainPosition(searchTrainIdent, searchDate);

     this.myTimer = setInterval(function () {
      api.ApiCollector(trainAnnouncementData, (data) => { this.trainSchedule = api.createSchedule(data) });
    //   getTrainState(searchTrainIdent, searchDate);
    //   getTrainPosition(searchTrainIdent, searchDate);
    }, 30000);

    // document.getElementById("schedule").style.display = "block";
    // // Set session storage items
    sessionStorage.setItem("searchTrainIdent", this.searchTrainIdent);
    sessionStorage.setItem("searchDate", this.searchDate);
  }

  getTrainState(searchTrainIdent, searchDate) {
    var trainStateAnnouncementData = "<REQUEST>" +
      "<LOGIN authenticationkey='" + this.apiKey + "' />" +
      "<QUERY objecttype='TrainAnnouncement' schemaversion='1.5' orderby='ActivityType desc' limit='1'>" +
      "<FILTER>" +
      "<EQ name='Advertised' value='true' />" +
      "<EQ name='AdvertisedTrainIdent' value='" + searchTrainIdent + "' />" +
      "<EQ name='ScheduledDepartureDateTime' value='" + searchDate + "' />" +
      "<EXISTS name='TimeAtLocation' value='true' />" +
      "</FILTER>" +
      "</QUERY>" +
      "</REQUEST>";

    api.ApiCollector(trainStateAnnouncementData, () => { console.log });
  }

  getTrainPosition(searchTrainIdent, searchDate) {
    var trainPositionData = "<REQUEST>" +
      "<LOGIN authenticationkey='" + this.apiKey + "' />" +
      "<QUERY objecttype='TrainAnnouncement' schemaversion='1.5' orderby='TimeAtLocation desc' limit='1'>" +
      "<FILTER>" +
      "<EQ name='AdvertisedTrainIdent' value='" + searchTrainIdent + "' />" +
      "<EQ name='ScheduledDepartureDateTime' value='" + searchDate + "' />" +
      "<EXISTS name='TimeAtLocation' value='true' />" +
      "</FILTER>" +
      "</QUERY>" +
      "</REQUEST>";

    api.ApiCollector(trainPositionData, (data) => { this.trainPositionData = data.RESPONSE.RESULT[0].TrainAnnouncement[0]; console.log(this.trainPositionData) });

  }


  handleSubmit(e: Event) {
    e.preventDefault();
    this.getTrainSchedule();
    console.log(this.trainSchedule);
    this.getTrainPosition(this.searchTrainIdent, this.searchDate);
  }

  handleDateChange(e): void {
    this.searchDate = e.target.value;
  }
  handleTrainChange(e): void {
    this.searchTrainIdent = e.target.value;
  }

  render() {
    return (
      <div>
        <header class="w3-container w3-blue">
          <h4>Tidtabellsinformation</h4>
        </header>
        
        <table class="w3-table w3-striped">
          <thead>
            <tr>
              <th><div>Plats</div></th>
              <th><div>Spår</div></th>
              <th><div>Ank.</div></th>
              <th><div>Avg.</div></th>
              <th><div>Diff ank.</div></th>
              <th><div>Diff avg.</div></th>
              <th><div>Info</div></th>
            </tr>
          </thead>
          <tbody>
          {this.trainSchedule.map(t =>
            <tr>
              <td>
                <div>
                  {t.locationSignature}
                </div>
              </td>
              <td>
                <div>
                  {t.departureTrackAtLocation}
                </div>
              </td>
              <td>
                <div>
                  {t.advertisedArrivalTime}<br />
                  {t.actualArrivalTime != 0 ? t.actualArrivalTime : t.estimatedArrivalTime}
                </div>
              </td>
              <td>
                <div>
                  {t.advertisedDepartureTime}<br />
                  {t.actualDepartureTime != 0 ? t.actualDepartureTime : t.estimatedDepartureTime}
                </div>
              </td>
              <td>
                <div>
                  {t.diffArrival}
                </div>
              </td>
              <td>
                <div>
                  {t.diffDeparture}
                </div>
              </td>
              <td>
                <div>
                  {t.deviations}
                </div>
              </td>
            </tr>
          )}
          </tbody>
        </table>

        <form id="searchForm" onSubmit={(e) => this.handleSubmit(e)}>
          <header class="w3-container w3-blue">
            <h4>Sök enskilt tåg</h4>
          </header>
          <div class="w3-container">
            <input id="trainIdent" type="number" value={this.searchTrainIdent} onInput={(e) => this.handleTrainChange(e)} class="w3-input" placeholder="Tågnummer" autofocus /><br />
            <input id="searchDate" type="date" value={this.searchDate} onInput={(e) => this.handleDateChange(e)} class="w3-input" placeholder="Datum (YYYY-MM-DD)" /><br />
            <div class="w3-center">
              <input type="submit" value="H&auml;mta uppgifter" id="searchTrain" />
            </div>
          </div>
        </form>
        <footer class="w3-container">
        <p id="lastUpdated" class="last-updated">
            Senast uppdaterat: {api.timestamp()}
          </p>
        </footer>
    </div>
    );
  }
}
