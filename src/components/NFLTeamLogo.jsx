import React from 'react';
import * as NFLIcons from 'react-nfl-logos';

/**
 * Component to render NFL team logos using react-nfl-logos
 * @param {string} teamAbbr - Team abbreviation (e.g., "ARI", "ATL")
 * @param {number} size - Logo size in pixels (default: 100)
 */
export default function NFLTeamLogo({ teamAbbr, size = 100 }) {
  // Special case: Washington Commanders - show simple "W" instead of logo
  if (teamAbbr === "WAS") {
    return (
      <div style={{ 
        height: size, 
        width: size, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: `${size * 0.6}px`,
        fontWeight: 'bold',
        color: 'var(--text-primary)',
        fontFamily: 'Arial, sans-serif'
      }}>
        W
      </div>
    );
  }

  // Map team abbreviations to react-nfl-logos component names
  const logoMap = {
    ARI: NFLIcons.ARI,
    ATL: NFLIcons.ATL,
    BAL: NFLIcons.BAL,
    BUF: NFLIcons.BUF,
    CAR: NFLIcons.CAR,
    CHI: NFLIcons.CHI,
    CIN: NFLIcons.CIN,
    CLE: NFLIcons.CLE,
    DAL: NFLIcons.DAL,
    DEN: NFLIcons.DEN,
    DET: NFLIcons.DET,
    GB: NFLIcons.GB,
    HOU: NFLIcons.HOU,
    IND: NFLIcons.IND,
    JAX: NFLIcons.JAX,
    KC: NFLIcons.KC,
    LV: NFLIcons.LV,
    LAC: NFLIcons.LAC,
    LAR: NFLIcons.LAR,
    MIA: NFLIcons.MIA,
    MIN: NFLIcons.MIN,
    NE: NFLIcons.NE,
    NO: NFLIcons.NO,
    NYG: NFLIcons.NYG,
    NYJ: NFLIcons.NYJ,
    PHI: NFLIcons.PHI,
    PIT: NFLIcons.PIT,
    SF: NFLIcons.SF,
    SEA: NFLIcons.SEA,
    TB: NFLIcons.TB,
    TEN: NFLIcons.TEN,
  };

  const LogoComponent = logoMap[teamAbbr];

  if (!LogoComponent) {
    // Fallback to abbreviation if logo not found
    return (
      <div style={{ 
        height: size, 
        width: size, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '0.875rem',
        color: 'var(--text-muted)'
      }}>
        {teamAbbr}
      </div>
    );
  }

  return <LogoComponent size={size} />;
}

