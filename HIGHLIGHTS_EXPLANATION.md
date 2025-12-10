# How Highlights Work

## Overview
Highlights are fetched from TheSportsDB API. The system uses the `fetchHighlights()` function in `src/services/sportsApi.js` to retrieve highlight videos.

## API Endpoints Used

### 1. League Highlights (General)
- **Endpoint**: `eventspastleague.php?id={leagueId}`
- **URL Format**: `https://www.thesportsdb.com/api/v1/json/123/eventspastleague.php?id={leagueId}`
- **Used when**: Fetching general highlights for a league (no specific team)
- **Example**: `fetchHighlights("NFL")` or `fetchHighlights("NBA")`

### 2. Team-Specific Highlights
- **Endpoint**: `searchevents.php?e={teamName}`
- **URL Format**: `https://www.thesportsdb.com/api/v1/json/123/searchevents.php?e={teamName}`
- **Used when**: Fetching highlights for a specific team
- **Example**: `fetchHighlights("NFL", "Dallas Cowboys")`

## League IDs
The following league IDs are used:
- **NBA**: `4387`
- **NFL**: `4391`
- **MLB**: `4424`
- **NHL**: `4380`

## Data Structure
Each highlight event from TheSportsDB contains:
- `idEvent`: Unique event ID
- `strEvent`: Event name (e.g., "Dallas Cowboys vs Philadelphia Eagles")
- `strDescriptionEN`: English description (used for display)
- `strVideo`: YouTube URL for the highlight video
- `strThumb`: Thumbnail image URL
- `dateEvent`: Date of the event (YYYY-MM-DD format)
- `strHomeTeam`: Home team name
- `strAwayTeam`: Away team name
- `strLeague`: League name (e.g., "NFL", "NBA")

## How to Manually Add More Highlights

### Option 1: Add to TheSportsDB Database
TheSportsDB is a community-maintained database. You can:
1. Visit https://www.thesportsdb.com/
2. Create an account
3. Submit new events/highlights to their database
4. Once approved, they'll be available via the API

### Option 2: Modify Mock Data
If you want to add highlights that aren't in TheSportsDB, you can modify the `getMockHighlights()` function in `src/services/sportsApi.js`:

```javascript
function getMockHighlights(league, teamName) {
  const leagueName = league || "NBA";
  const eventName = teamName ? `${teamName} Game Highlights` : `${leagueName} Game Highlights`;
  
  const baseHighlight = (idSuffix) => ({
    idEvent: `${idSuffix}`,
    strEvent: `${eventName} - Highlight ${idSuffix}`,
    strLeague: leagueName,
    strDescriptionEN: `Exciting plays from the ${eventName}.`,
    strDescription: `Exciting plays from the ${eventName}.`,
    dateEvent: new Date(new Date().setDate(new Date().getDate() - (idSuffix - 1))).toISOString().split("T")[0],
    strVideo: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID", // Replace with actual YouTube URL
    strThumb: null,
  });

  return Array.from({ length: 5 }, (_, i) => baseHighlight(i + 1));
}
```

### Option 3: Create a Local JSON File
1. Create a file `src/data/highlights.json` with your custom highlights
2. Import and use it in `fetchHighlights()` as a fallback

### Option 4: Use a Different API
You can modify `fetchHighlights()` to use a different API source. Just ensure the returned data matches the expected structure:
- Must have `idEvent` or `id`
- Must have `strEvent` or `title`
- Must have `strVideo` or `videoUrl`
- Should have `strDescriptionEN` or `description`
- Should have `dateEvent` or `date`

## Current Implementation
- Highlights are cached for 30 minutes to reduce API calls
- If TheSportsDB API fails, the system falls back to mock data
- Up to 5 highlights are displayed per league/team
- Highlights are filtered by league and team name when favorited teams are selected

## Testing
To test highlights:
1. Visit the Home page
2. Select a league from the dropdown
3. If you have favorited teams, their highlights will appear first
4. If no favorited teams, random highlights from that league will appear

