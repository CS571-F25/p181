import React from 'react';
import * as MLBIcons from 'react-mlb-logos';

/**
 * Component to render MLB team logos using react-mlb-logos
 * @param {string} teamAbbr - Team abbreviation (e.g., "ARI", "ATL")
 * @param {number} size - Logo size in pixels (default: 100)
 */
export default function MLBTeamLogo({ teamAbbr, size = 100 }) {
  // Map team abbreviations to react-mlb-logos component names
  // Note: Some abbreviations differ (e.g., KC -> KAN, CWS -> CHW)
  const logoMap = {
    ARI: MLBIcons.ARI,
    ATL: MLBIcons.ATL,
    BAL: MLBIcons.BAL,
    BOS: MLBIcons.BOS,
    CHC: MLBIcons.CHC,
    CWS: MLBIcons.CHW, // Chicago White Sox uses CHW in the package
    CIN: MLBIcons.CIN,
    CLE: MLBIcons.CLE,
    COL: MLBIcons.COL,
    DET: MLBIcons.DET,
    HOU: MLBIcons.HOU,
    KC: MLBIcons.KAN, // Kansas City Royals uses KAN in the package
    LAA: MLBIcons.LAA,
    LAD: MLBIcons.LAD,
    MIA: MLBIcons.MIA,
    MIL: MLBIcons.MIL,
    MIN: MLBIcons.MIN,
    NYM: MLBIcons.NYM,
    NYY: MLBIcons.NYY,
    OAK: MLBIcons.OAK,
    PHI: MLBIcons.PHI,
    PIT: MLBIcons.PIT,
    SD: MLBIcons.SD,
    SF: MLBIcons.SF,
    SEA: MLBIcons.SEA,
    STL: MLBIcons.STL,
    TB: MLBIcons.TB,
    TEX: MLBIcons.TEX,
    TOR: MLBIcons.TOR,
    WSH: MLBIcons.WAS, // Washington Nationals uses WAS in the package
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

