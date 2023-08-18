import styled from '@emotion/styled';
import { css } from '@emotion/react';

import { useTranslation } from 'next-i18next';

import { Scrollbars } from 'react-custom-scrollbars-2';
import { Body, Title3, SubHeading } from 'src/components/text';
import { borders, colors } from 'src/style';
import { CollectionArtworks } from 'src/types/types.generated';
import { PageLoader } from 'src/components/common/pageLoader';
import { ArtworkView } from 'src/components/artwork';

export type ArtworksProps = {
	artworks: CollectionArtworks['artworks'];
	isLoading: boolean;
	isError: boolean;
};

export const Artworks = (props: ArtworksProps) => {
	const { artworks, isLoading, isError } = props;

	const { t } = useTranslation();
	const artworksCount = artworks.length;

	let content;

	if (isLoading) {
		content = <PageLoader />;
	}

	if (isError && !isLoading) {
		content = <Body color={colors.foregroundSecondary}>{t('components.artworks.error')}</Body>;
	}

	if (!isLoading && !isError) {
		content = (
			<>
				<Scrollbars autoHeightMax={435} autoHeight autoHide>
					<div className="flex flex-wrap gap-5">
						{/* Впилить виртуализацию */}
						{artworks.map((art) => {
							return (
								<div className="relative rounded-lg" key={art.image || ''}>
									<StyledArtworkView
										isZoomEnabled
										zoomControlClassName="absolute right-2 bottom-2"
										artworks={[
											{
												id: art.id,
												animationUrl: art.animationUrl,
												image: art.image
											}
										]}
									/>
								</div>
							);
						})}
					</div>
				</Scrollbars>
			</>
		);
	}

	return (
		<div>
			<div className="mb-2 flex">
				<Title3 css={headerTitle}>{t('components.artworks.title')}</Title3>
				<Title3 color={colors.foregroundTertiary}>{!isLoading && artworksCount !== 0 && artworksCount}</Title3>
			</div>
			<SubHeading className="text-foregroundSecondary mb-3">
				{t('components.nftDetailsTab.artworks.subtitle')}
			</SubHeading>
			{content}
		</div>
	);
};

const headerTitle = css`
	margin-right: 8px;
`;

const StyledArtworkView = styled(ArtworkView)`
	width: 163px;
	height: 163px;
	border-radius: ${borders.medium};
	background-color: ${colors.overlaySecondary};
`;
