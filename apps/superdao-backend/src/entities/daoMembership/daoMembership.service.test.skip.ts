import { afterAll, beforeAll, describe, test } from '@jest/globals';
import { Connection } from 'typeorm';
import { Wallet } from 'ethers';
import times from 'lodash/times';
import { mockConnection } from 'src/utils/mockConnection';
import { Dao } from 'src/entities/dao/dao.model';
import { User } from 'src/entities/user/user.model';
import { DaoMembership } from 'src/entities/daoMembership/daoMembership.model';
import { DaoMemberRole } from 'src/entities/daoMembership/daoMembership.types';
import { DaoMembershipService } from 'src/entities/daoMembership/daoMembership.service';
import { Links } from '../links/links.model';

let connection: Connection;
let dao: Dao;
let users: User[];
let service: DaoMembershipService;

const totalCount = 40;
const adminsStarts = 35;
const creatorsStarts = 39;

jest.setTimeout(600000);

async function seed(connection: Connection) {
	const daoRepo = connection.getRepository(Dao);
	const preDao = daoRepo.create({
		name: 'test',
		description: 'test',
		slug: 'test'
	});
	dao = await daoRepo.save(preDao);

	const userRepo = connection.getRepository(User);
	const daoMembershipRepo = connection.getRepository(DaoMembership);
	const linksRepo = connection.getRepository(Links);

	const preUsers = times(totalCount, (i) =>
		userRepo.create({
			walletAddress: Wallet.createRandom().address,
			nonce: 'some-nonce',
			isClaimed: true,
			hasBetaAccess: true,
			isSupervisor: false,
			displayName: `User ${i}`
		})
	);

	users = await userRepo.save(preUsers);

	for (let i = 0; i < users.length; i++) {
		await new Promise((res) => setTimeout(res, 5));
		const role =
			i >= creatorsStarts ? DaoMemberRole.Creator : i >= adminsStarts ? DaoMemberRole.Admin : DaoMemberRole.Member;
		await daoMembershipRepo.save({
			daoId: dao.id,
			userId: users[i].id,
			role: role,
			tier: 'LoL'
		});
		await linksRepo.save({
			entityId: users[i].id
		});
	}
}

describe.skip('daoMembers service test', () => {
	beforeAll(async () => {
		connection = await mockConnection.create();
		await seed(connection);
		service = new DaoMembershipService(
			mockConnection.dataSource as any,
			connection.getRepository(User),
			connection.getRepository(Dao),
			connection.getRepository(DaoMembership),
			null as any,
			null as any,
			null as any
		);
	});

	afterAll(async () => {
		await mockConnection.clear();
		await mockConnection.close();
	});

	test('get members should sort by role', async () => {
		const members = await service.getMembers({
			daoId: dao.id,
			roles: null as any,
			search: '',
			offset: 0,
			limit: 10
		});

		expect(members.count).toBe(users.length);
		expect(members.items).toHaveLength(10);
		expect(members.items[0].role).toBe(DaoMemberRole.Creator);
		expect(members.items[1].role).toBe(DaoMemberRole.Admin);
		expect(members.items[5].role).toBe(DaoMemberRole.Member);
		expect(members.items[5].userId).toBe(users[0].id);
	});

	test('get members should filter by role', async () => {
		const members = await service.getMembers({
			daoId: dao.id,
			roles: [DaoMemberRole.Admin],
			search: '',
			offset: 0,
			limit: 5
		});

		expect(members.count).toBe(4);
		expect(members.items).toHaveLength(4);
		members.items.forEach((i) => {
			expect(i.role).toBe(DaoMemberRole.Admin);
		});
	});

	test('get members with current on top', async () => {
		const members = await service.getMembers(
			{
				daoId: dao.id,
				roles: null as any,
				search: '',
				offset: 0,
				limit: 5
			},
			users[30]
		);

		expect(members.count).toBe(users.length);
		expect(members.items).toHaveLength(5);
		expect(members.items[0].userId).toBe(users[30].id);
	});

	test('get members with current and offset', async () => {
		const members = await service.getMembers(
			{
				daoId: dao.id,
				roles: [DaoMemberRole.Member],
				search: '',
				offset: 5,
				limit: 5
			},
			users[30]
		);

		expect(members.count).toBe(35);
		expect(members.items).toHaveLength(5);
		expect(members.items[0].userId).toBe(users[4].id);
	});

	test('get members must escape search queries', async () => {
		const members = await service.getMembers(
			{
				daoId: dao.id,
				roles: [DaoMemberRole.Member],
				search: 'u_er',
				offset: 0,
				limit: 5
			},
			users[30]
		);

		expect(members.items).toHaveLength(0);
	});
});
