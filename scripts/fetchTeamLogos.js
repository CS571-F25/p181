/**
 * Script to fetch all team badge URLs from TheSportsDB and update teamLogos.js
 * 
 * Usage: node scripts/fetchTeamLogos.js
 * 
 * This script will:
 * 1. Fetch all teams for each league from TheSportsDB
 * 2. Match them to team abbreviations in sports.js
 * 3. Generate updated teamLogos.js with all badge URLs
 */

const fs = require('fs');
const path = require('path');

const API_KEY = "123"; // TheSportsDB free API key
const BASE_URL = "https://www.thesportsdb.com/api/v1/json";

const LEAGUE_IDS = {
  NFL: "4391",
  MLB: "4424",
  NHL: "4380",
};

// Team name mappings (full names from sports.js)
const TEAM_NAMES = {
  NFL: [
    { name: "Arizona Cardinals", abbreviation: "ARI" },
    { name: "Atlanta Falcons", abbreviation: "ATL" },
    { name: "Baltimore Ravens", abbreviation: "BAL" },
    { name: "Buffalo Bills", abbreviation: "BUF" },
    { name: "Carolina Panthers", abbreviation: "CAR" },
    { name: "Chicago Bears", abbreviation: "CHI" },
    { name: "Cincinnati Bengals", abbreviation: "CIN" },
    { name: "Cleveland Browns", abbreviation: "CLE" },
    { name: "Dallas Cowboys", abbreviation: "DAL" },
    { name: "Denver Broncos", abbreviation: "DEN" },
    { name: "Detroit Lions", abbreviation: "DET" },
    { name: "Green Bay Packers", abbreviation: "GB" },
    { name: "Houston Texans", abbreviation: "HOU" },
    { name: "Indianapolis Colts", abbreviation: "IND" },
    { name: "Jacksonville Jaguars", abbreviation: "JAX" },
    { name: "Kansas City Chiefs", abbreviation: "KC" },
    { name: "Las Vegas Raiders", abbreviation: "LV" },
    { name: "Los Angeles Chargers", abbreviation: "LAC" },
    { name: "Los Angeles Rams", abbreviation: "LAR" },
    { name: "Miami Dolphins", abbreviation: "MIA" },
    { name: "Minnesota Vikings", abbreviation: "MIN" },
    { name: "New England Patriots", abbreviation: "NE" },
    { name: "New Orleans Saints", abbreviation: "NO" },
    { name: "New York Giants", abbreviation: "NYG" },
    { name: "New York Jets", abbreviation: "NYJ" },
    { name: "Philadelphia Eagles", abbreviation: "PHI" },
    { name: "Pittsburgh Steelers", abbreviation: "PIT" },
    { name: "San Francisco 49ers", abbreviation: "SF" },
    { name: "Seattle Seahawks", abbreviation: "SEA" },
    { name: "Tampa Bay Buccaneers", abbreviation: "TB" },
    { name: "Tennessee Titans", abbreviation: "TEN" },
    { name: "Washington Commanders", abbreviation: "WAS" },
  ],
  MLB: [
    { name: "Arizona Diamondbacks", abbreviation: "ARI" },
    { name: "Atlanta Braves", abbreviation: "ATL" },
    { name: "Baltimore Orioles", abbreviation: "BAL" },
    { name: "Boston Red Sox", abbreviation: "BOS" },
    { name: "Chicago Cubs", abbreviation: "CHC" },
    { name: "Chicago White Sox", abbreviation: "CWS" },
    { name: "Cincinnati Reds", abbreviation: "CIN" },
    { name: "Cleveland Guardians", abbreviation: "CLE" },
    { name: "Colorado Rockies", abbreviation: "COL" },
    { name: "Detroit Tigers", abbreviation: "DET" },
    { name: "Houston Astros", abbreviation: "HOU" },
    { name: "Kansas City Royals", abbreviation: "KC" },
    { name: "Los Angeles Angels", abbreviation: "LAA" },
    { name: "Los Angeles Dodgers", abbreviation: "LAD" },
    { name: "Miami Marlins", abbreviation: "MIA" },
    { name: "Milwaukee Brewers", abbreviation: "MIL" },
    { name: "Minnesota Twins", abbreviation: "MIN" },
    { name: "New York Mets", abbreviation: "NYM" },
    { name: "New York Yankees", abbreviation: "NYY" },
    { name: "Oakland Athletics", abbreviation: "OAK" },
    { name: "Philadelphia Phillies", abbreviation: "PHI" },
    { name: "Pittsburgh Pirates", abbreviation: "PIT" },
    { name: "San Diego Padres", abbreviation: "SD" },
    { name: "San Francisco Giants", abbreviation: "SF" },
    { name: "Seattle Mariners", abbreviation: "SEA" },
    { name: "St. Louis Cardinals", abbreviation: "STL" },
    { name: "Tampa Bay Rays", abbreviation: "TB" },
    { name: "Texas Rangers", abbreviation: "TEX" },
    { name: "Toronto Blue Jays", abbreviation: "TOR" },
    { name: "Washington Nationals", abbreviation: "WAS" },
  ],
  NHL: [
    { name: "Anaheim Ducks", abbreviation: "ANA" },
    { name: "Arizona Coyotes", abbreviation: "ARI" },
    { name: "Boston Bruins", abbreviation: "BOS" },
    { name: "Buffalo Sabres", abbreviation: "BUF" },
    { name: "Calgary Flames", abbreviation: "CGY" },
    { name: "Carolina Hurricanes", abbreviation: "CAR" },
    { name: "Chicago Blackhawks", abbreviation: "CHI" },
    { name: "Colorado Avalanche", abbreviation: "COL" },
    { name: "Columbus Blue Jackets", abbreviation: "CBJ" },
    { name: "Dallas Stars", abbreviation: "DAL" },
    { name: "Detroit Red Wings", abbreviation: "DET" },
    { name: "Edmonton Oilers", abbreviation: "EDM" },
    { name: "Florida Panthers", abbreviation: "FLA" },
    { name: "Los Angeles Kings", abbreviation: "LAK" },
    { name: "Minnesota Wild", abbreviation: "MIN" },
    { name: "Montreal Canadiens", abbreviation: "MTL" },
    { name: "Nashville Predators", abbreviation: "NSH" },
    { name: "New Jersey Devils", abbreviation: "NJD" },
    { name: "New York Islanders", abbreviation: "NYI" },
    { name: "New York Rangers", abbreviation: "NYR" },
    { name: "Ottawa Senators", abbreviation: "OTT" },
    { name: "Philadelphia Flyers", abbreviation: "PHI" },
    { name: "Pittsburgh Penguins", abbreviation: "PIT" },
    { name: "San Jose Sharks", abbreviation: "SJS" },
    { name: "Seattle Kraken", abbreviation: "SEA" },
    { name: "St. Louis Blues", abbreviation: "STL" },
    { name: "Tampa Bay Lightning", abbreviation: "TBL" },
    { name: "Toronto Maple Leafs", abbreviation: "TOR" },
    { name: "Vancouver Canucks", abbreviation: "VAN" },
    { name: "Vegas Golden Knights", abbreviation: "VGK" },
    { name: "Washington Capitals", abbreviation: "WSH" },
    { name: "Winnipeg Jets", abbreviation: "WPG" },
  ],
};

