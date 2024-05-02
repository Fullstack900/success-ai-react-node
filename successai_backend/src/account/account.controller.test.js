import * as Service from '../account/account.service';
import mongoose from 'mongoose';
import { dummyDataWithoutSignature, dummyDataWithSignature } from './dummyData.js';
const { ObjectId } = require('mongodb');
require('dotenv').config();

jest.mock('intercom-client', () => {
  const createEvent = jest.fn();
  const mockSearch = jest.fn();
  const Operators = {
    EQUALS: 'equals',
  };
  const createClient = () => {

    const client = {
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
    return client;
  };

  const mockIntercomUser = (email) => ({
    data: [
      { email: email }
    ].filter((user) => user.email === email),
  });

  mockSearch.mockImplementation(async ({ data }) => {
    const { field, operator, value } = data.query;
    if (field === 'email' && operator === Operators.EQUALS) {
      return mockIntercomUser(value);
    }
  });
  return {
    Client: createClient,
    Operators
  };
});

describe('test case for optional signature', () => {
  let connection;
  let db;
  let accountWithoutSignature;
  let accountWithSignature;
  beforeAll(async () => {
    try {
      connection = await mongoose.connect(process.env.DB_URL,{ maxPoolSize: process.env.DB_POOL_SIZE});
      // console.log("Connected to MongoDB");
      db = connection.connection.db;
    } catch (error) {
      // console.error("Error connecting to MongoDB:", error);
    }
  });

  afterAll(async () => {
    jest.clearAllMocks();
    let idWithoutSignature = accountWithoutSignature._id.toString();
    let idWithSignature = accountWithSignature._id.toString();
    await Service.deleteOne({ _id: new ObjectId(idWithoutSignature) });
    await Service.deleteOne({ _id: new ObjectId(idWithSignature) });
    await mongoose.connection.close();
  });

  it('creates an account without signature', async () => {
    accountWithoutSignature = await Service.connectAccount(dummyDataWithoutSignature.email, dummyDataWithoutSignature);
    expect(accountWithoutSignature.signature).toBe(null);
  });

  it('creates an account with signature', async () => {
    accountWithSignature = await Service.connectAccount(dummyDataWithSignature.email, dummyDataWithSignature);
    expect(accountWithSignature.signature).toBe(dummyDataWithSignature.signature);
  });

  it('updates an account with a new signature', async () => {
    const newSignature = 'newSignature123';
    const updatedAccount = await Service.update(accountWithSignature._id, { ...dummyDataWithSignature, signature: newSignature });
    expect(updatedAccount.signature).toBe(newSignature);
  });

  it('handles updating an account that does not exist', async () => {
    const nonExistentAccountId = new ObjectId();
    await expect(Service.update(nonExistentAccountId, {})).rejects.toThrow('Account not found');
  });
});
