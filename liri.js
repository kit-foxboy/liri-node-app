//dependencies
require("dotenv").config();
var request = require("request");
var moment = require("moment");
var Spotify = require("node-spotify-api");
var keys = require("./keys");

//run app
main();

function main() {

    //get cli arguments
    var args = process.argv.splice(2);
    var searchString = args.splice(1).join(" ");

    //run command
    switch(args[0]) {

        case "concert-this":
            searchBandsInTown(searchString);
            break;

        case "spotify-this-song":
            searchSpotify(searchString);
            break;

        default:
            console.log("Invalid command");
    }
}

function searchBandsInTown(bandName) {

    //make http request
    request("https://rest.bandsintown.com/artists/" + bandName + "/events?app_id=codingbootcamp", function(err, response, body) {
        
        //handle error
        if (err) {
            console.log("An error occurred", err);
            return;
        }

        //get data
        var data = JSON.parse(body);
        if (data.length > 0) {

            //output data
            for(var i = 0; i < data.length; i++) {
                
                var event = parseEvent(data[i]);

                console.log("----------------");
                console.log("Venue: " + event.venue);
                console.log("Location: " + event.location);
                console.log("Date: " + event.date);
            }

        } else {
            console.log("No results found");
        }
    });
}

function searchSpotify(songName) {
    
    //set up spotify
    var spotify = new Spotify(keys.spotify);

    //run search
    spotify.search({type: "track", query: songName, limit: 1})
    .then(function(results) {
        
        //check for results
        var items = results.tracks.items;
        if(items.length > 0) {
            
            //parse data
            var album = parseAlbum(items[0]);
            
            //output data
            console.log("Song Name: " + album.song);
            console.log("Artist(s): " + album.artists);
            console.log("Album: " + album.album);
            console.log("Preview URL: " + album.previewURL);

        } else {
            console.log("No results found");
        }
    })
    .catch(function(err) {
        console.log("An error occurred", err);
    });
}

function parseEvent(data) {

    var location = data.venue.city;
    if(data.venue.region !== "") {
        location += " " + data.venue.region;
    }
    return {
        venue: data.venue.name,
        location: location + ", " + data.venue.country,
        date: moment(data.datetime).format("MM/DD/YYYY")
    }
}

function parseAlbum(data) {

    var artists = [];
    for(var i = 0; i < data.artists.length; i++) {
        artists.push(data.artists[i].name);
    }
    var previewURL = (data.preview_url === null) ? "not available" : data.preview_url;

    return {
        song: data.name,
        album: data.album.name,
        artists: artists.join(", "),
        previewURL: previewURL
    }
}