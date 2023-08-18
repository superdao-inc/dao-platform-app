import { NextPage } from 'next';

import { Content, Row } from './index';
import { Breadcrumbs, Caption, PageContent, Spacer } from 'src/components';
import * as icons from 'src/components/assets/icons';

import { prefetchData, SSR, SSRAuthMiddleware, checkSupervisorAuth } from 'src/client/ssr';

const Icons: NextPage = () => {
	return (
		<PageContent>
			<Breadcrumbs paths={['UI Kit', 'Icons']} />
			<Content>
				<Row
					dashed
					style={{
						flexWrap: 'wrap',
						gap: '24px',
						display: 'grid',
						gridTemplateColumns: 'repeat(5, 1fr)'
					}}
				>
					{Object.keys(icons)
						.sort()
						.map((key) => {
							// @ts-expect-error
							const Icon = icons[key]; // eslint-disable-line
							return (
								<div
									key={key}
									style={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
										flex: 1
									}}
								>
									<Icon width={48} height={48} />
									<Spacer height={8} />
									<Caption>{key}</Caption>
								</div>
							);
						})}
				</Row>
			</Content>
		</PageContent>
	);
};

export default Icons;

export const getServerSideProps = SSR(SSRAuthMiddleware, async (ctx) => {
	const [redirect] = await checkSupervisorAuth(ctx);
	if (redirect) return redirect;

	const [_, getProps] = await prefetchData(ctx);

	return { props: getProps() };
});
