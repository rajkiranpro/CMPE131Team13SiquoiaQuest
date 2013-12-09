/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    config = require('./config')(),
    app = express(),
    MongoClient = require('mongodb').MongoClient,
    Index = require('./controllers/Index'),
    PaymentController = require('./controllers/PaymentController'),
    QuizController = require('./controllers/QuizController'),
    PacketsController = require('./controllers/PacketsController'),
    Authentication = require('./controllers/Authentication');

// all environments
// app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/templates');
app.set('view engine', 'hjs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('fast-delivery-site'));
app.use(express.session());
app.use(app.router);
app.use(require('less-middleware')({
    src: __dirname + '/public'
}));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

MongoClient.connect('mongodb://' + config.mongo.host + ':' + config.mongo.port + '/siquoiaquest', function (err, db) {
    if (err) {
        console.log('Sorry, there is no mongo db server running.');
    } else {
        var attachDB = function (req, res, next) {
            req.db = db;
            next();
        };

        app.post('/next', attachDB, function (req, res, next) {
            console.info("-----------------");
            console.info("URL POST: /next");
            console.info("-----------------");
            QuizController.nextQuestion(req, res, next);
        });

        app.post('/answer', attachDB, function (req, res, next) {
            console.info("-----------------");
            console.info("URL POST: /answer");
            console.info("-----------------");
            QuizController.submitAnswer(req, res, next);
        });

        app.post('/play', attachDB, function (req, res, next) {
            console.info("-----------------");
            console.info("URL POST: /play");
            console.info("-----------------");
            QuizController.prepareSession(req, res, next);
        });

        app.get('/play/:packetid', attachDB, function (req, res, next) {
            console.info("-----------------");
            console.info("URL GET: /play/:packetid");
            console.info("-----------------");
            QuizController.startSession(req, res, next);
        });

        app.get('/play', attachDB, function (req, res, next) {
            console.info("-----------------");
            console.info("URL GET: /play");
            console.info("-----------------");
            PacketsController.getUserPackets(req, res, next);
        });

        app.get('/buy/:id', attachDB, function (req, res, next) {
            console.info("-----------------");
            console.info("URL GET: /buy/:id");
            console.info("-----------------");
            PaymentController.run(req, res, next);
        });

        app.post('/pay', attachDB, function (req, res, next) {
            console.info("-----------------");
            console.info("URL POST: /pay");
            console.info("-----------------");
            PaymentController.pay(req, res, next);
        });

        app.get('/browse', attachDB, function (req, res, next) {
            console.info("-----------------");
            console.info("URL GET: /browse");
            console.info("-----------------");
            PacketsController.getPackets(req, res, next);
        });


        app.get('/logout', attachDB, function (req, res, next) {
            console.info("-----------------");
            console.info("URL GET: /logout");
            console.info("-----------------");
            Authentication.logout(req, res, next);
        });
        app.post('/register', attachDB, function (req, res, next) {
            console.info("-----------------");
            console.info("URL POST: /register");
            console.info("-----------------");
            Authentication.register(req, res, next);
        });
        app.get('/login', attachDB, function (req, res, next) {
            console.info("-----------------");
            console.info("URL GET: /login");
            console.info("-----------------");
            Authentication.run(req, res, next);
        });
        app.post('/login', attachDB, function (req, res, next) {
            console.info("-----------------");
            console.info("URL POST: /login");
            console.info("-----------------");
            Authentication.sigin(req, res, next);
        });
        app.get('/profile', attachDB, function (req, res, next) {
            console.info("-----------------");
            console.info("URL GET: /profile");
            console.info("-----------------");
            Index.profile(req, res, next);
        });
        app.get('/index', attachDB, function (req, res, next) {
            console.info("-----------------");
            console.info("URL GET: /index");
            console.info("-----------------");
            Index.run(req, res, next);
        });
        app.get('/', attachDB, function (req, res, next) {
            console.info("-----------------");
            console.info("URL GET: /");
            console.info("-----------------");
            Index.run(req, res, next);
        });
        http.createServer(app).listen(config.port, function () {
            console.log(
                'Successfully connected to mongodb://' + config.mongo.host + ':' + config.mongo.port,
                '\nExpress server listening on port ' + config.port
            );
        });
    }
});