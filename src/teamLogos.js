/**
 * Team logo URLs mapping
 * Using TheSportsDB badge URLs for NFL, MLB, and NHL
 * NBA uses official NBA CDN for high-quality SVG logos
 * 
 * To update team logos, use TheSportsDB API:
 * - League IDs: NBA=4387, NFL=4391, MLB=4424, NHL=4380
 * - Endpoint: lookup_all_teams.php?id={leagueId}
 * - Badge URL format: https://r2.thesportsdb.com/images/media/team/badge/{TEAM_ID}.png
 */

// League IDs for TheSportsDB
const LEAGUE_IDS = {
  NBA: "4387",
  NFL: "4391",
  MLB: "4424",
  NHL: "4380",
};

// Team logo mapping by league and abbreviation
// NFL, MLB, and NHL use TheSportsDB badge URLs
// NBA uses official NBA CDN URLs
export const TEAM_LOGOS = {
  NBA: {
    // NBA logos - using official NBA CDN (high quality SVG logos)
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
    // NFL logos - using TheSportsDB badge URLs
    ARI: "https://r2.thesportsdb.com/images/media/team/badge/xvuwtw1420646838.png",
    ATL: "https://r2.thesportsdb.com/images/media/team/badge/rrpvpr1420658174.png",
    BAL: "https://r2.thesportsdb.com/images/media/team/badge/einz3p1546172463.png",
    BUF: "https://r2.thesportsdb.com/images/media/team/badge/6pb37b1515849026.png",
    CAR: "https://r2.thesportsdb.com/images/media/team/badge/xxyvvy1420940478.png",
    CHI: "https://r2.thesportsdb.com/images/media/team/badge/ji22531698678538.png",
    CIN: "https://r2.thesportsdb.com/images/media/team/badge/qqtwwv1420941670.png",
    CLE: "https://r2.thesportsdb.com/images/media/team/badge/squvxy1420942389.png",
    DAL: "https://r2.thesportsdb.com/images/media/team/badge/wrxssu1450018209.png",
    DEN: "https://r2.thesportsdb.com/images/media/team/badge/upsspx1421635647.png",
    DET: "https://r2.thesportsdb.com/images/media/team/badge/lgsgkr1546168257.png",
    GB: "https://r2.thesportsdb.com/images/media/team/badge/rqpwtr1421434717.png",
    HOU: "https://r2.thesportsdb.com/images/media/team/badge/wqyryy1421436627.png",
    IND: "https://r2.thesportsdb.com/images/media/team/badge/wqqvpx1421434058.png",
    JAX: "https://r2.thesportsdb.com/images/media/team/badge/0mrsd41546427902.png",
    KC: "https://r2.thesportsdb.com/images/media/team/badge/936t161515847222.png",
    LV: "https://r2.thesportsdb.com/images/media/team/badge/xqusqy1421724291.png",
    LAC: "https://r2.thesportsdb.com/images/media/team/badge/vrqanp1687734910.png",
    LAR: "https://r2.thesportsdb.com/images/media/team/badge/8e8v4i1599764614.png",
    MIA: "https://r2.thesportsdb.com/images/media/team/badge/trtusv1421435081.png",
    MIN: "https://r2.thesportsdb.com/images/media/team/badge/qstqqr1421609163.png",
    NE: "https://r2.thesportsdb.com/images/media/team/badge/xtwxyt1421431860.png",
    NO: "https://r2.thesportsdb.com/images/media/team/badge/nd46c71537821337.png",
    NYG: "https://r2.thesportsdb.com/images/media/team/badge/vxppup1423669459.png",
    NYJ: "https://r2.thesportsdb.com/images/media/team/badge/hz92od1607953467.png",
    PHI: "https://r2.thesportsdb.com/images/media/team/badge/pnpybf1515852421.png",
    PIT: "https://r2.thesportsdb.com/images/media/team/badge/2975411515853129.png",
    SF: "https://r2.thesportsdb.com/images/media/team/badge/bqbtg61539537328.png",
    SEA: "https://r2.thesportsdb.com/images/media/team/badge/wwuqyr1421434817.png",
    TB: "https://r2.thesportsdb.com/images/media/team/badge/2dfpdl1537820969.png",
    TEN: "https://r2.thesportsdb.com/images/media/team/badge/m48yia1515847376.png",
    WAS: "https://r2.thesportsdb.com/images/media/team/badge/rn0c7v1643826119.png",
  },
  MLB: {
    // MLB logos - using TheSportsDB badge URLs
    ARI: "https://r2.thesportsdb.com/images/media/team/badge/xe5wlo1713861863.png",
    ATL: "https://r2.thesportsdb.com/images/media/team/badge/yjs76e1617811496.png",
    BAL: "https://r2.thesportsdb.com/images/media/team/badge/ytywvu1431257088.png",
    BOS: "https://r2.thesportsdb.com/images/media/team/badge/stpsus1425120215.png",
    CHC: "https://r2.thesportsdb.com/images/media/team/badge/wxbe071521892391.png",
    CWS: "https://r2.thesportsdb.com/images/media/team/badge/yyz5dh1554140884.png",
    CIN: "https://r2.thesportsdb.com/images/media/team/badge/wspusr1431538832.png",
    CLE: "https://r2.thesportsdb.com/images/media/team/badge/3zvzao1640964590.png",
    COL: "https://r2.thesportsdb.com/images/media/team/badge/r7q6ko1687608395.png",
    DET: "https://r2.thesportsdb.com/images/media/team/badge/9dib6o1554032173.png",
    HOU: "https://r2.thesportsdb.com/images/media/team/badge/miwigx1521893583.png",
    KC: "https://r2.thesportsdb.com/images/media/team/badge/ii3rz81554031260.png",
    LAA: "https://r2.thesportsdb.com/images/media/team/badge/vswsvx1432577476.png",
    LAD: "https://r2.thesportsdb.com/images/media/team/badge/p2oj631663889783.png",
    MIA: "https://r2.thesportsdb.com/images/media/team/badge/0722fs1546001701.png",
    MIL: "https://r2.thesportsdb.com/images/media/team/badge/08kh2a1595775193.png",
    MIN: "https://r2.thesportsdb.com/images/media/team/badge/necd5v1521905719.png",
    NYM: "https://r2.thesportsdb.com/images/media/team/badge/rxqspq1431540337.png",
    NYY: "https://r2.thesportsdb.com/images/media/team/badge/wqwwxx1423478766.png",
    OAK: "https://r2.thesportsdb.com/images/media/team/badge/cyvrv31741640777.png",
    PHI: "https://r2.thesportsdb.com/images/media/team/badge/3xrldf1617528682.png",
    PIT: "https://r2.thesportsdb.com/images/media/team/badge/kw6uqr1617527138.png",
    SD: "https://r2.thesportsdb.com/images/media/team/badge/6wt1cn1617527530.png",
    SF: "https://r2.thesportsdb.com/images/media/team/badge/mq81yb1521896622.png",
    SEA: "https://r2.thesportsdb.com/images/media/team/badge/39x9ph1521903933.png",
    STL: "https://r2.thesportsdb.com/images/media/team/badge/uvyvyr1424003273.png",
    TB: "https://r2.thesportsdb.com/images/media/team/badge/littyt1554031623.png",
    TEX: "https://r2.thesportsdb.com/images/media/team/badge/qt9qki1521893151.png",
    TOR: "https://r2.thesportsdb.com/images/media/team/badge/f9zk3l1617527686.png",
    WSH: "https://r2.thesportsdb.com/images/media/team/badge/wpqrut1423694764.png",
  },
  NHL: {
    // NHL logos - using TheSportsDB badge URLs
    ANA: "https://r2.thesportsdb.com/images/media/team/badge/1d465t1719573796.png",
    UTA: "https://r2.thesportsdb.com/images/media/team/badge/w5m2ab1746690303.png", // Utah Mammoth (formerly Arizona Coyotes)
    BOS: "https://r2.thesportsdb.com/images/media/team/badge/b1r86e1720023232.png",
    BUF: "https://r2.thesportsdb.com/images/media/team/badge/3m3jhp1619536655.png",
    CGY: "https://r2.thesportsdb.com/images/media/team/badge/v8vkk11619536610.png",
    CAR: "https://r2.thesportsdb.com/images/media/team/badge/v07m3x1547232585.png",
    CHI: "https://r2.thesportsdb.com/images/media/team/badge/tuwyvr1422041801.png",
    COL: "https://r2.thesportsdb.com/images/media/team/badge/wqutut1421173572.png",
    CBJ: "https://r2.thesportsdb.com/images/media/team/badge/ssytwt1421792535.png",
    DAL: "https://r2.thesportsdb.com/images/media/team/badge/qrvywq1422042125.png",
    DET: "https://r2.thesportsdb.com/images/media/team/badge/1c24ow1546544080.png",
    EDM: "https://r2.thesportsdb.com/images/media/team/badge/uxxsyw1421618428.png",
    FLA: "https://r2.thesportsdb.com/images/media/team/badge/8qtaz11547158220.png",
    LAK: "https://r2.thesportsdb.com/images/media/team/badge/w408rg1719220748.png",
    MIN: "https://r2.thesportsdb.com/images/media/team/badge/swtsxs1422042685.png",
    MTL: "https://r2.thesportsdb.com/images/media/team/badge/stpryx1421791753.png",
    NSH: "https://r2.thesportsdb.com/images/media/team/badge/twqyvy1422052908.png",
    NJD: "https://r2.thesportsdb.com/images/media/team/badge/z4rsvp1619536740.png",
    NYI: "https://r2.thesportsdb.com/images/media/team/badge/hqn8511619536714.png",
    NYR: "https://www.thesportsdb.com/images/media/team/badge/ts2nhq1763454676.png",
    OTT: "https://r2.thesportsdb.com/images/media/team/badge/2tc1qy1619536592.png",
    PHI: "https://r2.thesportsdb.com/images/media/team/badge/qxxppp1421794965.png",
    PIT: "https://r2.thesportsdb.com/images/media/team/badge/dsj3on1546192477.png",
    SJS: "https://r2.thesportsdb.com/images/media/team/badge/yui7871546193006.png",
    SEA: "https://r2.thesportsdb.com/images/media/team/badge/zsx49m1595775836.png",
    STL: "https://r2.thesportsdb.com/images/media/team/badge/rsqtwx1422053715.png",
    TBL: "https://r2.thesportsdb.com/images/media/team/badge/swysut1421791822.png",
    TOR: "https://r2.thesportsdb.com/images/media/team/badge/mxig4p1570129307.png",
    VAN: "https://r2.thesportsdb.com/images/media/team/badge/xqxxpw1421875519.png",
    VGK: "https://r2.thesportsdb.com/images/media/team/badge/7fd4521619536689.png",
    WSH: "https://r2.thesportsdb.com/images/media/team/badge/99ca9a1638974052.png",
    WPG: "https://r2.thesportsdb.com/images/media/team/badge/bwn9hr1547233611.png",
  },
};

