import { useTranslation } from 'next-i18next';

import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';

import { Button, EnsIcon, Input, Label1 } from 'src/components';
import { colors } from 'src/style';
import { StepProps } from 'src/features/snapshot/namespace';
import { checkEnsDomain } from 'src/utils/checker';
import { ensDomainGuide } from 'src/constants';
import { openExternal } from 'src/utils/urls';

export const EnsStep = (props: StepProps) => {
	const { onStepSuccess, snapshotEnsDomain, setSnapshotEnsDomain } = props;

	const [ens, setEns] = useState(snapshotEnsDomain);
	const [ensError, setEnsError] = useState<string | undefined>(undefined);

	const { t } = useTranslation();

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => setEns(e.target.value);
	const checkEns = useCallback(() => {
		if (checkEnsDomain(ens)) {
			setEnsError(undefined);
		} else {
			setEnsError(t('components.dao.voting.integration.ensStep.error.notEns'));
		}
	}, [ens, t]);

	useEffect(() => {
		if (ensError) {
			checkEns();
		}
	}, [checkEns, ensError]);

	const handleSubmit = () => {
		setSnapshotEnsDomain(ens);
		onStepSuccess();
	};

	return (
		<>
			<h1 className="text-foregroundPrimary mb-2 text-4xl font-bold not-italic tracking-[.01em]">
				{t('components.dao.voting.integration.ensStep.heading')}
			</h1>
			<Label1 className="text-foregroundSecondary mb-8">
				{t('components.dao.voting.integration.ensStep.description')}{' '}
				<StyledLink onClick={() => openExternal(ensDomainGuide)}>
					{t('components.dao.voting.integration.ensStep.link')}
				</StyledLink>
			</Label1>

			<div className="w-[273px]">
				<Input
					value={ens}
					leftIcon={<EnsIcon />}
					placeholder={t('components.dao.voting.integration.ensStep.placeholder')}
					onChange={handleChange}
					onBlur={checkEns}
					error={ensError}
				/>
			</div>

			<Button
				className="mt-8 w-max"
				color="accentPrimary"
				size="lg"
				label={t('components.dao.voting.integration.ensStep.action')}
				onClick={handleSubmit}
				disabled={!!ensError}
			/>
		</>
	);
};

const StyledLink = styled.span`
	cursor: pointer;
	color: ${colors.accentPrimary};
`;
