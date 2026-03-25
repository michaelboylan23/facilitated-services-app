# Facilitated Services Assessment App — Architecture

## Overview
A web application for managing project readiness assessments (Construction Readiness, PDRI, Commissioning Readiness) within McDonough Bolyard Peck (MBP). Users create projects, run assessments against them, respond to assessment questions, and view readiness scores.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript (Vite) |
| Hosting | Azure Static Web Apps (Free tier, East US 2) |
| API | Azure Functions (v4, TypeScript) — integrated with SWA |
| Data | **Currently:** localStorage mock data / **Target:** SharePoint Online Lists via Microsoft Graph API |
| Auth | **Currently:** PIN + session codes / **Target:** Microsoft Entra ID (MSAL) for admin/facilitators |
| Repo | GitHub — `michaelboylan23/facilitated-services-app`, `main` branch |
| CI/CD | GitHub Actions (auto-configured by Azure SWA) |

## Project Structure
```
facilitated-services-app/
├── src/
│   ├── components/
│   │   ├── layout/         # Header (w/ MBP logo), Layout shell
│   │   ├── common/         # Shared UI components
│   │   ├── assessment/     # Assessment-specific components
│   │   └── project/        # Project-specific components
│   ├── pages/
│   │   ├── admin/          # Admin panel (Projects, Categories, Questions, Assessments)
│   │   ├── Home.tsx
│   │   ├── Login.tsx        # Staff PIN login + session code join
│   │   ├── Projects.tsx
│   │   └── Assessments.tsx
│   ├── services/
│   │   ├── mockData.ts     # localStorage CRUD + seed data (current data layer)
│   │   ├── sharepoint.ts   # PnPjs SharePoint service (future — needs App Registration)
│   │   └── auth.ts         # MSAL auth service (future — needs App Registration)
│   ├── context/
│   │   └── AuthContext.tsx  # PIN/session code auth provider
│   ├── types/              # TypeScript interfaces for all domain entities
│   ├── hooks/
│   └── utils/
├── api/                    # Azure Functions backend
│   └── src/functions/
│       └── health.ts       # Health check endpoint
├── staticwebapp.config.json
├── .env.example
└── ARCHITECTURE.md
```

## Authentication & Roles

### Current: PIN / Session Code (Interim)
| Role | Auth Method | Permissions |
|------|------------|-------------|
| Admin | Admin PIN (stored in SWA app settings) | Full access: manage master questions, categories, all projects/assessments via Admin panel |
| Facilitator | Facilitator PIN (stored in SWA app settings) | Create/manage projects and assessments, facilitate sessions |
| User | Session code + name (no account required) | Respond to assessment questions during facilitated sessions |

> **Planned upgrade:** Replace Admin/Facilitator PINs with Microsoft Entra ID (MSAL) once an Azure AD App Registration is created for the @mbpce.com tenant. The session code approach for regular users will remain. MSAL packages are already installed and auth service code exists at `src/services/auth.ts` — it just needs a valid client ID and tenant ID to activate. Blocked because user does not have permission to create App Registrations in the tenant.

## Data Layer

### Current: localStorage Mock Data
All data is stored in browser localStorage via `src/services/mockData.ts`. Seed data is auto-loaded on first visit and includes sample projects, question categories, and questions for all three assessment types. A "Reset Mock Data" button in the admin panel restores seed data.

### Target: SharePoint Online Lists
Site: `https://mbpce.sharepoint.com/sites/PRAC-FSR` (lists already created)

When the Azure AD App Registration is available, the data layer will switch from localStorage to SharePoint via Microsoft Graph API. The `src/services/sharepoint.ts` service has the full CRUD interface ready — it just needs a valid auth context.

### Data Model

#### Master Data (maintained by admins)
- **Projects** — Title (Project Number), ProjectName, Client, ProjectStatus, SecondaryLogo
- **Question Categories** — per assessment type, with CategoryWeight and CategoryOrder
- **Question Bank** — questions linked to categories, with DefaultQuestionScoreFactor, AdditionalInformation

