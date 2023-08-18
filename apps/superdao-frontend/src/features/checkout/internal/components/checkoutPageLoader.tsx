import { PageContent, PageLoader, Title1 } from 'src/components';
import { CustomHead } from 'src/components/head';

type Props = {
	title: string;
	metaTitle: string;
	metaDescription?: string;
};

export const CheckoutPageLoader = (props: Props) => {
	const { metaTitle, metaDescription = metaTitle, title } = props;

	return (
		<PageContent columnSize="sm" className="pt-5">
			<CustomHead main={metaTitle} additional="Superdao" description={metaDescription} />
			<div>
				<Title1>{title}</Title1>
			</div>
			<PageLoader />
		</PageContent>
	);
};
