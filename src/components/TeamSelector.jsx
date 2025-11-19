import { Form } from "react-bootstrap";
import { TEAMS } from "../sports";

export default function TeamSelector({ selectedTeam, setSelectedTeam, league }) {
  return (
    <Form.Select 
      value={selectedTeam} 
      onChange={(e) => setSelectedTeam(e.target.value)}
      style={{ width: "25vw" }}
    >
    {
    league? (
    TEAMS[league].map((team) => (
    <option value={team.abbreviation}>{team.name}</option>
    ))
    ) : (<option value="">Please select a league first</option>)
  }
    </Form.Select>
  );
}
