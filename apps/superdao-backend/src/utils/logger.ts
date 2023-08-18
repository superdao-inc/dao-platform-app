import winston from 'winston';
import { config } from 'src/config';

export const prodTransports = [
	new winston.transports.Console({
		format: winston.format.uncolorize()
	})
];

export const devTransports = [
	new winston.transports.Console({
		format: winston.format.combine(
			winston.format.simple(),
			winston.format.colorize({ all: true }),
			winston.format.printf(({ level, message, ...rest }) => {
				return `${level}: ${message} ${Object.keys(rest).length ? JSON.stringify(rest) : ''}`;
			})
		)
	})
];

export const log = winston.createLogger({
	level: config.env.isProd ? 'info' : 'debug',
	format: winston.format.json(),
	silent: config.env.isTest,
	transports: config.env.isProd ? prodTransports : devTransports
});
