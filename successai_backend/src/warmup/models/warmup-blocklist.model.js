import mongoose from 'mongoose';
import blocklistImportType from '../enum/blocklist-import-type.enum.js';
import mongoosePaginate from 'mongoose-paginate';

const warmupBlocklistSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(blocklistImportType),
            required: true,
        },
        link: {
            type: String,
            required: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

warmupBlocklistSchema.plugin(mongoosePaginate);

warmupBlocklistSchema.index({createdBy: 1})

const WarmupBlocklist = mongoose.model(
    'WarmupBlocklist',
    warmupBlocklistSchema,
    'warmup_blocklist'
);

export default WarmupBlocklist;
