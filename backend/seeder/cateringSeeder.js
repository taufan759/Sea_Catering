import MealPlan from '../models/MealPlanModel.js';
import Testimonial from '../models/TestimonialModel.js';
import db from '../config/Database.js';
import dotenv from 'dotenv';

dotenv.config();

const seedCateringData = async () => {
  try {
    // Connect to database
    await db.authenticate();
    console.log('✅ Database connected for SEA Catering seeding');
    
    // Sync database (create tables if they don't exist)
    await db.sync();
    console.log('✅ Database synced');
    
    // Check if meal plans already exist
    const existingMealPlans = await MealPlan.count();
    
    if (existingMealPlans > 0) {
      console.log(`⚠️  Database already has ${existingMealPlans} meal plans. Skipping meal plans seed...`);
    } else {
      console.log('🍽️  Creating meal plans...');
      
      // Sample meal plans data
      const mealPlansData = [
        {
          name: 'Diet Plan',
          price: 30000,
          description: 'Perfect for weight management and healthy living. Low-calorie, nutrient-dense meals designed to help you achieve your fitness goals while enjoying delicious food.',
          features: 'Calorie-controlled portions (1200-1500 calories)|High fiber content for better digestion|Fresh vegetables and lean proteins|Nutritionist-approved recipes|Weight loss support and tracking|Variety of international cuisines',
          icon: '🥗',
          isActive: true
        },
        {
          name: 'Protein Plan',
          price: 40000,
          description: 'High-protein meals for active individuals and fitness enthusiasts. Build muscle, recover faster, and fuel your workouts with our protein-rich meal plans.',
          features: 'High protein content (25-35g per meal)|Supports muscle building and recovery|Premium quality lean meats and fish|Plant-based protein options available|Pre and post-workout meal timing|Balanced macronutrients for optimal performance',
          icon: '💪',
          isActive: true
        },
        {
          name: 'Royal Plan',
          price: 60000,
          description: 'Our premium offering with gourmet ingredients and chef-crafted recipes. Experience luxury dining with the finest, most nutritious ingredients available.',
          features: 'Gourmet ingredients and chef-crafted recipes|Premium cuts of meat and fresh seafood|Organic vegetables and superfoods|Artisanal presentation and plating|Exclusive seasonal menu items|Personalized nutrition consultation',
          icon: '👑',
          isActive: true
        }
      ];
      
      // Create meal plans
      const createdMealPlans = await MealPlan.bulkCreate(mealPlansData);
      console.log(`✅ Created ${createdMealPlans.length} meal plans`);
    }

    // Check if testimonials already exist
    const existingTestimonials = await Testimonial.count();
    
    if (existingTestimonials > 0) {
      console.log(`⚠️  Database already has ${existingTestimonials} testimonials. Skipping testimonials seed...`);
    } else {
      console.log('⭐ Creating testimonials...');
      
      // Sample testimonials data
      const testimonialsData = [
        {
          customerName: 'Sarah M.',
          rating: 5,
          reviewMessage: 'SEA Catering has completely transformed my daily routine! The meals are delicious, healthy, and always delivered on time. I love the variety and the fact that I can customize my meals according to my dietary needs.',
          isApproved: true
        },
        {
          customerName: 'David L.',
          rating: 5,
          reviewMessage: 'As a busy professional, SEA Catering has been a lifesaver. No more worrying about what to eat or spending hours cooking. The nutritional information helps me stay on track with my fitness goals.',
          isApproved: true
        },
        {
          customerName: 'Maria K.',
          rating: 4,
          reviewMessage: 'Great service and quality food! The delivery is always punctual, and the packaging keeps everything fresh. My family loves the Royal Plan!',
          isApproved: true
        },
        {
          customerName: 'Ahmad R.',
          rating: 5,
          reviewMessage: 'Fantastic meal plans! The Protein Plan has really helped me with my workout routine. Highly recommended for anyone serious about fitness.',
          isApproved: true
        },
        {
          customerName: 'Linda S.',
          rating: 4,
          reviewMessage: 'Love the Diet Plan! I have lost 5kg in 2 months and the food still tastes amazing. Customer service is also very responsive.',
          isApproved: true
        },
        {
          customerName: 'Kevin T.',
          rating: 5,
          reviewMessage: 'The Royal Plan is absolutely worth it! Every meal feels like dining at a premium restaurant. The quality and presentation are exceptional.',
          isApproved: true
        },
        {
          customerName: 'Siti N.',
          rating: 4,
          reviewMessage: 'Been using SEA Catering for 6 months now. The convenience is unmatched and the meals never get boring. Great variety and always fresh!',
          isApproved: true
        }
      ];
      
      // Create testimonials
      const createdTestimonials = await Testimonial.bulkCreate(testimonialsData);
      console.log(`✅ Created ${createdTestimonials.length} testimonials`);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding SEA Catering data:', error);
    console.error('\n🔧 Possible solutions:');
    console.error('• Make sure MySQL is running');
    console.error('• Check database credentials in .env');
    console.error('• Ensure database "sea_catering" exists');
    console.error('• Run user seeder first: node seeder/userSeeder.js');
    process.exit(1);
  }
};

// Run seeder
seedCateringData();