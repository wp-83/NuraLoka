<p align="center">
  <img src="public/images/logo/with-tagline.png" width="320" alt="NuraLoka">
</p>

<h1 align="center">NuraLoka - Mantapkan Langkahmu!</h1>

<p align="center">
  A web-based tourism platform that helps users discover destinations, culinary spots,
  accommodations, and rest areas across Indonesia through intelligent recommendations
  and gamified exploration.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white">
  <img src="https://img.shields.io/badge/PHP-8.5-777BB4?style=for-the-badge&logo=php&logoColor=white">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black">
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white">
</p>

---

# 🌏 Overview

**NuraLoka** is a web-based tourism recommendation platform that assists travelers in discovering attractions, culinary destinations, accommodations, and rest stops throughout Indonesia.

Whether planning an intercity journey or exploring a specific region, users receive intelligent recommendations, learn about local destinations, save travel inspirations, and document memorable experiences. To encourage continuous exploration, NuraLoka incorporates gamification through missions, badges, levels, and leaderboards while celebrating Indonesia's cultural diversity with location-based regional greetings.

---

# ✨ Flagship Features

## 🗺️ Smart Travel Recommendations

Discover tourist attractions, culinary destinations, accommodations, souvenir shops, and rest areas around your current location or along your travel route using an interactive map.

## 🌐 Regional Language Greetings

Experience localized greetings based on your geographical location, providing a more personal experience while helping preserve Indonesia's regional languages and culture.

## 📖 Tourism Insights

Learn more about every destination through curated information covering its history, cultural significance, unique attractions, and travel tips.

## 📷 Trip Album

Capture and organize memorable moments from your journeys while sharing experiences with other travelers for inspiration.

## ❤️ Wishlist

Save destinations and travel inspirations from both NuraLoka recommendations and fellow travelers to plan future adventures.

## 🏆 Missions & Leaderboard

Complete exploration missions, earn points, unlock badges, level up your profile, and compete with other travelers on the leaderboard.

---

# 🏗 Tech Stack

## Backend

| Technology | Purpose |
|------------|---------|
| Laravel 12 | Web Framework |
| PHP 8.5 | Backend Language |
| Inertia.js | Server-driven SPA |
| MySQL | Relational Database |

## Frontend

| Technology | Purpose |
|------------|---------|
| React 19 | User Interface |
| Vite 6 | Build Tool |
| Tailwind CSS 4 | Styling |
| Leaflet | Interactive Maps |

## Infrastructure

| Technology | Purpose |
|------------|---------|
| Hostinger | Web Hosting |
| OpenStreetMap | Mapping Platform |
| Google OAuth | Social Authentication |

---

# 🔌 External Services

| Service | Purpose |
|---------|---------|
| OpenStreetMap | Interactive map tiles |
| Overpass API | Import tourism locations |
| Nominatim | Place search & geocoding |
| OSRM | Driving route generation |
| Browser Geolocation API | User location detection |
| ip-api.com | Regional greeting localization |
| Google OAuth | User authentication |

> Tourism locations are imported asynchronously through Laravel Queues while rotating across multiple Overpass mirrors to comply with public API rate limits.

---

# 🚀 Getting Started

## Requirements

- PHP **8.5**
- Composer
- Node.js 18+
- npm
- MySQL

## Installation

```bash
composer install
npm install

cp .env.example .env

php artisan key:generate

php artisan migrate --seed

npm run build
```

Run the development environment:

```bash
composer run dev
```

Start the queue worker:

```bash
php artisan queue:listen
```

---

# ⚙️ Environment Variables

```dotenv
APP_NAME=NuraLoka

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT=

DAERAH_IP_LOOKUP_ENDPOINT=http://ip-api.com/json/{ip}
```

---

# 📜 Available Commands

| Command | Description |
|---------|-------------|
| `composer run dev` | Run Laravel, Queue, Logs, and Vite simultaneously |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build production assets |
| `composer lint` | Check code style with Laravel Pint |
| `composer format` | Automatically format code |
| `composer analyse` | Run PHPStan static analysis |
| `php artisan test` | Execute the test suite |

---

# 👥 Development Team

| Member | Role |
|---------|------|
| Felicia Wijaya | Product Owner |
| William Pratama | Scrum Master |
| Agnes G. F. Sukma | Developer |
| Andi Zulfikar | Developer |
| Steven J. Wiyanto | Developer |

---

<p align="center">
Built with ❤️ using Laravel and React.
</p>
