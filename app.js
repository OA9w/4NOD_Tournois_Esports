var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var teamsRouter = require('./src/routes/teamRoutes.js');
var tournamentsRouter = require('./src/routes/tournamentRoutes.js');

var app = express();

// view engine setup (si tu n'utilises pas de vues, ça peut rester)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// --- MOUNT ROUTERS ---
app.use('/api/teams', teamsRouter);
app.use('/api/tournaments', tournamentsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.json({ error: err.message });
});

// IMPORTANT : exporter l'app !!!!!
module.exports = app;
