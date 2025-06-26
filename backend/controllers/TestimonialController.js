import Testimonial from '../models/TestimonialModel.js';
import { validationResult } from 'express-validator';

// Input sanitization helper
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  return input;
};

export const createTestimonial = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { customerName, rating, reviewMessage } = req.body;

    const testimonial = await Testimonial.create({
      customerName: sanitizeInput(customerName),
      rating,
      reviewMessage: sanitizeInput(reviewMessage)
    });

    res.status(201).json({
      message: 'Testimonial submitted successfully',
      testimonialId: testimonial.id
    });
  } catch (error) {
    console.error('Error creating testimonial:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getTestimonials = async (req, res) => {
  try {
    const { limit = 10, approved = true } = req.query;
    
    const whereClause = approved === 'true' ? { isApproved: true } : {};

    const testimonials = await Testimonial.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      attributes: ['id', 'customerName', 'rating', 'reviewMessage', 'created_at']
    });

    res.status(200).json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateTestimonialApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const testimonial = await Testimonial.findByPk(id);

    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    await testimonial.update({ isApproved });

    res.status(200).json({
      message: `Testimonial ${isApproved ? 'approved' : 'disapproved'} successfully`,
      testimonial
    });
  } catch (error) {
    console.error('Error updating testimonial:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findByPk(id);

    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    await testimonial.destroy();

    res.status(200).json({
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting testimonial:', error.message);
    res.status(500).json({ message: error.message });
  }
};