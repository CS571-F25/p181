# API Implementation Requirements

This document lists all API endpoints currently implemented or attempted, what data structure is expected, and how the data is used in the application.

---

## 1. NBA Games API - Ball Don't Lie

### Current Implementation Attempts:
- **Base URL**: `https://api.balldontlie.io/v1`
- **Endpoint Attempted**: `/games`
- **Query Parameters**:
  - `per_page=100` (to get enough games to filter)
  - `team_ids[]={teamId}` (optional, for specific team)

### Expected Data Structure:
```javascript
{
  data: [
    {
      id: number,
      date: string (ISO format like "2024-11-01" or "2024-11-01T00:00:00.000Z"),
      home_team: {
        id: number,
        abbreviation: string (e.g., "LAL", "GSW", "BOS"),
        full_name: string (e.g., "Los Angeles Lakers"),
        name: string (e.g., "Lakers"),
        city: string,
        conference: string,
        division: string
      },
      visitor_team: {
        id: number,
        abbreviation: string,
        full_name: string,
        name: string,
        city: string,
        conference: string,
        division: string
      },
      home_team_score: number | null,
      visitor_team_score: number | null,
      status: string (e.g., "Final", "Scheduled", "In Progress")
    }
  ]
}
```

### How Data is Used:
- **Filtering**: Only games where both teams have abbreviations in the valid NBA set (30 teams)
- **Date Filtering**: Only games from the last 2 years
- **Display**: Used in `GameCard` component to show:
  - Home team name (`home_team.full_name` or `home_team.name`)
  - Away team name (`visitor_team.full_name` or `visitor_team.name`)
  - Scores (`home_team_score`, `visitor_team_score`)
  - Status (`status`)
  - Date (`date`)

### Authentication:
- Currently trying without authentication first
- May need API key in header or query parameter
- API key format: UUID string

---

## 2. NFL Games API - API-Sports

### Current Implementation Attempts:
- **Base URL Attempts**:
  1. `https://api.api-sports.io/nfl/v1` (NFL-specific)
  2. `https://v1.american-football.api-sports.io` (current base URL)
  3. `https://api.api-sports.io/v3` (general v3 endpoint)

### Endpoints Attempted:
1. `/nfl/v1/games?season={year}&team={teamId}`
2. `/games?league=1&season={year}&team={teamId}` (league=1 for NFL)

### Expected Data Structure:
```javascript
{
  response: [
    {
      id: number,
      date: string (ISO format),
      teams: {
        home: {
          name: string (e.g., "Kansas City Chiefs"),
          abbreviation: string (e.g., "KC"),
          id: number
        },
        away: {
          name: string (e.g., "Buffalo Bills"),
          abbreviation: string (e.g., "BUF"),
          id: number
        }
      },
      scores: {
        home: number | null,
        away: number | null
      },
      status: string | {
        long: string (e.g., "Final", "Scheduled"),
        short: string,
        abstractGameState: string,
        detailedState: string
      }
    }
  ]
}
```

### How Data is Used:
- **Display**: Used in `GameCard` component to show:
  - Home team name (`teams.home.name`)
  - Away team name (`teams.away.name`)
  - Scores (`scores.home`, `scores.away`)
  - Status (extracted from `status` object or string)
  - Date (`date`)

### Authentication Attempts:
1. `x-apisports-key` header
2. `x-rapidapi-key` + `x-rapidapi-host` headers
3. API key format: 32-character hex string

---

## 3. MLB Games API - API-Sports

### Current Implementation Attempts:
- **Base URL Attempts**:
  1. `https://api.api-sports.io/mlb/v1` (MLB-specific)
  2. `https://v1.american-football.api-sports.io` (current base URL - likely wrong)
  3. `https://api.api-sports.io/v3` (general v3 endpoint)

### Endpoints Attempted:
1. `/mlb/v1/games?season={year}&team={teamId}`
2. `/games?league=3&season={year}&team={teamId}` (league=3 for MLB)

### Expected Data Structure:
```javascript
{
  response: [
    {
      id: number,
      date: string (ISO format),
      teams: {
        home: {
          name: string (e.g., "New York Yankees"),
          abbreviation: string (e.g., "NYY"),
          id: number
        },
        away: {
          name: string (e.g., "Boston Red Sox"),
          abbreviation: string (e.g., "BOS"),
          id: number
        }
      },
      scores: {
        home: number | null,
        away: number | null
      },
      status: string | {
        long: string,
        short: string,
        abstractGameState: string,
        detailedState: string
      }
    }
  ]
}
```

