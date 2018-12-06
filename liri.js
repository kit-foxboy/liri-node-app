//dependencies
require("dotenv").config();
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

        case 'spotify-this-song':
            spotifySong(searchString);
            break;

        default:
            console.log("Invalid command");
    }
}

function spotifySong(songName) {
    
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
            console.log("Song Name: " + album.song + "\n");
            console.log("Artist(s): " + album.artists + "\n");
            console.log("Album: " + album.album + "\n");
            console.log("Preview URL: " + album.previewURL + "\n");

        } else {
            console.log("No results found");
        }
    })
    .catch(function(err) {
        console.log("An error occurred", err);
    });
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