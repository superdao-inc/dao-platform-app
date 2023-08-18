import 'dotenv/config';
import { cleanEnv, str } from 'envalid';

const env = cleanEnv(process.env, {
	APP_ENV: str({ choices: ['dev', 'stage', 'prod'], default: 'dev' })
});

export const config = {
	appEnv: env.APP_ENV
};
