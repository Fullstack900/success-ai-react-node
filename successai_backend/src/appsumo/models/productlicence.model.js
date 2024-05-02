import mongoose from 'mongoose';

const productLicenceSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appsumo",
            required: false,
        },
        action: {
            type: String,
            required: true,
        },
        plan_id: {
            type: String,
            required: true,
        },
        uuid: {
            type: String,
            required: true,
            unique: true,
        },
        activation_email: {
            type: String,
            required: true,
        },
        invoice_item_uuid: {
            type: String,
            required: true,
        },
        plan_reset_date: {
            type: Date,
            required: false,
        }
    },
    {
        timestamps: true,
    }
);

const Productlicence = mongoose.model('Productlicence', productLicenceSchema, "product_licence");

export default Productlicence;
