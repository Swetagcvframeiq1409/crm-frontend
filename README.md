## CVFrameIQ CRM - Frontend

Internal CRM web app for IT services and consulting teams. Stage 1 frontend.

## What's built (Stage 1)
- Login: sign in with a demo user to access the app.
- Dashboard: pipeline value, active leads, deals by stage,
  recent activity and clients that need attention.
- Leads: list of leads with search and a status filter.
  Add a lead or open one to see its details.
- Pipeline: move deals through stages with drag and drop.
- Clients: view the client list and open a detail page with
  contact info and activity history.
- Proposals: list of proposals with a status filter.
  Open one to see line items, totals and versions.
- Settings: placeholder account page for profile and preferences.

## Tech used
- Next.js (App Router, JavaScript)
- Tailwind CSS
- framer-motion
- recharts
- dnd-kit
- lucide-react

## How to run it
Requirements: Node.js 18.18 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000

Other commands:

```bash
npm run build
npm run lint
```

## Demo logins
These are sample accounts for testing only.

| Name | Email | Password | Role |
| --- | --- | --- | --- |
| Sweta Ghosh | swetag.@cvframeiq.com | Demo@123 | Developer |
| Rahul Kumar | rahul.k@cvframeiq.com | Demo@123 | Sales Manager |
| Priya Sharma | priya.s@cvframeiq.com | Demo@123 | Sales Executive |
| Amit Patel | admin@cvframeiq.com | Demo@123 | Admin |

## Project structure
```text
src/
  app/        Route pages and app layout
  components/ Reusable UI, dashboard widgets, and layout pieces
  context/    Auth and toast state
  data/       Mock data and demo users
```

## Notes
- All data is sample data in src/data/mockData.js. There is no backend connected yet.
- The login is a temporary demo login and will be replaced once the backend is ready.
- Planned next: Stage 2 (projects, timesheets, billing, support tickets).
