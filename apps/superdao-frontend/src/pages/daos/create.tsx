import { useRef, useState } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useQueryClient } from 'react-query';
import { NextPage } from 'next';

import { prefetchData, SSR, SSRAuthMiddleware } from 'src/client/ssr';
import { useDaoCreate, useLeavePageConfirm } from 'src/hooks';
import { UserAPI } from 'src/features/user/API';

// components
import { CustomHead } from 'src/components/head';
import { PageContent, NftToastContent, toast } from 'src/components';
import { LinksStep } from 'src/pagesComponents/daoCreating/linksStep';
import { DocsStep } from 'src/pagesComponents/daoCreating/docsStep';
import { InfoStep } from 'src/pagesComponents/daoCreating/infoStep';
// import { ContractStep } from 'src/pagesComponents/daoCreating/contractStep';

import { borders, colors } from 'src/style';
import { betaRequestRedirect, daosRedirect } from 'src/utils/redirects';

import { CreateDaoRequest } from 'src/validators/daos';
import { CanCreateMoreDaoQuery } from 'src/gql/daos.generated';
import { useUserDaoParticipationQuery } from 'src/gql/user.generated';

const steps = [InfoStep, LinksStep, DocsStep];

type Props = {
	hostname: string;
};

const CreateDao: NextPage<Props> = (props) => {
	const { hostname } = props;

	const { back, push } = useRouter();
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	const [currentStep, setCurrentStep] = useState(0);
	const [needsLeaveConfirm, setNeedsLeaveConfirm] = useState(false);
	const allStepsDataRef = useRef<Partial<CreateDaoRequest> & Pick<CreateDaoRequest, 'description' | 'slug' | 'name'>>({
		name: '',
		description: '',
		slug: ''
	});

	const { data: user } = UserAPI.useCurrentUserQuery();
	const { currentUser: userData } = user || {};

	const { mutateAsync: createDao, isLoading: isCreatingDao } = useDaoCreate();

	useLeavePageConfirm(needsLeaveConfirm);

	const handleStepReverse = () => {
		setCurrentStep((step) => step - 1);
	};

	const handleStepSubmit = (data: Partial<CreateDaoRequest>) => {
		allStepsDataRef.current = {
			...allStepsDataRef.current,
			...data
		};

		if (currentStep === steps.length - 1) {
			setNeedsLeaveConfirm(false);
			const request = allStepsDataRef.current;

			const { name } = request;
			toast.loading(<NftToastContent title={t('toasts.createDao.loading.temporaryTitleToDelete')} />, {
				position: 'bottom-center',
				id: name,
				duration: Infinity
			});

			createDao({
				createDaoData: {
					...request,
					documents: request.documents?.filter((document) => document.name && document.url) || []
				}
			}).then(() => {
				queryClient.refetchQueries(useUserDaoParticipationQuery.getKey({ userId: userData!.id }));
			});

			return;
		}

		setNeedsLeaveConfirm(true);
		setCurrentStep((step) => step + 1);
	};

	const StepComponent = steps[currentStep];

	const handleClose = () => {
		if (window.history.length > 1) {
			back();
		} else {
			push('/daos');
		}
	};

	return (
		<PageContent columnSize="sm" onClose={handleClose} className="min-h-full !w-full lg:pt-0">
			<CustomHead main={'DAO creation'} additional={'Superdao'} description={'DAO creation'} />

			<StepProgress>
				{steps.map((_, index) => (
					// eslint-disable-next-line react/no-array-index-key
					<StepProgressItem key={String(index)} isActive={index === currentStep} />
				))}
			</StepProgress>

			<StepWrapper>
				<StepComponent
					isLoading={isCreatingDao}
					onSubmit={handleStepSubmit}
					onBack={handleStepReverse}
					name={allStepsDataRef.current.name}
					hostname={hostname}
					accumulator={allStepsDataRef.current}
				/>
			</StepWrapper>
		</PageContent>
	);
};

export default CreateDao;

export const getServerSideProps = SSR(SSRAuthMiddleware, async (ctx) => {
	const { currentUser } = ctx;

	if (!currentUser!.hasBetaAccess) {
		return betaRequestRedirect;
	}

	const [queryClient, getProps] = await prefetchData(ctx);

	const { canCreateMoreDao } = queryClient.getQueryData<CanCreateMoreDaoQuery>(
		UserAPI.useCanCreateMoreDaoQuery.getKey()
	)!;
	if (!canCreateMoreDao) {
		return daosRedirect;
	}

	return { props: getProps() };
});

const StepProgress = styled.div`
	position: absolute;
	top: 38px;

	display: flex;
	gap: 8px;
	width: 100%;
`;

const StepProgressItem = styled.div<{ isActive?: boolean }>`
	flex: 1;

	height: 4px;
	border-radius: ${borders.medium};
	background: ${({ isActive }) => (isActive ? colors.foregroundPrimary : colors.foregroundQuaternary)};
`;

const StepWrapper = styled.div`
	padding-top: 72px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	height: 100%;
`;
