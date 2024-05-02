import Intercom from 'intercom-client';

const { Client } = Intercom
const client = new Client({ tokenAuth: { token: process.env.INTERCOM_TOKEN } });

export default client
