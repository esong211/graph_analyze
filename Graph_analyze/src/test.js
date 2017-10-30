Graph = require("./graph.js");
var assert = require('assert');
var app = require('./server.js'); // Our app
var supertest = require("supertest");
var request = supertest(app);
// This agent refers to PORT where program is runninng.

describe ('Overall Graph Test',function() {
    describe('constructor', function () {
        var graph = new Graph();
        it('vertices.length should return 0 when a graph is constructed', function () {
            assert.equal(0, graph.vertices.length);
        });
        it('edges.length should return 0 when a graph is constructed', function () {
            assert.equal(0, graph.edges.length);
        });
    });

    describe('addActorObj ', function () {
        var graph = new Graph();
        var actorObj = {
            "json_class": "Actor",
            "name": "Eric Song",
            "age": 99,
            "movies": ["Iron Man", "A4", "B4"]
        };
        var movieObj = {
            "json_class": "Movie",
            "name": "Song Song",
            "gross": 100000,
            "movies": ["Bruce Willis"]
        };
        it('add obj to actor_obj', function () {
            graph.getActorObj();
            graph.getMovieObj();
            graph.addActorObj(actorObj);
            graph.addMovieObj(movieObj);
            assert.equal(actorObj, graph.findActor("Eric Song"));
            assert.equal(movieObj, graph.findMovie("Song Song"));
        });
    });

    describe('addVertex', function () {
        var graph = new Graph();
        it('length of vertices increase by 1 when a vertex is inserted', function () {
            graph.addVertex("V1");
            assert.equal(1, graph.vertices.length);
        });
        it('value of inserted vertex is V1', function () {
            assert.equal("V1", graph.vertices[0]);
        });

        it('inserting duplicate vertex does not do anything', function () {
            graph.addVertex("V1");
            assert.equal(1, graph.vertices.length);
        });
    });

    describe('removeVertex', function () {
        var graph = new Graph();
        graph.addVertex("V1");
        graph.addVertex("V2");
        it('removes vertex from vertices', function () {
            graph.removeVertex("V1");
            assert.equal(1, graph.vertices.length);
        });
        it('removes non-exist vertex from vertices does not do anything', function () {
            graph.removeVertex("V1");
            assert.equal(1, graph.vertices.length);
            assert.equal("V2", graph.vertices[0]);
        });
    });


    describe('containVertex', function () {
        var graph = new Graph();
        graph.addVertex("V1");
        graph.addVertex("V2");
        it('return true if a graph contain a given vertex', function () {
            assert.equal(true, graph.containVertex("V1"));
        });

        it('return false if a graph does not contain a give vertex', function () {
            assert.equal(false, graph.containVertex("V3"));
        });
    });


    describe('addEdge', function () {
        var graph = new Graph();
        graph.addVertex("V1");
        graph.addVertex("V2");
        graph.addEdge("V1", "V2");
        it('adding edge maps two vertices each other', function () {
            assert.equal("V1", graph.edges["V2"]);
            assert.equal("V2", graph.edges["V1"]);
            graph.removeEdge("V1");
            assert.equal(undefined, graph.edges["V1"]);
        });
    });

    describe('readFile/createGraph', function () {
        var graph = new Graph();
        graph.readFile("test_data.json");
        graph.createGraph();
        it('read from file and create a graph', function () {
            assert.equal(true, graph.vertices.length === 12);
        });
    });

    describe('getHubActors', function () {
        var graph = new Graph();
        graph.readFile("test_data.json");
        graph.createGraph();
        var map = graph.getHubActors();
        it('returns hub actors graph', function () {
            assert.equal(true, map["Bruce Willis"].length === 7);
            assert.equal(true, map["Faye Dunaway"].length === 7);
            assert.equal(true, map["Martin Gabel"].length === 2);
        });
    });

    describe('getHubData', function () {
        var graph = new Graph();
        graph.readFile("test_data.json");
        graph.createGraph();
        var data = graph.getHubData();
        var x = data.x;
        var y = data.y;
        it('returns hub data', function () {
            assert.equal(7, y[0]);
            assert.equal(4, y[2]);
            assert.equal("Bruce Willis", x[0]);
        });
    });

    describe('getAgeData', function () {
        var graph = new Graph();
        graph.readFile("test_data.json");
        graph.createGraph();
        var data = graph.getAgeData();
        var x = data.x;
        var y = data.y;
        var age = data.age;
        var totalGross = data.gross;
        it('returns hub data', function () {
            assert.equal(61, x[1]);
            assert.equal(562709189, y[1]);
            assert.equal(74, age);
            assert.equal(584376433, totalGross);
        });
    });
});

