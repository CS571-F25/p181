import React from 'react';
// Import individual logo components directly from source files
import ANA from 'react-nhl-logos/src/logos/ana';
import ARI from 'react-nhl-logos/src/logos/ari';
import BOS from 'react-nhl-logos/src/logos/bos';
import BUF from 'react-nhl-logos/src/logos/buf';
import CGY from 'react-nhl-logos/src/logos/cgy';
import CAR from 'react-nhl-logos/src/logos/car';
import CHI from 'react-nhl-logos/src/logos/chi';
import COL from 'react-nhl-logos/src/logos/col';
import CBJ from 'react-nhl-logos/src/logos/cbj';
import DAL from 'react-nhl-logos/src/logos/dal';
import DET from 'react-nhl-logos/src/logos/det';
import EDM from 'react-nhl-logos/src/logos/edm';
import FLA from 'react-nhl-logos/src/logos/fla';
import LAK from 'react-nhl-logos/src/logos/lak';
import MIN from 'react-nhl-logos/src/logos/min';
import MTL from 'react-nhl-logos/src/logos/mtl';
import NSH from 'react-nhl-logos/src/logos/nsh';
import NJD from 'react-nhl-logos/src/logos/njd';
import NYI from 'react-nhl-logos/src/logos/nyi';
import NYR from 'react-nhl-logos/src/logos/nyr';
import OTT from 'react-nhl-logos/src/logos/ott';
import PHI from 'react-nhl-logos/src/logos/phi';
import PIT from 'react-nhl-logos/src/logos/pit';
import SJS from 'react-nhl-logos/src/logos/sjs';
import STL from 'react-nhl-logos/src/logos/stl';
import TBL from 'react-nhl-logos/src/logos/tbl';
import TOR from 'react-nhl-logos/src/logos/tor';
import VAN from 'react-nhl-logos/src/logos/van';
import VGK from 'react-nhl-logos/src/logos/vgk';
import WSH from 'react-nhl-logos/src/logos/wsh';
import WPG from 'react-nhl-logos/src/logos/wpg';

/**
 * Component to render NHL team logos using react-nhl-logos
 * @param {string} teamAbbr - Team abbreviation (e.g., "ANA", "ARI")
 * @param {number} size - Logo size in pixels (default: 100)
 */
export default function NHLTeamLogo({ teamAbbr, size = 100 }) {
  // Map team abbreviations to react-nhl-logos component names
  const logoMap = {
    ANA,
    ARI,
    BOS,
    BUF,
    CGY,
    CAR,
    CHI,
    COL,
    CBJ,
    DAL,
    DET,
    EDM,
    FLA,
    LAK,
    MIN,
    MTL,
    NSH,
    NJD,
    NYI,
    NYR,
    OTT,
    PHI,
    PIT,
    SJS,
    SEA: ARI, // Seattle Kraken - package doesn't have SEA, using ARI as placeholder
    STL,
    TBL,
    TOR,
    VAN,
    VGK,
    WSH,
    WPG,
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

