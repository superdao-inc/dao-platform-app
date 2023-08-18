import { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Trans, useTranslation } from 'next-i18next';
import styled from '@emotion/styled';

import uniqWith from 'lodash/uniqWith';
import { CSVDownload } from 'react-csv';
import { airdropGuideLink, contactSupportCustomiseLink } from 'src/constants';

import { colors } from 'src/style';

import { prefetchData, SSR, SSRAuthMiddleware } from 'src/client/ssr';
import { useSwitch } from 'src/hooks';

import { Body, Button, DangerIcon, DownloadIcon, Label1, Title3, toast, SubHeading } from 'src/components';
import { Name } from 'src/pagesComponents/common/header';
import { UploadModal } from 'src/pagesComponents/membersImport/uploadModal';
import { AirdropParticipantType } from 'src/pagesComponents/membersImport/types';
import { getDaoWithRoles } from 'src/client/commonRequests';
import { useNftCollectionQuery } from 'src/gql/nft.generated';
import { useDaoMembersToExportQuery } from 'src/gql/daoMembership.generated';
import { useDaoWhitelistSaleQuery } from 'src/gql/whitelist.generated';
import { useCollectionTiersById } from 'src/hooks/useCollectionTiers';
import { getTiersNames } from 'src/utils/tiers';
import { DuplicatesModal } from '../duplicatesModal';
import { getImportTitles } from './helpers/getImportTitles';
import { useImport } from './hooks/useImport';
import { TierManager } from './tierManager';
import { FormType } from '../../dao/nftSelect';

type Props = {
	slug: string;
	daoId: string;
	daoAddress: string;
	csvFilename?: string;
	csvParticipants?: AirdropParticipantType[];
	isWhitelistMode?: boolean;
	isDuplicatesActive?: boolean;
	onBack?: () => void;
};

export type Members = {
	walletAddress: string;
	email: string | null;
	tiers: string[] | null;
};

