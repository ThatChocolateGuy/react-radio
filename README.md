# react-radio

Tiny learning app: React + Vite + TypeScript streaming radio.

Features:
- Play internet radio streams using the browser audio element
- Favorite stations (stored in localStorage)
- Simple recommendations based on favorite genres
- Modular services that are easy to split into microservices later

Getting started:
1. npm install
2. npm run dev
3. Open http://localhost:5173

Notes:
- Some public streams require CORS and may not play in the browser.
- All user data is stored locally (localStorage).
- To learn microservices: extract services/* to small servers (catalog, recommendation) that serve JSON endpoints.

License: MIT
