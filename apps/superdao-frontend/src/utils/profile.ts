import { UserByIdOrSlugQuery } from 'src/gql/user.generated';
import { Dao } from 'src/types/types.generated';

export const isUserProfileFilled = (
	user: Pick<UserByIdOrSlugQuery['userByIdOrSlug'], 'displayName' | 'bio' | 'email' | 'slug' | 'links'>
) => {
	const areFieldsFilled = (['displayName', 'bio', 'email', 'slug'] as const).some((property) =>
		Boolean(user[property])
	);

	const areLinksFilled =
		user.links.site || user.links.twitter || user.links.instagram || user.links.discord || user.links.telegram;

	return areFieldsFilled || areLinksFilled;
};

export const isDaoProfileFilled = (dao: Pick<Dao, 'description' | 'slug' | 'links'>) => {
	const areFieldsFilled = (['description', 'slug'] as const).some((property) => Boolean(dao[property]));

	const areLinksFilled =
		dao.links.site || dao.links.twitter || dao.links.instagram || dao.links.discord || dao.links.telegram;

	return areFieldsFilled || areLinksFilled;
};
