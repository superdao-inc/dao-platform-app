import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { nanoid } from 'nanoid';

import { MagicLinkNonceDto } from 'src/entities/auth/dto/magicLinkNonce.dto';
import { getReadableNonce } from 'src/entities/auth/utils';

import { Links } from 'src/entities/links/links.model';

// User
import { UserWalletType } from 'src/entities/user/user.types';
import { UserService } from 'src/entities/user/user.service';
import { User } from 'src/entities/user/user.model';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User) private usersRepository: Repository<User>,
		@InjectRepository(Links) private linksRepository: Repository<Links>,
		private readonly userService: UserService
	) {}

	async authMagicLinkNonce(magicLinkNonceDto: MagicLinkNonceDto): Promise<string> {
		const { walletAddress: userWallet, email, discord, facebook, twitter } = magicLinkNonceDto;

		const walletAddress = userWallet.toLowerCase();

		const nonce = getReadableNonce(nanoid());
		const user = await this.userService.findByWalletAddress(walletAddress);

		if (!user) {
			const insertedUser = await this.usersRepository.save({
				walletAddress,
				nonce,
				email,
				emailVerified: !!email,
				walletType: UserWalletType.MAGIC_LINK
			});

			const links = await this.linksRepository.save({ entityId: insertedUser.id, discord, facebook, twitter });

			await this.usersRepository.update({ id: insertedUser.id }, { links });

			return nonce;
		}

		user.walletType = UserWalletType.MAGIC_LINK;
		user.nonce = nonce;
		await user.save();

		let links = await this.linksRepository.findOneBy({ entityId: user.id });
		if (!links) links = await this.linksRepository.save({ entityId: user.id });

		links.discord ??= discord;
		links.facebook ??= facebook;
		links.twitter ??= twitter;
		await links.save();

		return nonce;
	}
}
