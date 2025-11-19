export default function StatsWidget(props) {
  return (
    <div className="p-3 border rounded">
      <h5>Upcoming Games</h5>
      <p>{props.team} vs Bears – Sunday 3:25 PM</p>
    </div>
  );
}
