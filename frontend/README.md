# 🏠 CarryIT Frontend - Rental & Airbnb Management Platform

A modern, responsive React application for managing rental properties and Airbnb listings across East Africa.

## 🌟 Features

- 🏘️ **Rental Properties** - Browse and book long-term rental homes
- 🏖️ **Vacation Rentals** - Discover Airbnb-style short-term stays
- 🔍 **Advanced Search** - Filter by location, price, type, and amenities
- 📱 **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- 🎨 **Modern UI** - Beautiful Material-UI components
- 🔐 **Authentication** - Secure login and registration
- 👨‍💼 **Property Management** - Owner dashboard for managing listings
- 🎯 **Admin Panel** - Comprehensive admin controls
- 📊 **Analytics** - Property performance insights
- 🌍 **SEO Optimized** - Top search engine rankings

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/carryit-frontend.git
cd carryit-frontend

# Install dependencies
npm install

# Start development server
npm start

# Open http://localhost:3000
```

### Build for Production

```bash
# Create optimized production build
npm run build

# The build folder is ready to be deployed
```

## 🌐 Deployment

### Deploy to Render (Recommended)

1. Push code to GitHub
2. Connect GitHub to Render
3. Render auto-deploys on every push

See [DEPLOY_TO_RENDER.md](./DEPLOY_TO_RENDER.md) for detailed instructions.

## 🔧 Configuration

### Environment Variables

Backend API URL is configured in the code:
- Development: `http://localhost:8000/api/v1`
- Production: `https://carryit-backend.onrender.com/api/v1`

To change the backend URL, update files in `src/services/` and `src/pages/`.

## 📁 Project Structure

```
frontend/
├── public/               # Static files
│   ├── index.html       # HTML template with SEO tags
│   ├── manifest.json    # PWA manifest
│   ├── robots.txt       # Search engine instructions
│   ├── sitemap.xml      # Site structure for SEO
│   └── _redirects       # SPA routing config
├── src/
│   ├── components/      # Reusable components
│   ├── pages/           # Page components
│   │   ├── Public/      # Public-facing pages
│   │   ├── Admin/       # Admin dashboard
│   │   ├── Airbnb/      # Airbnb management
│   │   └── Auth/        # Authentication pages
│   ├── services/        # API services
│   └── App.js           # Main app component
├── package.json         # Dependencies
└── render.yaml          # Render deployment config
```

## 🎨 Tech Stack

- **React** 18.2.0 - UI framework
- **Material-UI** 5.14.20 - Component library
- **React Router** 6.20.1 - Navigation
- **Axios** 1.6.2 - HTTP client
- **Recharts** 2.8.0 - Data visualization
- **Stripe** - Payment processing

## 📱 Pages

### Public Pages
- `/` - Home / Landing page
- `/rentals` - Browse rental properties
- `/airbnb` - Browse vacation rentals
- `/rental/:id` - Rental property details
- `/airbnb/:id` - Airbnb property details
- `/guidelines` - Rental guidelines and info

### Authenticated Pages
- `/login` - User login
- `/register` - User registration
- `/dashboard` - Owner dashboard
- `/admin` - Admin panel

## 🔍 SEO Features

✅ Comprehensive meta tags
✅ Open Graph tags (Facebook/LinkedIn)
✅ Twitter Card tags
✅ Schema.org structured data
✅ Geo-location tags for Uganda
✅ robots.txt configuration
✅ XML sitemap
✅ Canonical URLs

## 📊 Performance

- ⚡ Code splitting
- 🗜️ Minified assets
- 🌳 Tree shaking
- 📦 Optimized bundle size
- 🚀 Fast page loads
- 📱 Mobile-first responsive

## 🌍 Target Markets

- 🇺🇬 Uganda (Primary)
- 🇰🇪 Kenya
- 🇹🇿 Tanzania
- 🇷🇼 Rwanda
- 🇧🇮 Burundi
- East Africa region

## 📞 Contact

- **Email**: stuartkevinz852@gmail.com, carryit@gmail.com
- **Phone**: +256754577922
- **Website**: https://carryit.com

## 📄 License

Private - CarryIT Uganda © 2024

## 🤝 Contributing

This is a private project. Contact the team for collaboration opportunities.

---

Built with ❤️ for East Africa

