import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
import Provider from '../enum/provider.enum.js';
import CryptoJS from 'crypto-js';
import WarmupStatus from '../enum/warmup-status.enum.js';
import AccountStatus from '../enum/account-status.enum.js';
import WarmupEmail from '../../warmup/models/warmup-email.model.js';
import logger from '../../common/utils/logger.js';
import * as intercomController from '../../intercom/intercom.controller.js'

const Imap = new mongoose.Schema({
  _id: false,
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    set: (v) => CryptoJS.AES.encrypt(v, process.env.AES_SECRET),
    get: (v) =>
      CryptoJS.AES.decrypt(v, process.env.AES_SECRET).toString(
        CryptoJS.enc.Utf8
      ),
  },
  host: {
    type: String,
    required: true,
  },
  port: {
    type: Number,
    required: true,
  },
});

const Smtp = new mongoose.Schema({
  _id: false,
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    set: (v) => CryptoJS.AES.encrypt(v, process.env.AES_SECRET),
    get: (v) =>
      CryptoJS.AES.decrypt(v, process.env.AES_SECRET).toString(
        CryptoJS.enc.Utf8
      ),
  },
  host: {
    type: String,
    required: true,
  },
  port: {
    type: Number,
    required: true,
  },
});

const accountSchema = new mongoose.Schema(
  {
    emailEngineAccountId: {
      type: String,
      required: true,
  },
    freeUserOtherAccounts: {
      type: Boolean,
      default: false,
    },
    migrated: {
      type: Boolean,
      default: false,
  },
    name: {
      first: {
        type: String,
      },
      last: {
        type: String,
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    provider: {
      type: String,
      enum: Object.values(Provider),
      required: true,
    },

    googleRefreshToken: String,
    microsoftRefreshToken: String,
    imap: Imap,
    smtp: Smtp,

    replyTo: String,

    signature: {
      type: String,
    },
    accountError: {
      type: String,
    },
    campaign: {
      dailyLimit: {
        type: Number,
        default: 50,
      },
      waitTime: {
        type: Number,
        default: 1,
      },
    },

    customDomain: {
      isEnable: {
        type: Boolean,
        default: false,
      },
      name: {
        type: String,
      },
    },

    warmup: {
      error: {
      type: String,
      },
      status: {
        type: String,
        enum: Object.values(WarmupStatus),
        required: true,
        default: WarmupStatus.Paused,
      },
      warmupDisable: {
        type: Boolean,
        default: false,
      },
      warmupBounceCount: {
        type: Number,
        default: 0,
      },
      warmupRejectTotal: {
        type: Number,
        default: 0,
      },
      filterTag: {
        type: String,
      },
      basicSetting: {
        increasePerDay: {
          type: Number,
          default: 1,
          min: 1,
          max: 4,
        },
        slowWarmupDisabled: {
          type: Boolean,
          default: false,
        },
        limitPerDay: {
          type: Number,
          default: 20,
          min: 1,
          max: 50,
        },
        replyRate: {
          type: Number,
          default: 30,
        },
        alertBlock: {
          type: Boolean,
          default: true,
        },
      },
      advanceSetting: {
        weekdayOnly: {
          type: Boolean,
          default: false,
        },
        readEmulation: {
          type: Boolean,
          default: false,
        },
        customTrackingDomain: {
          type: Boolean,
          default: false,
        },
        customTrackingValue: {
          type: String,
        },
        openRate: {
          type: Number,
          default: 100,
          min: 0,
          max: 100,
        },
        spamProtectionRate: {
          type: Number,
          default: 100,
          min: 0,
          max: 100,
        },
        markImportantRate: {
          type: Number,
          default: 100,
          min: 0,
          max: 100,
        },
      },
    },

    status: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.Connected,
      required: true,
    },
    eEngineStatus: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    connectionWith: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmailEngine',
      required: true,
    }
  },
  {
    timestamps: true,
  }
);


// Define a post middleware for the 'remove' hook
accountSchema.pre('deleteMany', async function (next) {
  // 'doc' is the deleted document
  // Run your function here, after the document is deleted
  // console.log('Document has been deleted Many:');
  await WarmupEmail.deleteMany({ to: this.getQuery()["_id"], stats_loaded: false });
  // You can perform any additional actions you want here
  // For example, logging or updating related documents
  next();
});

accountSchema.post('save', async function (doc) {
  const email = doc.createdBy.email
  const user = await intercomController.findUserFromIntercom(email)
  const event = {
    eventName: "Email account connected",
    userId: user.id,
    id: user.id,
    email: user.email,
    metadata: {},
    createdAt: Math.round(new Date(doc.createdAt) / 1000),
  }
  await intercomController.addIntercomEvent(event)
});
// Define a post middleware for the 'remove' hook
accountSchema.pre('deleteOne', async function (next) {
  // 'doc' is the deleted document
  // Run your function here, after the document is deleted
  await WarmupEmail.deleteMany({ to: this.getQuery()["_id"], stats_loaded: false });
  // You can perform any additional actions you want here
  // For example, logging or updating related documents
  next();
});


accountSchema.virtual('warmupStats');
accountSchema.virtual('campaignSend');

accountSchema.plugin(mongoosePaginate);

accountSchema.set('toJSON', {
  virtuals: true,
  transform(_, account) {
    if (account.createdBy instanceof mongoose.Types.ObjectId) {
      delete account.createdBy;
    }
    delete account.googleRefreshToken;
    delete account.microsoftRefreshToken;
    delete account.imap?.password;
    delete account.smtp?.password;
  },
});

accountSchema.index({ email: 1 })
accountSchema.index({ createdBy: 1 })
accountSchema.index({
  email: "text",
})

const Account = mongoose.model('Account', accountSchema);

export default Account;
