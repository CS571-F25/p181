import { Form } from "react-bootstrap";
import { TEAMS } from "../sports";

export default function TeamSelector({ selectedTeam, setSelectedTeam, league, id }) {
  return (
    <Form.Select 
      id={id || "team-selector"}
      value={selectedTeam} 
      onChange={(e) => setSelectedTeam(e.target.value)}
      style={{ width: "25vw", minWidth: "200px" }}
      aria-label={league ? "Select a team" : "Please select a league first"}
      disabled={!league}
    >
      {league ? (
        <>
          <option value="">Select a Team</option>
          {TEAMS[league].map((team) => (
            <option key={team.abbreviation} value={team.abbreviation}>
              {team.name}
            </option>
          ))}
        </>
      ) : (
        <option value="">Please select a league first</option>
      )}
    </Form.Select>
  );
}
