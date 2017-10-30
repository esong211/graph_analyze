var fs = require("fs");
var plotly = require('plotly')("ssong11", "8YZW2vj8yFwuwj56U5SL");

//initial declaration for variables
var obj_json = fs.readFileSync("data.json", "utf8");
var objs = JSON.parse(obj_json);
var movie_obj = objs[1];
var actor_obj = objs[0];

//initialize logger
var log4js = require('log4js');
log4js.configure({
    appenders: { graph: { type: 'file', filename: 'graph.log' } },
    categories: { default: { appenders: ['graph'], level: 'debug' } }
});
var logger = log4js.getLogger('graph');

// Graph class object constructor
function Graph() {
    this.vertices = [];
    this.edges = [];
}

/*
    Add actor obj to list
    obj: is an obj added to the list
 */
Graph.prototype.addActorObj = function (obj){
    var key = obj.name;
    actor_obj[key] = obj;
};

/*
    Add movie object to list
    obj: is an object to be added to the list
 */
Graph.prototype.addMovieObj = function (obj){
    var key = obj.name;
    movie_obj[key] = obj;
};
/*
    it reads json file and convert it into Json object.
 */
Graph.prototype.readFile = function (path){
    obj_json = fs.readFileSync(path, "utf8");
    objs = JSON.parse(obj_json);
    movie_obj = objs[1];
    actor_obj = objs[0];
    logger.info("Successfully constructed a graph");
};

/*
    add a vertex into a graph.
    vertex: a vertex to be added into a graph.
 */
Graph.prototype.addVertex = function (vertex) {
    logger.info("addVertex was called: " + vertex);
    if (!this.containVertex(vertex)) {
        this.vertices.push(vertex);
        this.edges[vertex] = [];
    }
};

/*
    remove a vertex from a graph.
    vertex: a vertex to be added into a graph.
 */
Graph.prototype.removeVertex = function (vertex) {
    logger.info("removeVertex was called: " + vertex);
    this.vertices = this.vertices.filter (function(item){
        return item !== vertex;
    })
};

/*
    check if a graph contains the given vertex
    returns TRUE if it contains. FALSE otherwise.
 */
Graph.prototype.containVertex = function (vertex) {
    logger.info("containVertex was called: " + vertex);
    for (var x = 0; x < this.vertices.length; x ++) {
        if (this.vertices[x] === vertex) {
            return true;
        }
    }
    return false;
};

/*
    add edge between two vertices.
 */
Graph.prototype.addEdge = function (vertex1, vertex2) {
    logger.info("addEdge was called: " + vertex1 + ", " + vertex2);
    this.edges[vertex1].push(vertex2);
    this.edges[vertex2].push(vertex1);
};

/*
    remove edge between two vertices.
 */
Graph.prototype.removeEdge = function (vertex){
    this.edges[vertex] = undefined;
    for (var key in this.edges){
        if (this.edges.hasOwnProperty(key)){
            var list = this.edges[key];
            for (var i = 0; i < list; i ++){
                if (list.name === vertex.name){
                    list.splice(i,1);
                }
            }
        }
        this.edges[key] = list;
    }
};

//getter for movie obj
Graph.prototype.getMovieObj = function () {
    return movie_obj;
};

//getter for actor obj
Graph.prototype.getActorObj = function () {
    return actor_obj;
};

/*
    Find a actor from jsonActor list
    actor: object to be found in the list.
 */
Graph.prototype.findActor = function (actor_name) {
    for (var key in actor_obj){
        if (actor_obj.hasOwnProperty(key)){
            if (actor_name === key) {
                return actor_obj[key];
            }
        }
    }
    return null;
};

/*
    Find a movie from jsonMovie list
    movie: object to be found in the list.
 */
Graph.prototype.findMovie = function(movie_name){
    for (var key in movie_obj){
        if (movie_obj.hasOwnProperty(key)){
            if (movie_name === key) {
                return movie_obj[key];
            }
        }
    }
    return null;
};


/*
    This method creates a graph using objects in jsonMovie and jsonActor
 */
