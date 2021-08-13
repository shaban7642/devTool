import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'please add a valid email',
            ],
        },
        emailToken: String,
        isVerified: Boolean,
        password: {
            type: String,
            required: true,
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
        activationTime: {
            type: Date,
        },
        endActivationTime: {
            type: Date,
        },
        block: {
            blocked: Boolean,
            reason: String,
        },
        credits: {
            type: Number,
            default: 0,
            required: true,
        },
    },

    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
    // Genetate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

// Reverse populate with virtuals
// userSchema.virtual('credits', {
//     ref: 'Credit',
//     localField: '_id',
//     foreignField: 'user',
//     justOne: true,
// });

export default mongoose.model('User', userSchema);