const DaoMembersImport: NextPage<Props> = (props) => {
	const { slug, daoId, daoAddress, csvFilename, csvParticipants, onBack, isWhitelistMode, isDuplicatesActive } = props;
	const [members, setMembers] = useState<Members[] | undefined>();
	const [exportData, setExportData] = useState<AirdropParticipantType[] | null>(null);

	const { t } = useTranslation();
	const { push } = useRouter();
	const { data: collectionData, isLoading: isLoadingCollections } = useNftCollectionQuery({ daoAddress });

	const { data: exportMembersData } = useDaoMembersToExportQuery({ daoId });
	const { data: daoWhitelistSaleData } = useDaoWhitelistSaleQuery({ daoId });

	const { exportMembers } = exportMembersData || {};
	const { daoWhitelistSale } = daoWhitelistSaleData || {};

	const { collection } = collectionData || {};
	const tiers = useMemo(() => collection?.tiers || [], [collection?.tiers]);
	const tiersHash = useCollectionTiersById(daoAddress);

	const [isUploadModalOpen, { on: openUploadModal, off: closeUploadModal }] = useSwitch(false);
	const [isExport, { on: openExport }] = useSwitch(false);

	const [isDuplicatesModalOpen, { on: openDuplicatesModal, off: closeDuplicatesModal }] = useSwitch(false);

	useEffect(() => {
		if (!csvFilename) {
			push(`/${slug}/members`);
		}
	}, [csvFilename, push, slug]);

	const formType = isWhitelistMode ? FormType.whitelist : FormType.airdrop;
	const [filename, setFilename] = useState(csvFilename || '');

	const {
		totalCount,
		uniqueCount,
		canSend,
		isLoading,
		groups,
		participants,
		participantsByTier,
		options,
		selectedTiersWalletsSize,
		handleSelect,
		handleSetError,
		handleSend,
		setParticipants
	} = useImport({
		csvParticipants,
		formType,
		daoId,
		daoAddress,
		tiers,
		onBack
	});
	const { buttonText, headingTitle, nftTierHeading } = useMemo(
		() => getImportTitles({ formType, t, selectedTiersWalletsSize }),
		[formType, selectedTiersWalletsSize, t]
	);

	const handleCloseUploadModal = async (newCsvFilename: string, newCsvParticipants: AirdropParticipantType[]) => {
		setFilename(newCsvFilename);
		setParticipants(newCsvParticipants);
		setExportData(null);
		closeUploadModal();
	};

	const handleCloseDuplicatesModal = () => {
		closeDuplicatesModal();
	};

	const handleDeleteDuplicates = (
		removingDuplicates: { [key: string]: boolean | number },
		isCsvDuplicatesSelected: boolean
	) => {
		let newParticipants = participants.filter(({ walletAddress }) => !removingDuplicates[walletAddress.toLowerCase()]);
		if (isCsvDuplicatesSelected) {
			newParticipants = uniqWith(
				newParticipants,
				(a, b) =>
					Boolean(a.walletAddress) &&
					a.walletAddress.toLowerCase() === b.walletAddress.toLowerCase() &&
					a.tier === b.tier
			);
		}
		setParticipants(newParticipants);
		setExportData(newParticipants);
		closeDuplicatesModal();
	};

	const handleBack = () => {
		if (onBack) {
			onBack();
		} else {
			push(`/${slug}/members`);
		}
	};

	const downloadCsv = () => {
		if (!exportData) return null;
		else if (exportData.length) openExport();
		else {
			toast.error(t('pages.importMembers.duplicates.allRemoved'));
		}
	};

	const handleCancelUploadModal = () => {
		if (filename.length > 0) {
			closeUploadModal();
		} else {
			handleBack();
		}
	};

	useEffect(() => {
		const exmembers = [] as Members[];
		if (isWhitelistMode) {
			daoWhitelistSale?.map((wl) => {
				exmembers.push({ tiers: wl.tiers, walletAddress: wl.walletAddress, email: wl.walletAddress });
			});
		} else {
			exportMembers?.items.map((member) => {
				const tier = getTiersNames(tiersHash, member.tiers).join(';');
				exmembers.push({ tiers: [tier], ...member.user });
			});
		}
		setMembers(exmembers);
	}, [daoWhitelistSale, exportMembers, isWhitelistMode, tiers, tiersHash]);

	const existingMembersDuplicates = useMemo(() => {
		return members?.filter((member) =>
			participants?.find((participant) => participant.walletAddress.toLowerCase() === member.walletAddress)
		);
	}, [participants, members]);

	const csvMembersDuplicates = useMemo(() => {
		let lookup: Record<string, Record<string, number>> = {};
		let duplicates: Record<string, number> = {};
		Object.keys(groups).map((group) => {
			const result = groups[group].reduce((a: { [key: string]: number }, e) => {
				if (!e.walletAddress) return a;
				const walletAddress = lookup?.[group]?.[e.walletAddress.toLowerCase()] || e.walletAddress.toLowerCase();

				a[walletAddress] = ++a[walletAddress] || 0;
				return a;
			}, {});
			lookup = { ...lookup, [group]: result };
		});
		Object.keys(lookup).map((key) => {
			const group = lookup[key];
			Object.keys(group).map((duplicate) => {
				if (group[duplicate] > 0)
					duplicates = { ...duplicates, [duplicate]: (duplicates[duplicate] || 0) + group[duplicate] };
			});
		});
		return duplicates;
	}, [groups]);

	const isTierManagerVisible = exportData ? !!exportData?.length : true;
	const areThereDuplicates = existingMembersDuplicates?.length || Object.keys(csvMembersDuplicates).length;
	const isDuplicatesBlockVisible = isDuplicatesActive && areThereDuplicates;

	return (
		<Inner>
			<>
				<Name>{headingTitle}</Name>
				<StyledSubHeading className="mt-3">
					<Trans
						i18nKey={`pages.importMembers.${isWhitelistMode ? 'whitelistSubHeading' : 'subHeading'}`}
						components={[
							<a href={airdropGuideLink} target="_blank" key="0" rel="noreferrer" />,
							<a href={contactSupportCustomiseLink} target="_blank" key="1" rel="noreferrer" />
						]}
					/>
				</StyledSubHeading>

				<FileInfoHeader className="mt-6">
					<Title3>{t('pages.importMembers.fileInfo.heading')}</Title3>
					<ChangeButton color={colors.accentPrimary} onClick={openUploadModal}>
						{t('pages.importMembers.fileInfo.changeBtn')}
					</ChangeButton>
				</FileInfoHeader>

				<FileInfo className="bg-backgroundSecondary mt-4 rounded-md py-4 px-8">
					<Title3 className="break-all">{filename}</Title3>
					<ParticipantsCount className="mt-2 block" color={colors.foregroundSecondary}>
						<ParticipantsCount color={totalCount ? colors.accentPositive : colors.foregroundSecondary}>
							{t('pages.importMembers.fileInfo.uniqueCount', {
								uniqueCount: isWhitelistMode ? uniqueCount : selectedTiersWalletsSize
							})}
						</ParticipantsCount>{' '}
						• {t('pages.importMembers.fileInfo.totalCount', { totalCount })}
					</ParticipantsCount>
					{exportData && (
						<div className="mt-[10px] flex cursor-pointer" onClick={downloadCsv}>
							<DownloadIcon width={24} height={24} />
							<DownloadButton color={colors.foregroundSecondary}>
								{t('pages.importMembers.duplicates.download')}
							</DownloadButton>
						</div>
					)}
				</FileInfo>
				{isDuplicatesBlockVisible ? (
					<FileInfo className="bg-backgroundSecondary mt-4 flex flex-wrap justify-between rounded-md py-1 px-8">
						<FileInfoDuplicates className="py-3">
							<DangerIcon />
							<Body>{t('pages.importMembers.duplicates.headline')}</Body>
						</FileInfoDuplicates>
						<ChangeButton className="ml-[37px] py-3" color={colors.accentPrimary} onClick={openDuplicatesModal}>
							{t('pages.importMembers.duplicates.check')}
						</ChangeButton>
					</FileInfo>
				) : null}

				{isTierManagerVisible && (
					<>
						<TierRow className="mt-8">
							<TiersHeader className="hidden pr-10 sm:!block">
								{t('pages.importMembers.tiers.importTierHeading')}
							</TiersHeader>
							<TiersHeader className="hidden pl-0.5 sm:!block">
								{/* from hook too */}
								{nftTierHeading}
							</TiersHeader>
							<TiersHeader className="block sm:hidden">
								{t('pages.importMembers.tiers.importTierHeadingUniversal')}
							</TiersHeader>
						</TierRow>

						{Object.keys(groups).map((csvTierName) => (
							<TierManager
								isWhitelistMode={isWhitelistMode}
								isLoading={isLoadingCollections}
								key={csvTierName}
								csvTierName={csvTierName}
								csvTierCount={groups[csvTierName].length}
								participantsByTier={participantsByTier}
								participants={participants}
								tiers={tiers}
								options={options}
								onSetError={handleSetError}
								onSelectTier={handleSelect(csvTierName)}
							/>
						))}

						<Button
							className="mt-8 mb-[46px] sm:mb-0"
							size="lg"
							color="accentPrimary"
							label={buttonText}
							onClick={handleSend}
							disabled={!canSend}
							isLoading={isLoading}
						/>
					</>
				)}

				{isExport && exportData && <CSVDownload data={exportData} enclosingCharacter="" />}

				<UploadModal isOpen={isUploadModalOpen} onSubmit={handleCloseUploadModal} onCancel={handleCancelUploadModal} />
				<DuplicatesModal
					existingDuplicates={existingMembersDuplicates || []}
					csvDuplicates={csvMembersDuplicates}
					isOpen={isDuplicatesModalOpen}
					onClose={handleDeleteDuplicates}
					onCancel={handleCloseDuplicatesModal}
				/>
			</>
		</Inner>
	);
};