Graph.prototype.createGraph = function () {
    logger.trace("Entering createGraph");
    var found = false;
    for (var movie_key in movie_obj){
        if (movie_obj.hasOwnProperty(movie_key)){
            var mobj = movie_obj[movie_key];
            var actor_list = mobj.actors;
            if (actor_list !== undefined && actor_list !== null) {
                for (var j = 0; j < actor_list.length; j++) {
                    var actor = this.findActor(actor_list[j]);
                    if (actor !== null) {
                        if (found === false) {
                            this.addVertex(JSON.stringify(mobj));
                            found = true;
                        }
                        this.addVertex(JSON.stringify(actor));
                        this.addEdge(JSON.stringify(mobj), JSON.stringify(actor));
                    }
                }
            }
            found = false;
        }
    }

    found = false;
    for (var actor_key in actor_obj){
        if (actor_obj.hasOwnProperty(actor_key)){
            var aobj = actor_obj[actor_key];
            var movie_list = aobj.movies;
            if (movie_list !== null && movie_list !== undefined){
                for (var i = 0; i < movie_list.length; i++) {
                    var movie = this.findMovie(movie_list[i]);
                    if (movie !== null) {
                        if (found === false) {
                            this.addVertex(JSON.stringify(aobj));
                            found = true;
                        }
                        this.addVertex(JSON.stringify(movie));
                        this.addEdge(JSON.stringify(aobj), JSON.stringify(movie));
                    }
                }
            }
            found = false;
        }
    }

};

/*
    Helper function for getHubActors
    This function searches for input actor in actor dictionary declared in getHubActors
    actors_dic: is a actor dictionary
    key: is a actor key in the dictionary
    value: is a list of actors associated with the key actor

    return TRUE if it found the value in key's list. FALSE otherwise.
 */
function mapping_actors(actors_dic, key, value) {
    var actorList = actors_dic[key];
    if (actorList === undefined){
        return false;
    }
    else {
        for (var i = 0; i < actorList.length; i ++){
            if (actorList[i] === value){
                return true;
            }
        }
    }

    return false;
}

/*
    Find an actor in the list with given movie name
 */
Graph.prototype.findActorsByMovie = function(movieName) {
    var movie = this.findMovie(movieName);
    if (movie === null){
        return null;
    }
    return movie.actors;
};

/*
    Helper function for visualization functions
    It creates mapping between actor and actors.
 */
function createMap(actor_list, actor, actors_map) {
    var actorListWithout = actor_list.filter(function (item) {
        return item !== actor;
    });
    if (actors_map[actor] !== undefined) {
        for (var y = 0; y < actorListWithout.length; y++) {
            if (!mapping_actors(actors_map, actor, actorListWithout[y])) {
                actors_map[actor].push(actorListWithout[y]);
            }
        }
    }
    else {
        actors_map[actor] = actorListWithout;
    }
    return {actorListWithout: actorListWithout, y: y};
}

/*
    Get hub actors
 */
Graph.prototype.getHubActors = function () {
    logger.trace("Entering getHubActors");
    var actors_map = [];

    var queue = [];
    var visited_vertex = [];
    var startVertex = this.vertices[0];

    visited_vertex[startVertex] = "visited";
    queue.push(startVertex);

    var curVertex;

    while (queue.length !== 0){
        var __ret = addQueue.call(this, curVertex, queue, visited_vertex);
        curVertex = __ret.curVertex;
        var adjVertices = __ret.adjVertices;
        var i = __ret.i;

        var curObj = JSON.parse(curVertex);
        // case object is a movie
        if (curObj.json_class === "Movie"){
            var actor_list = curObj.actors;
            for (var x = 0; x < actor_list.length; x++) {
                var actor = actor_list[x];
                createMap(actor_list, actor, actors_map);
            }
        }

        // case object is an actor
        else {
            if (actors_map[curObj.name] === undefined){
                actors_map[curObj.name] = [];
            }
            var movie_list = curObj.movies;
            actor = curObj.name;
            for (var a = 0 ; a < movie_list.length; a++){
                actor_list = this.findActorsByMovie(movie_list[a]);
                if (actor_list !== null){
                    for (x = 0; x < actor_list.length; x++) {
                        createMap(actor_list, actor, actors_map);
                    }
                }
            }
        }
    }

    return actors_map;
};

/*
    Helper function for getHubActors method
    Generates necessary data to draw scatter plot
 */
Graph.prototype.getHubData = function (){
    var x = [];
    var y = [];
    var max = -1;
    var maxActor;

    var map = this.getHubActors();
    for (var key in map){
        if (map.hasOwnProperty(key)){
            var actors = map[key];
            y.push(actors.length);
            x.push(key);
            console.log("Actor: " + key + "connections: " + actors.length);
            if (actors.length > max){
                maxActor = key;
                max = actors.length;
            }
        }
    }

    return {x : x, y : y, actor : maxActor};
};

