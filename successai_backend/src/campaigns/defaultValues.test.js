import mongoose from 'mongoose';
import { createCampaign, createLeads, deleteCampaign, getVariables } from "../campaigns/campaign.service.js"
import { dependentVariables, leadData, campaignData, conditionallyIncludedVariables } from "../campaigns/dummyData.js"
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

describe('By default variables if leads are not avalaible', () => {

  let connection;
  let createdCampaignWithLead;
  let createdCampaignWithoutLead;
  let createdLead
  beforeAll(async () => {
    try {
      connection = await mongoose.connect(process.env.DB_URL, { maxPoolSize: process.env.DB_POOL_SIZE});
      // console.log("Connected to MongoDB");
    } catch (error) {
      // console.error("Error connecting to MongoDB:", error);
    }
  });

  afterAll(async () => {
    jest.clearAllMocks();
    const campaignIDwithLead = createdCampaignWithLead._id.toString();
    const campaignIDwithoutLead = createdCampaignWithoutLead._id.toString();
    await deleteCampaign({ _id: new ObjectId(campaignIDwithLead) });
    await deleteCampaign({ _id: new ObjectId(campaignIDwithoutLead) });
    await mongoose.connection.close();
  });

  it('getting variables according to lead', async () => {
    const { userId, campaignName, timezone, timezoneFormat } = campaignData;
    
    createdCampaignWithLead = await createCampaign(campaignName, userId, timezone, timezoneFormat);
    createdLead = await createLeads({ leads: leadData}, createdCampaignWithLead._id, userId);
    const resultVariables = await getVariables({_id: new ObjectId(createdCampaignWithLead._id)})

    expect(resultVariables).toEqual(dependentVariables);
  });

  it('getting variables without lead', async () => {
    const { userId, campaignName, timezone, timezoneFormat } = campaignData;
    
    createdCampaignWithoutLead = await createCampaign(campaignName, userId, timezone, timezoneFormat);
    const resultVariables = await getVariables({_id: new ObjectId(createdCampaignWithoutLead._id)})

    expect(resultVariables).toEqual(conditionallyIncludedVariables);
  });
});
