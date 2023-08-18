export const getDaoMemberPath = (daoSlug: string, userSlugOrId: string) => `/${daoSlug}/members/${userSlugOrId}`;
export const getDaoMemberDaosPath = (daoSlug: string, userSlugOrId: string) =>
	`${getDaoMemberPath(daoSlug, userSlugOrId)}/daos`;

export const PATH_PROFILE = '/profile';
export const PATH_PROFILE_DAOS = '/profile/daos';
export const PATH_PROFILE_EDIT = '/profile/edit';
export const PATH_PROFILE_EMAIL_SETTINGS = '/profile/email-settings';
export const PATH_PROFILE_ABOUT = '/profile/about';
