# Dangerzone Client

This folder contains the React frontend for the Dangerzone app. The client
shows a city incident map, an incident list, authentication screens, incident
detail modals, and an admin overview for moderation.

The app is built with Vite and talks to the Dangerzone server through REST API
requests.

## Purpose

The client is responsible for:

- showing active city incidents on a Leaflet map
- showing incidents in list and card views
- allowing guests to browse incidents in read-only mode
- allowing registered users to create incidents and comments
- allowing incident owners to edit or delete their own incidents
- allowing admins to access moderation tools
- handling login, signup, logout, and token verification
- showing user-facing loading and error states
- resolving addresses and user-selected positions for map features

When running locally, the client is usually available at:

```bash
http://localhost:5173
```

## Tech Stack

- React
- Vite
- React Router
- Axios
- Leaflet
- React Leaflet
- CSS modules/files by feature area

## How To Run

Install dependencies once:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the production version:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

## Environment Variables

Create a `.env.local` file in `dangerzone-client/`.

Example:

```bash
VITE_SERVER_URL=http://localhost:5005
```

The client automatically appends `/api` in `src/services/service.config.js`.
With the example above, API requests go to:

```bash
http://localhost:5005/api
```

For production, `VITE_SERVER_URL` must point to the deployed backend URL.

## Main Files

```md
src/main.jsx
Starts the React app and mounts it into the browser.

src/App.jsx
Defines the frontend routes and applies private/admin route guards where
needed.

src/context/auth.context.jsx
Stores the global authentication state and verifies saved JWT tokens.

src/services/service.config.js
Creates the shared Axios instance and attaches the auth token to API requests.

src/services/incident.service.js
Contains incident and comment API calls used by the map and incident views.

src/services/admin.service.js
Contains admin overview and moderation API calls.

src/pages/
Contains route-level pages such as map home, incidents list, login, signup,
and admin overview.

src/components/map/
Contains map UI components, incident modals, list items, and position controls.

src/hooks/useUserPosition.js
Manages the current map center, browser geolocation, and address-based
position changes.

src/utils/
Contains distance calculations, geocoding helpers, and server-to-view-model
incident mapping.

src/styles/
Contains CSS for auth screens, admin screens, and map/incident screens.
```

## Frontend Routes

```bash
/                     Home map view
/incidents            Incident card/list page
/login                Login screen
/signup               Signup screen
/admin                Admin overview
/private-page-example Example private route
```

Public routes:

- `/`
- `/incidents`
- `/login`
- `/signup`

Protected routes:

- `/private-page-example`

Admin-only routes:

- `/admin`

## User Modes

### Guests

Guests can:

- open the home map page
- view active incidents
- open incident details
- read comments
- use filters and map position tools

Guests cannot:

- create incidents
- post comments
- edit incidents
- delete incidents
- access the admin page

When guests try to report or comment, the UI asks them to sign in or register.

### Logged-In Users

Logged-in users can:

- create incidents
- post comments
- edit their own incidents
- delete their own incidents
- log out

The JWT token is stored in `localStorage` as `authToken`.

### Admins

Admins can access `/admin` and use moderation tools such as:

- reviewing users
- reviewing comments
- deleting comments
- warning users
- deleting users

The admin route is protected by `OnlyAdmin`.

## Authentication Flow

On app startup, `AuthWrapper` checks `localStorage` for `authToken`.

If a token exists, the client calls:

```bash
GET /api/auth/verify
```

If the token is valid, the app stores:

- `isLoggedIn`
- `loggedUserId`
- `loggedUserEmail`
- `loggedUsername`
- `loggedUserRole`

If the token is missing or invalid, the user remains a guest.

For protected API requests, the Axios interceptor adds:

```bash
Authorization: Bearer <token>
```

## API Usage

The frontend reads and writes data through the server API.

Main incident calls:

```bash
GET    /api/all-incidents
GET    /api/incident/:incidentId
POST   /api/incident
PUT    /api/incident/:incidentId
DELETE /api/incident/:incidentId
POST   /api/comment/incident/:incidentId
```

Main auth calls:

```bash
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/verify
```

Main admin calls:

```bash
GET    /api/all-users
GET    /api/all-comments
PUT    /api/user/:userId/warn
DELETE /api/user/:userId
DELETE /api/comment/:commentId
```

## Map And Position Handling

The home page uses Leaflet through `react-leaflet`.

Important map behavior:

- incidents with valid coordinates are shown as map markers
- the current user/map position is shown as a separate marker
- radius filtering limits visible incidents around the selected position
- users can set their position from browser geolocation, an address, or an
  existing incident
- address lookup goes through the server geocoding route

The current position logic lives in:

```bash
src/hooks/useUserPosition.js
```

Distance and radius calculations live in:

```bash
src/utils/distance.js
```

## Error Handling

The client shows errors in the UI instead of relying on console messages.

Examples:

- login/signup errors appear on the auth forms
- incident loading errors appear in the incident list/sidebar
- create/edit/delete/comment errors appear inside incident modals
- address and geolocation errors appear in the relevant position or create
  modal

Common frontend error messages include:

- `Could not load incidents from the server.`
- `Could not create incident.`
- `Could not update incident.`
- `Could not delete incident.`
- `Could not post comment.`
- `No position found for this address.`

Developer details are still logged with `console.error`, but user-facing
problems should also be rendered in the page or modal.

## Styling

The main style files are:

```md
src/styles/mapView.css
Map, incident list, incident modal, and position modal styling.

src/styles/auth.css
Login and signup styling.

src/styles/admin.css
Admin overview styling.

src/App.css and src/index.css
Global app styling.
```

## Deployment Notes

The client includes `vercel.json` with a rewrite rule:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This allows React Router routes such as `/incidents` or `/admin` to work after
refreshing the page on Vercel.

For deployment:

1. Deploy the server first.
2. Set the client environment variable `VITE_SERVER_URL` to the deployed server
   URL.
3. Set the server `ORIGIN` to the deployed client URL.
4. Build and deploy the client.
5. Test guest browsing, login, incident creation, and admin access.

## Common Checks

If the client shows no incidents:

- Check that the backend server is running.
- Check `VITE_SERVER_URL`.
- Open `<VITE_SERVER_URL>/api/all-incidents` in the browser.
- Check the browser Network tab for failed requests.
- Check the server terminal for database errors.

If login does not work:

- Check that the server has `TOKEN_SECRET`.
- Check that the user exists in the database.
- Check that the server CORS `ORIGIN` matches the client URL.
- Check that `authToken` is stored in browser localStorage after login.

If the map is blank:

- Check the browser console for Leaflet errors.
- Check that `leaflet/dist/leaflet.css` is imported.
- Check that incidents have valid `lat` and `lng` values.
- Check that the browser can load OpenStreetMap tiles.

If deployment routes show 404 on refresh:

- Check that `vercel.json` exists in the deployed client project.
- Check that the rewrite points all routes to `/index.html`.
