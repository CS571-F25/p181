# Sports Highlight Tracker

A React web application that allows sports fans to track highlights, game schedules, and stay up to date with their favorite teams from NBA, NFL, MLB, and NHL.

## Features

- **Team Selection**: Select and save your favorite teams from multiple leagues
- **Personalized Dashboard**: View highlights and schedules for your selected teams
- **Highlight Browsing**: Browse highlights from all leagues
- **Favorites System**: Save your favorite highlights for easy access
- **Fan Discussions**: Comment on highlights and engage with other fans
- **Game Schedules**: View upcoming games and recent scores

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Keys

The application uses sports APIs to fetch live data. To enable full functionality, you'll need to add your API keys:

1. Open `src/services/sportsApi.js`
2. Replace the placeholder API keys with your actual keys:

```javascript
const API_KEYS = {
  API_SPORTS: "YOUR_API_SPORTS_KEY_HERE", // Get from https://api-sports.io/
  THE_SPORTS_DB: "YOUR_THE_SPORTS_DB_KEY_HERE", // Get from https://www.thesportsdb.com/api.php
};
```

### API Key Sources

- **API-Sports**: Sign up at [https://api-sports.io/](https://api-sports.io/) for NFL and MLB data
- **TheSportsDB**: Sign up at [https://www.thesportsdb.com/api.php](https://www.thesportsdb.com/api.php) for highlights and events

**Note**: The app will work with mock data if API keys are not provided, but real-time data requires valid API keys.

### 3. Run the Development Server

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── CommentSection.jsx
│   ├── ErrorMessage.jsx
│   ├── FavoriteButton.jsx
│   ├── FavoritesList.jsx
│   ├── GameCard.jsx
│   ├── HighlightCard.jsx
│   ├── HighlightList.jsx
│   ├── LeagueSelector.jsx
│   ├── LoadingSpinner.jsx
│   ├── Navbar.jsx
│   ├── ScheduleCard.jsx
│   ├── StatsWidget.jsx
│   └── TeamSelector.jsx
├── contexts/            # React Context providers
│   └── SelectedTeamsContext.jsx
├── pages/              # Page components
│   ├── AboutMe.jsx
│   ├── Highlights.jsx
│   ├── Home.jsx
│   └── MyTeams.jsx
├── services/           # API service utilities
│   └── sportsApi.js
└── sports.js           # Team and league data

```

## Components

The application includes 12+ components:

1. **Navbar** - Main navigation bar
2. **LeagueSelector** - Dropdown for selecting sports leagues
3. **TeamSelector** - Dropdown for selecting teams
4. **HighlightCard** - Displays individual highlight with video link
5. **HighlightList** - Grid layout for multiple highlights
6. **GameCard** - Displays game information and scores
7. **ScheduleCard** - Container for upcoming games
8. **StatsWidget** - Widget showing team schedules
9. **FavoriteButton** - Button to favorite/unfavorite highlights
10. **FavoritesList** - Displays all favorited highlights
11. **CommentSection** - Comment thread for highlights
12. **LoadingSpinner** - Loading state indicator
13. **ErrorMessage** - Error state display

## Pages

- **Home** (`/`) - Personalized dashboard with selected team highlights
- **My Teams** (`/myteams`) - Team selection interface
- **Highlights** (`/highlights`) - Browse all highlights by league
- **About** (`/about`) - Project information and usage instructions

## Technologies Used

- React 19
- React Router 7
- React Bootstrap 2
- Vite
- LocalStorage for data persistence

## Accessibility Features

- Proper heading hierarchy (h1, h2, h3)
- Alt text on all images
- ARIA labels and roles
- Keyboard navigation support
- Form labels for all inputs
- Sufficient color contrast (WCAG AA compliant)

## Browser Support

Modern browsers that support ES6+ and React 19.

## License

This project is for educational purposes.
