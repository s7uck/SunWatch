var express = require('express');
var suncalc = require('suncalc');
var sun = require('../sun');
var router = express.Router();

dateValid = (date) => !isNaN(date)
Array.prototype.joinValues = function(delimiter) {
  return this.filter(Boolean).join(delimiter)
}

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

function getWeekdayString() {
  let date = new Date("2007-01-01")
  weekdays = []
  for (i = 0; i < 7; i++) {
    weekdays.push(date.toLocaleDateString(undefined, {weekday: 'short'})[0])
    date.setDate(date.getDate() + 1)
  }

  return weekdays
}

/* GET home page. */
router.get('/', function(req, res, next) {
  let site = req.app.locals.site;

  let now = new Date()
  let date = new Date([req.query.date, req.query.time].joinValues(" "))
  if (!dateValid(date)) date = now
  let lat = req.query.lat || req.cookies.lat || 47
  let long = req.query.long || req.cookies.long || 10 //example rn
  let alt = req.query.alt || 0
  let utcOffset = date.getTimezoneOffset()

  if (!req.cookies.lat) req.cookies.lat = lat
  if (!req.cookies.long) req.cookies.long = long

  let times = sun.times(date, lat, long, alt)

  let elevation = sun.elevation(date, lat, long)
  let maxElevation = sun.maxElevation(date, lat, long)
  let minElevation = sun.minElevation(date, lat, long)
  let elevationDelta = sun.elevationDelta(date, lat, long)

  console.log(date, lat, long, elevation, maxElevation, minElevation)

  res.locals.date = date
  res.locals.lat = lat
  res.locals.long = long
  res.locals.elevation = elevation
  res.locals.maxElevation = maxElevation
  res.locals.minElevation = minElevation

  res.locals.times = times
  for (time of Object.keys(res.locals.times)) {
    let timeString = res.locals.times[time].toLocaleTimeString()
    res.locals.times[time] = timeString
  }

  res.locals.sunlightLength = times.sunsetEnd - times.sunrise / 100
  res.locals.daylightLength = times.night - times.nightEnd / 100
  res.locals.darknessLength = times.sunrise - times.sunset / 100
  res.locals.nightLength = times.nightEnd - times.night / 100

  res.locals.date_s = date.toISOString().split('T')[0]
  res.locals.time_s = date.toISOString().split('T')[1].replace('Z', '')

  let graph_y = 50 + (20/12) * Math.max(0, elevationDelta)
  let calendar = makeCalendar(date)
  res.locals.graph_y = graph_y
  res.locals.calendar = calendar

  res.locals.year = date.getFullYear()
  res.locals.month = date.getMonth() + 1
  res.locals.day = date.getDate()
  res.locals.weekdays = getWeekdayString()
  res.locals.month_s = date.toLocaleString(undefined, { month: "long" })

  res.render('index', site);
});

module.exports = router;
