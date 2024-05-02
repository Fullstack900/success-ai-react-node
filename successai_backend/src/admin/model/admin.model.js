import mongoose from 'mongoose';
import Roles from '../enum/roles.enum.js';

const adminSchema = new mongoose.Schema(
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
            default: true, // need to updated if required as we are not providing admin register
        },
        password: {
            type: String,
            required: true,
        },
        lastLogout: {
            type: Date,
            default: new Date(0),
        },
        role: {
            type: String,
            enum: Object.values(Roles),
            default: Roles.Public,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

adminSchema.set('toJSON', {
    transform(_, admin) {
        delete admin.password;
    },
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
