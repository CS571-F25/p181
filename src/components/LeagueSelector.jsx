import { Form } from "react-bootstrap";

export default function LeagueSelector({ selectedLeague, setSelectedLeague }) {
  return (
    <Form.Select 
      value={selectedLeague} 
      onChange={(e) => setSelectedLeague(e.target.value)}
      style={{ width: "25vw" }}
    >
      <option value="">Select a League</option>
      <option value="NFL">NFL</option>
      <option value="NBA">NBA</option>
      <option value="NHL">NHL</option>
      <option value="MLB">MLB</option>
    </Form.Select>
  );
}