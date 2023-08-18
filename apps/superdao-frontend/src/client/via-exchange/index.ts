import { Via } from '@viaprotocol/router-sdk';

import { viaApiKey } from 'src/constants';

export const viaApi = new Via({ apiKey: viaApiKey });
