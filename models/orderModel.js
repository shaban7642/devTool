import mongoose from 'mongoose';

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    model: {
        type: String,
        required: true,
    },
    operation: {
        type: String,
        required: true,
    },
    amountOfCredit: {
        type: Number,
        required: true,
    },
});

export default mongoose.model('Order', orderSchema);
