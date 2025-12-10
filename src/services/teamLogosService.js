/**
 * Service to load team logos from a GitHub-hosted database
 * You can replace the GITHUB_RAW_URL with your own GitHub repository
 * Format: https://raw.githubusercontent.com/{username}/{repo}/{branch}/{path}/teamLogos.json
 */

// Default GitHub raw URL - replace with your own if you create a database
// Example format: https://raw.githubusercontent.com/{username}/{repo}/{branch}/teamLogos.json
const DEFAULT_GITHUB_URL = null; // Set this to your GitHub raw URL when you have one

// Fallback to local mapping if GitHub fetch fails
import { TEAM_LOGOS as FALLBACK_LOGOS } from "../teamLogos";

/**
 * Load team logos from GitHub-hosted JSON file
 * Falls back to local mapping if GitHub fetch fails
 */
export async function loadTeamLogosFromGitHub(githubUrl = null) {
  try {
    const url = githubUrl || DEFAULT_GITHUB_URL;
    
    // If no GitHub URL is provided, use local fallback immediately
    if (!url) {
      return convertLocalLogosToMap(FALLBACK_LOGOS);
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch logos: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn("Failed to load logos from GitHub, using fallback:", error);
    // Return fallback logos from local file
    return convertLocalLogosToMap(FALLBACK_LOGOS);
  }
}

/**
 * Convert local TEAM_LOGOS object to a flat map format
 * Format: { "LEAGUE-ABBR": "url" }
 */
function convertLocalLogosToMap(teamLogos) {
  const logoMap = {};
  
  Object.keys(teamLogos).forEach(league => {
    Object.keys(teamLogos[league]).forEach(abbr => {
      const url = teamLogos[league][abbr];
      if (url) {
        logoMap[`${abbr}-${league}`] = url;
      }
    });
  });
  
  return logoMap;
}

/**
 * Get team logo URL from local cache or GitHub data
 * @param {string} league - League name
 * @param {string} teamAbbr - Team abbreviation
 * @param {object} logoMap - Map of logos (from loadTeamLogosFromGitHub)
 * @returns {string|null} Logo URL or null
 */
export function getTeamLogoUrl(league, teamAbbr, logoMap = {}) {
  const key = `${teamAbbr}-${league}`;
  return logoMap[key] || null;
}

