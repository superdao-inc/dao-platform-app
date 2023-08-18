import { Module } from '@nestjs/common';
import { DaoPassResolver } from 'src/entities/daoPass/daoPass.resolver';

@Module({
	providers: [DaoPassResolver]
})
export class DaoPassModule {}