### How Data is Used:
- Same as NFL - used in `GameCard` component

### Authentication:
- Same as NFL (trying multiple methods)

---

## 4. NHL Games API - NHL Stats (Official)

### Current Implementation:
- **Base URL**: `https://statsapi.web.nhl.com/api/v1`
- **Endpoint**: `/schedule`
- **Query Parameters**:
  - `teamId={teamId}` (optional)
  - `expand=schedule.linescore` (to get scores)

### Expected Data Structure:
```javascript
{
  dates: [
    {
      games: [
        {
          gamePk: number,
          gameDate: string (ISO format),
          teams: {
            home: {
              team: {
                name: string (e.g., "Boston Bruins"),
                abbreviation: string (e.g., "BOS"),
                id: number
              }
            },
            away: {
              team: {
                name: string (e.g., "Toronto Maple Leafs"),
                abbreviation: string (e.g., "TOR"),
                id: number
              }
            }
          },
          linescore: {
            teams: {
              home: {
                goals: number
              },
              away: {
                goals: number
              }
            }
          },
          status: {
            abstractGameState: string (e.g., "Final", "Live"),
            detailedState: string,
            long: string,
            short: string
          }
        }
      ]
    }
  ]
}
```

### How Data is Used:
- **Display**: Used in `GameCard` component to show:
  - Home team name (`teams.home.team.name`)
  - Away team name (`teams.away.team.name`)
  - Scores (`linescore.teams.home.goals`, `linescore.teams.away.goals`)
  - Status (extracted from `status` object)
  - Date (`gameDate`)

### Authentication:
- No authentication needed (public API)

---

## 5. Highlights API - TheSportsDB

### Current Implementation:
- **Base URL**: `https://www.thesportsdb.com/api/v1/json`
- **Endpoints**:
  1. `/eventspastleague.php?id={leagueId}` (for league highlights)
  2. `/searchevents.php?e={teamName}` (for team-specific highlights)

### Expected Data Structure:
```javascript
{
  events: [
    {
      idEvent: string | number,
      strEvent: string (e.g., "Lakers vs Warriors Highlights"),
      strDescription: string (description of the highlight),
      strVideo: string (YouTube URL or video link),
      strThumb: string | null (thumbnail image URL),
      dateEvent: string (date in format "YYYY-MM-DD"),
      strLeague: string (e.g., "NBA", "NFL", "MLB", "NHL")
    }
  ]
}
```

### League IDs Used:
- NBA: "4387"
- NFL: "4391"
- MLB: "4424"
- NHL: "4380"

### How Data is Used:
- **Display**: Used in `HighlightCard` component to show:
  - Title (`strEvent`)
  - Description (`strDescription`)
  - Video URL (`strVideo`)
  - Thumbnail (`strThumb`)
  - Date (`dateEvent`)
  - League (`strLeague`)

### Authentication:
- Public read-only key: "123"
- Format: Key in URL path: `/{apiKey}/endpoint`

---

## Summary of Data Needs

### For Games (NBA, NFL, MLB, NHL):
1. **Team Information**:
   - Team name (full name preferred)
   - Team abbreviation (optional, for filtering)
   - Team ID (optional, for filtering)

2. **Game Information**:
   - Game ID
   - Date (ISO format preferred)
   - Home team
   - Away team
   - Home score (number or null)
   - Away score (number or null)
   - Status (string or object with status info)

### For Highlights:
1. **Event Information**:
   - Event ID
   - Event title/name
   - Description
   - Video URL
   - Thumbnail URL (optional)
   - Date
   - League name

---

## Questions for Documentation:

1. **Ball Don't Lie (NBA)**:
   - What is the correct authentication method?
   - Does it require an API key in header or query parameter?
   - What is the exact endpoint structure?

2. **API-Sports (NFL/MLB)**:
   - What is the correct base URL for NFL?
   - What is the correct base URL for MLB?
   - What is the correct endpoint structure?
   - What is the correct authentication header format?
   - What are the correct league IDs or endpoint paths?

3. **TheSportsDB (Highlights)**:
   - Are the league IDs correct?
   - Is the endpoint structure correct?
   - Are there better endpoints for getting recent highlights?

