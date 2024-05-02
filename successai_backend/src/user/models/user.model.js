import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      first: {
        type: String,
        required: true,
      },
      last: {
        type: String,
        required: true,
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    emailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    warmupTag : {
      type : String,
      unique : true,
      required : true
    },
    password: {
      type: String,
      required: true,
    },
    lastLogout: {
      type: Date,
      default: new Date(0),
    },
    appSumoCode: {
      type: String,
      required: false, // You can set it to true if you want to make it required
    },
    assignedPlan: {
      type: String,
      default:null,
      required: false, // You can set it to true if you want to make it required
    },
    isAppSumoRefund: {
      type: Boolean,
      default:false, 
      required: false, // You can set it to true if you want to make it required
    },
    twofaEnabled: {
      type: Boolean,
      default:false, 
      required: false,
    },
    firstLogin: {
      type: Boolean,
      default:true, 
      required: false,
    },
    twofaSecret: {
      type: String,
      default:"", 
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.set('toJSON', {
  transform(_, user) {
    delete user.password;
  },
});

userSchema.plugin(mongoosePaginate);
userSchema.plugin(softDeletePlugin);

userSchema.index({email: 1})

const User = mongoose.model('User', userSchema);

export default User;
