import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';

// eslint-disable-next-line no-shadow
export enum AttachmentType {
	image = 'image',
	link = 'link'
}
registerEnumType(AttachmentType, { name: 'AttachmentType', description: 'Post attachment types' });

@ObjectType()
@InputType('AttachmentImageDataInput')
export class AttachmentImageData {
	@Field(() => String)
	fileId: string;
}

@ObjectType()
@InputType('AttachmentLinkDataInput')
export class AttachmentLinkData {
	@Field(() => String)
	url: string;

	@Field(() => String)
	title: string;

	@Field(() => String)
	description: string;

	@Field(() => String)
	image: string;
}