4. **NHL Stats**:
   - Is the current implementation correct?
   - Are there any rate limits or restrictions?

---

## Current Issues:

1. **NBA**: Getting 401 errors - authentication method unclear
2. **NFL**: Getting ERR_NAME_NOT_RESOLVED - base URL likely incorrect
3. **MLB**: Same as NFL - base URL likely incorrect
4. **NHL**: Should be working (no auth needed)
5. **Highlights**: Should work with public key "123"

---

# API Documentation Template

Fill in the sections below with the correct API documentation for each service.

---

## 1. NBA Games - Ball Don't Lie API

### Official Documentation URL: https://docs.balldontlie.io/#attributes
```
[Paste the official documentation URL here]
```

### Base URL: https://api.balldontlie.io/v1
```
[Correct base URL, e.g., https://api.balldontlie.io/v1]
```

### Endpoint for Games: https://api.balldontlie.io/v1/games
```
[Exact endpoint path, e.g., /games]
```

### Authentication Method:
- [ ] No authentication required
- [X] API key in header (specify header name: `_____________`)
- [ ] API key in query parameter (specify parameter name: `_____________`)
- [ ] Bearer token
- [ ] Other: `_____________`

### Request Headers (if needed):
```
Header Name: Authorization: YOUR_API_KEY
[Example: Authorization: Bearer YOUR_KEY]
[Example: x-api-key: YOUR_KEY]
```

### Query Parameters:
| Parameter | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `per_page` | number | No | Number of results | `100` |
| `team_ids[]` | number | No | Filter by team ID | `1` |
| `[add more]` | | | | |

division	false	Returns teams that belong to this division
conference	false	Returns teams that belong to this conference
ID	true	The ID of the team to retrieve
cursor	false	The cursor, used for pagination
per_page	false	The number of results per page. Default to 25. Max is 100
dates	false	Returns games that match these dates. Dates should be formatted in YYYY-MM-DD. This should be an array: ?dates[]=2024-01-01&dates[]=2024-01-02
seasons	false	Returns games that occurred in these seasons. This should be an array: ?seasons[]=2022&seasons[]=2023
team_ids	false	Returns games for these team ids. This should be an array: ?team_ids[]=1&team_ids[]=2
posteason	false	Returns playoffs games when set to true. Returns regular season games when set to false. Returns both when not specified
start_date	false	Returns games that occurred on or after this date. Date should be formatted in YYYY-MM-DD
end_date	false	Returns games that occurred on or before this date. Date should be formatted in YYYY-MM-DD

### Request Example: curl "https://api.balldontlie.io/v1/games" \
  -H "Authorization: YOUR_API_KEY"
```
[Paste a complete example request URL or curl command]
```

### Response Structure:
```json
{
  "data": [
    "id": 15907925,
    "date": "2025-01-05",
    "season": 2024,
    "status": "Final",
    "period": 4,
    "time": "Final",
    "postseason": false,
    "home_team_score": 115,
    "visitor_team_score": 105,
    "datetime": "2025-01-05T23:00:00.000Z",
    "home_q1": 29,
    "home_q2": 34,
    "home_q3": 28,
    "home_q4": 24,
    "home_ot1": null,
    "home_ot2": null,
    "home_ot3": null,
    "home_timeouts_remaining": 2,
    "home_in_bonus": true,
    "visitor_q1": 23,
    "visitor_q2": 25,
    "visitor_q3": 30,
    "visitor_q4": 27,
    "visitor_ot1": null,
    "visitor_ot2": null,
    "visitor_ot3": null,
    "visitor_timeouts_remaining": 2,
    "visitor_in_bonus": false,
    "home_team": {
      "id": 6,
      "conference": "East",
      "division": "Central",
      "city": "Cleveland",
      "name": "Cavaliers",
      "full_name": "Cleveland Cavaliers",
      "abbreviation": "CLE"
    },
    "visitor_team": {
      "id": 4,
      "conference": "East",
      "division": "Southeast",
      "city": "Charlotte",
      "name": "Hornets",
      "full_name": "Charlotte Hornets",
      "abbreviation": "CHA"
    },
    ...
  ],
  "meta": {
    "next_cursor": 25,
    "per_page": 25
  }
}
```

### Response Example:
```json
[Paste a real response example from the API]
```

