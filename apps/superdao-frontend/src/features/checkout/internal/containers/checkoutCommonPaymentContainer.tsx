import { FC, PropsWithChildren, useState } from 'react';
import { useRouter } from 'next/router';
import { ContractErrorModal } from 'src/features/checkout/internal/modals/contractErrorModal';
import { CheckoutPaymentContextProvider } from 'src/features/checkout/internal/context/checkoutPaymentContext';
import { useLeavePageConfirm } from 'src/hooks';

export type ContractErrorModalArgs = {
	redirectPath: string;
	body: string;
	isOpen: boolean;
};

export const CheckoutCommonPaymentContainer: FC<PropsWithChildren> = (props) => {
	const { children } = props;

	const { push } = useRouter();

	const [needsLeaveConfirm, setNeedsLeaveConfirm] = useState(false);
	useLeavePageConfirm(needsLeaveConfirm);

	const [contractErrorModalArgs, setContractErrorModalArgs] = useState<ContractErrorModalArgs>({
		redirectPath: '',
		body: '',
		isOpen: false
	});

	const handleContractErrorModalRedirect = (path: string) => {
		return () => push(path);
	};

	return (
		<CheckoutPaymentContextProvider
			needsLeaveConfirm={needsLeaveConfirm}
			setNeedsLeaveConfirm={setNeedsLeaveConfirm}
			contractErrorModalArgs={contractErrorModalArgs}
			setContractErrorModalArgs={setContractErrorModalArgs}
		>
			{contractErrorModalArgs.isOpen && (
				<ContractErrorModal
					onRedirect={handleContractErrorModalRedirect(contractErrorModalArgs.redirectPath)}
					body={contractErrorModalArgs.body}
					isOpen
				/>
			)}
			{children}
		</CheckoutPaymentContextProvider>
	);
};