#### Instance Data (created per assessment)
- **Assessments** — linked to a Project, typed, dated, scored, FacilitatorName, ProjectManagerName
- **Assessment Categories** — copied from master categories; CategoryTargetScore, CategoryActualScore
- **Assessment Questions** — copied from question bank; QuestionOrder, Priority (High/Medium/Low), Status (Unanswered/Answered/Ignored), AdditionalInformation
- **Assessment Responses** — ResponseScore 0-5 (Yes=5, No=0 for boolean questions), Response text, Comments
- **Assessment Attendees** — Attendee name, Company, Role, Email
- **Assessment Actions** — Action text, ActionStatus (Open/In Progress/Complete/Closed), TargetDate, CompletedDate, ResponsiblePartyId (lookup to Attendees), QuestionId (optional link to question)

### Key Workflow
1. Admin/Facilitator creates a Project
2. Admin/Facilitator creates an Assessment linked to that Project (selects type)
3. System copies master categories + questions → assessment-specific instances
4. During facilitated session, responses are recorded against assessment questions
5. Scores roll up from responses → categories → overall assessment score

## UI Theme
MBP brand colors defined as CSS variables in `src/App.css`:
- **Navy (Primary):** `#003463` — header, headings, table headers
- **Cool Gray (Secondary):** `#646569` — muted text, inactive elements
- **Cyan (Accent):** `#0FA3DF` — buttons, active tabs, focus states, role badges
- **Lime:** `#BAB40B` — available for charts/visualizations
- **Teal:** `#07B0A6` — available for charts/visualizations

Logos: `public/MBP_logo_white.png` (header) and `public/MBP_logo_navy.png` (login page)

## App Pages

### Home / Dashboard
- Project list with search, filter by status, sortable columns
- Expandable rows showing assessments per project with quick-open
- Create Project and Compare Assessments (TBD) buttons

### Project Details (`/projects/:id`)
- View/edit project info (number, name, status, client)
- List of assessments with create new assessment form
- Secondary logo upload (for client branding on PDFs — TBD)

### Assessment (`/assessments/:id`) — 6 tabs
1. **Summary** — Project info, facilitator, PM, status, score, Executive Summary (TBD)
2. **Readiness** — Visual readiness cards per category with progress bars, color-coded by %
3. **Questions** — Progress bar, category pill tabs, searchable/filterable table, click-to-open question detail modal with score input (0-5 + Ignore), response, comments, prev/next navigation, Edit button for question fields
4. **Action Items** — CRUD table with status, responsible party (from attendees), target/completed dates, linked questions
5. **Attendees** — CRUD table with name, company, role, email, action count; delete warns if actions assigned
6. **Settings** — Edit assessment info, adjust category target scores, adjust question score factors and active status, export (TBD)

### Admin (`/admin`) — admin role only
- Tabbed CRUD for all SharePoint lists

## Scoring (TBD)
- ResponseScore: 0-5 per question (ignored questions excluded from totals)
- QuestionScoreFactor: weight per question (adjustable per assessment in Settings)
- CategoryWeight: weight per category
- Exact formula for category and assessment roll-up scores is pending definition
- Different assessment types may have different scoring approaches

## Assessment Types
Currently defined (will expand over time):
- **Construction Readiness**
- **PDRI** (Project Definition Rating Index)
- **Commissioning Readiness**

Each type has its own set of master categories and questions. Scoring may differ by type.

## Environment Variables
| Variable | Purpose |
|----------|---------|
| `VITE_ADMIN_PIN` | PIN for admin access (set in SWA app settings) |
| `VITE_FACILITATOR_PIN` | PIN for facilitator access (set in SWA app settings) |
| `VITE_SHAREPOINT_URL` | SharePoint base URL |
| `VITE_AZURE_CLIENT_ID` | (Future) Azure AD App Registration client ID |
| `VITE_AZURE_TENANT_ID` | (Future) Azure AD tenant ID for @mbpce.com |

## Constraints
- **Azure SWA Free tier** — 2 custom domains, 0.5 GB storage, 100 GB bandwidth/month, 1 integrated Azure Functions API

## Open Items
- [ ] Azure AD App Registration — blocked, user lacks permissions; upgrade auth + SharePoint connection when available
- [ ] Scoring formula definition per assessment type
- [ ] Add ResponseType column to Question Bank SP list (numeric 0-5 vs yes/no)
- [ ] Print/Export functionality (PDF and XLSX) for questions, actions, attendees
- [ ] Executive Summary feature
- [ ] Compare Assessments feature
- [ ] Readiness tab — richer visualizations (charts library TBD)
- [ ] Session code generation and validation for user role
- [ ] Secondary logo upload per project (client branding on PDFs)
- [ ] Question history/audit trail (deferred)
