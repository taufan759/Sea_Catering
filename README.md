# 🍽️ SEA Catering - Healthy Meals Service

**Developer:** Muhammad Taufan Akbar  
**NIM:** 12220831  
**University:** Universitas Bina Sarana Informatika  
**Project:** SEA Compfest Software Engineering Academy Final Project

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Live Demo](#live-demo)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Admin Account Setup](#admin-account-setup)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Development Process](#development-process)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

SEA Catering is Indonesia's premier customizable healthy meal service that transforms your health journey with fresh, nutritious, and delicious meals crafted by professional chefs and approved by nutritionists. This application provides a comprehensive platform for customers to browse meal plans, manage subscriptions, and for administrators to monitor business performance.

### 🎯 Key Highlights

- **50,000+ Happy Customers** across Indonesia
- **1M+ Meals Delivered** with 99.8% on-time delivery
- **25+ Cities Covered** throughout Indonesia
- **4.9/5 Average Rating** from satisfied customers

---

## ✨ Features

### 🏠 **Public Features (Home Page)**
- Interactive hero section with dynamic animations
- Comprehensive meal plan showcase (Diet, Protein, Royal)
- Real-time subscription form with price calculation
- Customer testimonials carousel
- Contact form and business information
- Responsive design for all devices

### 👤 **User Dashboard (Customer Portal)**
- **View Active Subscriptions**: Complete subscription details including plan name, meal types, delivery days, total price, and status
- **Pause Subscriptions**: Temporarily pause subscriptions with specific date range selection
- **Cancel Subscriptions**: Permanently cancel subscriptions with clear confirmation process
- **Resume Subscriptions**: Reactivate paused subscriptions
- Personal profile management
- Subscription history and status tracking

### 👨‍💼 **Admin Dashboard (Business Intelligence)**
- **Date Range Selector**: Filter data within chosen date ranges
- **New Subscriptions**: Track total new subscriptions during selected periods
- **Monthly Recurring Revenue (MRR)**: Monitor revenue from active subscriptions
- **Reactivations**: Track subscriptions that were cancelled and restarted
- **Subscription Growth**: Monitor overall active subscription numbers
- Real-time business metrics and analytics

### 🔐 **Authentication & Security**
- Secure JWT-based authentication
- Role-based access control (User, Admin, Super Admin)
- Protected routes with automatic redirects
- Session management and token validation

---

## 🛠️ Technology Stack

### **Frontend**
- ⚛️ **React 18** - Modern UI framework
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🚀 **Vite** - Fast build tool and development server
- 📱 **PWA** - Progressive Web App capabilities
- 🎭 **React Router** - Client-side routing
- 📊 **Context API** - State management

### **Backend Integration**
- 🌐 **REST API** - RESTful API communication
- 🔐 **JWT Authentication** - Secure token-based auth
- 📡 **Fetch API** - Modern HTTP client

### **Development Tools**
- 📝 **ESLint** - Code linting
- 💅 **Prettier** - Code formatting
- 🔧 **Git** - Version control
- 📱 **Responsive Design** - Mobile-first approach

---

## 🌐 Live Demo

### **Deployment Options**

**Option 1: GitHub Pages (Frontend Only)**
```bash
🔗 https://taufan759.github.io/Sea_Catering/
```

**Option 2: Full Stack Deployment**
```bash
🔗 https://sea-catering-frontend.vercel.app/
🔗 https://sea-catering-backend.railway.app/
```

### **Demo Accounts**

**Regular User:**
```
Email: user@seacatering.id
Password: user123
```

**Admin User:**
```
Email: admin@seacatering.id
Password: admin123
```

**Super Admin:**
```
Email: superadmin@seacatering.id
Password: superadmin123
```

---

## 🚀 Installation & Setup

### **Prerequisites**
- Node.js (v16.0.0 or higher)
- npm or yarn package manager
- Git

### **1. Clone Repository**
```bash
git clone https://github.com/taufan759/Sea_Catering.git
cd Sea_Catering
```

### **2. Install Dependencies**
```bash
npm install
# or
yarn install
```

### **3. Environment Setup**
Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:3000/api

# App Configuration
VITE_APP_NAME=SEA Catering
VITE_APP_VERSION=1.0.0

# Authentication
VITE_JWT_SECRET=your-secret-key-here
VITE_JWT_EXPIRES_IN=3600

# Business Configuration
VITE_BUSINESS_PHONE=08123456789
VITE_BUSINESS_EMAIL=hello@seacatering.id
VITE_BUSINESS_ADDRESS=Indonesia

# Features
VITE_ENABLE_PWA=true
VITE_ENABLE_NOTIFICATIONS=true
```

### **4. Start Development Server**
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

### **5. Build for Production**
```bash
npm run build
# or
yarn build
```

### **6. Preview Production Build**
```bash
npm run preview
# or
yarn preview
```

---

## 🔧 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000` | ✅ |
| `VITE_API_BASE_URL` | API endpoint base URL | `http://localhost:3000/api` | ✅ |
| `VITE_APP_NAME` | Application name | `SEA Catering` | ❌ |
| `VITE_APP_VERSION` | Application version | `1.0.0` | ❌ |
| `VITE_JWT_SECRET` | JWT secret key | - | ✅ |
| `VITE_JWT_EXPIRES_IN` | Token expiration time | `3600` | ❌ |
| `VITE_BUSINESS_PHONE` | Business phone number | `08123456789` | ❌ |
| `VITE_BUSINESS_EMAIL` | Business email | `hello@seacatering.id` | ❌ |
| `VITE_ENABLE_PWA` | Enable PWA features | `true` | ❌ |

---

## 👨‍💼 Admin Account Setup

### **Method 1: Database Seeding (Recommended)**

Create a database seeder script to insert admin accounts:

```sql
-- Insert Super Admin
INSERT INTO users (name, email, password, role, created_at, updated_at) 
VALUES (
  'Super Admin', 
  'superadmin@seacatering.id', 
  '$2b$10$hashedPassword', 
  'super_admin', 
  NOW(), 
  NOW()
);

-- Insert Regular Admin
INSERT INTO users (name, email, password, role, created_at, updated_at) 
VALUES (
  'Admin User', 
  'admin@seacatering.id', 
  '$2b$10$hashedPassword', 
  'admin', 
  NOW(), 
  NOW()
);
```

### **Method 2: Registration with Role Update**

1. Register a new account normally
2. Update the user role directly in the database:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### **Method 3: Admin Registration Endpoint**

If your backend supports it, create an admin via API:

```bash
curl -X POST http://localhost:3000/api/admin/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Name",
    "email": "admin@seacatering.id",
    "password": "admin123",
    "role": "admin"
  }'
```

---

## 📁 Project Structure

```
Sea_Catering/
├── public/                     # Static assets
│   ├── manifest.json          # PWA manifest
│   ├── favicon.ico            # Favicon
│   ├── logo192.png           # PWA icons
│   ├── logo512.png           # PWA icons
│   └── robots.txt            # SEO robots file
├── src/
│   ├── components/           # Reusable components
│   │   ├── common/          # Common UI components
│   │   │   ├── Header.jsx   # Navigation header
│   │   │   ├── Footer.jsx   # Site footer
│   │   │   └── Sidebar.jsx  # Dashboard sidebar
│   │   ├── AppLayouts.jsx   # Layout wrapper
│   │   └── ProtectedRoute.jsx # Route protection
│   ├── context/             # React Context
│   │   └── AuthContext.jsx  # Authentication context
│   ├── pages/               # Page components
│   │   ├── auth/           # Authentication pages
│   │   │   ├── Login.jsx   # Login page
│   │   │   └── Register.jsx # Registration page
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   ├── Home.jsx        # Landing page
│   │   └── UserSubscriptions.jsx # User dashboard
│   ├── services/           # API services
│   │   ├── api.js         # API utilities
│   │   └── localStorage.js # Storage utilities
│   ├── utils/              # Utility functions
│   │   ├── auth.js        # Auth utilities
│   │   └── jwtUtils.js    # JWT utilities
│   ├── App.jsx            # Main app component
│   ├── AppSettings.js     # App configuration
│   ├── main.jsx          # App entry point
│   └── index.css         # Global styles
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules
├── index.html            # HTML template
├── package.json          # Dependencies
├── tailwind.config.js    # Tailwind configuration
├── vite.config.js        # Vite configuration
└── README.md            # This file
```

---

## 🔌 API Integration

### **Backend Requirements**

The frontend expects a REST API with the following endpoints:

#### **Authentication**
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout

#### **Meal Plans**
- `GET /meal-plans` - Get all meal plans
- `GET /meal-plans/:id` - Get specific meal plan

#### **Subscriptions**
- `POST /subscriptions` - Create new subscription
- `GET /my-subscriptions` - Get user subscriptions
- `PUT /subscriptions/:id/status` - Update subscription status
- `GET /admin/subscriptions` - Admin: Get all subscriptions
- `GET /admin/subscriptions/stats` - Admin: Get subscription statistics

#### **Testimonials**
- `GET /testimonials` - Get all testimonials
- `POST /testimonials` - Create new testimonial

### **Backend Repository**
```bash
🔗 https://github.com/taufan759/Sea_Catering_Backend
```

---

## 🚀 Deployment

### **Option 1: GitHub Pages (Frontend Only)**

⚠️ **Note**: GitHub Pages only supports static hosting. Backend API functionality will not work.

1. **Build the project:**
```bash
npm run build
```

2. **Install gh-pages:**
```bash
npm install --save-dev gh-pages
```

3. **Add deployment scripts to package.json:**
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://taufan759.github.io/Sea_Catering"
}
```

4. **Deploy:**
```bash
npm run deploy
```

### **Option 2: Full Stack Deployment (Recommended)**

#### **Frontend: Vercel**
1. Push your code to GitHub
2. Connect Vercel to your GitHub repository
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on every push

#### **Backend: Railway/Render/Heroku**
1. Deploy your backend API
2. Update `VITE_API_URL` to point to your backend
3. Configure database connection
4. Deploy frontend with updated API URL

### **Option 3: Docker Deployment**

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build and run
docker build -t sea-catering .
docker run -p 80:80 sea-catering
```

