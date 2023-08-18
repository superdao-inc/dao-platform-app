import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { AmbassadorStatus, ReferralMessage } from '@sd/superdao-shared';

registerEnumType(ReferralMessage, { name: 'ReferralMessage' });

registerEnumType(AmbassadorStatus, { name: 'AmbassadorStatus' });

@ObjectType()
export class ClaimReferralNftResponse {
	@Field(() => Boolean)
	transactionInitiated: boolean;

	@Field(() => ReferralMessage, { nullable: true })
	message?: ReferralMessage;
}

@ObjectType()
export class AmbassadorStatusResponse {
	@Field(() => AmbassadorStatus)
	message: AmbassadorStatus;
}