describe("Sever Test", function() {
    beforeEach(function () {
        app = require('./server.js');
    });
    afterEach(function () {
        app.close();
    });

    describe('GET /actors', function() {
        it('test name', function(done) {
            request.get('/actors?name="Bob"')
                .expect(200)
                .end(function(err, res) {
                    done(err);
                });
        });
        it('test age', function(done) {
            request.get('/actors?age=67')
                .expect(200)
                .end(function(err, res) {
                    done(err);
                });
        });
        it('test total gross', function(done) {
            request.get('/actors?total_gross=562709189')
                .expect(200)
                .end(function(err, res) {
                    done(err);
                });
        });
        it('test movies', function(done) {
            request.get('/actors?movies=The Verdict')
                .expect(200)
                .end(function(err, res) {
                    done(err);
                });
        });
        it('test /:name', function(done) {
            request.get('/actors/"Bruce Willis"')
                .expect(200)
                .end(function(err, res) {
                    done(err);
                });
        });
        it('test wrong input', function(done) {
            request.get('/actors/"Does not exist"')
                .expect(400)
                .end(function(err, res) {
                    done(err);
                });
        });
    });

    describe('GET /movies', function() {
        it('test name', function(done) {
            request.get('/movies?holla=The First Deadly Sin')
                .expect(400)
                .end(function(err, res) {
                    done(err);
                });
        });
        it('test name', function(done) {
            request.get('/movies?name=The First Deadly Sin')
                .expect(200)
                .end(function(err, res) {
                    done(err);
                });
        });
        it('test wiki_page', function(done) {
            request.get('/movies?wiki_page=https://en.wikipedia.org/wiki/The_First_Deadly_Sin')
                .expect(200)
                .end(function(err, res) {
                    done(err);
                });
        });
        it('test box_office', function(done) {
            request.get('/movies?box_office=0')
                .expect(200)
                .end(function(err, res) {
                    done(err);
                });
        });
        it('test year', function(done) {
            request.get('/movies?year=1988')
                .expect(200)
                .end(function(err, res) {
                    done(err);
                });
        });
        it('test actors', function(done) {
            request.get('/movies?actors=Bruce Willis')
                .expect(200)
                .end(function(err, res) {
                    done(err);
                });
        });
        /*it('test name', function(done) {
            request.get('/movies/"Die_Hard"')
                .expect(400)
                .end(function(err, res) {
                    done(err);
                });
        });*/
        it('test wrong input', function(done) {
            request.get('/movies/"Does not exist"')
                .expect(400)
                .end(function(err, res) {
                    done(err);
                });
        });
    });

    describe('Put /actors/:name', function() {
        it('test put data', function(done) {
            request.put('/actors/Bruce Willis')
                .send({
                    "json_class": "Actor",
                    "name": "Eric Song",
                    "age": 26
                })
                .expect(200)
                .end(function(err, res) {
                    done(err);
                });
        });

        it('test wrong input', function(done) {
            request.put('/actors/nope')
                .send({
                    "json_class": "Actor",
                    "name": "Eric Song",
                    "age": 26
                })
                .expect(400)
                .end(function(err, res) {
                    done(err);
                });
        });
    });

    describe('Put /movies/:name', function() {
        it('test wrong input', function(done) {
            request.put('/movies/Does not exist')
                .send({
                    "json_class": "Movie",
                    "name": "Eric Song",
                })
                .expect(400)
                .end(function(err, res) {
                    done(err);
                });
        });
    });

    describe('Post /actors/', function() {
        it('test post', function(done) {
            request.post('/actors/')
                .send({
                    "json_class": "Actor",
                    "name": "Eric Song"
                })
                .expect(201)
                .end(function(err, res) {
                    done(err);
                });
        });
        it('test wrong post', function(done) {
            request.post('/actors/')
                .send({
                    "json_class": "Actor"
                })
                .expect(400)
                .end(function(err, res) {
                    done(err);
                });
        });
    });

    describe('Post /movies/', function() {
        it('test post', function(done) {
            request.post('/movies/')
                .send({
                    "json_class": "Movie",
                    "name": "Eric Song"
                })
                .expect(201)
                .end(function(err, res) {
                    done(err);
                });
        });
        it('test wrong post', function(done) {
            request.post('/movies/')
                .send({
                    "json_class": "Movie"
                })
                .expect(400)
                .end(function(err, res) {
                    done(err);
                });
        });
    });


    describe('Delete /actors/', function() {
        it('test delete', function(done) {
            request.delete('/actors/Bruce Willis')
                .expect(202)
                .end(function(err, res) {
                    done(err);
            });
        });
        it('test wrong delete', function(done) {
            request.delete('/actors/hola')
                .expect(204)
                .end(function(err, res) {
                    done(err);
            });
        });
    });

    describe('Delete /movies/', function() {
        it('test wrong delete', function(done) {
            request.delete('/movies/hola')
                .expect(204)
                .end(function(err, res) {
                    done(err);
                });
        });
    });
});