### Notes:
```
[Any important notes about rate limits, pagination, date formats, etc.]
```
Attributes to note:
period	integer	0, 1, 2, 3, 4	0 will be returned for games that have not started. 4 will be returned when a game is either complete or in the 4th quarter.
status	string	{start_time}, 1st Qtr, 2nd Qtr, Halftime, 3rd Qtr, 4th Qtr, Final	{start_time} looks something like "7:00 pm ET", which indicates that the game has not started yet.
time	string	{time_in_period}, " "	${time_in_period} looks something like "3:44". " " is an empty string that is returned when game has not started or is complete.

---

## 2. NFL Games - API-Sports

### Official Documentation URL: https://www.thesportsdb.com/documentation
```
[Paste the official documentation URL here]
```

### Base URL: https://v1.american-football.api-sports.io
```
[Correct base URL] 
```

### Endpoint for Games: 
/games?league=1&season=2023 (only have access to 2023 season)



```
[Exact endpoint path]
```

### Authentication Method:
- [ ] No authentication required
- [X ] API key in header (specify header name: `_____________`)
- [ ] API key in query parameter (specify parameter name: `_____________`)
- [ ] Bearer token
- [ ] Other: `_____________`

### Request Headers (if needed):
```
Header Name: Value
[Example: x-apisports-key: YOUR_KEY]
[Example: x-rapidapi-key: YOUR_KEY]
[Example: x-rapidapi-host: api.api-sports.io]
```

### Query Parameters:
| Parameter | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `season` | number | Yes/No | Season year | `2024` |
| `team` | number | No | Filter by team ID | `1` |
| `league` | number | No | League ID (if using general endpoint) | `1` |
| `[add more]` | | | | |

need to include league (1 for nff)
need to include season (2023 for free plan)

### Request Example:
```
[Paste a complete example request URL or curl command]
```

### Response Structure:
```json
{
          {
            "game": {
                "id": 7823,
                "stage": "Pre Season",
                "week": "Week 2",
                "date": {
                    "timezone": "UTC",
                    "date": "2023-08-18",
                    "time": "23:30",
                    "timestamp": 1692401400
                },
                "venue": {
                    "name": "Mercedes-Benz Stadium",
                    "city": "Atlanta"
                },
                "status": {
                    "short": "FT",
                    "long": "Finished",
                    "timer": null
                }
            },
            "league": {
                "id": 1,
                "name": "NFL",
                "season": "2023",
                "logo": "https://media.api-sports.io/american-football/leagues/1.png",
                "country": {
                    "name": "USA",
                    "code": "US",
                    "flag": "https://media.api-sports.io/flags/us.svg"
                }
            },
            "teams": {
                "home": {
                    "id": 8,
                    "name": "Atlanta Falcons",
                    "logo": "https://media.api-sports.io/american-football/teams/8.png"
                },
                "away": {
                    "id": 10,
                    "name": "Cincinnati Bengals",
                    "logo": "https://media.api-sports.io/american-football/teams/10.png"
                }
            },
            "scores": {
                "home": {
                    "quarter_1": 0,
                    "quarter_2": 3,
                    "quarter_3": 7,
                    "quarter_4": 3,
                    "overtime": null,
                    "total": 13
                },
                "away": {
                    "quarter_1": 0,
                    "quarter_2": 3,
                    "quarter_3": 3,
                    "quarter_4": 7,
                    "overtime": null,
                    "total": 13
                }
            }
        },
        {
            "game": {
                "id": 7824,
                "stage": "Pre Season",
                "week": "Week 2",
                "date": {
                    "timezone": "UTC",
                    "date": "2023-08-19",
                    "time": "17:00",
                    "timestamp": 1692464400
                },
                "venue": {
                    "name": "Ford Field",
                    "city": "Detroit"
                },
                "status": {
                    "short": "FT",
                    "long": "Finished",
                    "timer": null
                }
            },
            "league": {
                "id": 1,
                "name": "NFL",
                "season": "2023",
                "logo": "https://media.api-sports.io/american-football/leagues/1.png",
                "country": {
                    "name": "USA",
                    "code": "US",
                    "flag": "https://media.api-sports.io/flags/us.svg"
                }
            },
            "teams": {
                "home": {
                    "id": 7,
                    "name": "Detroit Lions",
                    "logo": "https://media.api-sports.io/american-football/teams/7.png"
                },
                "away": {
                    "id": 2,
                    "name": "Jacksonville Jaguars",
                    "logo": "https://media.api-sports.io/american-football/teams/2.png"
                }
            },
            "scores": {
                "home": {
                    "quarter_1": 0,
                    "quarter_2": 0,
                    "quarter_3": 7,
                    "quarter_4": 0,
                    "overtime": null,
                    "total": 7
                },
                "away": {
                    "quarter_1": 3,
                    "quarter_2": 9,
                    "quarter_3": 6,
                    "quarter_4": 7,
                    "overtime": null,
                    "total": 25
                }
            }
        },
        {
            "game": {
                "id": 7825,
                "stage": "Pre Season",
                "week": "Week 2",
                "date": {
                    "timezone": "UTC",
                    "date": "2023-08-19",
                    "time": "20:00",
                    "timestamp": 1692475200
                },
                "venue": {
                    "name": "NRG Stadium",
                    "city": "Houston"
                },
                "status": {
                    "short": "FT",
                    "long": "Finished",
                    "timer": null
                }
            },
            "league": {
                "id": 1,
                "name": "NFL",
                "season": "2023",
                "logo": "https://media.api-sports.io/american-football/leagues/1.png",
                "country": {
                    "name": "USA",
                    "code": "US",
                    "flag": "https://media.api-sports.io/flags/us.svg"
                }
            },
            "teams": {
                "home": {
                    "id": 26,
                    "name": "Houston Texans",
                    "logo": "https://media.api-sports.io/american-football/teams/26.png"
                },
                "away": {
                    "id": 25,
                    "name": "Miami Dolphins",
                    "logo": "https://media.api-sports.io/american-football/teams/25.png"
                }
            },
            "scores": {
                "home": {
                    "quarter_1": 0,
                    "quarter_2": 3,
                    "quarter_3": 0,
                    "quarter_4": 0,
                    "overtime": null,
                    "total": 3
                },
                "away": {
                    "quarter_1": 7,
                    "quarter_2": 14,
                    "quarter_3": 7,
                    "quarter_4": 0,
                    "overtime": null,
                    "total": 28
                }
            }
        },
}
```

