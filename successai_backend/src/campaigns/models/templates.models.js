import mongoose from 'mongoose';

const template = new mongoose.Schema({
  _id: false,

  id: {
    type : Number,
  },

  title: {
    type : String,
  },

  category: {
    type : Array , "default" : []
  }
},
{
  timestamps: true,
})

const Template = mongoose.model('Templates', template);

export default Template;