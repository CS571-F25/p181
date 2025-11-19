export default function FavoritesList({ favorites }) {
  return (
    <div>
      <h4>Your Favorites</h4>
      <ul>
        {favorites.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
    </div>
  );
}
