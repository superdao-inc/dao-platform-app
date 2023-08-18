import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UpdateUserEmailResponse {
	/**
	 * Timestamp before which a new message cannot be sent
	 */
	@Field(() => Number)
	nextAttemptToSendEmail: number;
}
