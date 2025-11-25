# Universal Study Material Generator

## Overview

The Universal Study Material Generator is an AI-powered learning tool that transforms text input (notes, articles, chapters, PDF content) into comprehensive study materials. It generates summaries, flashcards, multiple-choice questions, true/false statements, key definitions, and explanations tailored to different learning levels (kids, high school, university, professional).

Built with React 18.3.1 and TypeScript, the application leverages AI to instantly create study materials, eliminating the need for manual creation and helping students, professionals, and lifelong learners study more efficiently.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tool**
- React 18.3.1 with TypeScript for type safety and component reusability
- Vite as the build tool for fast development and optimized production builds
- Component-based architecture with functional components and React Hooks

**UI Component System**
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with a custom design system defined in CSS variables
- Design tokens managed through HSL color values for consistent theming
- Responsive design patterns with mobile-first approach

**State Management**
- React Query (@tanstack/react-query) for server state management and caching
- Local component state using React useState hooks
- Form state managed through react-hook-form with zod validation (@hookform/resolvers)

**Routing**
- React Router v6 for client-side routing
- Single-page application (SPA) architecture with catch-all 404 handling

**Type System**
- Strict TypeScript configuration disabled for flexibility (noImplicitAny: false)
- Custom type definitions for study materials in `src/types/studyMaterials.ts`
- Path aliases configured for clean imports (@/ maps to ./src/)

### Backend Architecture

**AI Integration**
- Supabase Edge Functions for serverless AI processing
- Function endpoint: `generate-study-materials`
- Processes text input with difficulty level and content type options
- Returns structured JSON containing all requested study materials

**API Layer**
- Centralized API client in `src/lib/api.ts`
- Type-safe function invocations using Supabase client
- Error handling with user-friendly messages through toast notifications

**Content Generation Types**
The system generates seven types of study materials:
1. **Summary**: 150-200 word condensed overview
2. **Flashcards**: 10-15 question-answer pairs
3. **MCQs**: Multiple choice questions with options and correct answers
4. **True/False**: Boolean statements with answers
5. **Definitions**: Key terms with explanations
6. **Kids Explanation**: Simplified version for ages 8-12
7. **Professional Explanation**: Advanced technical version

### External Dependencies

**Supabase Platform**
- Backend-as-a-Service providing edge functions for AI processing
- Authentication and session management (configured but not actively used)
- Environment variables required:
  - `VITE_SUPABASE_URL`: Supabase project URL
  - `VITE_SUPABASE_PUBLISHABLE_KEY`: Public API key

**PDF Generation**
- jsPDF library for PDF document creation
- jspdf-autotable for structured table layouts in PDFs
- Client-side PDF generation supporting individual section downloads or complete study material packages

**Third-Party UI Libraries**
- Radix UI primitives (@radix-ui/*) for accessible, unstyled components
- Embla Carousel for potential carousel functionality
- Lucide React for icon system
- next-themes for dark/light mode theming support

**Development Tools**
- ESLint with TypeScript support for code quality
- Lovable component tagger for development mode tracking
- PostCSS with Tailwind CSS and Autoprefixer

**Planned Features**
- Advertisement placeholders positioned at header, sidebar, and footer
- Premium/upgrade modal for monetization (UI implemented, backend integration pending)
- Copy-to-clipboard functionality for all generated content sections
- Expandable/collapsible sections for better content organization