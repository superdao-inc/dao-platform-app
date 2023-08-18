import { DataSource } from 'typeorm';
import { log } from './logger';
import { cliOptions } from './ormConfig';

export const initDB = async () => {
	const dataSource = new DataSource(cliOptions);
	await ensureConnection(dataSource);
	const migrationsStatus = await dataSource.showMigrations();

	if (migrationsStatus) {
		log.error('There are pending migrations');
		process.exit(1);
	}

	return dataSource;
};

async function updateConnectionEntities(dataSource: DataSource) {
	if (dataSource.options.synchronize) {
		await dataSource.synchronize();
	}
}

export async function ensureConnection(dataSource: DataSource) {
	if (!dataSource.isInitialized) {
		await dataSource.initialize();
	}

	if (process.env.NODE_ENV !== 'production') {
		if (dataSource.options.synchronize) {
			await dataSource.synchronize();
		}

		await updateConnectionEntities(dataSource);
	}
}
