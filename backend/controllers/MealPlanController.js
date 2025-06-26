import MealPlan from '../models/MealPlanModel.js';

export const getMealPlans = async (req, res) => {
  try {
    const mealPlans = await MealPlan.findAll({
      where: { isActive: true },
      order: [['price', 'ASC']],
      attributes: ['id', 'name', 'price', 'description', 'features', 'icon']
    });

    res.status(200).json(mealPlans);
  } catch (error) {
    console.error('Error fetching meal plans:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getMealPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const mealPlan = await MealPlan.findByPk(id, {
      attributes: ['id', 'name', 'price', 'description', 'features', 'icon']
    });

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    res.status(200).json(mealPlan);
  } catch (error) {
    console.error('Error fetching meal plan:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const createMealPlan = async (req, res) => {
  try {
    const { name, price, description, features, icon } = req.body;

    const mealPlan = await MealPlan.create({
      name,
      price,
      description,
      features,
      icon: icon || '🍽️'
    });

    res.status(201).json({
      message: 'Meal plan created successfully',
      mealPlan
    });
  } catch (error) {
    console.error('Error creating meal plan:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateMealPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, features, icon, isActive } = req.body;

    const mealPlan = await MealPlan.findByPk(id);

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    await mealPlan.update({
      name: name || mealPlan.name,
      price: price || mealPlan.price,
      description: description || mealPlan.description,
      features: features || mealPlan.features,
      icon: icon || mealPlan.icon,
      isActive: isActive !== undefined ? isActive : mealPlan.isActive
    });

    res.status(200).json({
      message: 'Meal plan updated successfully',
      mealPlan
    });
  } catch (error) {
    console.error('Error updating meal plan:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const deleteMealPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const mealPlan = await MealPlan.findByPk(id);

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    // Soft delete by setting isActive to false
    await mealPlan.update({ isActive: false });

    res.status(200).json({
      message: 'Meal plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting meal plan:', error.message);
    res.status(500).json({ message: error.message });
  }
};