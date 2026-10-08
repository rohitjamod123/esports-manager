# Booyah Arena - Esports Squad & Tournament Manager
PBL project for **Web Application Development (BE05000281)**, GTU, Dept. of IT, GECG Sector 28.
Theme inspired by Free Fire MAX esports websites. All names are fictional; no official assets are used.

## 1. Abstract (Activity 1)
**Title:** Booyah Arena - Esports Squad & Tournament Manager

**Problem statement:** Amateur and college esports squads manage rosters in chat groups and tournament slots in spreadsheets. Organisers cannot see who has registered, slots get double-booked, and players have no single place for their stats.

**Proposed solution:** A full-stack web application where captains create an account, register a squad, add players with roles (IGL, Rusher, Sniper, Support) and register the squad in tournaments in one click. Admins create and manage tournaments, and a leaderboard ranks squads by points.

**Target users:** College and amateur esports players, squad captains and tournament organisers.

**Main features:** Home page with live stats and countdown, tournament list with filter and search, squad and player management (CRUD), slot-limited registration, JWT login with captain and admin roles, responsive design.

**Technologies:** HTML5, CSS3, Bootstrap 5, JavaScript (DOM, Fetch API, Local Storage), Node.js, Express.js, MongoDB with Mongoose, JWT, React.js (hooks, Axios), Postman, Git.

**Architecture:** Client-server. The browser UI (HTML/CSS/JS and a React dashboard) calls a REST API built with Express. The API validates requests, applies authentication middleware and reads or writes MongoDB collections: users, teams, players and tournaments.

**Expected outcome:** A deployed, responsive web application that replaces spreadsheets for tournament registration and gives squads a shared record of members and performance.

## 2. Folder structure
```
esports-manager/
├── backend/            Node.js + Express + MongoDB (REST API)
│   ├── config/db.js            database connection
│   ├── models/                 User, Team, Player, Tournament schemas
│   ├── routes/                 auth, teams, players, tournaments (+ crud.js factory)
│   ├── middleware/auth.js      JWT protect + adminOnly
│   ├── server.js               app entry, serves ../frontend too
│   └── seed.js                 demo data
├── frontend/           HTML + CSS + Bootstrap + JavaScript (served by Express)
│   ├── index, tournaments, teams, players, login, register, about, legal (.html)
│   ├── css/style.css
│   └── js/ api.js, layout.js, home.js, tournaments.js, teams.js, players.js, auth.js, register.js, about.js
└── react-app/          React.js (Vite) dashboard using components, props, state, hooks, Axios
```

## 3. How to run
Install Node.js and MongoDB (local, or a free MongoDB Atlas URI).

```bash
cd backend
npm install
# edit .env if needed (MONGO_URI, JWT_SECRET)
npm run seed        # loads demo data once
npm start           # http://localhost:5000
```
Open **http://localhost:5000** for the HTML/CSS/JS website.

React dashboard (keep the backend running):
```bash
cd react-app
npm install
npm run dev         # http://localhost:5173
```

Demo logins: `admin@booyah.com / admin123` (can delete) and `captain@booyah.com / captain123`.

## 4. API documentation
Base URL: `http://localhost:5000/api`. Send `Authorization: Bearer <token>` where marked.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /auth/register | - | Create captain account `{name,email,password}` |
| POST | /auth/login | - | Login `{email,password}` -> `{token,user}` |
| GET | /teams | - | List squads. Query: `q`, `sort` (e.g. `-points`) |
| GET | /teams/:id | - | One squad |
| POST | /teams | Login | Create squad `{name,tag,captain,region,wins,points}` |
| PUT | /teams/:id | Login | Update squad |
| DELETE | /teams/:id | Admin | Delete squad |
| GET | /players | - | List players. Query: `q`, `role`, `team`, `sort` |
| POST/PUT | /players, /players/:id | Login | Create / update `{ign,realName,uid,role,team,kills,headshotRate}` |
| DELETE | /players/:id | Admin | Delete player |
| GET | /tournaments | - | List. Query: `q`, `status`, `mode`, `sort` |
| POST/PUT | /tournaments, /tournaments/:id | Login | Create / update `{title,prize,mode,slots,startDate,status}` |
| DELETE | /tournaments/:id | Admin | Delete tournament |
| POST | /tournaments/:id/register | Login | Register a squad `{teamName, tag, players:[{ign,uid} x4]}`. Creates the squad and its 4 players, then locks a slot. Blocks duplicate squad names, duplicate UIDs, full slots and completed events |
| GET | /stats | - | Counts and total prize pool |

Status codes used: 200, 201, 400 (validation), 401 (no/invalid token), 403 (not admin), 404, 500.

## 5. Syllabus and PBL mapping
| Syllabus topic | Where it is used |
|---|---|
| Client-server, frontend/backend/database, static vs dynamic | Architecture above, about.html |
| HTML structure, semantic tags, tables, forms, media (SVG) | All .html files, about.html figure |
| CSS selectors, colors, fonts, box model, Flexbox, positioning, media queries | css/style.css |
| Bootstrap | Grid, navbar, modals, forms on every page |
| JS variables, functions, arrays, objects, loops, DOM, events | frontend/js/*.js |
| Local Storage | Auth token in api.js, contact messages in about.js |
| Callbacks, promises, async/await, Fetch API | `api()` in js/api.js |
| HTTP methods, status codes, query params, request body, JSON | API table, Fetch calls |
| Node.js, npm, Express routing and middleware | backend/server.js, routes/ |
| REST API, MongoDB connectivity, CRUD | routes/crud.js, models/ |
| Authentication and authorization | routes/auth.js, middleware/auth.js |
| React: JSX, components, props, state, useState, useEffect, conditional and list rendering, Axios, CORS | react-app/src, `cors()` in server.js |
| Hosting, domain, SEO, cloud | Section 7 below, meta tags in HTML |

## 6. Testing (Activity 2 and 3)
Use Postman with the API table above. Suggested test cases:
1. Register with a short password -> 400.
2. Login with wrong password -> 401.
3. POST /teams without a token -> 401.
4. DELETE /teams/:id as captain -> 403; as admin -> 200.
5. Register the same squad twice in one tournament -> 400 "Team already registered".
6. Register into a full or completed tournament -> 400.
7. Browser: resize to 375px wide and confirm navbar collapses and tables scroll.
8. Stop the server and open the site -> a clear "Cannot reach the server" message appears.

## 7. Deployment
- Database: create a free cluster on MongoDB Atlas and copy the connection string.
- Backend + website: push the repo to GitHub, create a Web Service on Render, root directory `backend`, build `npm install`, start `npm start`. Set env vars `MONGO_URI` and `JWT_SECRET`. Express serves the frontend, so one URL hosts the whole site.
- React app: set `baseURL` in `react-app/src/api.js` to your Render URL + `/api`, then deploy the `react-app` folder on Vercel or Netlify (`npm run build`, output `dist`).
- Run `npm run seed` once against the Atlas database.

## 8. Report checklist (17 sections required by the PBL guideline)
Cover page, certificate, abstract (Section 1), introduction, problem definition, objectives, technology used (Section 5), database design (collections: users, teams, players, tournaments; players.team -> teams, tournaments.teams -> teams), UI wireframes, module-wise implementation, API documentation (Section 4), testing (Section 6), screenshots, deployment (Section 7), conclusion, future scope (payments, live match scoring, team chat, image uploads, CAPTCHA on signup), references (MDN, React docs, Express docs, Node.js docs).
