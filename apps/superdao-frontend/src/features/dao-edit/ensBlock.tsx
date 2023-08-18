import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { openExternal } from 'src/utils/urls';

import { colors } from 'src/style';
import { ActionBlock } from 'src/components/action-block';
import { SnapshotIcon } from 'src/components/assets/icons/snapshot';
import { DropdownMenu } from 'src/components/';
import { ExternalLinkIcon } from 'src/components/assets/icons/externalLink';
import { BanIcon } from 'src/components/assets/icons/ban';
import { Button } from 'src/components/button';
import { Body } from 'src/components/text';
import { snapshotSpaceUrl, snapshotStrategiesGuide } from 'src/constants';
import { useDaoBySlugQuery, useUpdateDaoMutation } from 'src/gql/daos.generated';
import { mapDaoDataToUpdate } from 'src/hooks';

type Props = {
	ensDomain: string | null;
	slug: string;
	daoId: string;
};

export const EnsBlock = (props: Props) => {
	const { ensDomain, slug, daoId } = props;

	const router = useRouter();
	const { t } = useTranslation();
	const { mutate } = useUpdateDaoMutation();
	const { data: daoData, refetch } = useDaoBySlugQuery({ slug });
	const { daoBySlug } = daoData || {};

	const handleOpenSnapshotIntegrationPage = () => router.push(`/${slug}/voting/integration`);

	const handleDisconnectSnapshot = () => {
		const mappedDao = daoBySlug ? mapDaoDataToUpdate(daoBySlug) : daoBySlug;

		mutate(
			{ updateDaoData: { ...mappedDao, id: daoId, ensDomain: null } },
			{
				onSuccess: () => {
					refetch();
				}
			}
		);
	};

	return ensDomain ? (
		<div className="flex w-full gap-3">
			<ActionBlock
				className="px-4 py-3"
				icon={<SnapshotIcon width={20} height={20} />}
				iconWithoutBackground
				title={
					(
						<div className="flex items-center">
							{t('components.dao.voting.edit.name')}
							<Dot />
							<StyledBody>{ensDomain}</StyledBody>
						</div>
					) as any
				}
				action={
					<div className="max-h-6">
						<DropdownMenu
							options={[
								{
									label: t('components.dao.voting.edit.space'),
									before: <ExternalLinkIcon width={20} height={20} />,
									onClick: () => {
										openExternal(`${snapshotSpaceUrl}${ensDomain}`);
									}
								},
								{
									label: t('components.dao.voting.edit.strategies'),
									before: <ExternalLinkIcon width={20} height={20} />,
									onClick: () => {
										openExternal(snapshotStrategiesGuide);
									}
								},
								{
									label: t('components.dao.voting.edit.disconnect'),
									before: <BanIcon width={20} height={20} />,
									onClick: handleDisconnectSnapshot
								}
							]}
						/>
					</div>
				}
			/>
		</div>
	) : (
		<div className="flex w-full gap-3">
			<Button
				className="flex-1 justify-start px-3"
				data-testid="DaoEdit__addSnapshotButton"
				leftIcon={<SnapshotIcon width={20} height={20} />}
				label={t('components.dao.voting.action')}
				color="overlaySecondary"
				size="lg"
				type="button"
				onClick={handleOpenSnapshotIntegrationPage}
			/>
		</div>
	);
};

const Dot = styled.div`
	width: 3px;
	height: 3px;
	margin: 0 8px;
	border-radius: 50%;
	background: ${colors.foregroundSecondary};
`;

const StyledBody = styled(Body)`
	color: ${colors.foregroundSecondary};
`;
