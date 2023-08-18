import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

import { VerificationErrorCode } from './verification.error';
import { VerificationService } from './verification.service';

describe('VerificationService', () => {
	let verificationService: VerificationService;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [JwtModule.register({ secret: 'secret-for-test' })],
			providers: [VerificationService]
		}).compile();

		verificationService = moduleRef.get<VerificationService>(VerificationService);
	});

	describe('token flow', () => {
		const payload = {
			email: 'dan@superdao.co',
			userId: 'c703f824-376f-558c-be36-ef382d8ebde2'
		};
		let token: string;

		it('should generate token', () => {
			token = verificationService.generateToken(payload);

			expect(token).toBeDefined();
		});

		it('should verify token', () => {
			const tokenPayload = verificationService.verifyToken(token);

			expect(tokenPayload).toEqual(payload);
		});

		it('should not verify corrupted token', () => {
			const [header, _, signature] = token.split('.');
			const corruptedPayload = 'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ';
			const corruptedToken = [header, corruptedPayload, signature].join('.');

			try {
				const tokenPayload = verificationService.verifyToken(corruptedToken);

				expect(tokenPayload).not.toBeDefined();
			} catch (error: any) {
				expect(error.code).toBe(VerificationErrorCode.TOKEN_INVALID);
			}
		});

		describe('expiration date', () => {
			let token: string;

			beforeAll(() => {
				jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

				token = verificationService.generateToken(payload, {
					expiresIn: '30d'
				});
			});

			afterAll(() => {
				jest.useRealTimers();
			});

			it('should be valid before expiration', () => {
				jest.useFakeTimers().setSystemTime(new Date('2020-01-29'));
				const tokenPayload = verificationService.verifyToken(token);

				expect(tokenPayload).toEqual(tokenPayload);
			});

			it('should not be valid after expiration', () => {
				jest.useFakeTimers().setSystemTime(new Date('2020-02-01'));
				try {
					const tokenPayload = verificationService.verifyToken(token);

					expect(tokenPayload).not.toBeDefined();
				} catch (error: any) {
					expect(error.code).toBe(VerificationErrorCode.TOKEN_EXPIRED);
				}
			});
		});
	});
});
