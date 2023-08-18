import { registerEnumType } from '@nestjs/graphql';

export enum ReferralLinkStatus {
	active = 'active',
	disabled = 'disabled'
}

registerEnumType(ReferralLinkStatus, { name: 'ReferralLinkStatus' });
