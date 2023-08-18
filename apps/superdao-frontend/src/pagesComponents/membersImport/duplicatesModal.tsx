import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styled from '@emotion/styled';
import { useState } from 'react';
import { Body, Button, Caption, Checkbox, Ellipsis, Label3, Title1 } from 'src/components';
import Tooltip from 'src/components/tooltip';
import { Modal, ModalContent, ModalFooter } from 'src/components/baseModal';
import { borders, colors } from 'src/style';
import { Members } from './members/daoMembersImport';

const modalStyles = {
	content: { width: '100%', maxWidth: 600, minWidth: 320 }
};

export const DuplicatesModal = ({
	existingDuplicates,
	csvDuplicates,
	isOpen,
	onClose,
	onCancel
}: {
	existingDuplicates: Members[];
	csvDuplicates: { [key: string]: number };
	isOpen: boolean;
	onClose: (removingDuplicates: { [key: string]: boolean | number }, isCsvDuplicatesSelected: boolean) => void;
	onCancel: () => void;
}) => {
	const { t } = useTranslation();

	const isExistingDuplicatesOn = useMemo(() => !!existingDuplicates?.length, [existingDuplicates]);
	const isCsvDuplicatesOn = useMemo(() => !!Object.keys(csvDuplicates)?.length, [csvDuplicates]);

	const existingDuplicatesCount = useMemo(() => existingDuplicates.length, [existingDuplicates]);
	const csvDuplicatesCount = useMemo(() => Object.keys(csvDuplicates)?.length, [csvDuplicates]);

	const [isExistingDuplicatesSelected, setExistingDuplicatesSelected] = useState(isExistingDuplicatesOn);
	const [isCsvDuplicatesSelected, setCsvDuplicatesSelected] = useState(isCsvDuplicatesOn);

	useEffect(() => {
		setExistingDuplicatesSelected(isExistingDuplicatesOn);
		setCsvDuplicatesSelected(isCsvDuplicatesOn);
	}, [isExistingDuplicatesOn, isCsvDuplicatesOn]);

	const handleSubmit = () => {
		let removingDuplicates: Record<string, boolean> = {};
		if (isExistingDuplicatesSelected) {
			existingDuplicates.map((duplicate) => {
				removingDuplicates[duplicate.walletAddress] = true;
			});
		}
		onClose(removingDuplicates, isCsvDuplicatesSelected);
	};

	const duplicatesText = useMemo(() => {
		let str = '';
		if (csvDuplicatesCount) {
			let addingText = csvDuplicatesCount + ` ${csvDuplicatesCount > 1 ? ' duplicates' : ' duplicate'}`;
			str += addingText;
		}
		if (existingDuplicatesCount) {
			if (str) str += ' and ';
			let addingText = existingDuplicatesCount + ` ${existingDuplicatesCount > 1 ? ' members' : ' member'}`;
			str += addingText;
		}
		str += ' found';
		return str;
	}, [csvDuplicatesCount, existingDuplicatesCount]);

	const btnText = useMemo(() => {
		let str = `Remove ${
			(isExistingDuplicatesSelected ? existingDuplicatesCount : 0) + (isCsvDuplicatesSelected ? csvDuplicatesCount : 0)
		}`;
		if (existingDuplicatesCount + csvDuplicatesCount > 1) {
			str += ' wallets';
		} else {
			str += ' wallet';
		}
		return str;
	}, [csvDuplicatesCount, existingDuplicatesCount, isExistingDuplicatesSelected, isCsvDuplicatesSelected]);

	return (
		<Modal isOpen={isOpen} style={modalStyles}>
			<ModalContent>
				<Title1>{t('pages.importMembers.duplicates.remove')}</Title1>
				<Body className="mt-2">{duplicatesText}</Body>
				<DuplicatesContentArea>
					<div className="flex">
						<ListHeaderItem data-testid="DaoMembers__memberColumn">
							{t('pages.dao.members.columns.member')}
						</ListHeaderItem>
						<ListHeaderItem data-testid="DaoMembers__tierColumn">{t('pages.dao.members.columns.tier')}</ListHeaderItem>
					</div>
					<DuplicateMembers>
						{existingDuplicates.map((duplicate) => {
							return (
								<DuplicateEllipsis
									isSelected={isExistingDuplicatesSelected}
									walletAddress={duplicate.walletAddress}
									tiers={duplicate.tiers || []}
									key={duplicate.walletAddress}
								/>
							);
						})}
						{Object.keys(csvDuplicates).map((key) => {
							return (
								csvDuplicates[key] > 0 && (
									<DuplicateMember isSelected={isCsvDuplicatesSelected} key={key}>
										<Body className="flex-[55%] truncate">{key}</Body>
									</DuplicateMember>
								)
							);
						})}
					</DuplicateMembers>
				</DuplicatesContentArea>
				{isCsvDuplicatesOn && (
					<DuplicateTypes>
						<Checkbox
							onClick={() => setCsvDuplicatesSelected(!isCsvDuplicatesSelected)}
							checked={isCsvDuplicatesSelected}
						>
							<StyledCaption>{t('pages.importMembers.duplicates.remove')}</StyledCaption>
						</Checkbox>
					</DuplicateTypes>
				)}
				{isExistingDuplicatesOn && (
					<DuplicateTypes>
						<Checkbox
							onClick={() => setExistingDuplicatesSelected(!isExistingDuplicatesSelected)}
							checked={isExistingDuplicatesSelected}
						>
							<StyledCaption>{t('pages.importMembers.duplicates.removeMembers')}</StyledCaption>
						</Checkbox>
					</DuplicateTypes>
				)}
			</ModalContent>

			<ModalFooter
				right={
					<>
						<Button onClick={onCancel} label={t('actions.labels.cancel')} size="lg" color="backgroundTertiary" />
						<Button
							onClick={handleSubmit}
							disabled={!isExistingDuplicatesSelected && !isCsvDuplicatesSelected}
							label={btnText}
							size="lg"
							color="accentPrimary"
						/>
					</>
				}
			/>
		</Modal>
	);
};
type DuplicateProps = {
	isSelected: boolean;
	walletAddress: string;
	tiers: string[];
};

