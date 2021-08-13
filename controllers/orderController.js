import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrder = asyncHandler(async (req, res) => {
    const { model, operation, amountOfCredit } = req.body;

    if (amountOfCredit <= req.user.credits) {
        req.user.credits -= amountOfCredit;
        if (req.user.credits < 0) {
            throw new Error(
                "You don't have enough credits to make this order."
            );
        }
        await req.user.save();
    } else {
        throw new Error("You don't have enough credits to make this order.");
    }

    const order = new Order({
        user: req.user._id,
        model,
        operation,
        amountOfCredit,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
});

// @desc    Get order by id
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
        'user',
        'name email'
    );

    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get orders for the logged in user
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/admin
export const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
});
