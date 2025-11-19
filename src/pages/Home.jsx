import { useState } from "react";
import TeamSelector from "../components/Teamselector";
import StatsWidget from "../components/StatsWidget";
import LeagueSelector from "../components/LeagueSelector";

export default function Home() {
  const [team, setTeam] = useState("");
  const [league, setLeague] = useState("");

  return (
    <div className="w-100">
      <h1>Welcome to Sports Tracker</h1>
      
      <div className="mb-3">
        <LeagueSelector selectedLeague={league} setSelectedLeague={setLeague} />
        <div style={{ marginTop: "10px", marginBottom: "5px" }} />
        <TeamSelector selectedTeam={team} setSelectedTeam={setTeam} league={league}/>
      </div>

      <p className="mt-2">Selected Team: {team || "None"}</p>

      <StatsWidget team={team}/>
    </div>
  );
}
