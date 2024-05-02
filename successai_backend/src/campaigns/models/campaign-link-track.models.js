import mongoose from "mongoose";

const linkTrackSchema = new mongoose.Schema({

    redirectLink : {
        type: String,
        required: true
    },

    isRedirect : {
        type : Boolean,
        default : false
    },

}, {
    timestamps: true
})

const LinkTrack = mongoose.model(
    'LinkTrack',
    linkTrackSchema,
    'link_track'
  );
  
  export default LinkTrack;