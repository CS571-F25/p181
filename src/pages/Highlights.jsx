import HighlightCard from "../components/HighlightCard";

export default function Highlights() {
  return (
    <div>
      <h1>Latest Highlights</h1>

      <HighlightCard 
        title="Bulls Win in Overtime"
        description="DeMar DeRozan hits the game winner."
        videoUrl="https://youtube.com"
      />
    </div>
  );
}
