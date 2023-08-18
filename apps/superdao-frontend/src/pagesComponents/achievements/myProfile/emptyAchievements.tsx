import { FC } from 'react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { Body } from 'src/components';
import { colors } from 'src/style';

export const EmptyAchievements: FC<{ link: string }> = ({ link }) => {
	const { t } = useTranslation();

	return (
		<>
			<div className="flex h-[303px] flex-col items-center justify-center  text-center">
				<div className="my-8">
					<Image src="/assets/arts/emptyAssetsArt.svg" priority={true} width={120} height={75} />
				</div>
				<div className="mb-3 text-[15px] font-semibold leading-[16px] text-white">
					{t('components.treasury.emptyState.achievements.title')}
				</div>
				<Body color={colors.foregroundSecondary} className="w-[85%] text-center tracking-[-0.24px]">
					{t('components.treasury.emptyState.achievements.description')}
					<span className="text-accentPrimary pl-1">
						<a href={link}>{t('components.treasury.emptyState.achievements.descriptionLabel')}</a>
					</span>
				</Body>
			</div>
		</>
	);
};
