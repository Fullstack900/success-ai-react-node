import mongoose from 'mongoose';

const appSumoSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

appSumoSchema.set('toJSON', {
    transform(_, user) {
        delete user.password;
    },
});

appSumoSchema.index({ username: 1 })

const Appsumo = mongoose.model('Appsumo', appSumoSchema);

export default Appsumo;
