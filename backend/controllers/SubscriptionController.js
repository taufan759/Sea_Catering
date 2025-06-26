import Subscription from '../models/SubscriptionModel.js';
import MealPlan from '../models/MealPlanModel.js';
import User from '../models/UserModel.js';
import { body, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import db from '../config/Database.js';

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  return input;
};

export const createSubscription = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { name, phoneNumber, planId, mealTypes, deliveryDays, allergies } = req.body;

    const plan = await MealPlan.findOne({
      where: { id: planId, isActive: true }
    });
    
    if (!plan) {
      return res.status(404).json({ error: 'Meal plan not found or inactive' });
    }

    if (!Array.isArray(mealTypes) || mealTypes.length === 0) {
      return res.status(400).json({ error: 'At least one meal type is required' });
    }

    if (!Array.isArray(deliveryDays) || deliveryDays.length === 0) {
      return res.status(400).json({ error: 'At least one delivery day is required' });
    }

    const totalPrice = plan.price * mealTypes.length * deliveryDays.length * 4.3;

    const existingSubscriptions = await Subscription.count({
      where: { userId: req.user.userId, status: 'active' }
    });

    if (existingSubscriptions >= 3) {
      return res.status(400).json({ 
        error: 'You already have 3 active subscriptions. Please cancel one before creating a new subscription.' 
      });
    }

    const subscription = await Subscription.create({
      userId: req.user.userId,
      name: sanitizeInput(name),
      phoneNumber,
      planId,
      mealTypes,
      deliveryDays,
      allergies: sanitizeInput(allergies || ''),
      totalPrice: Math.round(totalPrice * 100) / 100,
      status: 'active'
    });

    res.status(201).json({
      message: 'Subscription created successfully',
      subscriptionId: subscription.id,
      totalPrice: subscription.totalPrice
    });
  } catch (error) {
    console.error('Error creating subscription:', error.message);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

export const getUserSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll({
      where: { userId: req.user.userId },
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error.message);
    res.status(500).json({ 
      message: 'Failed to fetch subscriptions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

export const updateSubscriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, pausedStart, pausedEnd } = req.body;

    const validStatuses = ['active', 'paused', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const subscription = await Subscription.findOne({
      where: { id, userId: req.user.userId }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const updateData = { status };

    if (status === 'paused') {
      if (!pausedStart || !pausedEnd) {
        return res.status(400).json({ error: 'Pause dates are required' });
      }
      updateData.pausedStart = new Date(pausedStart);
      updateData.pausedEnd = new Date(pausedEnd);
    } else {
      updateData.pausedStart = null;
      updateData.pausedEnd = null;
    }

    await subscription.update(updateData);

    res.status(200).json({
      message: `Subscription ${status} successfully`,
      subscription: { id: subscription.id, status: subscription.status }
    });
  } catch (error) {
    console.error('Error updating subscription:', error.message);
    res.status(500).json({ message: 'Failed to update subscription' });
  }
};

export const getAllSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await Subscription.findAndCountAll({
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.status(200).json({
      subscriptions: result.rows,
      pagination: {
        total: result.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(result.count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching all subscriptions:', error.message);
    res.status(500).json({ message: 'Failed to fetch subscriptions' });
  }
};

export const getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subscription = await Subscription.findOne({
      where: { 
        id,
        userId: req.user.userId 
      }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.status(200).json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error.message);
    res.status(500).json({ message: 'Failed to fetch subscription' });
  }
};

export const getSubscriptionStats = async (req, res) => {
  try {
    const overallStats = await Subscription.findOne({
      attributes: [
        [db.fn('COUNT', '*'), 'totalSubscriptions'],
        [db.fn('SUM', db.col('total_price')), 'totalRevenue'],
        [db.fn('COUNT', db.literal("CASE WHEN status = 'active' THEN 1 END")), 'activeSubscriptions'],
        [db.fn('COUNT', db.literal("CASE WHEN status = 'cancelled' THEN 1 END")), 'cancelledSubscriptions'],
        [db.fn('COUNT', db.literal("CASE WHEN status = 'paused' THEN 1 END")), 'pausedSubscriptions']
      ],
      raw: true
    });

    res.status(200).json({ overallStats });
  } catch (error) {
    console.error('Error fetching subscription stats:', error.message);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
};