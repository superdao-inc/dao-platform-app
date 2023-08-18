import { ChangeEvent, useState } from 'react';
import { useSaveClaimWhitelist } from 'src/hooks';
import { checkSupervisorAuth, prefetchData, SSR } from 'src/client/ssr';
import { Button, Input } from 'src/components';
import { SudoLayout } from 'src/features/sudo/components/sudoLayout';

const Whitelist = () => {
	const [daoAddress, setDaoAddress] = useState('');
	const [whitelist, setWhitelist] = useState<any>();

	const { mutate } = useSaveClaimWhitelist();

	const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		const reader = new FileReader();
		reader.onload = onReaderLoad;
		if (file) {
			reader.readAsText(file);
		}
	};

	const onReaderLoad = (event: ProgressEvent<FileReader>) => {
		const obj = JSON.parse(event.target?.result as string);
		setWhitelist(obj);
	};

	const onSubmit = () => {
		if (whitelist?.length && daoAddress) {
			mutate({
				daoAddress,
				whitelist
			});
		}
	};

	return (
		<SudoLayout>
			<form>
				<Input label="Contract address" onChange={(e) => setDaoAddress(e.target.value)} />

				<input className="mt-2" type="file" accept="application/json" onChange={onUpload} />

				<Button
					disabled={!whitelist || !daoAddress}
					type="button"
					className="mt-2 w-full"
					color="accentPrimary"
					size="md"
					label="Submit"
					onClick={onSubmit}
				/>
			</form>
		</SudoLayout>
	);
};

export default Whitelist;

export const getServerSideProps = SSR(async (ctx) => {
	const [redirect] = await checkSupervisorAuth(ctx);
	if (redirect) return redirect;

	const [_, getProps] = await prefetchData(ctx);

	return { props: getProps() };
});
