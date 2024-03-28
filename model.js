const rad = Math.PI/180
const deg = 1/rad

function mod(a, n) {
	if (a/n < 0) return (a % n) + n
	return a % n
}

function sunPosition(time, lat, long) {
	let date = time.getDate()
	let month= time.getMonth() + 1
	let year = time.getFullYear()
	let hours = time.getHours()
	let minutes = time.getMinutes()
	// time of day in decimal form (ex. 00:30 -> 0,5)
	let ut = hours+1/60*minutes

	console.dir({ time, date, month, year })
	console.dir({ hours, minutes, ut })
	console.dir({ lat, long })

	term1 = year - 1 + 4716
	term2 = month+ 1 + 12
	term4 = year - 1
	if (month > 2) {
		term1 += 1
		term2 -= 12
		term4 = year
	}
	term4 /= 100
	console.log("month > 2", month > 2)
	let JD = (
		Math.floor(365.25*(term1))
	+	Math.floor(30.6001*(term2))
	+	date + ut/24 + 2
	-	Math.floor(term4)
	+	Math.floor(term4)/4 
	-	1524.5
		)
	let T = (JD-2451545)/36525
	let M = mod((357.5291 + 35999.0503*T - 0.0001559*T*T - 0.00000048*T*T*T), 360)
	let L0 = mod((280.46645 + 36000.76983*T + 0.0003032*T*T), 360)
	let DL = mod((
		(1.9146 - 0.004817*T - 0.000014*T*T)*Math.sin(M*rad)
	+	(0.019993 - 0.000101*T)*Math.sin(2*M*rad)
	+	0.00029*Math.sin(3*M*rad)
		), 360)
	let L = mod((L0 + DL), 360)
	let X = Math.cos(L*rad)
	let Y = Math.cos( (23.4393-46.815*T/3600)*rad )*Math.sin(L*rad)
	let Z = Math.sin( (23.4393-46.815*T/3600)*rad )*Math.sin(L*rad)
	let R = Math.sqrt(1-Z*Z)
	let delta = Math.atan(Z/R)/rad
	let RA = 2*Math.atan(Y/(X+R))/rad
	if (RA <= 0) RA += 360
	let theta = mod((
		280.46061837
	+	360.98564736629*(JD-2451545)
	+	0.000387933*(T*T)
	-	(T*T*T)/3871000010
	+	long
		), 360)
	let tau = theta - RA
	if (tau > 0) tau += 360
	let sin_elevation = (
		Math.sin(lat*rad)*Math.sin(delta*rad)
	+	Math.cos(lat*rad)*Math.cos(delta*rad)*Math.cos(tau*rad)
		)

	let result = { JD, T, M, L0, DL, L, X, Y, Z, R, delta, RA, theta, tau, sin_elevation }
	result.elevation = Math.asin(sin_elevation)/rad
	result.declination = delta
	console.dir(result)
	return result
}

function getElevation(time, lat, long) {
	return Math.asin(sunPosition(time, lat, long).sin_elevation)/rad
}

function getDeclination(time, lat, long) {
	return sunPosition(time, lat, long).delta
}

function equationOfTime(time, lat, long) {
	let sun_pos = sunPosition(time, lat, long)
	let eqtime = 4*(sun_pos.L0 - 0.0057183 - sun_pos.RA)
	if (Math.abs(eqtime) > 20) eqtime -= 4*360
	return eqtime
}

function timeOffset(time, lat, long, utc_offset_min) {
	let hours = time.getHours()
	let minutes = time.getMinutes()
	let seconds = time.getSeconds()

	let eqtime = equationOfTime(time, lat, long)
	let time_offset = eqtime + 4*long + utc_offset_min
	let true_solar_time = hours*60 + minutes + seconds/60 + time_offset
	let hour_angle = true_solar_time/4 - 180
	return time_offset
}

function sunTimes(time, lat, long) {
	let zenith = 90
	let delta = getDeclination(time, lat, long)
	let eqtime = equationOfTime(time, lat, long)
	let hour_angle = Math.acos(
		Math.sin(zenith*rad)
	-	Math.sin(lat*rad) * Math.sin(delta*rad)) / (Math.cos(lat*rad) * Math.cos(delta*rad)
		)*deg

	console.log(hour_angle)

	let noon = -4*long - eqtime

	return {
		sunrise: noon - 4*hour_angle,
		sunset: noon + 4*hour_angle
	}
}

function getMaxElevation(date, lat, long) {
	elevations = []
	for (i = 0; i < 24; i++) {
		elevations[i] = getElevation(date, lat, long)
		date.setHours(date.getHours() + 1)
		console.log(i, date.getHours(), elevations[i])
	}
	console.log(elevations)
	return Math.max.apply(Math, elevations)
}

// test
// elevations = {}
// testDate = new Date("1991-5-19 00:00")
// for (i = 0; i < 24; i++) {
// 	elevations[i] = getElevation(testDate, 50, 10)
// 	testDate.setHours(testDate.getHours() + 1)
// }
// console.log()
// console.dir(elevations)
// maxElevation = getMaxElevation(testDate, 50, 10)
// console.log(maxElevation)

module.exports = {
	getElevation,
	getDeclination,
	equationOfTime,
	timeOffset,
	sunTimes,
	getMaxElevation }