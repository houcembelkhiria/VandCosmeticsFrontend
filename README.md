# VANDA Cosmetics Frontend

A modern, responsive React eCommerce frontend for VANDA Cosmetics built with TypeScript, Tailwind CSS, and Shadcn/ui components.

## 🚀 Features

- **Modern UI**: Built with Tailwind CSS and Shadcn/ui components
- **Authentication**: Supabase Auth integration with protected routes
- **Product Management**: Browse, search, and filter products
- **Shopping Cart**: Persistent cart with Zustand state management
- **Checkout Flow**: Complete order placement with form validation
- **Admin Dashboard**: Product and order management for administrators
- **Responsive Design**: Mobile-first responsive design
- **Real-time Updates**: React Query for efficient data fetching
- **Type Safety**: Full TypeScript implementation

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see backend README)

## 🛠️ Installation

1. **Clone and navigate to frontend directory:**
   ```bash
   cd vanda-cosmetic
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env.local
   ```

4. **Configure your `.env.local` file:**
   ```env
   VITE_API_URL=http://localhost:9000
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## 🚀 Running the Application

**Development mode:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

The application will start on `http://localhost:3000`.

## 📱 Pages & Features

### Public Pages
- **Home**: Hero section with featured products
- **Products**: Product listing with filters and pagination
- **Product Detail**: Individual product pages with add to cart
- **Cart**: Shopping cart management
- **Checkout**: Order placement form
- **Order Confirmation**: Order success page

### Authentication
- **Login**: User authentication
- **Register**: New user registration

### Protected Pages
- **Profile**: User profile management
- **Orders**: Order history
- **Admin Dashboard**: Product and order management (admin only)

## 🎨 UI Components

Built with Shadcn/ui components:
- **Forms**: React Hook Form with Zod validation
- **Modals**: Dialog and Sheet components
- **Navigation**: Dropdown menus and breadcrumbs
- **Feedback**: Toast notifications and alerts
- **Layout**: Cards, badges, and responsive grids

## 🛒 Shopping Cart

Cart features implemented with Zustand:
- **Persistent Storage**: Cart persists across browser sessions
- **Add/Remove Items**: Easy cart management
- **Quantity Updates**: Adjust item quantities
- **Price Calculations**: Automatic totals and discounts
- **Coupon System**: Support for discount codes

## 🔐 Authentication

Supabase Auth integration:
- **User Registration**: Email/password signup
- **User Login**: Secure authentication
- **Protected Routes**: Role-based access control
- **Session Management**: Automatic token refresh
- **Profile Management**: User data updates

### User Roles
- **User**: Can browse, purchase, and manage orders
- **Admin**: Full access to admin dashboard

## 🛍️ Product Features

### Product Listing
- **Category Filters**: Filter by product categories
- **Price Range**: Min/max price filtering
- **Search**: Text search across products
- **Pagination**: Efficient product loading
- **Sorting**: Sort by price, date, popularity

### Product Detail
- **Image Gallery**: Multiple product images
- **Variant Selection**: Product options (size, color, etc.)
- **Stock Status**: Real-time inventory display
- **Add to Cart**: Direct product addition
- **Related Products**: Product recommendations

## 🏪 Admin Dashboard

Admin-only features:
- **Product Management**: Create, edit, delete products
- **Image Upload**: Multiple image upload to Supabase Storage
- **Order Management**: View and update order status
- **Analytics**: Sales and order statistics
- **User Management**: View user data

## 🎯 State Management

### Zustand Stores
- **Cart Store**: Shopping cart state and actions
- **Auth Store**: User authentication state (via Supabase)

### React Query
- **Data Fetching**: Efficient API data fetching
- **Caching**: Automatic data caching and updates
- **Background Updates**: Automatic data refresh
- **Error Handling**: Built-in error states

## 📱 Responsive Design

Mobile-first responsive design:
- **Breakpoints**: Tailwind CSS responsive utilities
- **Touch-Friendly**: Optimized for mobile interactions
- **Performance**: Optimized images and lazy loading
- **Accessibility**: WCAG compliant components

## 🔧 Development

### Project Structure
```
src/
├── api/              # API client functions
├── components/       # Reusable UI components
│   └── ui/          # Shadcn/ui components
├── contexts/        # React contexts (Auth)
├── hooks/           # Custom React hooks
├── lib/             # Utility libraries
├── pages/           # Page components
├── store/           # Zustand stores
└── data/            # Static data and types
```

### Adding New Features

1. **New Page:**
   - Create component in `src/pages/`
   - Add route in `src/App.tsx`
   - Update navigation if needed

2. **New Component:**
   - Create in `src/components/`
   - Export from appropriate index file
   - Add to component library if reusable

3. **New API Endpoint:**
   - Add function to appropriate API file in `src/api/`
   - Use React Query for data fetching
   - Handle loading and error states

### Code Style
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting (configure in your editor)
- **Conventions**: PascalCase for components, camelCase for functions

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables
5. Deploy!

### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables
5. Deploy!

### Environment Variables for Production
Make sure to set these in your deployment platform:

- `VITE_API_URL`: Your deployed backend URL
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

## 📊 Performance

### Optimization Features
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Images and components
- **Caching**: React Query caching strategies
- **Bundle Analysis**: Use `npm run build` to analyze bundle size

### Best Practices
- Use React.memo for expensive components
- Implement proper loading states
- Optimize images with proper formats and sizes
- Use Suspense for code-split components

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Check TypeScript errors and fix type issues
2. **API Connection**: Verify backend is running and CORS is configured
3. **Authentication Issues**: Check Supabase configuration
4. **Styling Issues**: Ensure Tailwind CSS is properly configured

### Development Tips
- Use React DevTools for debugging
- Check browser console for errors
- Use Network tab to debug API calls
- Verify environment variables are loaded

## 📚 Dependencies

### Core
- **React 18**: Latest React with concurrent features
- **TypeScript**: Type safety and better DX
- **Vite**: Fast build tool and dev server

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: High-quality component library
- **Lucide React**: Beautiful icon library

### State & Data
- **Zustand**: Lightweight state management
- **React Query**: Server state management
- **React Hook Form**: Form handling
- **Zod**: Schema validation

### Routing & Auth
- **React Router**: Client-side routing
- **Supabase**: Authentication and real-time features

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues:
- Check the troubleshooting section
- Review the backend documentation
- Open an issue on GitHub

---

**Happy shopping! 🛍️**#   V a n d C o s m e t i c s F r o n t e n d  
 