---

## 📸 Screenshots

### **Home Page**
![Home Page](./screenshots/home-page.png)

### **Meal Plans Section**
![Meal Plans](./screenshots/meal-plans.png)

### **User Dashboard**
![User Dashboard](./screenshots/user-dashboard.png)

### **Admin Dashboard**
![Admin Dashboard](./screenshots/admin-dashboard.png)

### **Mobile Responsive**
![Mobile View](./screenshots/mobile-view.png)

---

## 💻 Development Process

### **Commit History Overview**

This project was developed in phases with regular commits:

1. **Initial Setup** - Project structure and basic configuration
2. **UI Components** - Header, Footer, and basic layouts
3. **Authentication** - Login/register system with JWT
4. **Home Page** - Landing page with meal plans showcase
5. **User Features** - Subscription management and user dashboard
6. **Admin Features** - Admin dashboard with business metrics
7. **Polish & Deploy** - Final touches, testing, and deployment

### **Development Guidelines**

- **Clean Code**: Well-structured, readable, and maintainable code
- **Component Architecture**: Reusable and modular components
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **State Management**: Efficient use of React Context and hooks
- **Error Handling**: Comprehensive error handling and user feedback

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is created for educational purposes as part of the SEA Compfest Software Engineering Academy program.

**Copyright © 2024 Muhammad Taufan Akbar - Universitas Bina Sarana Informatika**

---

## 📞 Contact

**Developer**: Muhammad Taufan Akbar  
**University**: Universitas Bina Sarana Informatika  
**NIM**: 12220831  
**Email**: taufan.akbar@student.bsi.ac.id  
**GitHub**: [@taufan759](https://github.com/taufan759)  
**Project Link**: [https://github.com/taufan759/Sea_Catering](https://github.com/taufan759/Sea_Catering)

---

## 🙏 Acknowledgments

- **SEA Compfest** for providing this amazing learning opportunity
- **Brian (Project Manager)** for guidance and requirements
- **Universitas Bina Sarana Informatika** for supporting my education
- **React Community** for excellent documentation and resources
- **Tailwind CSS** for the amazing utility-first CSS framework

---

**Thank you for reviewing SEA Catering! 🍽️✨**