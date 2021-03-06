//dependencies
require("dotenv").config();
var fs = require("fs");
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

    //run main command
    runCommand(args[0], searchString);
}

function runCommand(command, searchString) {

    //log command
    fs.appendFile("log.txt", "\n" + command + ": " + searchString, function(err) {
        if (err) {
            console.log("An error has occurred.", err);
        }
    });

    //run command
    switch(command) {

        case "concert-this":
            searchBandsInTown(searchString);
            break;

        case "spotify-this-song":
            searchSpotify(searchString);
            break;

        case "movie-this":
            searchOMDB(searchString);
            break;

        case "do-what-it-says":
            searchFromFile();
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
    
    //check search string
    if (songName === "") {
        songName = "The Sign";
    }

    //set up spotify
    var spotify = new Spotify(keys.spotify);

    //run search
    spotify.search({type: "track", query: songName})
    .then(function(results) {
        
        //check for results
        var items = results.tracks.items;
        if(items.length > 0) {
            
            //parse data
            var album = parseAlbum(items[0]);
            
            //output data
            console.log("\nSong Name: " + album.song);
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

function searchOMDB(movieName) {

    //check search string
    if (movieName === "") {
        movieName = "Mr. Nobody";
    }

    //make http request
    request("http://www.omdbapi.com/?apikey=trilogy&t=" + encodeURI(movieName), function(err, response, body) {

        //handle error
        if (err) {
            console.log("An error occurred", err);
            return;
        }

        //get data
        var data = JSON.parse(body);
        if (data.Error) {
            console.log("No results found");
            return;
        }
        var ratings = parseRatings(data.Ratings);

        //display data
        console.log("\nTitle: " + data.Title);
        console.log("Release Year: " + data.Year);
        console.log("IMDB Rating: " + ratings["Internet Movie Database"]);
        console.log("Rotten Tomatoes Rating: " + ratings["Rotten Tomatoes"]);
        console.log("Countries Produced In: " + data.Country);
        console.log("Language: " + data.Language);
        console.log("Plot: " + data.Plot);
        console.log("Actors: " + data.Actors);
    });
}

function searchFromFile() {

    //read file
    fs.readFile("random.txt", function(err, data) {
        
        //handle errors
        if (err) {
            console.log("An error has occurred", err);
            return;
        }

        var input = data.toString().split(',');
        runCommand(input[0], input[1].replace("\"", ""));
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

function parseRatings(data) {

    var ratings = {};
    for(var i = 0; i < data.length; i++) {
        ratings[data[i].Source] = data[i].Value;
    }

    return ratings;
}