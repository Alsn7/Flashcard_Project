# Flashcard Application - Complete Functions Documentation


## Table of Contents
1. [API Routes (Backend Functions)](#api-routes-backend-functions)
2. [Library Functions](#library-functions)
3. [React Hooks](#react-hooks)
4. [Component Functions](#component-functions)
5. [Utility Functions](#utility-functions)

---

## API Routes (Backend Functions)

### 1. POST `/api/process-pdf` - PDF Processing Route

**Location:** `app/api/process-pdf/route.ts`

**Runtime:** Node.js (configured for PDF processing)

**Purpose:** Extracts text from uploaded PDF files and generates flashcards using AI

**Request Parameters:**
```typescript
// FormData fields:
{
  file: File,                    // PDF file (required)
  count: string,                 // Number of flashcards or "auto"
  preferences: string,           // JSON string of UserPreferences
  flashcardType: string,         // "Standard" | "Cloze" | "Image Occlusion"
  language: string,              // "Auto-detect" | "English" | "Arabic" | etc.
  visibility: string             // "Public" | "Private" | "Unlisted"
}
```

**Response:**
```typescript
Success (200):
{
  success: true,
  flashcards: Flashcard[],
  count: number,
  pdfInfo: {
    pages: number,
    textLength: number
  }
}

Error (400/500):
{
  error: string,
  message?: string,
  details?: string
}
```

**Processing Steps:**
1. Validates that a file was uploaded
2. Validates PDF format
3. Converts file to ArrayBuffer
4. Loads PDF document using `pdfjs-dist`
5. Extracts text from all pages
6. Calls `generateFlashcardsFromPDF()` with extracted text
7. Returns generated flashcards with metadata

**Error Handling:**
- 400: No file uploaded
- 400: Invalid file format (not PDF)
- 500: Missing OpenAI API key
- 500: PDF processing failed
- 500: Flashcard generation failed

---

### 2. POST `/api/generate-flashcards` - Text-based Generation Route

**Location:** `app/api/generate-flashcards/route.ts`

**Runtime:** Node.js

**Purpose:** Generates flashcards from plain text input (without PDF upload)

**Request Body:**
```typescript
{
  text: string,        // Input text content (required)
  count?: number       // Number of flashcards (default: 10)
}
```

**Response:**
```typescript
Success (200):
{
  success: true,
  flashcards: Flashcard[],
  count: number
}

Error (400/500):
{
  error: string,
  message?: string
}
```

**Processing Steps:**
1. Validates text input is provided
2. Calls `generateFlashcardsFromText()` from OpenAI service
3. Returns generated flashcards

**Error Handling:**
- 400: No text provided
- 500: Missing OpenAI API key
- 500: Generation failed

---

## Library Functions

### OpenAI Integration (`src/lib/openai.ts`)

#### Interfaces

```typescript
interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardPreferences {
  frontTextLength?: "Short" | "Medium" | "Long";
  backTextLength?: "Short" | "Medium" | "Long";
  language?: string;
  flashcardType?: "Standard" | "Cloze" | "Image Occlusion";
}
```

---

#### Function: `generateFlashcardsFromText()`

**Signature:**
```typescript
async function generateFlashcardsFromText(
  text: string,
  count: number | "auto" = 10,
  preferences?: FlashcardPreferences
): Promise<Flashcard[]>
```

**Purpose:** Generates flashcards from text using OpenAI GPT-4O

**Parameters:**
- `text` (required): Source text for flashcard generation
- `count` (optional): Number of flashcards (5-50) or "auto" for AI-determined count
- `preferences` (optional): Customization options for flashcard format

**Returns:** Promise resolving to array of Flashcard objects

**Features:**
- **Auto-count mode:** AI determines optimal number (5-50 based on content)
- **Text length customization:** Short/Medium/Long for questions and answers
- **Multi-language support:** Detects language or uses specified language
- **Flashcard type support:** Standard Q&A or Cloze deletion format
- **Error handling:** Throws descriptive errors on failure

**Processing Logic:**
1. Validates text input is not empty
2. Builds system prompt based on preferences:
   - Sets language instructions (auto-detect or specific)
   - Adds text length guidance for questions and answers
   - Configures flashcard type (Standard or Cloze)
3. Determines count parameter:
   - If "auto": Instructs AI to choose 5-50 cards based on content
   - If number: Uses specified count
4. Calls OpenAI API with GPT-4O model
5. Parses JSON response into Flashcard array
6. Returns flashcards

**Example:**
```typescript
const flashcards = await generateFlashcardsFromText(
  "Photosynthesis is the process by which plants convert light into energy...",
  10,
  {
    frontTextLength: "Short",
    backTextLength: "Medium",
    language: "English",
    flashcardType: "Standard"
  }
);
```

---

#### Function: `generateFlashcardsFromPDF()`

**Signature:**
```typescript
async function generateFlashcardsFromPDF(
  pdfText: string,
  count: number | "auto" = 10,
  preferences?: FlashcardPreferences
): Promise<Flashcard[]>
```

**Purpose:** Wrapper function for generating flashcards from PDF-extracted text

**Parameters:** Same as `generateFlashcardsFromText()`

**Returns:** Promise resolving to array of Flashcard objects

**Implementation:** Directly calls `generateFlashcardsFromText()` with the same parameters

---

#### Function: `getLengthGuidance()`

**Signature:**
```typescript
function getLengthGuidance(
  length: "Short" | "Medium" | "Long",
  isQuestion: boolean
): string
```

**Purpose:** Returns AI prompt guidance for text length preferences

**Parameters:**
- `length`: Desired text length
- `isQuestion`: Whether guidance is for questions (true) or answers (false)

**Returns:** String with specific length guidance for AI prompts

**Output Examples:**
- Short question: "Keep questions concise and focused (1 sentence or less)."
- Medium question: "Keep questions clear and direct (1-2 sentences)."
- Long question: "Provide detailed, comprehensive questions when needed (2-3 sentences)."
- Short answer: "Keep answers brief and to the point (1-2 sentences)."
- Medium answer: "Provide clear, complete answers with key details (2-4 sentences)."
- Long answer: "Provide thorough, detailed answers with comprehensive explanations (4-6 sentences)."

---

### Authentication (`src/lib/auth.tsx`)

#### Context Type

```typescript
interface AuthContextType {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}
```

---

#### Component: `AuthProvider`

**Purpose:** React Context Provider for authentication state management

**Features:**
- Manages Supabase authentication session
- Auto-refreshes tokens
- Listens to auth state changes
- Persists userId to localStorage
- Provides auth methods to child components

**State Management:**
```typescript
const [session, setSession] = useState<Session | null>(null);
const [loading, setLoading] = useState(true);
```

**Lifecycle:**
1. On mount: Fetches current session
2. Sets up auth state change listener
3. Updates session and localStorage on changes
4. Cleans up listener on unmount

---

#### Function: `signIn()`

**Signature:**
```typescript
async function signIn(email: string, password: string): Promise<void>
```

**Purpose:** Authenticates user with email and password

**Process:**
1. Calls `supabase.auth.signInWithPassword()`
2. Throws error if authentication fails
3. Session automatically updated via state listener

---

#### Function: `signUp()`

**Signature:**
```typescript
async function signUp(
  email: string,
  password: string,
  fullName: string
): Promise<void>
```

**Purpose:** Creates new user account

**Process:**
1. Calls `supabase.auth.signUp()` with email, password, and metadata
2. Stores fullName in user metadata
3. Throws error if signup fails
4. Session automatically updated via state listener

---

#### Function: `signInWithGoogle()`

**Signature:**
```typescript
async function signInWithGoogle(): Promise<void>
```

**Purpose:** Initiates Google OAuth authentication

**Process:**
1. Calls `supabase.auth.signInWithOAuth({ provider: 'google' })`
2. Opens Google OAuth popup
3. Redirects to application after authentication
4. Session automatically updated via state listener

Note: This application includes `prompt=select_account` in the OAuth query
parameters so Google will show the account chooser dialog every time a user
starts the Google sign-in flow (even for returning users). This is set in
`src/lib/auth.tsx` inside the `signInWithGoogle()` function via the
`options.queryParams` field.

---

#### Function: `signOut()`

**Signature:**
```typescript
async function signOut(): Promise<void>
```

**Purpose:** Logs out current user

**Process:**
1. Calls `supabase.auth.signOut()`
2. Clears session state
3. Removes userId from localStorage

---

#### Hook: `useAuth()`

**Signature:**
```typescript
function useAuth(): AuthContextType
```

**Purpose:** React hook to access authentication context

**Returns:** AuthContextType object with session, user, and auth methods

**Usage:**
```typescript
const { user, signIn, signOut, loading } = useAuth();
```

**Error Handling:** Throws error if used outside `AuthProvider`

---

### Supabase Client (`src/lib/supabase.ts`)

#### Function: `getSupabaseClient()`

**Signature:**
```typescript
function getSupabaseClient(): SupabaseClient
```

**Purpose:** Returns singleton Supabase client instance

**Features:**
- Client-side only (throws error if called server-side)
- Singleton pattern (creates only one instance)
- Persistent sessions enabled
- Auto token refresh enabled

**Configuration:**
```typescript
createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})
```

---

#### Export: `supabase`

**Purpose:** Proxy-based safe export of Supabase client

**Implementation:** Calls `getSupabaseClient()` on access

**Usage:**
```typescript
import { supabase } from '@/lib/supabase';
const { data } = await supabase.from('table').select();
```

---

### Language Utilities (`src/lib/language-utils.ts`)

#### Function: `isArabic()`

**Signature:**
```typescript
function isArabic(text: string): boolean
```

**Purpose:** Detects if text contains Arabic characters

**Implementation:** Tests text against Arabic Unicode range (U+0600 to U+06FF)

**Returns:** `true` if Arabic characters found, `false` otherwise

---

#### Function: `isRTL()`

**Signature:**
```typescript
function isRTL(text: string): boolean
```

**Purpose:** Detects if text is in a right-to-left language

**Supported Languages:**
- Arabic (U+0600 to U+06FF)
- Hebrew (U+0590 to U+05FF)

**Returns:** `true` if RTL characters found, `false` otherwise

---

#### Function: `getTextDirection()`

**Signature:**
```typescript
function getTextDirection(text: string): 'rtl' | 'ltr'
```

**Purpose:** Returns the text direction for layout purposes

**Logic:** Returns `'rtl'` if `isRTL(text)` is true, otherwise `'ltr'`

**Usage:**
```typescript
const direction = getTextDirection(userInput);
// Apply to element: <div dir={direction}>
```

---

### General Utilities (`src/lib/utils.ts`)

#### Function: `cn()`

**Signature:**
```typescript
function cn(...inputs: ClassValue[]): string
```

**Purpose:** Intelligently merges Tailwind CSS class names

**Dependencies:**
- `clsx`: Conditional class name builder
- `tailwind-merge`: Prevents Tailwind class conflicts

**Features:**
- Handles conditional classes
- Resolves Tailwind class conflicts (e.g., `px-4 px-6` → `px-6`)
- Supports arrays, objects, and strings

**Usage:**
```typescript
cn("px-4 py-2", isDark && "bg-black", { "text-white": isActive })
// Output: "px-4 py-2 bg-black text-white" (if conditions met)
```

---

## React Hooks

### File Upload Hook (`src/hooks/use-file-upload.ts`)

#### Hook: `useFileUpload()`

**Signature:**
```typescript
function useFileUpload(options: UseFileUploadOptions): UseFileUploadReturn
```

**Options Type:**
```typescript
interface UseFileUploadOptions {
  accept?: string;              // MIME types (default: "application/pdf")
  maxSize?: number;             // Max file size in MB (default: 10)
  onFileSelect?: (file: File) => void;
  onError?: (error: string) => void;
}
```

**Return Type:**
```typescript
interface UseFileUploadReturn {
  previewUrl: string | null;
  fileName: string | null;
  error: string | null;
  fileInputRef: React.Ref<HTMLInputElement>;
  handleThumbnailClick: () => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemove: () => void;
}
```

**Purpose:** Manages file upload state with validation

**Features:**
- File format validation (PDF by default)
- File size validation (10MB default limit)
- Preview URL generation
- Error message handling
- File input ref management
- Click-to-upload functionality
- File removal

**State Management:**
```typescript
const [previewUrl, setPreviewUrl] = useState<string | null>(null);
const [fileName, setFileName] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);
```

**Validation:**
1. Checks file format against accepted MIME types
2. Validates file size against max limit
3. Sets appropriate error messages
4. Creates object URL for preview if valid

**Usage Example:**
```typescript
const {
  fileName,
  error,
  fileInputRef,
  handleFileChange,
  handleRemove
} = useFileUpload({
  accept: "application/pdf",
  maxSize: 10,
  onFileSelect: (file) => console.log('Selected:', file.name)
});
```

---

## Component Functions

### Authentication Components

#### Component: `AuthForm`

**Location:** `src/components/auth/AuthForm.tsx`

**Purpose:** Login and signup form with email/password and Google OAuth

**Features:**
- Toggle between login and signup modes
- Email and password validation with React Hook Form + Zod
- Full name input for signup
- Google OAuth button
- Error message display
- Loading states

**Form Schema:**
```typescript
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2),
});
```

**Functions:**
- `onSubmit()`: Handles form submission (login or signup)
- `handleGoogleSignIn()`: Initiates Google OAuth flow

---

#### Component: `AuthGuard`

**Location:** `src/components/auth/AuthGuard.tsx`

**Purpose:** Protected route wrapper component

**Logic:**
1. Checks if user is authenticated via `useAuth()`
2. Shows loading spinner while checking session
3. Renders `AuthForm` if not authenticated
4. Renders children if authenticated

**Usage:**
```typescript
<AuthGuard>
  <ProtectedPageContent />
</AuthGuard>
```

---

### Upload Components

#### Component: `ModernUploadZone`

**Location:** `src/components/upload/ModernUploadZone.tsx`

**Purpose:** Modern drag-and-drop PDF upload interface

**Props:**
```typescript
interface ModernUploadZoneProps {
  onFileSelect?: (file: File) => void;
  isLoading?: boolean;
}
```

**Features:**
- Drag-and-drop file upload
- Click-to-upload functionality
- File format validation (PDF only)
- File size validation (10MB max)
- Visual drag state feedback
- Loading state with disabled interaction
- File preview with name display
- Remove file functionality
- Animated upload icon

**State:**
```typescript
const [isDragging, setIsDragging] = useState(false);
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [error, setError] = useState<string | null>(null);
```

**Functions:**
- `handleDragEnter()`: Sets dragging state
- `handleDragLeave()`: Clears dragging state
- `handleDrop()`: Processes dropped file
- `handleFileSelect()`: Processes selected file from input
- `handleRemove()`: Removes selected file
- `validateFile()`: Validates file format and size

---

#### Component: `FlashcardOptionsModal`

**Location:** `src/components/upload/FlashcardOptionsModal.tsx`

**Purpose:** Configuration modal for flashcard generation options

**Props:**
```typescript
interface FlashcardOptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (options: FlashcardGenerationOptions) => void;
  fileName: string;
}
```

**Options:**
```typescript
interface FlashcardGenerationOptions {
  count: number | "auto";
  flashcardType: "Standard" | "Cloze" | "Image Occlusion";
  language: string;
  visibility: "Public" | "Private" | "Unlisted";
}
```

**Features:**
- Flashcard count selector (auto or manual 5-50)
- Flashcard type selection
- Language selection (Auto-detect, English, Arabic, Spanish, French, German)
- Visibility settings
- User preferences integration (text length)
- Form validation

**Functions:**
- `handleGenerate()`: Validates and submits options
- `loadUserPreferences()`: Loads saved preferences from localStorage

---

#### Component: `FlashcardCountSelector`

**Location:** `src/components/upload/FlashcardCountSelector.tsx`

**Purpose:** Selector for number of flashcards to generate

**Props:**
```typescript
interface FlashcardCountSelectorProps {
  value: number | "auto";
  onChange: (value: number | "auto") => void;
}
```

**Features:**
- "Auto" mode (AI determines count)
- Manual mode with slider (5-50 cards)
- Visual toggle between modes
- Real-time value display

---

### Navigation Components

#### Component: `Header`

**Location:** `src/components/layout/Header.tsx`

**Purpose:** Top navigation header with logo and menu trigger

**Features:**
- Logo/brand display
- Mobile menu trigger button
- Sticky positioning
- Responsive design

---

#### Component: `AnimatedMenu`

**Location:** `src/components/layout/AnimatedMenu.tsx`

**Purpose:** Animated sidebar navigation menu

**Props:**
```typescript
interface AnimatedMenuProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Features:**
- Framer Motion slide-in animation
- Backdrop overlay
- Navigation links (Dashboard, Profile, Settings)
- User display section
- Sign out button
- Click-outside-to-close
- Escape key to close

**Navigation Routes:**
- Dashboard → `/dashboard`
- Profile → `/profile`
- Settings → `/settings`

**Animations:**
- Menu slides in from left with spring animation
- Backdrop fades in
- Exit animations on close

---

### Content Components

#### Component: `Dashboard`

**Location:** `src/components/dashboard/Dashboard.tsx`

**Purpose:** Main dashboard with upload and flashcard display

**Features:**
- PDF upload zone
- Flashcard options modal
- Generated flashcards display
- RTL text direction support
- User preferences integration
- Loading states
- Error handling
- Flashcard count display

**State:**
```typescript
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
const [isGenerating, setIsGenerating] = useState(false);
const [showOptions, setShowOptions] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**Functions:**
- `handleFileSelect()`: Processes selected PDF file
- `handleGenerateWithOptions()`: Submits to API and generates flashcards
- `loadUserPreferences()`: Loads saved preferences
- `saveUserPreferences()`: Saves preferences to localStorage

**API Integration:**
- POST to `/api/process-pdf` with FormData
- Handles API errors with user-friendly messages
- Displays flashcards on success

---

#### Component: `ProfileContent`

**Location:** `src/components/profile/ProfileContent.tsx`

**Purpose:** User profile display with information and stats

**Features:**
- User avatar with initials
- User full name and email display
- Account statistics:
  - Flashcards Created
  - Total Study Time
  - Current Streak
- Settings link
- Sign out button
- Responsive card layout

**Data Source:** `useAuth()` hook for user information

---

#### Component: `SettingsContent`

**Location:** `src/components/settings/SettingsContent.tsx`

**Purpose:** User preferences and account management

**Features:**
- Text length preferences:
  - Front text length (Short/Medium/Long)
  - Back text length (Short/Medium/Long)
- Auto-save to localStorage
- Delete account option (UI only)
- Responsive card layout
- Section organization

**Functions:**
- `loadPreferences()`: Loads from localStorage
- `savePreferences()`: Saves to localStorage with userId key
- `handleDelete()`: Placeholder for account deletion

---

#### Component: `TextLengthSelector`

**Location:** `src/components/settings/TextLengthSelector.tsx`

**Purpose:** Radio selector for text length preferences

**Props:**
```typescript
interface TextLengthSelectorProps {
  value: "Short" | "Medium" | "Long";
  onChange: (value: "Short" | "Medium" | "Long") => void;
  label: string;
  description?: string;
}
```

**Features:**
- Three options: Short, Medium, Long
- Radio button UI (Radix UI)
- Accessible labels
- Visual selection state

---

#### Component: `Hero`

**Location:** `src/components/landing/Hero.tsx`

**Purpose:** Landing page hero section

**Features:**
- Main headline and tagline
- Call-to-action button (Get Started)
- Gradient background
- Centered layout
- Responsive typography

---

#### Component: `FeaturesGrid`

**Location:** `src/components/features/FeaturesGrid.tsx`

**Purpose:** Features showcase grid with 4 feature cards

**Features Displayed:**
1. **AI-Powered** - Smart flashcard generation using GPT-4O
2. **Fast & Easy** - Upload PDFs and generate flashcards instantly
3. **Customizable** - Adjust text length, language, and flashcard type
4. **Multi-Language** - Support for English, Arabic, Spanish, French, German

**UI Components:**
- Icon for each feature (Lucide React)
- Title and description
- Grid layout (2x2 on desktop, 1 column on mobile)
- Card styling with hover effects

---

## Utility Functions

### Complete Function List

#### Authentication Utilities
- `signIn()` - Email/password login
- `signUp()` - Create new account
- `signInWithGoogle()` - Google OAuth
- `signOut()` - Logout user
- `useAuth()` - Auth context hook

#### API Functions
- `POST /api/process-pdf` - Process PDF and generate flashcards
- `POST /api/generate-flashcards` - Generate from text

#### AI/OpenAI Functions
- `generateFlashcardsFromText()` - Main AI generation function
- `generateFlashcardsFromPDF()` - PDF-specific wrapper
- `getLengthGuidance()` - Length preference helper

#### Language Functions
- `isArabic()` - Detect Arabic text
- `isRTL()` - Detect RTL languages
- `getTextDirection()` - Get text direction

#### File Handling
- `useFileUpload()` - File upload hook with validation

#### UI Utilities
- `cn()` - Class name merger

#### Supabase
- `getSupabaseClient()` - Get Supabase client
- `supabase` - Client export

---

## Function Categories Summary

### Backend (API Routes)
- 2 API endpoints for flashcard generation

### Authentication
- 5 auth functions + 1 hook + 1 provider component

### AI/Content Generation
- 3 OpenAI integration functions

### File Operations
- 1 file upload hook

### Language/Internationalization
- 3 language detection and RTL functions

### UI/Styling
- 1 class name utility function

### Data Persistence
- localStorage integration in multiple components
- Supabase session management

---

## Total Function Count: 20+ Core Functions

All functions are **fully functional** and integrated into the application workflow. The codebase follows modern React and Next.js best practices with TypeScript type safety throughout.
