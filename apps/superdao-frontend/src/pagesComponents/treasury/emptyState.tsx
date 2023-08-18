import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { Body, Button, Title1, Title2 } from 'src/components';
import { colors } from 'src/style';
import { getWrapperEmptyClass } from 'src/pagesComponents/treasury/styles';

type Props = {
	name?: string;
	slug: string;
	isCreator: boolean;
	isMobile?: boolean;
};

export const EmptyState = (props: Props) => {
	const { name, slug, isCreator, isMobile } = props;
	const { t } = useTranslation();
	const { push } = useRouter();

	const handleOpenWalletCreationPage = () => push(`/${slug}/treasury/wallets/create`);

	return (
		<>
			{isMobile ? (
				<div className={getWrapperEmptyClass(isMobile)}>
					<Image src="/assets/arts/emptyTreasuryArt.svg" priority={true} width={110} height={130} />

					<div>
						<Title2 className="capitalize">{`${name} ${t('components.treasury.emptyState.treasury')}`}</Title2>
						<Body color={colors.foregroundSecondary} className="w-[300px]">
							{t('components.treasury.emptyState.description')}
						</Body>
					</div>
				</div>
			) : (
				<div className={getWrapperEmptyClass(isMobile)}>
					<div className="my-9">
						<Image src="/assets/arts/emptyTreasuryArt.svg" priority={true} width={110} height={130} />
					</div>
					<Title1 className="mb-1 capitalize">{`${name} ${t('components.treasury.emptyState.treasury')}`}</Title1>
					<Body color={colors.foregroundSecondary} className="w-[500px]">
						{t('components.treasury.emptyState.description')}
					</Body>
					{isCreator && (
						<Button
							size="lg"
							color="accentPrimary"
							label={t('components.treasury.addWalletBtn')}
							onClick={handleOpenWalletCreationPage}
						/>
					)}
				</div>
			)}
		</>
	);
};
