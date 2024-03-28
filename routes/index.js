var express = require('express');
var suncalc = require('suncalc');
var sun = require('../sun');
var router = express.Router();

dateValid = (date) => !isNaN(date)

function makeCalendar(date) {
  let today = date;
  let month = date.getMonth()
  let year = date.getFullYear()
  let firstDay = new Date(year, month, 0)
  let lastDay = new Date(year, month + 1, 0)

  let weeks = []
  const weekDays = 7
  const numberOfDays = lastDay.getDate()
  let arrayMonth = Array.from({ length:numberOfDays }, (v, i) => i + 1)
  arrayMonth = Array.from({ length:firstDay.getDay()}, (v, i) => 0).concat(arrayMonth)

  let i = 0;
  for (w = 0; w <= 7*Math.ceil(numberOfDays / weekDays); w += weekDays) {
    weeks[i] = arrayMonth.slice(w, w + weekDays);
    i++
  }

  return weeks
}

/* GET home page. */
router.get('/', function(req, res, next) {
  let site = req.app.locals.site;

  let now = new Date()
  let date = new Date(req.query.date + ' ' + req.query.time)
  if (!dateValid(date)) date = now
  let lat = req.query.lat || 40
  let long = req.query.long || 17 //example rn
  let alt = req.query.alt || 0
  let utcOffset = date.getTimezoneOffset()

  let times = sun.times(date, lat, long)

  let elevation = sun.elevation(date, lat, long)
  let maxElevation = sun.maxElevation(date, lat, long)

  console.log(date, lat, long, elevation, maxElevation)

  res.locals.date = date
  res.locals.lat = lat
  res.locals.long = long
  res.locals.elevation = elevation
  res.locals.times = times
  for (time of Object.keys(times)) {
    res.locals.times[time] = res.locals.times[time].toLocaleTimeString()
  }
  res.locals.maxElevation = maxElevation

  let graph_y = 50 + (20/6) * Math.max(0, maxElevation)
  let calendar = makeCalendar(date)
  res.locals.graph_y = graph_y
  res.locals.calendar = calendar

  res.locals.day = date.getDate()
  res.locals.month_s = date.toLocaleString(undefined, { month: "long" })

  res.render('index', site);
});

module.exports = router;
