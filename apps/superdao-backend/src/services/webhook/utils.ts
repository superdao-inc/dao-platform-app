import { ethers } from 'ethers';
import { daoRewardsMap, STAGE_TEST_DAO_ADDRESS } from 'src/services/webhook/constants';
import { WebhookFormMessageBodyData } from 'src/services/webhook/webhook.types';

export const getRewardTierId = (daoAddress: string, resultPoints: number): string => {
	const rewardsMap = Object.entries(
		daoRewardsMap?.[daoAddress.toLowerCase() as keyof typeof daoRewardsMap] ?? daoRewardsMap[STAGE_TEST_DAO_ADDRESS]
	);

	const defaultReward = rewardsMap[0][0]; // mean that daoRewardsMap is sorted by asc

	return rewardsMap.reverse().find(([_, points]) => resultPoints >= points)?.[0] ?? defaultReward;
};

type GetDataFromWebhookFormMessageBodyResult = { email: string; result: number; walletAddress?: string };

export const getDataFromWebhookFormMessageBody = (
	body: WebhookFormMessageBodyData
): GetDataFromWebhookFormMessageBodyResult => {
	const walletAddress =
		Object.entries(body.data.lead2).find(([key]) => key.toUpperCase().includes('SHORT'))?.[1]?.value ?? ''; // Short text
	return {
		result: body.data.result,
		email: Object.entries(body.data.lead2).find(([key]) => key.toUpperCase().includes('EMAIL'))?.[1]?.value ?? '', // email
		walletAddress: ethers.utils.isAddress(walletAddress) ? walletAddress : undefined
	};
};
