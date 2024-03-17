var fs = require('fs');

function setupLogging(logger, logFile) {
  logger.token('statusColor', (req, res) => {
    var color = res.statusCode >= 500 ? 31 // red
          : res.statusCode >= 400 ? 33 // yellow
              : res.statusCode >= 300 ? 36 // cyan
                  : res.statusCode >= 200 ? 32 // green
                      : 0; // no color

    return `\x1b[${color}m${res.statusCode}\x1b[0m`;
  });

  logger.token('timestamp',
    (req, res) => req['_startTime'].toISOString() || new Date().toISOString())
  logger.token('useragent',
    (req, res) => req.get('user-agent'))
  logger.token('sec-ch-ua',
    (req, res) => [
      req.get('sec-ch-ua'), req.get('sec-ch-ua-mobile'), req.get('sec-ch-ua-platform')
    ])
  logger.token('ipaddr',   
    (req, res) => [
      req.headers['x-forwarded-for'] || req.socket.remoteAddress, req.ip
    ])
  logger.token('host',
    (req, res) => req.get('host'))
  logger.token('connection',
    (req, res) => req.get('connection'))
  logger.token('fetch-mode',
    (req, res) => req.get('sec-fetch-mode'))
  logger.token('locale',
    (req, res) => req.get('accept-language'))

  logger.format('extensive',
    `\x1b[36m:timestamp\x1b[0m \t \x1b[33m]:method\x1b[0m \x1b[35m:url\x1b[0m :statusColor in :response-time ms :res[content-length]
    \t:useragent
    \t\x1b[31m:ipaddr\x1b[0m --> \x1b[35m:host\x1b[0m via :fetch-mode
    \t:sec-ch-ua
    \t:locale

  `)

  return logger('extensive', {
    stream: fs.createWriteStream(logFile, {flags: 'a'})
  });
}

module.exports = setupLogging;