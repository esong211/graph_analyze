Graph = require("./graph.js");

//initial variable declarations
var express = require('express');
var app = express();
var fs = require("fs");
var graph = new Graph();

var bodyParser = require('body-parser')
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.use(bodyParser.raw());
graph.createGraph();


/*
    Writes data into json file
    content: is a content to be written
 */
function writeToFile (content){
    fs.writeFile('output.json', content, function (err) {
        if (err) {
            console.log("Failed to write a file");
        }
        else {
            console.log("Successfully written actors file");
        }
    })
}

/*
    Modify input string. Eliminate unnecessary characters from string
 */
function modifyString (string){
    var value = string.replace(/"/g, "");
    value = value.replace(/&/g, " ");
    value = value.replace(/_/g, " ");

    return value;
}

/*
    GET endpoint for /actors case
 */
app.get('/actors', function (req, res) {
    var actors = [];
    var value;

    if (req.query.name !== undefined){
        value = modifyString(req.query.name);
        actors = graph.filterActor("name", value);
    }
    else if (req.query.age !== undefined){
        value = modifyString(req.query.age);
        actors = graph.filterActor("age", value);
    }
    else if (req.query.total_gross !== undefined){
        value = modifyString(req.query.total_gross);
        actors = graph.filterActor("total_gross", value);
    }
    else if (req.query.movies !== undefined){
        value = modifyString(req.query.movies);
        actors = graph.filterActor("movies", value);
    }
    else {
        res.sendStatus(400);
        return;
    }
    console.log(actors);
    writeToFile(JSON.stringify(actors));
    res.sendStatus(200);
});

/*
    GET endpoint for /actors/:name case
 */
app.get('/actors/:name', function (req, res) {
    var name = req.params.name;
    name = modifyString(name);
    var actor = graph.findActor(name);
    if (actor === null){
        res.sendStatus(400);
        return;
    }
    else {
        console.log(actor);
        writeToFile(JSON.stringify(actor));
        res.sendStatus(200);
    }
});

/*
    GET endpoint for /movies case
 */
app.get('/movies', function (req, res) {
    var movies = [];
    var value;
    if (req.query.name !== undefined){
        value = modifyString(req.query.name);
        movies = graph.filterMovie("name", value);
    }
    else if (req.query.wiki_page !== undefined){
        value = modifyString(req.query.wiki_page);
        movies = graph.filterMovie("wiki_page", value);
    }
    else if (req.query.box_office !== undefined){
        value = modifyString(req.query.box_office);
        movies = graph.filterMovie("box_office", value);
    }
    else if (req.query.year !== undefined){
        value = modifyString(req.query.year);
        movies = graph.filterMovie("year", value);
    }
    else if (req.query.actors !== undefined){
        value = modifyString(req.query.actors);
        movies = graph.filterMovie("actors", value);
    }
    else {
        res.sendStatus(400);
        return;
    }
    console.log(movies);
    writeToFile(JSON.stringify(movies));
    res.sendStatus(200);
});

/*
    GET endpoint for /movies:name case
 */
app.get('/movies/:name', function (req, res) {
    var name = req.params.name;
    name = modifyString(name);
    console.log(name);
    var movie = graph.findMovie(name);
    //console.log(graph.vertices);
    //console.log(movie);
    if (movie === null){
        res.sendStatus(400);
    }
    else {
        console.log(movie);
        writeToFile(JSON.stringify(movie));
        res.sendStatus(200);
    }
});

/*
    Extract actor data from given body.
    req: is a body of information
 */
function extractActorData(req, newName, newAge, newGross, newMovies) {
    if (req.body.name !== undefined) {
        newName = req.body.name;
    }
    if (req.body.age !== undefined) {
        newAge = req.body.age
    }
    if (req.body.total_gross !== undefined) {
        newGross = req.body.total_gross;
    }
    if (req.body.movies !== undefined) {
        newMovies = req.body.movies;
    }
    return {newName: newName, newAge: newAge, newGross: newGross, newMovies: newMovies};
}

/*
    PUT endpoint for /actors/:name
 */
app.put('/actors/:name', function (req, res){
    var name = req.params.name;
    name = modifyString(name);
    var actor = graph.findActor(name);

    var newName = null;
    var newAge = null;
    var newGross = null;
    var newMovies = null;

    if (actor !== null){
        var __ret = extractActorData(req, newName, newAge, newGross, newMovies);
        newName = __ret.newName;
        newAge = __ret.newAge;
        newGross = __ret.newGross;
        newMovies = __ret.newMovies;
        graph.modifyActor(actor.name, newName, newAge, newGross, newMovies);
        console.log(JSON.stringify(graph.findActor(name)) + ": Modified successfully");
        writeToFile(JSON.stringify(graph));
        res.sendStatus(200);
    }
    else {
        res.sendStatus(400);
    }

});

/*
    Extract movie data from given body.
    req: is a body of information.
 */
function extractMovieData(req, newName, newWiki_page, newBox, newYear, newActors) {
    if (req.body.name !== undefined) {
        newName = req.body.name;
    }
    if (req.body.wiki_page !== undefined) {
        newWiki_page = req.body.wiki_page
    }
    if (req.body.box_office !== undefined) {
        newBox = req.body.box_office;
    }
    if (req.body.year !== undefined) {
        newYear = req.body.year;
    }
    if (req.body.actors !== undefined) {
        newActors = req.body.actors;
    }
    return {newName: newName, newWiki_page: newWiki_page, newBox: newBox, newYear: newYear, newActors: newActors};
}

/*
    PUT endpoint for /movies/:name
 */
app.put('/movies/:name', function (req, res){
    var name = req.params.name;
    name = modifyString(name);
    var movie = graph.findMovie(name);

    var newName = null;
    var newWiki_page = null;
    var newBox = null;
    var newYear = null;
    var newActors = null;
    if (movie !== null){
        var __ret = extractMovieData(req, newName, newWiki_page, newBox, newYear, newActors);
        newName = __ret.newName;
        newWiki_page = __ret.newWiki_page;
        newBox = __ret.newBox;
        newYear = __ret.newYear;
        newActors = __ret.newActors;
        graph.modifyMovie(movie.name, newName, newWiki_page, newBox, newYear, newActors);
        console.log(JSON.stringify(graph.findMovie(name)) + ": Modified successfully");
        writeToFile(JSON.stringify(graph));
        res.sendStatus(200);
    }
    else {
        res.sendStatus(400);
    }

});

/*
    POST endpoint for /actors
 */
app.post("/actors", function (req, res){
    if (req.body.name === undefined){
        res.sendStatus(400);
        return;
    }
    var age = 0;
    var name = "";
    var gross = 0;
    var movie = [];
    var __ret = extractActorData(req, name, age, gross, movie);
    age = __ret.newAge;
    gross = __ret.newGross;
    movie = __ret.newMovies;

    var actorObj = "{\"json_class\": \"Actor\", \"name\":" + "\"" + req.body.name + "\"" + ", \"age\":" + age + ", \"total_gross\":" + gross + ", \"movies\": [] }";
    actorObj = JSON.parse(actorObj);
    actorObj.movies = movie;
    graph.addActorObj(actorObj);
    graph.createGraph();
    writeToFile(JSON.stringify(graph));
    //console.log(graph);
    res.sendStatus(201);
});

/*
    POST endpoint for /movies
 */
app.post("/movies", function (req, res){
    if (req.body.name === undefined || req.body.json_class === undefined){
        res.sendStatus(400);
        return;
    }
    var newName = null;
    var newWiki_page = null;
    var newBox = 0;
    var newYear = 0;
    var newActors = [];
    var __ret = extractMovieData(req, newName, newWiki_page, newBox, newYear, newActors);
    newName = __ret.newName;
    newWiki_page = __ret.newWiki_page;
    newBox = __ret.newBox;
    newYear = __ret.newYear;
    newActors = __ret.newActors;

    var movieObj = "{\"json_class\": \"Movie\", \"name\":" + "\"" + req.body.name + "\"" + ", \"wiki_page\":" + newWiki_page + ", \"box_office\":" + newBox + ", \"year\":" +newYear+ ", \"actors\":[] }";
    movieObj = JSON.parse(movieObj);
    movieObj.actors = newActors;
    graph.addMovieObj(movieObj);
    graph.createGraph();
    writeToFile(JSON.stringify(graph));
    res.sendStatus(201);
});

/*
    DELETE endpoint for /actors/:name
 */
app.delete("/actors/:name", function (req, res){
    var name = modifyString(req.params.name);
    var actor = graph.findActor(name);
    if (actor === null){
        res.sendStatus(204);
        return;
    }
    else {
        graph.removeVertex(JSON.stringify(actor));
        graph.removeEdge(JSON.stringify(actor));
        //console.log(graph);
        writeToFile(JSON.stringify(graph));
        res.sendStatus(202);
    }
});

/*
    DELETE endpoint for /movies/:name
 */
app.delete("/movies/:name", function (req, res){
    var name = modifyString(req.params.name);
    var movie = graph.findMovie(name);
    if (movie === null){
        res.sendStatus(204);
        return;
    }
    else {
        graph.removeVertex(JSON.stringify(movie));
        graph.removeEdge(JSON.stringify(movie));
        writeToFile(JSON.stringify(graph));
        res.sendStatus(202);
    }
});

/*
    Open a server
 */
var server = app.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("app listening at http://%s:%s", host, port)
});

module.exports = server;