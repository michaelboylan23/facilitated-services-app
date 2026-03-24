# Facilitated Services Assessment App — Architecture

## Overview
A web application for managing project readiness assessments (Construction Readiness, PDRI, Commissioning Readiness) within McDonough Bolyard Peck (MBP). Users create projects, run assessments against them, respond to assessment questions, and view readiness scores.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript (Vite) |
| Hosting | Azure Static Web Apps (Free tier, East US 2) |
| API | Azure Functions (v4, TypeScript) — integrated with SWA |
| Data | SharePoint Online Lists (PnPjs) |
| Auth | Microsoft Entra ID (MSAL) for admin/facilitators |
| Repo | GitHub — `michaelboylan23/facilitated-services-app`, `main` branch |
| CI/CD | GitHub Actions (auto-configured by Azure SWA) |

## Project Structure
```
facilitated-services-app/
├── src/                    # React frontend
│   ├── components/
│   │   ├── layout/         # Header, Layout shell
│   │   ├── common/         # Shared UI components
│   │   ├── assessment/     # Assessment-specific components
│   │   └── project/        # Project-specific components
│   ├── pages/              # Route-level page components
│   ├── services/           # SharePoint & auth service layers
│   ├── context/            # React context providers (Auth)
│   ├── types/              # TypeScript interfaces
│   ├── hooks/              # Custom React hooks
│   └── utils/              # Helper functions
├── api/                    # Azure Functions backend
│   └── src/functions/      # Individual function endpoints
├── staticwebapp.config.json # SWA routing, auth, roles
├── .env.example            # Required environment variables
└── ARCHITECTURE.md         # This file
```

## Authentication & Roles

### Current: PIN / Session Code (Interim)
| Role | Auth Method | Permissions |
|------|------------|-------------|
| Admin | Admin PIN (stored in SWA app settings) | Full access: manage master questions, categories, all projects/assessments |
| Facilitator | Facilitator PIN (stored in SWA app settings) | Create/manage projects and assessments, facilitate sessions |
| User | Session code + name (no account required) | Respond to assessment questions during facilitated sessions |

> **Planned upgrade:** Replace Admin/Facilitator PINs with Microsoft Entra ID (MSAL) once an Azure AD App Registration is created for the @mbpce.com tenant. The session code approach for regular users will remain. MSAL packages are already installed and auth service code exists at `src/services/auth.ts` — it just needs a valid client ID and tenant ID to activate.

## SharePoint Lists (Data Layer)
Site: `https://mbpce.sharepoint.com/sites/PRAC-FSR`

### Master Data (maintained by admins)
- **Projects** — Title (Project Number), ProjectName, Client
- **Question Categories** — per assessment type, with CategoryWeight and CategoryOrder
- **Question Bank** — questions linked to categories, with DefaultQuestionScoreFactor

### Instance Data (created per assessment)
- **Assessments** — linked to a Project, typed, dated, scored
- **Assessment Categories** — copied from master categories when assessment is created
- **Assessment Questions** — copied from master question bank when assessment is created
- **Assessment Responses** — user answers (ResponseScore 0-5) linked to questions
- **Assessment Attendees** — people participating in an assessment session

### Key Workflow
1. Admin/Facilitator creates a Project
2. Admin/Facilitator creates an Assessment linked to that Project (selects type)
3. System copies master categories + questions → assessment-specific instances
4. During facilitated session, responses are recorded against assessment questions
5. Scores roll up from responses → categories → overall assessment score

## Scoring (TBD)
- ResponseScore: 0-5 per question
- QuestionScoreFactor: weight per question
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
- [ ] Azure AD App Registration — blocked, user lacks permissions; upgrade auth when available
- [ ] Scoring formula definition per assessment type
- [ ] Visualization/charting library for readiness dashboards
