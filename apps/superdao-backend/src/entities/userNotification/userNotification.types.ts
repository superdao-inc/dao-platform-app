import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';

// eslint-disable-next-line no-shadow
export enum NotificationType {
	NewNft = 'NewNft'
}

registerEnumType(NotificationType, {
	name: 'NotificationType'
});

@ObjectType()
@InputType('NewNftDataInput')
export class NewNftData {
	@Field(() => String)
	id: string;
}
