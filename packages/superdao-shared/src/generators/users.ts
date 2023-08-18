/**
 * emptyUser returns placeholder for unauthorized user,
 * which can be used for public pages.
 *
 * Can be extended
 */
export const userPlaceholder = (): any => ({
	id: '',
	slug: 'unauthorized',
	displayName: 'unauthorized',
	walletAddress: '',
	createdAt: '',
	nonce: '',
	hasBetaAccess: false,
	isClaimed: false,
	isSupervisor: false
});
