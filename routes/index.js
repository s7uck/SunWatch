var express = require('express');
var router = express.Router();
var model = require('../model');

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
  let lat = 40
  let long = 17 //example rn

  let maxElevation = model.getMaxElevation(now, lat, long)
  let elevation = model.getElevation(now, lat, long)

  let graph_y = 50 + (20/6) * maxElevation
  let calendar = makeCalendar(now)
  res.locals.graph_y = graph_y
  res.locals.calendar = calendar

  res.render('index', site);
});

module.exports = router;
