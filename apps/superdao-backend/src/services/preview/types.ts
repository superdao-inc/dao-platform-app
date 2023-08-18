import { Dao } from 'src/entities/dao/dao.model';

export interface IDaoProfilePreviewParams {
	artworks: string[];
	tiersCount: number;
	dao: Dao;
	daoAvatarUrl?: string | null | undefined;
	daoGradientFromColor?: string | null | undefined;
	daoGradientToColor?: string | null | undefined;
}

export interface IBullQueueResponse {
	isInStorage: boolean;
	jobId: number | string | null;
	imageHashSum: string;
}

export class ImageError extends Error {
	constructor(msg: string) {
		super(msg);

		// Set the prototype explicitly.
		Object.setPrototypeOf(this, ImageError.prototype);
	}
}
