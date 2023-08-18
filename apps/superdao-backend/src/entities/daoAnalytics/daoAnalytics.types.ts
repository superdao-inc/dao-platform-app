import { registerEnumType } from '@nestjs/graphql';

export enum DaoMaskType {
	Public = 'PUBLIC',
	Test = 'TEST',
	Internal = 'INTERNAL'
}
registerEnumType(DaoMaskType, { name: 'DaoMaskType', description: 'Describes usage of particular dao' });
