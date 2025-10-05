const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;

const myFormat = printf(({ level, message, timestamp, ...rest }) => {
  const restMsg = Object.keys(rest).length ? JSON.stringify(rest) : '';
  return `${timestamp} ${level}: ${message} ${restMsg}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp(), myFormat),
  transports: [
    new transports.Console({ format: combine(colorize(), timestamp(), myFormat) }),
    new transports.Console({
      format: format.simple(),
      log: info => console.log(info[Symbol.for('message')]) // ensures console.log output
    }),
  ],
});

module.exports = console