export const getServerSideProps = SSR(SSRAuthMiddleware, async (ctx) => {
	const slug = ctx.params?.slug;
	if (typeof slug !== 'string') return { notFound: true };

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);
	if (!dao) return { notFound: true };

	return {
		props: {
			daoId: dao.id,
			slug: dao.slug,
			daoAddress: dao.contractAddress,
			...getProps()
		}
	};
});

export { DaoMembersImport };

const Inner = styled.div`
	position: relative;
`;

const FileInfoHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const FileInfo = styled.div`
	background-color: ${colors.backgroundSecondary};
	border-radius: 8px;
	padding: 16px 24px;
	margin-top: 8px;
`;

const FileInfoDuplicates = styled.div`
	display: flex;
	gap: 13px;
	@supports not (gap: 13px) {
		${Body} {
			margin-left: 13px;
		}
	}
`;

const ParticipantsCount = styled(Body)`
	display: inline;
`;

const TiersHeader = styled(Title3)`
	flex: 1;
`;

const TierRow = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 8px;
`;

const ChangeButton = styled(Label1)`
	cursor: pointer;

	&:hover {
		color: ${colors.accentPrimaryHover};
	}
`;

const DownloadButton = styled(Label1)`
	margin-left: 10px;
`;

const StyledSubHeading = styled(SubHeading)`
	& a {
		color: ${colors.accentPrimary};
	}
`;