### Response Example:
```json
[Paste a real response example from the API]
```

### Notes:
```
[Any important notes about rate limits, pagination, date formats, etc.]
```
we can only get games for 2023 unfortunately, and they all come in one giant chunck so just take the last week of games to display
---

## 3. MLB Games - API-Sports

### Official Documentation URL:
```
[Paste the official documentation URL here]
```

### Base URL:
```
[Correct base URL]
```

### Endpoint for Games:
```
[Exact endpoint path]
```

### Authentication Method:
- [ ] No authentication required
- [ ] API key in header (specify header name: `_____________`)
- [ ] API key in query parameter (specify parameter name: `_____________`)
- [ ] Bearer token
- [ ] Other: `_____________`

### Request Headers (if needed):
```
Header Name: Value
[Same format as NFL]
```

### Query Parameters:
| Parameter | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `season` | number | Yes/No | Season year | `2024` |
| `team` | number | No | Filter by team ID | `1` |
| `league` | number | No | League ID (if using general endpoint) | `3` |
| `[add more]` | | | | |

### Request Example:
```
[Paste a complete example request URL or curl command]
```

### Response Structure:
```json
[Same format as NFL - paste actual structure]
```

### Response Example:
```json
[Paste a real response example from the API]
```

### Notes:
```
[Any important notes]
```

---

## 4. NHL Games - NHL Stats API

### Official Documentation URL:
```
[Paste the official documentation URL here if available]
```

### Base URL:
```
[Current: https://statsapi.web.nhl.com/api/v1]
[Confirm if correct or update]
```

### Endpoint for Games:
```
[Current: /schedule]
[Confirm if correct or update]
```

### Authentication Method:
- [x] No authentication required (current assumption)
- [ ] API key in header
- [ ] Other: `_____________`

### Query Parameters:
| Parameter | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `teamId` | number | No | Filter by team ID | `1` |
| `expand` | string | No | Additional data to include | `schedule.linescore` |
| `[add more]` | | | | |

### Request Example:
```
[Paste a complete example request URL or curl command]
```

### Response Structure:
```json
[Confirm or update the actual structure]
```

### Response Example:
```json
[Paste a real response example from the API]
```

### Notes:
```
[Any important notes about rate limits, pagination, etc.]
```

---

## 5. Highlights - TheSportsDB

### Official Documentation URL: https://www.thesportsdb.com/documentation
```
[Paste the official documentation URL here]
```

