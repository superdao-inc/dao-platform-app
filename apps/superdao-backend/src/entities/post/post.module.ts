import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostService } from 'src/entities/post/post.service';
import { PostResolver } from 'src/entities/post/post.resolver';
import { Attachment } from './attachment/attachment.model';
import { Post } from './post.model';
import { Like } from './like.model';
import { Dao } from 'src/entities/dao/dao.model';

@Module({
	imports: [TypeOrmModule.forFeature([Attachment, Post, Like, Dao])],
	providers: [PostService, PostResolver],
	exports: [PostService]
})
export class PostModule {}
