# 🚀 CMS Quick Reference Card

## Admin Routes (Must be logged in)

| What to Edit | Route |
|-------------|-------|
| Homepage hero & stats | `/admin/home-editor` |
| About page & executives | `/admin/about-editor` |
| Contact information | `/admin/contact-info-editor` |

## API Functions (Import from `@api/cms-endpoints`)

### Home Content
```tsx
import { getHomeContent, updateHomeContent, uploadHeroImage } from '@api/cms-endpoints';

// Get content
const content = await getHomeContent();

// Update content
await updateHomeContent({
  heroTitleEn: 'Welcome',
  heroTitleAm: 'እንኳን በደህና መጡ',
  stat1Value: '1000',
  stat1LabelEn: 'Members',
  // ... more fields
});

// Upload image
const formData = new FormData();
formData.append('image', file);
const result = await uploadHeroImage(formData);
```

### About Content
```tsx
import { getAboutContent, updateAboutContent } from '@api/cms-endpoints';

// Get content
const content = await getAboutContent();

// Update content (arrays must be JSON strings)
await updateAboutContent({
  missionEn: 'Our mission...',
  valuesEn: '["Value 1", "Value 2"]',
  objectivesEn: '["Objective 1", "Objective 2"]',
  // ... more fields
});
```

### Executives
```tsx
import { 
  getExecutives, 
  createExecutive, 
  updateExecutive, 
  deleteExecutive,
  uploadExecutiveImage 
} from '@api/cms-endpoints';

// Get all
const executives = await getExecutives();

// Create new
await createExecutive({
  nameEn: 'John Doe',
  nameAm: 'ጆን ዶ',
  positionEn: 'President',
  positionAm: 'ፕሬዚዳንት',
  type: 'executive'
});

// Update
await updateExecutive(id, { nameEn: 'Jane Doe' });

// Delete
await deleteExecutive(id);

// Upload photo
const formData = new FormData();
formData.append('image', file);
const result = await uploadExecutiveImage(formData);
```

### Contact Info
```tsx
import { getContactInfo, updateContactInfo } from '@api/cms-endpoints';

// Get info
const info = await getContactInfo();

// Update info
await updateContactInfo({
  addressEn: '123 Main St',
  addressAm: 'አድራሻ',
  phone: '+251911234567',
  email: 'info@example.com',
  facebookUrl: 'https://facebook.com/...',
  // ... more fields
});
```

## Common Patterns

### Load Data on Mount
```tsx
useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await getHomeContent();
      setContent(data);
    } catch (error) {
      console.error('Failed to load', error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

### Save Data
```tsx
const handleSave = async () => {
  try {
    await updateHomeContent(formData);
    toast.success('Saved successfully!');
  } catch (error) {
    toast.error('Failed to save');
    console.error(error);
  }
};
```

### Upload Image
```tsx
const handleImageUpload = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    const result = await uploadHeroImage(formData);
    setImageUrl(result.imageUrl);
    toast.success('Image uploaded!');
  } catch (error) {
    toast.error('Upload failed');
  }
};
```

### Parse JSON Arrays
```tsx
const parseArray = (value: any): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return [];
};

// Usage
const values = parseArray(content.valuesEn);
```

### Safe Access
```tsx
// Always use optional chaining for data from API
<p>{content?.titleEn || 'Loading...'}</p>

// For objects
<p>{content?.address?.en || 'N/A'}</p>

// For arrays
{content?.values?.length > 0 && (
  <ul>
    {content.values.map(v => <li key={v}>{v}</li>)}
  </ul>
)}
```

## Database Schema Reference

### home_content (Singleton)
```sql
- heroTitleEn, heroTitleAm
- heroSubtitleEn, heroSubtitleAm
- heroImageUrl
- stat1Value, stat1LabelEn, stat1LabelAm
- stat2Value, stat2LabelEn, stat2LabelAm
- stat3Value, stat3LabelEn, stat3LabelAm
- stat4Value, stat4LabelEn, stat4LabelAm
```

### about_content (Singleton)
```sql
- missionEn, missionAm
- visionEn, visionAm
- historyEn, historyAm
- valuesEn, valuesAm (JSON string)
- objectivesEn, objectivesAm (JSON string)
- structureEn, structureAm (JSON string)
- departmentsEn, departmentsAm (JSON string)
- stakeholdersEn, stakeholdersAm (JSON string)
```

### executives (Multiple)
```sql
- id (PK)
- nameEn, nameAm
- positionEn, positionAm
- bioEn, bioAm
- photoUrl
- type ('executive' | 'expert')
- sortOrder
```

### contact_info (Singleton)
```sql
- addressEn, addressAm
- phone, phone2
- email, fax
- facebookUrl, twitterUrl, linkedinUrl
- telegramUrl, youtubeUrl
- mapUrl
```

## Toast Messages

```tsx
import { toast } from '@components/Toast/ToastProvider';