/*
    Visualize the data generated from getHubData
 */
Graph.prototype.hubVisual = function (){
    var data = this.getHubData();
    var x = data.x;
    var y = data.y;
    this.visualize("Hub Actors", "Actors", "Number of actors worked with", x, y);
    console.log(data.actor + " has the most connections");
};

/*
    Draw given data with scatter plot.
    title: Title of a graph
    xaxis_title: title of a x-axis
    yaxis_title: title ofa  y-axis
    x: is a list contain data. It is going to be x values
    y: is also a list contain data. It is going to be y values
 */
Graph.prototype.visualize = function (title, xaxis_title, yaxis_title , x , y) {
    var trace1 = {
        y: y,
        x: x,
        mode: "markers",
        marker: {
            color: "rgb(164, 194, 244)",
            size: 12,
            line: {
                color: "white",
                width: 0.5
            }
        },
        type: "scatter"
    };

    var data = [trace1];
    var layout = {
        title: title,
        xaxis: {
            title: xaxis_title,
            showgrid: false,
            zeroline: false
        },
        yaxis: {
            title: yaxis_title,
            showline: false
        }
    };
    var graphOptions = {layout: layout, filename: "line-style", fileopt: "overwrite"};
    plotly.plot(data, graphOptions, function (err, msg) {
        if (err !== null) {
            logger.debug(err);
        }
        else {
            logger.info(msg);
        }
        console.log(msg);
    });
};

/*
    finds age group that generates the most amount of money
 */
Graph.prototype.ageAndGross = function () {
    logger.trace("Entering ageAndGross");
    var age_map = [];

    var queue = [];
    var visited_vertex = [];
    var startVertex = this.vertices[0];

    visited_vertex[startVertex] = "visited";
    queue.push(startVertex);

    var curVertex;

    while (queue.length !== 0){
        var __ret = addQueue.call(this, curVertex, queue, visited_vertex);
        curVertex = __ret.curVertex;
        var adjVertices = __ret.adjVertices;
        var i = __ret.i;

        var curObj = JSON.parse(curVertex);
        // case object is a movie
        if (curObj.json_class === "Actor"){
            var gross = curObj.total_gross;
            var age = curObj.age;

            if (age_map[age] !== undefined){
                age_map[age] += gross;
            }
            else {
                age_map[age] = gross;
            }
        }
    }

    return age_map;
};

/*
    Helper function for ageAndGross method.
    Generate data to visualize
 */
Graph.prototype.getAgeData = function (){
    var x = [];
    var y = [];
    var maxGross = -1;
    var maxAge;

    var map = this.ageAndGross();
    for (var key in map){
        if (map.hasOwnProperty(key)){
            x.push(key);
            y.push(map[key]);
            if (map[key] > maxGross){
                maxGross = map[key];
                maxAge = key;
            }
        }
    }

    return {x : x, y : y, age : maxAge, gross: maxGross};
};

/*
    Visualize data using scatter plot
 */
Graph.prototype.ageGrossVisual = function (){
    var data = this.getAgeData();
    var x = data.x;
    var y = data.y;
    var gross = data.gross;
    var age = data.age;

    this.visualize("Age Vs. Gross Amount", "Age", "Total Gross", x, y);

    console.log("Age of group: " + age + ", Total Gross: " + gross);
};

function addQueue(curVertex, queue, visited_vertex) {
    curVertex = queue.shift();
    visited_vertex[curVertex] = "visited"
    var adjVertices = this.edges[curVertex];

    for (var i = 0; i < adjVertices.length; i++) {
        if (visited_vertex[adjVertices[i]] !== "visited") {
            visited_vertex[adjVertices[i]] = "visited";
            queue.push(adjVertices[i]);
        }
    }
    return {curVertex: curVertex, adjVertices: adjVertices, i: i};
}

/*
    Filters actor with given value.
    filterAttr: filter an actor by this attribute
    value: is a value to be filtered
 */
