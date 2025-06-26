// models/SubscriptionModel.js
import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Subscription = db.define('subscriptions', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
    // Remove references untuk avoid circular dependency
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'phone_number'
  },
  planId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'plan_id'
    // Remove references untuk avoid circular dependency
  },
  mealTypes: {
    type: DataTypes.JSON,
    allowNull: false,
    field: 'meal_types'
  },
  deliveryDays: {
    type: DataTypes.JSON,
    allowNull: false,
    field: 'delivery_days'
  },
  allergies: {
    type: DataTypes.TEXT
  },
  totalPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'total_price'
  },
  status: {
    type: DataTypes.ENUM('active', 'paused', 'cancelled'),
    defaultValue: 'active'
  },
  pausedStart: {
    type: DataTypes.DATE,
    field: 'paused_start'
  },
  pausedEnd: {
    type: DataTypes.DATE,
    field: 'paused_end'
  }
}, {
  freezeTableName: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Subscription;