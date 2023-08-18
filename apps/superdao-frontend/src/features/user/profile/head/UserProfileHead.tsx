import { useTranslation } from 'next-i18next';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import copy from 'clipboard-copy';
import { useRouter } from 'next/router';

import { getOptimizedFileUrl } from 'src/utils/upload';
import { shrinkWallet } from '@sd/superdao-shared';

import { generateCoverGradient } from 'src/utils/cover-generator';
import { ProfileHeader } from 'src/components/profileHeader';
import {
	Body,
	Button,
	DoneIcon,
	Label1,
	Label2,
	PlusBoldIcon,
	SettingsIcon,
	SocialLinks,
	Title1,
	UserAvatar
} from 'src/components';
import { CollapsableDescription } from 'src/components/collapsableDescription';
import { toast } from 'src/components/toast/toast';
import { colors } from 'src/style';
import { openExternal } from 'src/utils/urls';
import { UserAPI } from 'src/features/user/API';
import { PATH_PROFILE_EDIT } from 'src/features/user/constants';
import { PublicUserFragment } from 'src/gql/user.generated';
import { prepareBio } from 'src/utils/bio';
import { MENTION_SYMBOL } from 'src/constants/bio';
import { DaoBioMention } from 'src/components/bioMention/daoBioMention';
import { SuperdaoWalletBadge } from 'src/features/profile/walletBadge/superdaoWalletBadge';
import Tooltip from 'src/components/tooltip';

type UserProfileHeadProps = {
	user: PublicUserFragment;
};

const UserProfileHead = (props: UserProfileHeadProps) => {
	const { user } = props;

	const {
		id: userId,
		slug,
		displayName,
		bio: description,
		walletAddress,
		walletType,
		ens,
		avatar,
		cover,
		links
	} = user;
	const { site, telegram, twitter, instagram, discord } = links;

	const [publicLink, setPublicLink] = useState<string | undefined>();

	const { t } = useTranslation();

	const { push } = useRouter();

	useEffect(() => {
		const origin = window.location.origin;

		setPublicLink(`${origin}/users/${slug || userId}`);
	}, [slug, userId]);

	const isCurrentUserProfile = UserAPI.useIsCurrentUser(userId);

	const hasAnySocialLink = twitter || instagram || discord || telegram || site;

	const handleProfileEdit = useMemo(() => {
		if (isCurrentUserProfile) {
			return () => push(PATH_PROFILE_EDIT);
		}
	}, [isCurrentUserProfile, push]);

	const handleAddContacts = useCallback(() => {
		return push(`${PATH_PROFILE_EDIT}#social-links`);
	}, [push]);

	const handleSocialLinkClick = useCallback((link: string) => openExternal(link), []);

	const handleSlugCopy = useCallback(async () => {
		if (!publicLink) return;

		await copy(publicLink);

		toast(
			<div className="flex items-center gap-2">
				<DoneIcon className="h-6 w-6" fill={colors.accentPositive} /> <Label1>{t('actions.confirmations.copy')}</Label1>
			</div>,
			{ id: 'wallet-address-copy' }
		);
	}, [publicLink, t]);

	const preparedBio = prepareBio(description);

	const bioContent = preparedBio.reduce<Array<string | JSX.Element>>((acc, value) => {
		if (!value.startsWith(MENTION_SYMBOL)) {
			acc.push(value);
			return acc;
		}

		const id = value.slice(1);

		acc.push(<DaoBioMention key={id} daoId={id} />);

		return acc;
	}, []);

	const ensOrAddress = ens || walletAddress;

	const title = displayName || shrinkWallet(ensOrAddress);

	return (
		<>
			<ProfileHeader
				titleText={t('components.user.profile')}
				rightNode={
					handleProfileEdit && (
						<button onClick={handleProfileEdit} className="rounded-full p-3">
							<SettingsIcon fill={colors.foregroundTertiary} width={24} height={24} />
						</button>
					)
				}
			/>

			<div className="bg-backgroundSecondary rounded-xl p-2">
				<div
					className="h-40 rounded-lg !bg-cover !bg-center"
					style={{
						background: cover ? `url(${getOptimizedFileUrl(cover)})` : generateCoverGradient(userId)
					}}
					data-testid="Profile__cover"
				/>

				<main className="bg-backgroundSecondary relative flex w-full flex-col items-center rounded-xl px-4 pt-6 pb-5 lg:mt-0 lg:items-start lg:rounded-none lg:rounded-b-xl">
					<UserAvatar
						className="bg-backgroundSecondary border-backgroundSecondary absolute top-0 -translate-y-1/2 transform rounded-full border-[8px] lg:left-5"
						seed={userId}
						src={avatar ? getOptimizedFileUrl(avatar) : undefined}
						size="112"
						data-testid="Profile__avatar"
					/>

					<div className="hidden h-8 self-end lg:flex">
						{handleProfileEdit && (
							<Button
								onClick={handleProfileEdit}
								color="backgroundTertiary"
								size="md"
								label={t('components.user.actions.edit')}
							/>
						)}
					</div>

					<Title1 className="m-w-100 mt-11 w-full truncate lg:mt-3" data-testid="Profile__name">
						{title}
					</Title1>

					{slug && (
						<Tooltip content={t('actions.labels.clickToCopy')} placement="bottom">
							<Body className="cursor-pointer truncate" onClick={handleSlugCopy} color={colors.foregroundTertiary}>
								{`@${slug}`}
							</Body>
						</Tooltip>
					)}

					{description && <CollapsableDescription transformedDescription={bioContent} description={description} />}

					<div className="mt-4 flex flex-col items-center gap-5 lg:flex-row lg:justify-start lg:gap-2">
						<SuperdaoWalletBadge walletAddress={walletAddress} walletType={walletType} />

						{!hasAnySocialLink && (
							<div
								className={
									'hover:bg-overlaySecondary border-overlaySecondary flex w-max cursor-pointer items-center gap-2 rounded-[100px] border-2 py-1.5 px-3 transition-all hover:border-transparent'
								}
								onClick={handleAddContacts}
							>
								<PlusBoldIcon />
								<Label2>{t('components.user.addContacts')}</Label2>
							</div>
						)}
						<SocialLinks
							twitter={twitter}
							discord={discord}
							telegram={telegram}
							instagram={instagram}
							site={site}
							onSocialLinkClick={handleSocialLinkClick}
						/>
					</div>
				</main>
			</div>
		</>
	);
};

export default memo(UserProfileHead);
