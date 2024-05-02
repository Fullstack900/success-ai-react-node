const { ObjectId } = require('mongodb');

export const mockSearch = jest.fn();

export const Operators = {
  EQUALS: 'equals',
};

export const createEvent = jest.fn();

export const mockIntercomUser = (email) => ({
  data: [
    { email: email },
  ].filter((user) => user.email === email),
});

export const createClient = {
  users: {
    create: jest.fn(),
    update: jest.fn(),
  },
  contacts: {
    search: mockSearch,
  },
  events: {
    create: createEvent,
  },
};

export const Client = jest.fn().mockImplementation(() => createClient);

const dummyDataWithoutSignature = {
  name: {
    first: 'olive',
    last: 'howard',
  },
  email: 'olive@gmail.com',
  provider: 'google_oauth',
  createdBy: new ObjectId("5f5b8e14b899c218d1bb43e5"),
  campaign: {
    dailyLimit: 40,
    waitTime: 8,
  },
  replyTo: '',
  signature: null,
  customDomain: {
    isEnable: false,
  },
  warmup: {
    basicSetting: {
      increasePerDay: 1,
      slowWarmupDisabled: false,
      limitPerDay: 20,
      replyRate: 30,
      alertBlock: true,
    },
    advanceSetting: {
      weekdayOnly: false,
      readEmulation: false,
      customTrackingDomain: false,
      openRate: 100,
      spamProtectionRate: 100,
      markImportantRate: 100,
    },
  },
};

const dummyDataWithSignature = {
  name: {
    first: 'olive3',
    last: 'howard',
  },
  email: 'olivehowards@gmail.com',
  provider: 'google_oauth',
  createdBy: new ObjectId("5f5b8e14b899c218d1bb43e5"),
  campaign: {
    dailyLimit: 40,
    waitTime: 8,
  },
  replyTo: '',
  signature: "Olive",
  customDomain: {
    isEnable: false,
  },
  warmup: {
    basicSetting: {
      increasePerDay: 1,
      slowWarmupDisabled: false,
      limitPerDay: 20,
      replyRate: 30,
      alertBlock: true,
    },
    advanceSetting: {
      weekdayOnly: false,
      readEmulation: false,
      customTrackingDomain: false,
      openRate: 100,
      spamProtectionRate: 100,
      markImportantRate: 100,
    },
  },
};

module.exports = {
  dummyDataWithoutSignature,
  dummyDataWithSignature,
};
