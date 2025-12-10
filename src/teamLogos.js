/**
 * Team logo URLs mapping
 * Using publicly available logo sources
 * Format: { "LEAGUE-TEAM_ABBR": "logo_url" }
 */

// Using a CDN service or direct URLs to team logos
// You can replace these with actual logo URLs from your preferred source
const TEAM_LOGO_BASE = {
  // Using a placeholder service - replace with actual logo URLs
  // Format: https://logo.clearbit.com/{domain} or direct image URLs
};

// Team logo mapping by league and abbreviation
export const TEAM_LOGOS = {
  NBA: {
    ATL: "https://cdn.nba.com/logos/nba/1610612737/primary/L/logo.svg",
    BOS: "https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg",
    BKN: "https://cdn.nba.com/logos/nba/1610612751/primary/L/logo.svg",
    CHA: "https://cdn.nba.com/logos/nba/1610612766/primary/L/logo.svg",
    CHI: "https://cdn.nba.com/logos/nba/1610612741/primary/L/logo.svg",
    CLE: "https://cdn.nba.com/logos/nba/1610612739/primary/L/logo.svg",
    DAL: "https://cdn.nba.com/logos/nba/1610612742/primary/L/logo.svg",
    DEN: "https://cdn.nba.com/logos/nba/1610612743/primary/L/logo.svg",
    DET: "https://cdn.nba.com/logos/nba/1610612765/primary/L/logo.svg",
    GSW: "https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg",
    HOU: "https://cdn.nba.com/logos/nba/1610612745/primary/L/logo.svg",
    IND: "https://cdn.nba.com/logos/nba/1610612754/primary/L/logo.svg",
    LAC: "https://cdn.nba.com/logos/nba/1610612746/primary/L/logo.svg",
    LAL: "https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg",
    MEM: "https://cdn.nba.com/logos/nba/1610612763/primary/L/logo.svg",
    MIA: "https://cdn.nba.com/logos/nba/1610612748/primary/L/logo.svg",
    MIL: "https://cdn.nba.com/logos/nba/1610612749/primary/L/logo.svg",
    MIN: "https://cdn.nba.com/logos/nba/1610612750/primary/L/logo.svg",
    NOP: "https://cdn.nba.com/logos/nba/1610612740/primary/L/logo.svg",
    NYK: "https://cdn.nba.com/logos/nba/1610612752/primary/L/logo.svg",
    OKC: "https://cdn.nba.com/logos/nba/1610612760/primary/L/logo.svg",
    ORL: "https://cdn.nba.com/logos/nba/1610612753/primary/L/logo.svg",
    PHI: "https://cdn.nba.com/logos/nba/1610612755/primary/L/logo.svg",
    PHX: "https://cdn.nba.com/logos/nba/1610612756/primary/L/logo.svg",
    POR: "https://cdn.nba.com/logos/nba/1610612757/primary/L/logo.svg",
    SAC: "https://cdn.nba.com/logos/nba/1610612758/primary/L/logo.svg",
    SAS: "https://cdn.nba.com/logos/nba/1610612759/primary/L/logo.svg",
    TOR: "https://cdn.nba.com/logos/nba/1610612761/primary/L/logo.svg",
    UTA: "https://cdn.nba.com/logos/nba/1610612762/primary/L/logo.svg",
    WAS: "https://cdn.nba.com/logos/nba/1610612764/primary/L/logo.svg",
  },
  NFL: {
    // NFL logos - using a placeholder pattern
    // You can replace these with actual NFL logo URLs from a reliable source
    ARI: null,
    ATL: null,
    BAL: null,
    BUF: null,
    CAR: null,
    CHI: null,
    CIN: null,
    CLE: null,
    DAL: null,
    DEN: null,
    DET: null,
    GB: null,
    HOU: null,
    IND: null,
    JAX: null,
    KC: null,
    LV: null,
    LAC: null,
    LAR: null,
    MIA: null,
    MIN: null,
    NE: null,
    NO: null,
    NYG: null,
    NYJ: null,
    PHI: null,
    PIT: null,
    SF: null,
    SEA: null,
    TB: null,
    TEN: null,
    WAS: null,
  },
  MLB: {
    // MLB logos - using a placeholder pattern
    // You may need to find a reliable MLB logo CDN
    ARI: null,
    ATL: null,
    BAL: null,
    BOS: null,
    CHC: null,
    CWS: null,
    CIN: null,
    CLE: null,
    COL: null,
    DET: null,
    HOU: null,
    KC: null,
    LAA: null,
    LAD: null,
    MIA: null,
    MIL: null,
    MIN: null,
    NYM: null,
    NYY: null,
    OAK: null,
    PHI: null,
    PIT: null,
    SD: null,
    SF: null,
    SEA: null,
    STL: null,
    TB: null,
    TEX: null,
    TOR: null,
    WAS: null,
  },
  NHL: {
    // NHL logos - using NHL official API or CDN
    ANA: null,
    ARI: null,
    BOS: null,
    BUF: null,
    CGY: null,
    CAR: null,
    CHI: null,
    COL: null,
    CBJ: null,
    DAL: null,
    DET: null,
    EDM: null,
    FLA: null,
    LAK: null,
    MIN: null,
    MTL: null,
    NSH: null,
    NJD: null,
    NYI: null,
    NYR: null,
    OTT: null,
    PHI: null,
    PIT: null,
    SJS: null,
    SEA: null,
    STL: null,
    TBL: null,
    TOR: null,
    VAN: null,
    VGK: null,
    WSH: null,
    WPG: null,
  },
};

/**
 * Get team logo URL
 * @param {string} league - League name (NBA, NFL, MLB, NHL)
 * @param {string} teamAbbr - Team abbreviation
 * @returns {string|null} Logo URL or null if not available
 */
export function getTeamLogo(league, teamAbbr) {
  return TEAM_LOGOS[league]?.[teamAbbr] || null;
}

