class TrainScheduleRow{
    constructor(trainIdent) {
        this.locationSignature = "";
        this.activityType = "";
        this.advertisedTrainIdent = trainIdent;

        this.arrivalTrackAtLocation = "";
        this.departureTrackAtLocation = "";
        
        this.arrivalAdvertisedTimeAtLocation = "";
        this.departureAdvertisedTimeAtLocation = "";
        
        this.arrivalEstimatedTimeAtLocaiton = "";
        this.departureEstimatedTimeAtLocation = "";
        
        this.arrivalTimeAtLocation = "";
        this.departureTimeAtLocation = "";
        
        this.arrivalDeviation = "";
        this.departureDeviation = "";
    }
}