import { Form } from "react-bootstrap";

export default function LeagueSelector({ selectedLeague, setSelectedLeague, id, includeAll = false }) {
  return (
    <Form.Select 
      id={id || "league-selector"}
      value={selectedLeague} 
      onChange={(e) => setSelectedLeague(e.target.value)}
      style={{ width: "25vw", minWidth: "200px" }}
      aria-label="Select a sports league"
    >
      <option value="">All Leagues</option>
      <option value="NFL">NFL</option>
      <option value="NBA">NBA</option>
      <option value="NHL">NHL</option>
      <option value="MLB">MLB</option>
    </Form.Select>
  );
}