/**
 * Helper function to fetch team badge URL from TheSportsDB
 * This can be used to populate the TEAM_LOGOS object
 * @param {string} league - League name (NBA, NFL, MLB, NHL)
 * @param {string} teamName - Full team name
 * @returns {Promise<string|null>} Badge URL or null
 */
export async function fetchTeamBadgeUrl(league, teamName) {
  try {
    const leagueId = LEAGUE_IDS[league];
    if (!leagueId) return null;

    const API_KEY = "123"; // TheSportsDB free API key
    const url = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/searchteams.php?t=${encodeURIComponent(teamName)}`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.teams || data.teams.length === 0) return null;
    
    // Find team in the correct league
    const team = data.teams.find(t => 
      t.idLeague === leagueId || 
      t.strLeague === league
    );
    
    return team?.strTeamBadge || null;
  } catch (error) {
    console.error(`Error fetching badge for ${teamName}:`, error);
    return null;
  }
}

/**
 * Get team logo URL
 * @param {string} league - League name (NBA, NFL, MLB, NHL)
 * @param {string} teamAbbr - Team abbreviation
 * @returns {string|null} Logo URL or null if not available
 */
export function getTeamLogo(league, teamAbbr) {
  return TEAM_LOGOS[league]?.[teamAbbr] || null;
}
