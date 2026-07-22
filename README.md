<p align="center">
  <img src="public/images/logo/with-tagline.png" width="320" alt="NuraLoka">
</p>

<h1 align="center">NuraLoka</h1>

<p align="center">
  A gamified travel-exploration platform for discovering Indonesia — plan routes,
  find hidden gems, collect badges, and share your journey.
</p>

---

## Overview

**NuraLoka** turns exploring Indonesia into an interactive, map-driven experience.
Users discover places, get real driving routes, check in on arrival, and earn
levels, badges, and leaderboard rankings — combining a curated, admin-managed
catalog with live points-of-interest imported from OpenStreetMap. It even greets
users in their local regional language based on where they are.

**Core features:** interactive map exploration & check-ins · real routing between
points · gamification (missions, badges, levels, leaderboard) · wishlists ·
location photo albums · travel insights · multi-language UI (`id` / `en` / `ko`)
with regional-language greetings · a full admin panel with background OSM imports.

---

## Tech Stack

**Backend**

![Laravel](https://img.shields.io/badge/Laravel_12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![PHP](https://img.shields.io/badge/PHP_8.2+-777BB4?style=for-the-badge&logo=php&logoColor=white)
![Inertia](https://img.shields.io/badge/Inertia.js-9553E9?style=for-the-badge&logo=inertia&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

**Frontend**

![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)

**Infrastructure**

![Hostinger](https://img.shields.io/badge/Hostinger-673DE6?style=for-the-badge&logo=hostinger&logoColor=white)
![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-7EBC6F?style=for-the-badge&logo=openstreetmap&logoColor=white)
![Google](https://img.shields.io/badge/Google_OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white)

| Layer | Details |
| --- | --- |
| **Framework** | Laravel 12 + Inertia.js (server-driven SPA), Ziggy for shared routes |
| **UI** | React 19, Vite 6, Tailwind CSS 4, Leaflet / React-Leaflet, react-icons |
| **Auth** | Laravel Socialite (Google OAuth) |
| **Libraries** | Intervention Image, Spatie Laravel Sluggable, axios |
| **Hosting & Storage** | Hostinger (web hosting + file/asset storage), MySQL database |
| **Tooling** | Pint, PHPStan, PHPUnit, Faker, Pail, Sail, concurrently |

---

## APIs & External Services

NuraLoka runs entirely on free, open mapping data — no paid map provider required.

| Service | Used for |
| --- | --- |
| **OpenStreetMap tiles** | Base map rendering |
| **Overpass API** (+ mirrors) | Importing POI data into the places catalog |
| **Nominatim** | Location search / geocoding autocomplete |
| **OSRM** (`router.project-osrm.org`) | Real driving routes between points |
| **ip-api.com** | IP-based geolocation for regional greetings |
| **Google OAuth** | Social sign-in / sign-up |
| **Browser Geolocation API** | Detecting current position & province |

> The Overpass importer rotates across public mirrors, splits large areas into
> tiles, and runs as queued background jobs to respect rate limits.

---

## Getting Started

**Prerequisites:** PHP 8.2+ & Composer · Node.js 18+ & npm · MySQL (or SQLite for local)

```bash
# Install dependencies
composer install && npm install

# Configure environment
cp .env.example .env
php artisan key:generate

# Set up the database, then run
php artisan migrate --seed
npm run build        # or: npm run dev
```

Run the full local stack (server, queue, logs, and Vite) in one command:

```bash
composer run dev
```

**Environment keys** to set in `.env`:

```dotenv
APP_NAME=NuraLoka

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT=

DAERAH_IP_LOOKUP_ENDPOINT=http://ip-api.com/json/{ip}
```

> OSM imports run on the queue — keep a worker running (`php artisan queue:listen`)
> when triggering an import from the admin panel.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` / `npm run build` | Vite dev server / production build |
| `composer run dev` | Server + queue + logs + Vite together |
| `composer lint` · `composer format` | Code style check / auto-format (Pint) |
| `composer analyse` | Static analysis (PHPStan) |
| `php artisan test` | Run the test suite |

---

## Team

| Felicia Wijaya | William Pratama | Agnes G. F. Sukma | Andi Zulfikar | Steven J. Wiyanto |
| :---: | :---: | :---: | :---: | :---: |
| Product Owner | Scrum Master | Developer | Developer | Developer |

---

<p align="center">
  Built with the <a href="https://laravel.com">Laravel</a> framework · Licensed under
  the <a href="https://opensource.org/licenses/MIT">MIT license</a>.
</p>
