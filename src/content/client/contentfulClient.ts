import { createClient } from 'contentful';

export const client = createClient({
	space: 'y60vdtprw3sq',
	environment: 'master',
	accessToken: '4G7L1oV5TJRhKPd-5Q5-hJ_jBbHK76npaQlKy2dM64w',
}).withoutUnresolvableLinks;
