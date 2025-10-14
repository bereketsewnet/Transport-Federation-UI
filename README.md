# Transport & Communication Workers Federation - Frontend UI

A modern, production-ready frontend application for managing the Transport & Communication Workers Federation system.

## 🚀 Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 5
- **Routing:** React Router v6
- **State Management:** TanStack Query (React Query)
- **Forms:** React Hook Form + Yup validation
- **Styling:** CSS Modules (60% White, 30% Blue, 10% Red theme)
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Internationalization:** i18next (English + Amharic)
- **HTTP Client:** Axios
- **Testing:** Vitest + React Testing Library

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your API base URL if different from default
# VITE_API_BASE_URL=http://localhost:3000
```

## 🛠️ Development

```bash
# Start development server (runs on http://localhost:5173)
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format

# Run tests
npm test

# Run tests with UI
npm run test:ui
```

## 🏗️ Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── api/                    # API client and endpoints
│   ├── client.ts          # Axios instance with auth interceptors
│   └── endpoints.ts       # API endpoint functions
├── assets/                # Static assets (images, icons)
├── components/            # Reusable components
│   ├── DataTable/         # Server-side paginated table
│   ├── FormField/         # Form input component
│   ├── Select/            # Custom select with async loading
│   ├── DateRangePicker/   # Date range selector
│   ├── Modal/             # Reusable modal
│   ├── ConfirmDialog/     # Confirmation dialog
│   ├── ChartCard/         # Chart wrapper component
│   ├── KPICard/           # KPI display card
│   ├── Header/            # Main header
│   ├── Footer/            # Main footer
│   └── ...
├── pages/
│   ├── Public/            # Public-facing pages
│   │   ├── Home.tsx
│   │   ├── NewsList.tsx
│   │   ├── Gallery.tsx
│   │   ├── About.tsx
│   │   └── Contact.tsx
│   ├── Auth/              # Authentication pages
│   │   ├── Login.tsx
│   │   ├── ChangePasswordFirstLogin.tsx
│   │   └── ForgotPassword.tsx
│   ├── Member/            # Member area
│   │   └── Profile.tsx
│   └── Admin/             # Admin dashboard
│       ├── Dashboard.tsx
│       ├── Reports.tsx
│       ├── Members/
│       ├── Unions/
│       ├── CBAs/
│       └── Executives/
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts
│   ├── useFetch.ts
│   ├── useTable.ts
│   └── useExportCsv.ts
├── utils/                 # Utility functions
├── styles/                # Global styles and CSS variables
├── i18n/                  # Internationalization
│   ├── i18n.ts
│   ├── en.json
│   └── am.json
└── App.tsx               # Main app component
```

## 🎨 Design System

### Color Palette (60/30/10 Rule)

- **Primary (60%)**: White backgrounds `#FFFFFF`
- **Secondary (30%)**: Blue accents `#0B63D3`
- **Accent (10%)**: Red highlights `#E53935`

### CSS Variables

All components use CSS modules with design tokens:

```css
--bg: #FFFFFF
--primary: #0B63D3
--accent: #E53935
--text: #0F172A
--text-muted: #6B7280
--bg-subtle: #F5F7FA
```

## 🔐 Authentication

The app uses JWT-based authentication:

1. Login with username (member ID) and password
2. First-time users must change password
3. JWT token stored in localStorage
4. Auto-refresh on 401 responses
5. Protected routes redirect to login if unauthenticated

### Default Credentials (Development)

```
Username: admin
Password: ChangeThisStrongAdminPass!
```

## 🌐 API Integration

The app connects to the backend API running on `http://localhost:3000`.

### API Client

All API calls go through `src/api/client.ts` which:
- Automatically adds Authorization header
- Handles token refresh
- Manages error responses
- Provides request/response interceptors

### Endpoints

API functions are defined in `src/api/endpoints.ts`:

```typescript
// Example usage
import { getMembers, createMember } from '@api/endpoints';

const { data } = await getMembers({ page: 1, per_page: 20, q: 'search' });
await createMember(payload);
```

## 📊 Key Features

### Admin Dashboard
- Real-time KPIs (total members, gender breakdown, unions count)
- Animated metric cards
- Visitor analytics (daily/weekly/monthly)

### Reports Page
- Members by gender and registration year
- Unions by sector and organization
- Union executives with term tracking
- Youth demographics (<35, >35)
- CBA status tracking
- Export to CSV/PDF

### CRUD Operations
- Server-side pagination
- Search and filtering
- Inline editing
- Archive/delete with confirmation
- Bulk operations

### Data Tables
- Sortable columns
- Server-side pagination
- Row actions (view/edit/archive/delete)
- Export filtered results
- Responsive mobile view

## 🌍 Internationalization

Switch between English and Amharic using the language selector in the header.

```typescript
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();

// Usage
<h1>{t('common.welcome')}</h1>

// Change language
i18n.changeLanguage('am');
```

## ✅ Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run tests with UI
npm run test:ui
```

### Example Test

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@components/Button/Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

## 📝 Code Conventions

### Component Structure

Each component follows this structure:

```
ComponentName/
├── ComponentName.tsx
├── ComponentName.module.css
├── ComponentName.test.tsx (optional)
└── index.ts (re-export)
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **CSS Modules**: ComponentName.module.css

### Import Order

1. React imports
2. Third-party libraries
3. Internal components
4. Utils and hooks
5. Types
6. Styles

## 🚀 Deployment

```bash
# Build for production
npm run build

# The dist/ folder contains the production build
# Deploy to your hosting service (Vercel, Netlify, etc.)
```

### Environment Variables for Production

Update `.env.production`:

```
VITE_API_BASE_URL=https://api.yourproduction.com
VITE_APP_NAME=Transport & Communication Workers Federation
VITE_DEFAULT_LANGUAGE=en
```

## 🐛 Troubleshooting

### API Connection Issues

If you can't connect to the API:

1. Ensure backend is running on `http://localhost:3000`
2. Check `VITE_API_BASE_URL` in `.env`
3. Verify CORS is enabled on the backend

### Build Errors

If you encounter TypeScript errors:

```bash
npm run type-check
```

If you encounter linting errors:

```bash
npm run lint:fix
```

## 📄 License

Proprietary - Transport & Communication Workers Federation

## 👥 Support

For technical support, contact the development team.

---

**Built with ❤️ for the Transport & Communication Workers Federation**

