// import { CodegenConfig } from '@graphql-codegen/cli';

const config /*: CodegenConfig */ = {
	schema: 'src/services/the-graph/graph-polygon/**/*.gql',
	documents: 'src/services/blockchain/**/*.gql',
	ignoreNoDocuments: true, // for better experience with the watcher
	generates: {
		['src/services/the-graph/graph-polygon/types.generated.ts']: {
			plugins: [
				'typescript',
				{
					add: {
						content: '/* eslint-disable */'
					}
				}
			]
		},
		['src/']: {
			preset: 'near-operation-file',
			presetConfig: {
				extension: '.generated.ts',
				baseTypesPath: 'services/the-graph/graph-polygon/types.generated.ts'
			},
			plugins: [
				'typescript-operations',
				'typescript-graphql-request',
				{
					add: {
						content: '/* eslint-disable */'
					}
				}
			],
			config: {
				skipTypename: true
			}
		}
	},
	hooks: {
		afterAllFileWrite: ['eslint --fix --quiet']
	}
};

export default config;
