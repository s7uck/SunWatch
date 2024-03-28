const suncalc = require('suncalc')

const rad = Math.PI/180
const deg = 180/Math.PI


times = (date, lat, long, altitude) => suncalc.getTimes(date, lat, long, altitude)

// astronomical dawn time
dawnStartTime = (date, lat, long, altitude=0) => times(date, lat, long, altitude).nightEnd
// sunrise time
sunriseTime = (date, lat, long, altitude=0) => times(date, lat, long, altitude).sunrise
// noon time
noonTime = (date, lat, long, altitude=0) => times(date, lat, long, altitude).solarNoon
// sunset time
sunsetTime = (date, lat, long, altitude=0) => times(date, lat, long, altitude).sunset
// astronomical dusk time
duskEndTime = (date, lat, long, altitude=0) => times(date, lat, long, altitude).night
// nadir (darkest time of night)
nadirTime = (date, lat, long, altitude=0) => times(date, lat, long, altitude).nadir


// elevation in degrees
elevation = (time, lat, long) => suncalc.getPosition(time, lat, long).altitude*deg
// max elevation of the day
maxElevation = (date, lat, long) => elevation(noonTime(date, lat, long), lat, long)
// min elevation of the day
minElevation = (date, lat, long) => elevation(nadirTime(date, lat, long), lat, long)

elevationDelta = (date, lat, long) => maxElevation(date, lat, long) - minElevation(date, lat, long)


module.exports = {
	times, dawnStartTime, sunriseTime, noonTime,
	sunsetTime, duskEndTime, nadirTime,
	elevation, maxElevation, minElevation, elevationDelta,
}