const DuplicateEllipsis = (props: DuplicateProps) => {
	const { isSelected, walletAddress, tiers } = props;
	const ellipsisRef = useRef<HTMLDivElement | null>(null);
	const [isEllipsisActive, setEllipsisActive] = useState(false);
	useEffect(() => {
		if (ellipsisRef && ellipsisRef.current && ellipsisRef.current?.offsetWidth < ellipsisRef.current?.scrollWidth) {
			setEllipsisActive(true);
		}
	}, [ellipsisRef]);
	return (
		<DuplicateMember isSelected={isSelected}>
			<Body className="flex-[55%] truncate">{walletAddress}</Body>
			<Tooltip
				placement="bottom"
				isVisible={isEllipsisActive}
				className="width-100 flex-1 overflow-hidden"
				content={tiers.join(',')}
			>
				<Ellipsis className="flex-1 truncate" as={Body} ref={ellipsisRef}>
					{tiers.join(',')}
				</Ellipsis>
			</Tooltip>
		</DuplicateMember>
	);
};

const DuplicatesContentArea = styled.div`
	display: flex;
	flex-direction: column;
	background-color: ${colors.overlaySecondary};
	padding: 16px 24px;
	margin-top: 20px;
	margin-bottom: 12px;
	border-radius: ${borders.medium};
`;

const DuplicateMember = styled.div<{ isSelected: boolean }>`
	display: flex;
	* {
		color: ${(props) => (props.isSelected ? 'white' : colors.foregroundSecondary)} !important;
	}
`;

const DuplicateMembers = styled.div`
	display: flex;
	flex-direction: column;
	margin-top: 15px;
	gap: 8px;
`;

const DuplicateTypes = styled.div`
	padding: 10px 0;
`;

const StyledCaption = styled(Caption)`
	padding-left: 7px;
	color: ${colors.foregroundSecondary};
`;

const ListHeaderItem = styled(Label3)`
	&:first-of-type {
		flex: 55%;
	}

	flex: 1;

	color: ${colors.foregroundSecondary};
`;
