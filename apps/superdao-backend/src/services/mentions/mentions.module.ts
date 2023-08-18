import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Dao } from 'src/entities/dao/dao.model';
import { MentionsResolver } from './mentions.resolver';
import { MentionsService } from './mentions.service';

@Module({
	imports: [TypeOrmModule.forFeature([Dao])],
	providers: [MentionsResolver, MentionsService]
})
export class MentionsModule {}
