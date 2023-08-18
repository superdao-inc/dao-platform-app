import { Module } from '@nestjs/common';

import { DelayedMessageBrokerService } from './delayedMessage.service';

@Module({
	providers: [DelayedMessageBrokerService],
	exports: [DelayedMessageBrokerService]
})
export class DelayedMessageBrokerModule {}
