import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { BoldPlusIcon, FileIcon, PlusIcon } from 'src/components';
import { SkeletonComponent } from 'src/components/skeletonBaseComponent';
import { Label1 } from 'src/components/text';

import { DaoPageNavigationTab } from './daoPageNavigationTab';

type Props = {
	toggleIsNavigationShown: () => void;
	documents: any;
	isCreator: boolean;
	isSkeletonMode: boolean;
};

export const DaoPageNavigationDocumentsTab = (props: Props) => {
	const { documents, toggleIsNavigationShown, isCreator, isSkeletonMode } = props;

	const { t } = useTranslation();
	const { query } = useRouter();
	const { slug } = query;

	const adminCreationInterface = isCreator ? (
		<Link href={`/${slug}/settings/about/edit#docs`} passHref>
			<a className="w-full" onClick={toggleIsNavigationShown} data-testid={'DaoMenu__Add doc'}>
				<div className="hover-firstChild:fill-foregroundSecondary flex w-full items-center gap-3 px-3 py-2 transition-all">
					{isSkeletonMode ? (
						<SkeletonComponent variant="circular" className="h-6 w-6 shrink-0" />
					) : (
						<BoldPlusIcon width={20} height={20} className="transition-all" />
					)}
					{isSkeletonMode ? (
						<SkeletonComponent variant="rectangular" className="h-4 w-full" />
					) : (
						<Label1>{t('components.dao.docs.addLabel')}</Label1>
					)}
				</div>
			</a>
		</Link>
	) : null;

	const documentsContent = documents?.map((document: any, i: number) => (
		<a
			key={`${document.name}${i}`}
			href={document.url}
			className="w-full"
			data-testid={`DaoMenu__document${document.name}`}
			target="_blank"
			rel="noreferrer"
		>
			<DaoPageNavigationTab
				icon={<FileIcon className="shrink-0" width={20} height={20} />}
				content={document.name}
				isActive={false}
				toggleIsNavigationShown={toggleIsNavigationShown}
				isSkeletonMode={isSkeletonMode}
			/>
		</a>
	));

	const selectedDocumentsContent = !!documents?.length ? documentsContent : adminCreationInterface;

	const alternateCreation =
		!!documents?.length && isCreator ? (
			<div className="absolute top-1 right-4 w-max" data-testid={'DaoMenu__addDocButton'}>
				<Link href={`/${slug}/settings/about/edit#docs`} passHref>
					<a onClick={toggleIsNavigationShown}>
						<PlusIcon
							className="fill-foregroundSecondary hover:fill-foregroundTertiary transition-all"
							width={16}
							height={16}
						/>
					</a>
				</Link>
			</div>
		) : null;

	const isBlockHidden = !isCreator && !documents?.length;

	if (isBlockHidden) return null;

	return (
		<div className="relative mx-3 mt-6 flex h-max flex-wrap gap-2">
			{alternateCreation}
			<Label1 className="text-foregroundSecondary ml-3">
				{isSkeletonMode ? (
					<SkeletonComponent variant="rectangular" className="h-3 w-20" />
				) : (
					t('components.dao.navigation.links.documents')
				)}
			</Label1>
			<div className="relative w-full">{selectedDocumentsContent}</div>
		</div>
	);
};
