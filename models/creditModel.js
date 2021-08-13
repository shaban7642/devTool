import mongoose from 'mongoose';

const creditSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    credits: {
        type: Number,
        default: 1,
        required: true,
    },
    price: {
        type: Number,
        default: 1,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false,
    },
    paidAt: {
        type: Date,
    },
});

export default mongoose.model('Credit', creditSchema);
