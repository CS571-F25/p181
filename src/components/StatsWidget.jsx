import ScheduleCard from "./ScheduleCard";
import { fetchGamesByLeague } from "../services/sportsApi";
import { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";

export default function StatsWidget({ team, league }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!league) {
      setLoading(false);
      return;
    }

    const loadGames = async () => {
      try {
        setLoading(true);
        const fetchedGames = await fetchGamesByLeague(league);
        setGames(fetchedGames);
        setError(null);
      } catch (err) {
        setError("Failed to load games");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, [league]);

  if (!league) {
    return (
      <div className="p-3 border rounded">
        <h2>Upcoming Games</h2>
        <p className="text-muted">Select a league to see upcoming games</p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Loading games..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return <ScheduleCard games={games} league={league} title="Upcoming Games" />;
}
