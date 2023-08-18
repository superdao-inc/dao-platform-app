import { SyntheticEvent, useCallback, useRef } from 'react';
import { NextPage } from 'next';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { useTranslation } from 'next-i18next';
import { checkSupervisorAuth } from 'src/client/ssr';

import { borders, colors } from 'src/style';
import {
	ActionBlock,
	Avatar,
	Body,
	Button,
	Caption,
	Cell,
	CellSize,
	Checkbox,
	Detail,
	Dropdown,
	DropdownMenu,
	Input,
	Label1,
	Label2,
	Label3,
	PageContent,
	Loader,
	Radio,
	SubHeading,
	Switch,
	Textarea,
	Title1,
	Title2,
	Title3,
	toast,
	CustomSelect
} from 'src/components';
import { GiftIcon, TrashIcon } from 'src/components/assets/icons';

import { prefetchData, SSR, SSRAuthMiddleware } from 'src/client/ssr';
import { useSwitch } from 'src/hooks';
import Tooltip from 'src/components/tooltip';
import { NftToastContent } from 'src/components/toast/nftToastContent';
import { ToastContent } from 'src/components/toast/toastContent';
import { LabelWrapper } from 'src/components/labelWrapper';
import {
	customDaoSelectColourStyles,
	DaoCheckboxOption,
	DaoMultiValue,
	DaoRadioOption,
	DaoMultiPlaceholder,
	SelectNftProps
} from 'src/pagesComponents/dao/nftSelect';

const delay = (delayMillis: number) => {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, delayMillis);
	});
};

