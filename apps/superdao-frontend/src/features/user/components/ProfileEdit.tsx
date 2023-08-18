import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { defaultSuggestionsFilter } from '@draft-js-plugins/mention';
import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { EditorState } from 'draft-js';
import { getPathnameFromUrl, shrinkWallet } from '@sd/superdao-shared';

import { UpdateUserRequest, updateUserResolver } from 'src/validators/users';
import { PageContent } from 'src/components/pageContent';
import { AvatarUploader } from 'src/components/upload/avatarUploader';
import { CoverUploader } from 'src/components/upload/coverUploader';
import { Button } from 'src/components/button';
import { Input, Label } from 'src/components/input';
import { DiscordIcon, LinkIcon, TelegramIcon, TwitterIcon, InstagramIcon } from 'src/components/assets/icons';
import { Title1, toast } from 'src/components';
import { CustomHead } from 'src/components/head';

import { colors } from 'src/style';
import { parseGqlErrorMessage } from 'src/utils/errors';
import { MobileHeader } from 'src/components/mobileHeader';
import { UserAPI } from '../API';
import {
	DaoMention,
	MentionSearchResult,
	TextareaMentionEditor,
	replaceMentionNamesWithIds,
	createEditorStateWithMentions
} from 'src/components/TextareaMentionEditor';
import {
	DaoSuggestionsBySlugDocument,
	DaoSuggestionsBySlugQuery,
	DaoSuggestionsBySlugQueryVariables
} from 'src/gql/mentions.generated';
import { gqlClient } from 'src/client/gqlApi';
import { useMountedState } from 'src/hooks/useMountedState';
import { PublicUserFragment } from 'src/gql/user.generated';

type Props = {
	daoMentions: DaoMention[];
	currentUser: PublicUserFragment;
	hostname: string;
};

