# Wellness Scribe React

A modern AI-powered wellness companion application built with React, TypeScript, and Vite. This application provides personalized wellness advice, mental health support, and healthy lifestyle recommendations through an intuitive web interface.

## Features

### Core Functionality
- **AI-Powered Conversations**: Chat with an intelligent wellness assistant that provides personalized advice
- **Multi-Channel Support**: Access through web interface with plans for Telegram and WhatsApp integration
- **Voice Input**: Voice recording capabilities for natural interaction
- **Document Management**: Upload and manage wellness-related documents
- **Wellness Coaching**: Dedicated coaching features with goal setting and progress tracking
- **Real-time Chat**: Instant messaging with AI responses
- **User Authentication**: Secure login/registration system with password reset
- **Subscription Management**: Tiered pricing plans (Free, Premium, Business)

### UI/UX Features
- **Modern Design**: Beautiful, responsive interface built with Tailwind CSS
- **Dark Mode Support**: Automatic theme switching capabilities
- **Animated Components**: Smooth animations using Framer Motion
- **Mobile Responsive**: Optimized for all device sizes
- **Accessibility**: ARIA-compliant components using Radix UI

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **State Management**: Zustand for efficient state management
- **API Integration**: Axios-based API client with authentication
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: React Router for client-side navigation
- **Charts & Analytics**: Recharts for data visualization
- **Toast Notifications**: User feedback system

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Recharts** - Chart library
- **React Markdown** - Markdown rendering

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes
- **React Query** - Server state management

## Project Structure

```
src/
├── api/                    # API service functions
│   ├── auth.ts            # Authentication endpoints
│   ├── chat.ts            # Chat functionality
│   ├── subscription.ts    # Subscription management
│   ├── usage.ts           # Usage tracking
│   ├── wellness-coaching.ts # Coaching features
│   └── wellness-documents.ts # Document management
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn/ui components
│   ├── wellness/         # Wellness-specific components
│   ├── AuthForm.tsx      # Authentication forms
│   ├── ChatBubble.tsx    # Chat message component
│   ├── NavBar.tsx        # Navigation bar
│   ├── ProtectedRoute.tsx # Route protection
│   └── VoiceRecorder.tsx # Voice input component
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── pages/                # Route components
├── store/                # State management
└── assets/               # Static assets
```

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wellness-scribe-react
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Configuration

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```env
VITE_API_BASE_URL=your_api_base_url
VITE_APP_NAME=Wellness Scribe
```

### Build Configuration
The project uses Vite for building and development. Configuration can be found in `vite.config.ts`.

## Features Overview

### Authentication System
- User registration and login
- Password reset functionality
- Protected routes for authenticated users
- Admin role support

### Chat Interface
- Real-time messaging with AI
- Voice input capabilities
- Message history
- Responsive chat bubbles

### Wellness Coaching
- Goal setting and tracking
- Progress visualization
- AI-powered insights
- Personalized recommendations

### Document Management
- Upload wellness documents
- Document viewing and organization
- Integration with AI for document-based advice

### Subscription System
- Multiple pricing tiers
- Usage tracking and limits
- Subscription management interface

## Deployment

### Production Build
```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment to any static hosting service.

### Deployment Options
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Any static hosting provider

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Use TypeScript for all new code
- Follow the existing code style and ESLint rules
- Add appropriate tests for new features
- Update documentation as needed

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

The application is optimized for performance with:
- Code splitting and lazy loading
- Optimized bundle sizes
- Efficient state management
- Responsive images and assets

## Security

- Secure authentication implementation
- Protected API endpoints
- Input validation and sanitization
- HTTPS enforcement in production

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review existing issues for solutions

## Roadmap

- Multi-language support
- Mobile app development
- Advanced analytics dashboard
- Integration with health devices
- Expanded AI capabilities
- Team collaboration features