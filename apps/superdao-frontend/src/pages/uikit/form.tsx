import { NextPage } from 'next';
import { ChangeEvent, useCallback, useMemo } from 'react';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import styled from '@emotion/styled';

import { Content, Row } from './index';

import { checkSupervisorAuth } from 'src/client/ssr';

import {
	Button,
	Checkbox,
	Input,
	PageContent,
	Radio,
	Switch,
	CustomSelect,
	toast,
	DefaultSelectProps,
	Breadcrumbs
} from 'src/components';
import { prefetchData, SSR, SSRAuthMiddleware } from 'src/client/ssr';
import { InputFile } from 'src/components/inputFile';
import { csvToJson } from 'src/utils/csv';

const networks: DefaultSelectProps[] = [
	{ value: '1', label: 'Ethereum', description: 'ETH' },
	{ value: '2', label: 'Polygon', description: 'MATIC' },
	{ value: '3', label: 'Avalanche', description: 'AVAX', isDisabled: true },
	{ value: '4', label: 'BSC', description: 'BNB' },
	{ value: '5', label: 'Fantom', description: 'FTM' },
	{ value: '6', label: 'DAI', description: 'xDai' }
];

const tokenStandards = [
	{ label: 'ERC721', value: '721' },
	{ label: 'ERC1155', value: '1155' }
];

const airdropParticipant = z.object({
	walletAddress: z.string(),
	tier: z.string(),
	email: z.string()
});

type AirdropParticipantType = z.infer<typeof airdropParticipant>;

const form = z.object({
	name: z.string().min(1),
	network: z.string(),
	standard: z.string(),
	transferable: z.boolean(),
	agreement: z.boolean(),
	airdropParticipants: z.array(airdropParticipant).max(1000)
});

type FormExampleType = z.infer<typeof form>;

const FormExample: NextPage = () => {
	const { register, handleSubmit, formState, control, setValue, setError, clearErrors } = useForm<FormExampleType>();

	const { isValid, errors } = formState;

	const onSubmit = useCallback(
		(props: FormExampleType) => {
			// eslint-disable-next-line no-console
			console.log(props, errors);
			toast('You can see results at console');
		},
		[errors]
	);

	const handleFormSubmit = useMemo(() => handleSubmit(onSubmit), [handleSubmit, onSubmit]);

	const handleAirdropCsvFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
		const value = await csvToJson<AirdropParticipantType>(event?.target?.files?.[0]);
		if (value.length > 1000) {
			setError('airdropParticipants', { message: 'Max 1000 wallets' });
			return;
		}
		clearErrors('airdropParticipants');
		setValue('airdropParticipants', value);
	};

	return (
		<PageContent>
			<Breadcrumbs paths={['UI Kit', 'Form']} />
			<Content>
				<Row dashed vertical>
					<form onSubmit={handleFormSubmit}>
						<FormField>
							<Input placeholder="Token name" {...register('name')} error={errors.name?.message} />
						</FormField>
						<FormField>
							<Controller
								name="network"
								control={control}
								rules={{ required: true }}
								render={({ field: { name, value, onChange, ref } }) => (
									<CustomSelect
										innerRef={ref}
										onChange={({ value: newValue }) => onChange(newValue?.value)}
										name={name}
										isClearable
										value={networks.find((item) => item.value === value)}
										options={networks}
									/>
								)}
							/>
						</FormField>
						<FormField>
							{tokenStandards.map((standard) => (
								<Radio
									key={standard.value}
									defaultValue={standard.value}
									defaultChecked={standard.value === '1155'}
									{...register('standard')}
								>
									{standard.label}
								</Radio>
							))}
						</FormField>
						<FormField>
							<Controller
								control={control}
								name="airdropParticipants"
								render={() => (
									<InputFile
										onChange={handleAirdropCsvFileUpload}
										placeholder="Select CSV airdrop list file..."
										accept=".csv"
										error={(errors.airdropParticipants as { message?: string })?.message}
									/>
								)}
							/>
						</FormField>
						<FormField>
							<Switch {...register('transferable')}>Transferable</Switch>
						</FormField>
						<FormField>
							<Checkbox {...register('agreement')}>I`m agree with service rules</Checkbox>
						</FormField>
						<Button color="accentPrimary" size="lg" type="submit" disabled={!isValid} label="Create token" />
					</form>
				</Row>
			</Content>
		</PageContent>
	);
};

export default FormExample;

export const getServerSideProps = SSR(SSRAuthMiddleware, async (ctx) => {
	const [redirect] = await checkSupervisorAuth(ctx);
	if (redirect) return redirect;

	const [_, getProps] = await prefetchData(ctx);

	return { props: getProps() };
});

const FormField = styled.div`
	margin-bottom: 30px;
`;