export const ProfileEdit = ({ currentUser, daoMentions, hostname }: Props) => {
	const router = useRouter();
	const { t } = useTranslation();
	const isMounted = useMountedState();

	const { mutate: updateUser, isLoading: isUpdateUserLoading } = UserAPI.useUpdateUserMutation();

	useEffect(() => {
		const section = window.location.hash.replace('#', '');

		const socialLinksSectionEl = socialLinksSectionRef.current;

		if (socialLinksSectionEl && section === socialLinksSectionEl.id) {
			// Set focus to the first input
			socialLinksSectionEl.querySelector<HTMLInputElement>('input')?.focus();
		}
	}, []);

	const formProps = useMemo(() => {
		const { id, displayName, bio, avatar, cover, links, slug } = currentUser;

		return {
			resolver: updateUserResolver,
			mode: 'onChange' as const,
			defaultValues: {
				id,
				displayName,
				bio: createEditorStateWithMentions(bio ?? '', daoMentions),
				avatar,
				cover,
				site: links.site,
				telegram: getPathnameFromUrl(links.telegram),
				instagram: getPathnameFromUrl(links.instagram),
				discord: getPathnameFromUrl(links.discord),
				twitter: getPathnameFromUrl(links.twitter),
				slug: slug || id
			}
		};
	}, [currentUser, daoMentions]);
	const { register, handleSubmit, setValue, getValues, formState } = useForm<UpdateUserRequest>(formProps);

	const [suggestions, setSuggestions] = useState<DaoMention[]>([]);
	const [suggestionsIsLoading, setSuggestionsIsLoading] = useState(false);
	const socialLinksSectionRef = useRef<HTMLFieldSetElement>(null);

	const handleBioChange = useCallback((editorState: EditorState) => setValue('bio', editorState), [setValue]);

	const fetchSuggestions = useCallback(
		async ({ value }: MentionSearchResult): Promise<void> => {
			try {
				setSuggestionsIsLoading(true);
				const res = await gqlClient<DaoSuggestionsBySlugQuery, DaoSuggestionsBySlugQueryVariables>({
					query: DaoSuggestionsBySlugDocument,
					variables: { input: { inputValue: value } }
				});

				if (isMounted()) {
					const suggestions = res?.daoSuggestionsBySlug?.suggestions ?? [];
					const filteredSuggestions = defaultSuggestionsFilter(value, suggestions);
					setSuggestions(filteredSuggestions as DaoMention[]);
				}
			} catch (error) {}

			setSuggestionsIsLoading(false);
		},
		[isMounted, t]
	);

	const onSubmit = handleSubmit((data) => {
		const editorState = getValues('bio');
		const formattedBio = editorState ? replaceMentionNamesWithIds(editorState) : null;

		updateUser(
			{ updateUserData: { ...data, bio: formattedBio } },
			{
				onSuccess: (result) => {
					const { slug, id } = result.updateUser;
					router.push(`/users/${slug || id}`);
				},
				onError: (error) => {}
			}
		);
	});

	const { walletAddress, displayName, ens, id, avatar, cover } = currentUser;
	const { isValid, errors } = formState;
	const disabledSubmit = !isValid || isUpdateUserLoading;
	const name = displayName || shrinkWallet(ens || walletAddress);

	return (
		<PageContent columnSize="sm">
			<CustomHead main={name} additional={'Profile edition'} description={'Superdao profile edition'} />

			<Title1 className="mb-6 hidden lg:flex">{t('pages.editProfile.title')}</Title1>

			<MobileHeader title={t('pages.editProfile.title')} onBack={() => router.back()} />

			<Form onSubmit={onSubmit} className="pb-[88px] lg:pb-6">
				<div className="flex w-full flex-col-reverse gap-7 lg:flex-row">
					<AvatarUploader
						label={t('upload.avatarLabel')}
						seed={id}
						currentAvatar={avatar}
						onChange={(file) => {
							setValue('avatar', file);
						}}
					/>

					<CoverUploader
						label={t('upload.coverLabel')}
						seed={id}
						currentCover={cover}
						onChange={(file) => {
							setValue('cover', file);
						}}
					/>
				</div>

				<Input
					label={t('components.user.displayName.label')}
					placeholder={t('components.user.displayName.placeholder')}
					error={errors.displayName?.message}
					{...register('displayName')}
				/>
				<Input
					label={t('components.user.slug.label')}
					placeholder={t('components.user.slug.placeholder')}
					prefix={`${hostname}/users/`}
					prefixClassName="max-w-[161px]"
					className="w-full"
					error={errors.slug?.message}
					{...register('slug')}
				/>

				<TextareaMentionEditor
					editorKey="bioTextarea"
					error={errors.bio?.message}
					initialValue={getValues().bio}
					label={t('components.user.bio.label')}
					loading={suggestionsIsLoading}
					placeholder={t('components.user.bio.placeholder')}
					suggestions={suggestions}
					onChange={handleBioChange}
					onSearchChange={fetchSuggestions}
				/>

				<Input label={t('components.user.wallet.addressLabel')} disabled value={walletAddress} />

				{ens && <Input label={t('components.user.wallet.ensLabel')} disabled value={ens} />}

				<Links id="social-links" ref={socialLinksSectionRef}>
					<Label>{t('components.user.links.label')}</Label>
					<Input
						leftIcon={<LinkIcon fill={colors.foregroundSecondary} />}
						placeholder={t('components.user.links.sitePlaceholder')}
						className="w-full"
						{...register('site')}
					/>
					<Input
						leftIcon={<TwitterIcon fill={colors.foregroundSecondary} />}
						placeholder={t('components.user.links.twitterPlaceholder')}
						prefix="twitter.com/"
						prefixClassName="max-w-[130px]"
						className="w-full"
						{...register('twitter')}
					/>
					<Input
						leftIcon={<InstagramIcon fill={colors.foregroundSecondary} />}
						placeholder={t('components.user.links.instagramPlaceholder')}
						prefix="instagram.com/"
						prefixClassName="max-w-[130px]"
						className="w-full"
						{...register('instagram')}
					/>
					<Input
						leftIcon={<TelegramIcon fill={colors.foregroundSecondary} />}
						placeholder={t('components.user.links.telegramPlaceholder')}
						prefix="t.me/"
						prefixClassName="max-w-[130px]"
						className="w-full"
						{...register('telegram')}
					/>
					<Input
						leftIcon={<DiscordIcon fill={colors.foregroundSecondary} />}
						placeholder={t('components.user.links.discordPlaceholder')}
						prefix="discord.com/invite/"
						prefixClassName="max-w-[130px]"
						className="w-full"
						error={(errors.site || errors.twitter || errors.telegram || errors.discord)?.message}
						{...register('discord')}
					/>
				</Links>

				<div className="bg-backgroundPrimary fixed bottom-0 left-0 w-full py-6 lg:relative lg:mb-0 lg:w-auto lg:py-0">
					<Button
						color="accentPrimary"
						size="lg"
						type="submit"
						label={t('actions.labels.save')}
						disabled={disabledSubmit}
						data-testid="ProfileEdit__saveButton"
						className="mx-4 w-[calc(100%-32px)] lg:mx-0 lg:w-auto"
					/>
				</div>
			</Form>
		</PageContent>
	);
};

const Form = styled.form`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 28px;
`;

const Links = styled.fieldset`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 8px;

	margin: 0;
	padding: 0;
	border: none;
`;