const Index: NextPage = () => {
	const { t } = useTranslation();

	/* For button loading example  */
	const [isLoading, { on: setIsLoading, off: setIsLoaded }] = useSwitch(false);
	const setLoading = useCallback(() => {
		setIsLoading();
		setTimeout(setIsLoaded, 3000);
	}, [setIsLoading, setIsLoaded]);

	/* For checkbox example */
	const checkboxRef = useRef<HTMLInputElement>(null);
	// eslint-disable-next-line no-console
	const getCheckedValue = (event: SyntheticEvent<HTMLInputElement>) => console.log(event.currentTarget.checked);

	/* For radio value select example */
	const radioOptions = [
		{ label: 'ERC721', value: '721' },
		{ label: 'ERC1155', value: '1155' }
	];

	/* For select example */
	const selectOptions: SelectNftProps[] = [
		{ value: '1', label: 'Ethereum', description: 'ETH', icon: <Avatar seed="Ethereum" size="xs" /> },
		{ value: '2', label: 'Polygon', description: 'MATIC', icon: <Avatar seed="Polygon" size="xs" /> },
		{ value: '3', label: 'Avalanche', description: 'AVAX', isDisabled: true, icon: <Avatar seed="Avax" size="xs" /> },
		{ value: '4', label: 'BSC', description: 'BNB', icon: <Avatar seed="BSC" size="xs" /> },
		{ value: '5', label: 'Fantom', description: 'FTM', icon: <Avatar seed="Fantom" size="xs" /> },
		{ value: '6', label: 'DAI', description: 'xDai', icon: <Avatar seed="DAI" size="xs" /> }
	];

	const getCustomSelectValue = (value: any) => {
		// eslint-disable-next-line no-console
		console.log(value);
	};

	/* For toast example */
	const toastPromise = () =>
		toast.promise(
			new Promise<{ name: string; value: number }>((resolve, reject) => {
				setTimeout(() => {
					if (Math.random() >= 0.5) {
						resolve({ name: 'ETH', value: 10 });
					}
					// eslint-disable-next-line prefer-promise-reject-errors
					reject('Insufficient balance');
				}, 3000);
			}),
			{
				loading: 'Loading',
				success: (data) => `Tx successfully: ${data.value} ${data.name}`,
				error: (err) => `Transaction failed: ${err.toString()}`
			},
			{
				style: {
					minWidth: '250px',
					color: colors.accentPrimary
				},
				success: {
					duration: 5000,
					icon: '🔥'
				}
			}
		);

	const getToastWithCustomContent = () =>
		toast(
			<div>
				Toast with{' '}
				<b>
					<i>custom content</i>
				</b>
			</div>,
			{ position: 'bottom-left', duration: 10000, icon: <span>(icon)</span> }
		);

	const renderNftToastChangingState = async () => {
		const toastId = toast.loading(<NftToastContent title="Sending 875 NFT." description="It can take a few minutes" />);
		await delay(5000);

		toast.success(
			<NftToastContent
				title="875 NFT sent."
				description="Refresh a page to see new members"
				actionProps={{
					title: 'Refresh',
					onClick: () => console.log('Refreshing') // eslint-disable-line no-console
				}}
			/>,
			{
				id: toastId, // Update the existing toast. Without the "id" the new toast will be created.
				duration: 3000 // Even use a custom duration in millis
			}
		);

		await delay(5000);
		toast.error(
			// eslint-disable-next-line no-shadow
			(t) => (
				// If you need a "Close Icon", use this "ToastContent"
				<ToastContent hasCloseIcon t={t}>
					<NftToastContent title="Ups, an error occurred" description="It looks like the blockchain is too busy now" />
				</ToastContent>
			)
		);
	};

	/* dropdown */
	const [isDropdownOpen, { off, toggle }] = useSwitch(false);

	const [isOpen, { off: close }] = useSwitch(true);

	return (
		<PageContent>
			<Title1 className="py-5">UI Kit</Title1>
			<Content>
				<Row dashed>
					<Button size="lg" label="Label" color="accentPrimary" />
					<Button size="lg" label="Label" color="accentNegative" />
					<Button size="lg" label="Label" color="backgroundTertiary" />
					<Button size="lg" label="Label" color="backgroundQuaternary" />
					<Button size="lg" label="Label" color="transparent" />
				</Row>
				<Row dashed>
					<Button size="lg" label="With loader" onClick={setLoading} isLoading={isLoading} color="accentPrimary" />
					<Button size="lg" label="With loader" onClick={setLoading} isLoading={isLoading} color="accentNegative" />
					<Button size="lg" label="With loader" onClick={setLoading} isLoading={isLoading} color="backgroundTertiary" />
					<Button
						size="lg"
						label="With loader"
						onClick={setLoading}
						isLoading={isLoading}
						color="backgroundQuaternary"
					/>
					<Button size="lg" label="With loader" onClick={setLoading} isLoading={isLoading} color="transparent" />
				</Row>
				<Row dashed vertical>
					<Input label="Input" placeholder="Placeholder" />
					<Input label="Input" prefix="prefix -" placeholder="placeholder" />
					<Input label="Input" prefix="prefix -" placeholder="placeholder" error="Input error" />
					<Input label="Input" prefix="prefix -" placeholder="placeholder" isLoading />
				</Row>
				<Row dashed vertical>
					<LabelWrapper label="Select">
						<CustomSelect
							name="select-network-one"
							placeholder="Select network..."
							onChange={getCustomSelectValue}
							options={selectOptions}
						/>
					</LabelWrapper>
				</Row>
				<Row dashed vertical>
					<LabelWrapper label="Default selected">
						<CustomSelect
							name="select-network-two"
							isClearable
							defaultValue={selectOptions[0]}
							onChange={getCustomSelectValue}
							options={[selectOptions[0], selectOptions[1]]}
						/>
					</LabelWrapper>
				</Row>
				<Row dashed vertical>
					<LabelWrapper label="Has inner search">
						<CustomSelect
							name="select-network-three"
							isClearable
							isSearchable
							onChange={getCustomSelectValue}
							options={selectOptions}
						/>
					</LabelWrapper>
				</Row>
				<Row dashed vertical>
					<LabelWrapper label="Multiselect options">
						<CustomSelect
							name="select-network-three"
							isClearable
							isMulti
							onMultiChange={getCustomSelectValue}
							components={{ Option: DaoCheckboxOption }}
							options={selectOptions}
						/>
					</LabelWrapper>
					<LabelWrapper label="Multiselect options with custom placeholder and selected value">
						<CustomSelect
							name="select-network-four"
							isClearable
							isMulti
							onMultiChange={getCustomSelectValue}
							styles={customDaoSelectColourStyles}
							components={{ Option: DaoCheckboxOption, MultiValue: DaoMultiValue, Placeholder: DaoMultiPlaceholder }}
							options={selectOptions}
						/>
					</LabelWrapper>
				</Row>
				<Row dashed vertical>
					<LabelWrapper label="With radio options">
						<CustomSelect
							name="select-network-five"
							isClearable
							components={{ Option: DaoRadioOption }}
							onChange={getCustomSelectValue}
							options={selectOptions}
						/>
					</LabelWrapper>
				</Row>
				<Row dashed vertical>
					<LabelWrapper label="With checkbox options">
						<CustomSelect
							name="select-network-six"
							isClearable
							components={{ Option: DaoCheckboxOption }}
							onChange={getCustomSelectValue}
							options={selectOptions}
						/>
					</LabelWrapper>
				</Row>
				<Row>
					<Row dashed vertical>
						<Title1>Title1</Title1>
						<Title2>Title2</Title2>
						<Title3>Title3</Title3>
						<Label1>Label1</Label1>
						<Label2>Label2</Label2>
						<Label3>Label3</Label3>
					</Row>
					<Row dashed vertical>
						<SubHeading>SubHeading</SubHeading>
						<Body>Body</Body>
						<Caption>Caption</Caption>
						<Detail>Detail</Detail>
					</Row>
				</Row>
				<Row dashed>
					<Avatar size="120" isOnline src="/wallets/metamask.png" />
					<Avatar size="xxl" isOnline src="/wallets/metamask.png" />
					<Avatar size="xl" isOnline src="/wallets/metamask.png" />
					<Avatar size="lg" isOnline src="/wallets/metamask.png" />
					<Avatar size="md" isOnline src="/wallets/metamask.png" />
					<Avatar size="sm" isOnline src="/wallets/metamask.png" />
					<Avatar size="xs" isOnline src="/wallets/metamask.png" />
				</Row>
				<Row dashed>
					<Loader size="56" color="light" />
					<Loader size="48" />
					<Loader size="xl" color="light" />
					<Loader size="lg" />
					<Loader size="md" color="light" />
					<Loader size="sm" />
				</Row>
				<Row>
					<Row dashed>
						<Checkbox ref={checkboxRef} onChange={getCheckedValue}>
							Checkbox
						</Checkbox>
						<Button
							size="md"
							color="accentPrimary"
							label="Mark as checked"
							onClick={() => checkboxRef?.current?.click()}
						/>
					</Row>
					<Row dashed>
						<Checkbox defaultChecked>Default checked</Checkbox>
					</Row>
				</Row>
				<Row dashed vertical>
					{radioOptions.map((option) => (
						<Radio name="standard" key={option.value} defaultValue={option.value}>
							{option.label}
						</Radio>
					))}
				</Row>
				<Row>
					<Row dashed>
						<Switch onChange={getCheckedValue} />
					</Row>
					<Row dashed>
						<Switch defaultChecked>Default checked</Switch>
					</Row>
				</Row>
				<Row dashed>
					<Button size="lg" label="Add toast" color="accentPrimary" onClick={() => toast('Success')} />
					<Button
						size="lg"
						label="Custom toast"
						color="accentNegative"
						onClick={() => toast('Toast at bottom right', { position: 'bottom-right', duration: 10000 })}
					/>
					<Button
						size="lg"
						label="Toast with custom content"
						color="backgroundTertiary"
						onClick={getToastWithCustomContent}
					/>
					<Button size="lg" label="Toast with promise" color="backgroundQuaternary" onClick={toastPromise} />
					<Button
						size="lg"
						label="NFT Toast changing state"
						color="accentPrimary"
						onClick={() => {
							renderNftToastChangingState();
						}}
					/>
				</Row>
				<Row>
					<Row dashed>
						<Dropdown
							isOpen={isDropdownOpen}
							onClickOutside={off}
							placement="bottom-end"
							content={
								<div style={{ padding: '0 8px' }}>
									This is bottom-center content <br />
									Available placements: <br />
									<i>
										top-start top-end bottom-start <br />
										bottom-end right-start right-end <br />
										left-start left-end <br />
										auto auto-start auto-end
									</i>
								</div>
							}
						>
							<Button size="md" label="bottom-end" color="accentPrimary" onClick={toggle} />
						</Dropdown>
					</Row>
				</Row>
				<Row>
					{(['xs', 'sm'] as CellSize[]).map((size) => (
						<Row dashed vertical key={size}>
							<Cell
								size={size}
								before={<Avatar size={size} src="/wallets/metamask.png" />}
								after={<Checkbox defaultChecked />}
								label={`${size} cell`}
							/>
							<Cell
								size={size}
								before={<Avatar size={size} src="/wallets/metamask.png" />}
								after={<Switch />}
								label={`${size} cell`}
								description="Description"
							/>
							<Cell
								size={size}
								before={<Avatar size={size} src="/wallets/metamask.png" />}
								after={<Checkbox defaultChecked />}
								label={`${size} disabled cell`}
								description="Description"
								disabled
							/>
							<Cell
								size={size}
								before={<Avatar size={size} src="/wallets/metamask.png" />}
								after={
									<DropdownMenu
										options={[
											{ label: 'Send NFT', before: <GiftIcon />, onClick: () => toast('OK') },
											{ label: 'Remove', before: <TrashIcon />, onClick: () => toast('REMOVED') }
										]}
									/>
								}
								label={`${size} cell`}
								description="Description"
							/>
							<Cell size={size} isLoading />
						</Row>
					))}
				</Row>
				<Row dashed vertical>
					<Cell
						size="md"
						before={<Avatar size="md" src="/wallets/metamask.png" />}
						after={<Checkbox defaultChecked />}
						label="Label"
					/>
					<Cell
						size="md"
						before={<Avatar size="md" src="/wallets/metamask.png" />}
						after={<Switch />}
						label="Label"
						description="Description"
					/>
					<Cell
						size="md"
						before={<Avatar size="md" src="/wallets/metamask.png" />}
						after={<Checkbox defaultChecked />}
						label="Label"
						description="Description"
						disabled
					/>
					<Cell
						size="md"
						before={<Avatar size="md" src="/wallets/metamask.png" />}
						after={
							<DropdownMenu
								shouldCloseOnSelect={false}
								options={[
									{ label: 'Send NFT', before: <GiftIcon />, onClick: () => toast('OK') },
									{ label: 'Remove', before: <TrashIcon />, onClick: () => toast('REMOVED') },
									{ label: 'Get Money', disabled: true, onClick: () => toast('REMOVED') }
								]}
							/>
						}
						label="Label"
						description="Description"
					/>
					<Cell size="md" isLoading />
				</Row>
				<Row dashed>
					<DropdownMenu
						control={<Button size="lg" label="Menu" color="accentPrimary" />}
						shouldCloseOnSelect={false}
						options={[
							{ label: 'Send NFT', before: <GiftIcon />, onClick: () => toast('OK') },
							{ label: 'Remove', before: <TrashIcon />, onClick: () => toast('REMOVED') },
							{ label: 'Get Money', disabled: true, onClick: () => toast('REMOVED') }
						]}
					/>
				</Row>
				<Row dashed>
					<ActionBlock
						isOpen={isOpen}
						onClose={close}
						title={t('components.nft.actionTitle')}
						subtitle={t('components.nft.actionSubtitle')}
						action={<Button color="backgroundTertiary" size="md" label={t('components.nft.addNft')} />}
						icon={<GiftIcon />}
					/>
				</Row>
				<Row dashed>
					<Textarea isCounterVisible maxLength={80} />
				</Row>
				<Row dashed>
					<Tooltip content={<Label3>Left tooltip</Label3>} placement="left">
						<Button size="lg" label="Left" color="accentPrimary" />
					</Tooltip>
					<Tooltip
						content={
							<>
								<Label1>You can Pass</Label1>
								<Body>
									Any react component
									<br /> as a child
								</Body>
							</>
						}
						placement="top"
					>
						<Button size="lg" label="Top" color="accentPrimary" />
					</Tooltip>
					<Tooltip content={<Label3>Bottom tooltip</Label3>} placement="bottom">
						<Button size="lg" label="Bottom" color="accentPrimary" />
					</Tooltip>
					<Tooltip content={<Label3>Right tooltip</Label3>} placement="right">
						<Button size="lg" label="Left" color="accentPrimary" />
					</Tooltip>
				</Row>
			</Content>
		</PageContent>
	);
};

export default Index;

export const getServerSideProps = SSR(SSRAuthMiddleware, async (ctx) => {
	const [redirect] = await checkSupervisorAuth(ctx);
	if (redirect) return redirect;

	const [_, getProps] = await prefetchData(ctx);

	return { props: getProps() };
});

export const Content = styled.div`
	display: flex;
	flex-direction: column;
	row-gap: 24px;
`;

export const Row = styled.div<{ vertical?: boolean; dashed?: boolean }>`
	color: ${colors.foregroundPrimary};

	${(props) => props.dashed && dashedRowStyle}
	${(props) => (props.vertical ? verticalRowStyle : horizontalRowStyle)}

	width: 100%;
`;

const verticalRowStyle = css`
	display: flex;
	flex-direction: column;
	row-gap: 14px;
`;

const horizontalRowStyle = css`
	display: flex;
	column-gap: 5px;
`;

const dashedRowStyle = css`
	border: 1px dashed ${colors.border};
	border-radius: ${borders.medium};
	padding: 18px 18px;
`;
