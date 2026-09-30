## CVFrameIQ CRM

I built this internal CRM frontend with Next.js, Tailwind CSS, and JavaScript. It includes sales, client, project, billing, timesheet, and support views; the app currently uses sample data rather than a backend.

## Run locally

Use Node.js 18.18 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000. I use these commands to check the app:

```bash
npm run build
npm run lint
```

## Demo logins

These sample accounts are defined in `src/data/users.js`:

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
