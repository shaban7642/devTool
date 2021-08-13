import asyncHandler from 'express-async-handler';
import Credit from '../models/creditModel.js';

// @desc    Create new credits
// @route   POST /api/credits
// @access  Private
export const addCredits = asyncHandler(async (req, res) => {
    const { credits, paymentMethod } = req.body;

    const credit = new Credit({
        user: req.user._id,
        credits,
        paymentMethod,
    });
    credit.price = credit.price * credits;

    const createdCredit = await credit.save();
    res.status(201).json(createdCredit);
});

// @desc    update credits when buying
// @route   PUT /api/credits/:id
// @access  Private
export const buyCredits = asyncHandler(async (req, res) => {
    const credit = await Credit.findById(req.params.id);

    if (credit) {
        credit.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address,
        };
        credit.isPaid = true;
        credit.paidAt = Date.now();
        req.user.credits += credit.credits;

        await req.user.save();
        const updatedCredit = await credit.save();
        res.status(201).json(updatedCredit);
    } else {
        res.status(404);
        throw new Error('Credit not found');
    }
});

// @desc    Get credit by id
// @route   GET /api/credits/:id
// @access  Private
export const getCreditById = asyncHandler(async (req, res) => {
    const credit = await Credit.findById(req.params.id).populate(
        'user',
        'name email'
    );

    if (credit) {
        res.json(credit);
    } else {
        res.status(404);
        throw new Error('Credit not found');
    }
});

// @desc    Get credits for the logged in user
// @route   GET /api/credits/mycredits
// @access  Private
export const getMyCreditsHistory = asyncHandler(async (req, res) => {
    const credits = await Credit.find({ user: req.user._id });
    res.json(credits);
});

// @desc    Get all credits
// @route   GET /api/credits
// @access  Private/admin
export const getAllCreditsHistory = asyncHandler(async (req, res) => {
    const credits = await Credit.find({}).populate('user', 'id name');
    res.json(credits);
});