async function fetchTeamBadges(league) {
  const leagueId = LEAGUE_IDS[league];
  if (!leagueId) return {};

  try {
    const url = `${BASE_URL}/${API_KEY}/lookup_all_teams.php?id=${leagueId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Failed to fetch ${league} teams: ${response.status}`);
      return {};
    }

    const data = await response.json();
    if (!data.teams || !Array.isArray(data.teams)) {
      console.error(`No teams found for ${league}`);
      return {};
    }

    const badges = {};
    const teamNames = TEAM_NAMES[league];

    // Match teams by name
    teamNames.forEach(({ name, abbreviation }) => {
      const team = data.teams.find(t => 
        t.strTeam === name || 
        t.strAlternate === name ||
        t.strTeam.toLowerCase().includes(name.toLowerCase().split(' ')[0]) // Partial match
      );

      if (team && team.strTeamBadge) {
        badges[abbreviation] = team.strTeamBadge;
        console.log(`✓ ${league} ${abbreviation}: ${team.strTeamBadge}`);
      } else {
        console.warn(`✗ ${league} ${abbreviation} (${name}): Not found`);
        badges[abbreviation] = null;
      }
    });

    return badges;
  } catch (error) {
    console.error(`Error fetching ${league} teams:`, error);
    return {};
  }
}

async function main() {
  console.log("Fetching team badges from TheSportsDB...\n");

  const allBadges = {
    NFL: {},
    MLB: {},
    NHL: {},
  };

  for (const league of Object.keys(LEAGUE_IDS)) {
    console.log(`\nFetching ${league} teams...`);
    allBadges[league] = await fetchTeamBadges(league);
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log("\n\nDone! Update teamLogos.js with the fetched badge URLs.");
  console.log("\nFetched badges:", JSON.stringify(allBadges, null, 2));
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fetchTeamBadges };

