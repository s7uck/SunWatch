var express = require('express');
var router = express.Router();
var model = require('../model');

function dateValid(date) {
  return !isNaN(date) ?? false;
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

/* GET home page. */
router.get('/', function(req, res, next) {
  let site = req.app.locals.site;

  let now = new Date()
  let date = new Date(req.query.date + ' ' + req.query.time)
  if (!dateValid(date)) date = now
  let lat = req.query.lat || 40
  let long = req.query.long || 17 //example rn
  let utcOffset = date.getTimezoneOffset()

  let maxElevation = model.getMaxElevation(date, lat, long)
  let elevation = model.getElevation(date, lat, long)
  let declination = model.getDeclination(date, lat, long)
  let equationOfTime = model.equationOfTime(date, lat, long)
  let timeOffset = model.timeOffset(date, lat, long, utcOffset)
  let sunTimes = model.sunTimes(date, lat, long)

  console.log(date, lat, long, elevation, maxElevation)
  console.dir({
    elevation, maxElevation, declination, equationOfTime, timeOffset,
    sunTimes
  })

  res.locals.date = date
  res.locals.lat = lat
  res.locals.long = long
  res.locals.maxElevation = maxElevation
  res.locals.elevation = elevation

  let graph_y = 50 + (20/6) * Math.max(0, maxElevation)
  let calendar = makeCalendar(date)
  res.locals.graph_y = graph_y
  res.locals.calendar = calendar

  res.locals.day = date.getDate()
  res.locals.month_s = date.toLocaleString(undefined, { month: "long" })

  res.render('index', site);
});

module.exports = router;
