import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IpfsMetadataService } from './ipfsMetadata.service';

@Module({
	imports: [ConfigModule],
	providers: [IpfsMetadataService],
	exports: [IpfsMetadataService]
})
export class IpfsMetadataModule {}
