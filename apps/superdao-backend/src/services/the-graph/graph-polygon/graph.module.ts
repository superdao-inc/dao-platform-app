import { Module } from '@nestjs/common';
import { GraphClient } from './graph.client';

@Module({
	providers: [GraphClient],
	exports: [GraphClient]
})
export class GraphModule {}