toast.success('Success message');
toast.error('Error message');
toast.info('Info message');
toast.warning('Warning message');
```

## Loading Component

```tsx
import Loading from '@components/Loading';

if (loading) return <Loading />;
```

## Common Errors & Fixes

| Error | Solution |
|-------|----------|
| `Cannot read property 'map' of undefined` | Add null check or use `parseArray()` |
| `Network Error` | Check if backend is running |
| `404 Not Found` | Verify API endpoint URLs |
| `Contact editor blank` | Added null safety: `data.field || ''` |
| `Arrays not displaying` | Use `parseArray()` helper |

## File Locations

```
src/
├── api/cms-endpoints.ts              ← Import from here
├── pages/
│   ├── Admin/
│   │   ├── HomeEditor.tsx           ← Edit here
│   │   ├── AboutEditor.tsx          ← Edit here
│   │   └── ContactInfoEditor.tsx    ← Edit here
│   └── Public/
│       ├── Home.tsx                 ← Edit here
│       ├── About.tsx                ← Edit here
│       └── Contact.tsx              ← Edit here
└── App.tsx                          ← Routes here
```

## Environment Variables

Make sure these are set in your `.env`:
```
VITE_API_BASE_URL=http://localhost:3000/api
```

## TypeScript Interfaces

```tsx
// Home Content
interface HomeContent {
  heroTitleEn: string;
  heroTitleAm: string;
  heroSubtitleEn: string;
  heroSubtitleAm: string;
  heroImageUrl: string;
  stat1Value: string;
  stat1LabelEn: string;
  stat1LabelAm: string;
  // ... more stats
}

// About Content
interface AboutContent {
  missionEn: string;
  missionAm: string;
  visionEn: string;
  visionAm: string;
  historyEn: string;
  historyAm: string;
  valuesEn: string; // JSON string
  valuesAm: string; // JSON string
  // ... more fields
}

// Executive
interface Executive {
  id: number;
  nameEn: string;
  nameAm: string;
  positionEn: string;
  positionAm: string;
  bioEn: string;
  bioAm: string;
  photoUrl: string;
  type: 'executive' | 'expert';
  sortOrder: number;
}

// Contact Info
interface ContactInfo {
  addressEn: string;
  addressAm: string;
  phone: string;
  phone2: string;
  email: string;
  fax: string;
  facebookUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  telegramUrl: string;
  youtubeUrl: string;
  mapUrl: string;
}
```

## Testing URLs

### Admin:
- http://localhost:5173/admin/home-editor
- http://localhost:5173/admin/about-editor
- http://localhost:5173/admin/contact-info-editor

### Public:
- http://localhost:5173/
- http://localhost:5173/about
- http://localhost:5173/contact

### API:
- http://localhost:3000/api/home-content
- http://localhost:3000/api/about-content
- http://localhost:3000/api/executives
- http://localhost:3000/api/contact-info

## Quick Debugging

```tsx
// Log API response
const data = await getHomeContent();
console.log('Home content:', data);

// Log state
console.log('Current state:', content);

// Check if data exists
console.log('Has data?', !!content);
console.log('Is array?', Array.isArray(content.values));
```

## Git Status

All changes are in:
- `src/api/cms-endpoints.ts` (new)
- `src/pages/Admin/ContactInfoEditor.tsx` (new)
- `src/pages/Admin/HomeEditor.tsx` (modified)
- `src/pages/Admin/AboutEditor.tsx` (modified)
- `src/pages/Public/Home.tsx` (modified)
- `src/pages/Public/About.tsx` (modified)
- `src/pages/Public/Contact.tsx` (modified)
- `src/App.tsx` (modified)

---

**Need more details?** Check:
- `README_CMS.md` - Complete overview
- `CMS_TESTING_GUIDE.md` - Testing instructions
- `CMS_INTEGRATION_COMPLETE.md` - Implementation details