### Base URL: https://www.thesportsdb.com/api/v1/json/123
```
[Correct base URL]
```

### Endpoint for Games: 
/eventspastleague.php?id={leagueID} (for recent past games)

/eventsnextleague.php?id={leagueID} (for upcoming games)

/eventsday.php?d={YYYY-MM-DD}&l={leagueID} (games on specific date, i would like you to find a way to gather the last week of games highlights)



```
[Exact endpoint path]
```

### Authentication Method:
- [ ] No authentication required
- [ ] API key in header (specify header name: `_____________`)
- [X ] API key in query parameter (specify parameter name: `_____________`)
- [ ] Bearer token
- [ ] Other: `_____________`

### Request Headers (if needed):
```
Header Name: Value
[Example: x-apisports-key: YOUR_KEY]
[Example: x-rapidapi-key: YOUR_KEY]
[Example: x-rapidapi-host: api.api-sports.io]
```

### Query Parameters:
| Parameter | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `season` | number | Yes/No | Season year | `2024` |
| `team` | number | No | Filter by team ID | `1` |
| `league` | number | No | League ID (if using general endpoint) | `1` |
| `[add more]` | | | | |

### Request Example:
```
[Paste a complete example request URL or curl command]
```

### Response Structure:
```json
{
    "events": [
        {
            "idEvent": "2261394",
            "idAPIfootball": "17521",
            "strEvent": "Los Angeles Chargers vs Philadelphia Eagles",
            "strEventAlternate": "Philadelphia Eagles @ Los Angeles Chargers",
            "strFilename": "NFL 2025-12-09 Los Angeles Chargers vs Philadelphia Eagles",
            "strSport": "American Football",
            "idLeague": "4391",
            "strLeague": "NFL",
            "strLeagueBadge": "https://r2.thesportsdb.com/images/media/league/badge/g85fqz1662057187.png",
            "strSeason": "2025",
            "strDescriptionEN": "",
            "strHomeTeam": "Los Angeles Chargers",
            "strAwayTeam": "Philadelphia Eagles",
            "intHomeScore": "22",
            "intRound": "14",
            "intAwayScore": "19",
            "intSpectators": null,
            "strOfficial": null,
            "strTimestamp": "2025-12-09T01:15:00",
            "dateEvent": "2025-12-09",
            "dateEventLocal": "2025-12-08",
            "strTime": "01:15:00",
            "strTimeLocal": "17:15:00",
            "strGroup": "",
            "idHomeTeam": "135908",
            "strHomeTeamBadge": "https://r2.thesportsdb.com/images/media/team/badge/vrqanp1687734910.png",
            "idAwayTeam": "134936",
            "strAwayTeamBadge": "https://r2.thesportsdb.com/images/media/team/badge/pnpybf1515852421.png",
            "intScore": null,
            "intScoreVotes": null,
            "strResult": " Los Angeles Chargers Quarter 1:<br>7 3 <br>Quarter 2<br>3 3 <br>Quarter 3<br>3 3 <br>Quarter 4<br>6 10 <br>Overtime<br>3 0",
            "idVenue": "23720",
            "strVenue": "SoFi Stadium",
            "strCountry": "United States",
            "strCity": "Inglewood, CA",
            "strPoster": "https://r2.thesportsdb.com/images/media/event/poster/s8l8ia1748646245.jpg",
            "strSquare": "https://r2.thesportsdb.com/images/media/event/square/1xxc251748648401.jpg",
            "strFanart": null,
            "strThumb": "https://r2.thesportsdb.com/images/media/event/thumb/dfx0h71748641351.jpg",
            "strBanner": "",
            "strMap": null,
            "strTweet1": "",
            "strVideo": "https://www.youtube.com/watch?v=Mpj2TpaVo8o",
            "strStatus": "AOT",
            "strPostponed": "no",
            "strLocked": "unlocked"
        }
    ]
}

#6 Using SportsDB for NFL games

base URL:
https://www.thesportsdb.com/api/v1/json/123

endpoint URL:
eventsday.php?l=nfl&d={YYYY-MM-DD}

no headers are necessary, just the l and d params.
the servers that host the data are not in the USA, so some of the dates are off by a day. When you are pulling the data, I want you to pull the last 12 days of data and use "dateEventLocal" and "strTimeLocal" for the date and time of each NFL game.
