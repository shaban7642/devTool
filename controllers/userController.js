import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Credit from '../models/creditModel.js';
import generateToken from '../utils/generateToken.js';
import axios from 'axios';
import crypto from 'crypto';

//@desc     Auth user & get token
//@route    POST /api/users/login
//@access   Public
export const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user.block.isblocked) {
        throw new Error('This user is blocked');
    }

    if (!user.isVerified) {
        throw new Error('Please verify your account first to login');
    }

    if (user && (await user.matchPassword(password)) & user.isVerified) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            credits: user.credits.numOfCredit,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

//@desc     Register a new user
//@route    POST /api/users
//@access   Public
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists.block.isblocked) {
        throw new Error('This user is blocked');
    }

    if (userExists) {
        res.status(400);
        throw new Error('User is already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        emailToken: crypto.randomBytes(64).toString('hex'),
        isVerified: false,
    });

    const msg = {
        name,
        frommail: 'ashaban7642@gmail.com',
        tomail: email,
        subject: 'Verify your email',
        text: `Hello, Thanks for registering on our website.
                Please copy and paste the address below to verify your account.
                ${req.protocol}://${req.get('host')}/api/users/verify-email/${
            user.emailToken
        }`,
        html: `<h1>Hello</h1>
                <p>Thanks for registering on our website.</p>
                <p>Please click the link below to verify your account.</p>
                <a href="${req.protocol}://${req.get(
            'host'
        )}/api/users/verify-email/${user.emailToken}" >Verify your account</a>`,
    };

    try {
        await axios.post(
            `${req.protocol}://${req.get('host')}/api/users/mail`,
            msg
        );
    } catch (error) {
        await user.remove();
        console.log(error);
    }

    if (user) {
        res.status(201).json('Please check your email to verify your account');
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

export const verifyEmail = asyncHandler(async (req, res) => {
    const user = await User.findOne({ emailToken: req.params.emailToken });

    if (!user) {
        throw new Error('token is invalid please contact us for assistance');
    }
    user.emailToken = undefined;
    user.isVerified = true;
    await user.save();
    res.redirect('/');
});

// @desc   Forgot password
// @route  POST /api/users/forgotpassword
// @access public
export const forgotPassword = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        throw new Error('There is no user with this email');
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const msg = {
        name: user.name,
        frommail: 'ashaban7642@gmail.com',
        tomail: user.email,
        subject: 'Reset your password',
        text: `Hello, You are receving this email because you (or someone else) has requested the reset of a password.
                Please copy and paste the address below to Reset your password.
                ${req.protocol}://${req.get(
            'host'
        )}/api/users/resetpassword/${resetToken}`,
        html: `<h1>Hello</h1>
                <p>You are receving this email because you (or someone else) has requested the reset of a password.</p>
                <p>Please click the link below to reset your password.</p>
                <a href="${req.protocol}://${req.get(
            'host'
        )}/api/users/resetpassword/${resetToken}" >Reset your password</a>`,
    };

    try {
        await axios.post(
            `${req.protocol}://${req.get('host')}/api/users/mail`,
            msg
        );
    } catch (err) {
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        throw new Error('Email could not be sent');
    }

    console.log(resetToken);
    res.json('Please check your email to reset your password');
});

// @desc   Reset password
// @route  PUT /api/users/resetpassword/:resettoken
// @access public
export const resetPassword = asyncHandler(async (req, res) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        throw new Error('invalid token');
    }

    // set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json(user);
});

//@desc     Get user by ID
//@route    GET /api/users/:id
//@access   Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

//@desc     Get all users
//@route    GET /api/users
//@access   Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});

    res.json(users);
});

//@desc     Get user profile
//@route    POST /api/users/profile
//@access   Private
export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            credits: user.credits,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

//@desc     Update user profile
//@route    Put /api/users/profile
//@access   Private
export const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

//@desc     Update user
//@route    Put /api/users/:id
//@access   Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.isAdmin = req.body.isAdmin;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    update user to blocked
// @route   PUT /api/user/:id/block
// @access  Private/admin
export const updateUserToBlocked = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.block.isBlocked = true;
        user.block.reason = req.body.reason;

        const updatedUser = await user.save();
        res.status(201).json(updatedUser);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    update user to unblocked
// @route   PUT /api/user/:id/unblock
// @access  Private/admin
export const updateUserToUnblocked = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.block.isBlocked = false;
        user.block.reason = undefined;

        const updatedUser = await user.save();
        res.status(201).json(updatedUser);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

//@desc     Delete user
//@route    DELETE /api/users/:id
//@access   Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.remove();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    update credits when buying
// @route   PUT /api/credits
// @access  Private
// export const buyCredits = asyncHandler(async (req, res) => {
//     const { credits, paymentMethod } = req.body;
//     const credit = await Credit.findOne({ user: req.user._id });

//     if (credit) {
//         credit.credit = credits;
//         credit.paymentMethod = paymentMethod;
//         credit.price *= credits;
//         credit.paymentResult = {
//             id: req.body.id,
//             status: req.body.status,
//             update_time: req.body.update_time,
//             email_address: req.body.payer.email_address,
//         };

//         const updatedCredit = await credit.save();
//         res.status(201).json(updatedCredit);
//     } else {
//         res.status(404);
//         throw new Error('Credit not found');
//     }
// });

// @desc    Get credits for the logged in user
// @route   GET /api/credits/mycredits
// @access  Private
// export const getMyCreditsHistory = asyncHandler(async (req, res) => {
//     const credits = await Credit.find({ user: req.user._id });
//     res.json(credits);
// });

// @desc    Get all orders
// @route   GET /api/credits
// @access  Private/admin
// export const getAllCreditsHistory = asyncHandler(async (req, res) => {
//     const credits = await Credit.find({}).populate('user', 'id name');
//     res.json(credits);
// });
