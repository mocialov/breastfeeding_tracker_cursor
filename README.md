# Breastfeeding Tracker

A comprehensive, mobile-responsive React web application designed to help nursing mothers track their breastfeeding sessions with ease and precision. **Now with cloud data storage using Supabase!**

## 🚀 Features

### Core Functionality

- **Live Feeding Tracker**
  - Start/pause/resume/finish controls with clear visual indicators
  - Breast selection toggle (left/right) that can be switched mid-session
  - Real-time timer display showing elapsed feeding time
  - Session summary showing total time per breast
  - Notes requirement (minimum 500 characters) for comprehensive tracking

- **Manual Entry System**
  - Form to add past feeding sessions with date and time pickers
  - Duration input OR end time picker for flexibility
  - Breast selection (left, right, both, or bottle)
  - Bottle volume tracking for bottle-fed babies
  - Input validation to prevent impossible time ranges
  - Optional detailed notes (minimum 500 characters if provided)

- **Data Management**
  - Complete edit functionality for all feeding entries
  - Delete option with confirmation dialog
  - **Cloud data storage with Supabase** - data persists across devices
  - Export functionality for feeding data (CSV and PDF)
  - **User authentication and data privacy**

### User Experience Features

- **Mobile-First Design**
  - Responsive design optimized for mobile devices
  - One-handed operation capability for nursing mothers
  - Large, easily tappable buttons
  - Intuitive navigation between live tracking and manual entry modes

- **Visual Design**
  - Clear visual distinction between different feeding types
  - Color-coded breast selection (left/right/both/bottle)
  - Weekly summary view with daily statistics
  - Session history with expandable notes

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Routing**: React Router DOM v7
- **State Management**: React Context API with useReducer
- **Date Handling**: date-fns library
- **PDF Export**: jsPDF with autoTable plugin
- **Styling**: CSS3 with mobile-first responsive design
- **Icons**: Emoji-based icons for cross-platform compatibility
- **Backend**: **Supabase (PostgreSQL + Auth + Real-time)**
- **Authentication**: **Supabase Auth with Row Level Security**

## ☁️ Supabase Integration

The application now uses Supabase for:
- **User Authentication**: Secure signup/login with email verification
- **Data Storage**: PostgreSQL database with automatic backups
- **Data Privacy**: Row Level Security ensures users only see their own data
- **Real-time Updates**: Live data synchronization across devices
- **Scalability**: Built on PostgreSQL with automatic scaling

## 📱 Mobile Responsiveness

The application is designed with mobile-first principles:

- **Touch-Friendly Interface**: Large buttons and touch targets
- **Responsive Grid Layouts**: Adapts to different screen sizes
- **Optimized Navigation**: Bottom navigation bar for easy thumb access
- **Readable Typography**: Appropriate font sizes for mobile devices
- **Gesture Support**: Swipe-friendly date navigation

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- **Supabase account** (free tier available)

### Supabase Setup

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com) and sign up
   - Create a new project
   - Note your project URL and anon key

2. **Set up the Database**:
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Run the `supabase-setup.sql` script to create tables and policies

3. **Configure Environment Variables**:
   - Copy `env.example` to `.env.local`
   - Add your Supabase credentials:
   ```bash
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Application Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd breastfeeding-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (see Supabase Setup above)

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

The build folder will contain the optimized production build.

## 📊 Data Structure

### Feeding Session
```typescript
interface FeedingSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  breastType: 'left' | 'right' | 'both' | 'bottle';
  bottleVolume?: number; // in ml
  notes?: string;
  isActive?: boolean;
}
```

### Daily Summary
```typescript
interface DailySummary {
  date: string;
  totalSessions: number;
  totalTime: number;
  leftBreastTime: number;
  rightBreastTime: number;
  bottleTime: number;
  bottleVolume: number;
}
```

### User Profile
```typescript
interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  babyName?: string;
  babyBirthDate?: Date;
}
```

## 🔧 Key Components

### LiveTracker
- Real-time session tracking with pause/resume functionality
- Breast switching during active sessions
- Timer display with pause compensation
- Notes modal for session completion

### ManualEntry
- Comprehensive form for historical data entry
- Validation for time ranges and required fields
- Support for both duration and end-time input methods
- Breast type selection with bottle volume tracking

### FeedingHistory
- Session listing with edit/delete capabilities
- Weekly summary view with daily statistics
- Date navigation with calendar picker
- Export functionality (CSV and PDF)

### Navigation
- Sticky navigation bar with active state indicators
- Mobile-optimized touch targets
- Clear visual feedback for current page
- **User authentication status and logout**

### Auth
- **User registration and login forms**
- **Email verification support**
- **Password reset functionality**
- **User profile management**

## 📱 Usage Guide

### Getting Started
1. **Create an account** or sign in to the application
2. **Complete your profile** with baby information (optional)
3. Start tracking your feeding sessions!

### Starting a Live Session
1. Navigate to the Live Tracker page
2. Select the breast you want to start with (left, right, both, or bottle)
3. Use the pause/resume button to handle interruptions
4. Switch breasts mid-session if needed
5. End the session and add detailed notes (minimum 500 characters)

### Adding Manual Entries
1. Go to the Manual Entry page
2. Fill in the date, time, and duration details
3. Select the feeding type and add bottle volume if applicable
4. Optionally add detailed notes
5. Submit the form

### Managing History
1. Access the History page to view all sessions
2. Toggle between list and summary views
3. Navigate between dates using the date picker
4. Edit or delete sessions as needed
5. Export data in CSV or PDF format

## 🎨 Design Principles

- **Accessibility**: High contrast colors and clear visual hierarchy
- **Usability**: Intuitive workflows for one-handed operation
- **Responsiveness**: Mobile-first design that scales to desktop
- **Performance**: Efficient state management and minimal re-renders
- **Data Integrity**: Comprehensive validation and error handling
- **Security**: **Row Level Security and user authentication**

## 🔒 Data Privacy & Security

- **User Authentication**: Secure login with email verification
- **Data Isolation**: Users can only access their own data
- **Row Level Security**: Database-level access control
- **Encrypted Storage**: All data is encrypted at rest
- **No Data Sharing**: Your data is never shared with third parties
- **Cloud Backup**: Automatic backups with point-in-time recovery

## 🚀 Future Enhancements

- **Real-time Sync**: Live updates across multiple devices
- **Analytics Dashboard**: Advanced statistics and trends
- **Reminder System**: Feeding schedule notifications
- **Multi-Child Support**: Track multiple children
- **Offline Support**: Progressive Web App capabilities
- **Data Import**: Import from other tracking apps
- **Family Sharing**: Share data with partners/caregivers
- **Healthcare Integration**: Export for medical professionals

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Designed specifically for nursing mothers' needs
- Built with accessibility and mobile-first principles
- Inspired by real-world breastfeeding tracking requirements
- Optimized for one-handed operation during nursing sessions
- **Powered by Supabase for reliable cloud infrastructure**

---

**Built with ❤️ for nursing mothers everywhere**

**Now with cloud-powered data persistence! ☁️**
