import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ApolloError } from 'apollo-server';
import { GqlContextType } from '@nestjs/graphql';
import { mapErrorToStatus } from 'src/utils/graphqlConfig';

@Catch()
export class AllExceptionFilter extends BaseExceptionFilter {
	private readonly logger = new Logger(AllExceptionFilter.name);

	catch(error: any, host: ArgumentsHost): any {
		if (host.getType() === 'http') {
			super.catch(error, host);
		} else if (host.getType<GqlContextType>() === 'graphql') {
			const { message, name, stack } = error;

			if (error instanceof ApolloError) {
				if (mapErrorToStatus(error.extensions?.code) >= 500) {
					this.logger.error({ message, name, stack });
				}
			} else {
				this.logger.error(`UnhandledError (${error.name})`, { message: error.message, stack: error.stack });
			}

			throw error;
		} else {
			throw new Error('Unknown context type');
		}
	}
}