Graph.prototype.filterActor = function (filterAttr, value) {
    logger.trace("Entering filterActor");
    var queue = [];
    var visited_vertex = [];
    var startVertex = this.vertices[0];

    visited_vertex[startVertex] = "visited";
    queue.push(startVertex);

    var list = [];
    var curVertex;

    while (queue.length !== 0){
        var __ret = addQueue.call(this, curVertex, queue, visited_vertex);
        curVertex = __ret.curVertex;
        var adjVertices = __ret.adjVertices;
        var i = __ret.i;

        var curObj = JSON.parse(curVertex);
        // case object is a movie
        if (curObj.json_class === "Actor"){
            if (filterAttr === "name"){
                if ((curObj.name).includes(value)){
                    list.push(curObj);
                }
            }
            else if (filterAttr === "age"){
                if (curObj.age === value){
                    list.push(curObj);
                }
            }
            else if (filterAttr === "total_gross"){
                if (curObj.total_gross === value){
                    list.push(curObj);
                }
            }
            else if (filterAttr === "movies"){
                var check = false;
                for (var j = 0; j < curObj.movies; j ++){
                    if (curObj.movies[j] === value){
                        check = true;
                    }
                }
                if (check){
                    list.push(curObj);
                }
            }
        }
    }

    return list;
};

/*
    Filter a movie with given attribute and value
    filterAttr: filter an actor by this attribute
    value: is a value to be filtered
 */
Graph.prototype.filterMovie = function (filterAttr, value) {
    logger.trace("Entering filterMovie");
    var queue = [];
    var visited_vertex = [];
    var startVertex = this.vertices[0];

    visited_vertex[startVertex] = "visited";
    queue.push(startVertex);

    var list = [];
    var curVertex;

    while (queue.length !== 0){
        var __ret = addQueue.call(this, curVertex, queue, visited_vertex);
        curVertex = __ret.curVertex;
        var adjVertices = __ret.adjVertices;
        var i = __ret.i;

        var curObj = JSON.parse(curVertex);
        // case object is a movie
        if (curObj.json_class === "Movie"){
            if (filterAttr === "name"){
                if ((curObj.name).includes(value)){
                    list.push(curObj);
                }
            }
            else if (filterAttr === "wiki_page"){
                if (curObj.wiki_page === value){
                    list.push(curObj);
                }
            }
            else if (filterAttr === "box_office"){
                if (curObj.box_office === value){
                    list.push(curObj);
                }
            }
            else if (filterAttr === "year"){
                if (curObj.year === value){
                    list.push(curObj);
                }
            }
            else if (filterAttr === "actors"){
                var check = false;
                for (var j = 0; j < curObj.actors; j ++){
                    if (curObj.actors[j] === value){
                        check = true;
                    }
                }
                if (check){
                    list.push(curObj);
                }
            }
        }
    }
    return list;
};

/*
    Modify actor data in a graph
    actor: vertex in a graph
    name: new name for an actor
    age: new age for an actor
    total_gross: new total_gross for an actor
    movie: new movie for an actor
 */
Graph.prototype.modifyActor = function (actor, name, age, total_gross, movie) {
    var foundActor = this.findActor(actor);
    var newActor = foundActor;
    if (foundActor !== null){
        this.removeVertex(JSON.stringify(foundActor));
        this.removeEdge(JSON.stringify(foundActor));
        if (name !== null){
          foundActor.name = name;
        }
        if (age !== null){
          foundActor.age = age;
        }
        if (total_gross !== null){
          foundActor.total_gross = total_gross;
        }
        if (movie !== null){
          foundActor.movie = movie;
        }
    }
    newActor = JSON.stringify(newActor);
    actor_obj[JSON.stringify(newActor)] = newActor;
    this.createGraph();
};

/*
    Modify movie data in a graph
 */
Graph.prototype.modifyMovie = function (movie, name, wiki_page, box_office, year, actors) {
    var foundMovie = this.findMovie(movie);

    var newMovie = foundMovie;
    if (foundMovie !== null){
        this.removeVertex(JSON.stringify(foundMovie));
        this.removeEdge(JSON.stringify(foundMovie));

        if (name !== null){
            newMovie.name = name;
        }
        if (wiki_page !== null){
            newMovie.wiki_page = wiki_page;
        }
        if (box_office !== null){
            newMovie.box_office = box_office;
        }
        if (year !== null){
            newMovie.year = year;
        }
        if (actors !== null) {
            newMovie.actors = actors;
        }
    }
    newMovie = JSON.stringify(newMovie);
    movie_obj[JSON.stringify(newMovie)] = newMovie;
    this.createGraph();
};
module.exports = Graph;

var g = new Graph();
g.createGraph();
//g.hubVisual();
g.ageGrossVisual();