// Props: teams (array), isAdmin (bool), onDelete (function)
export default function TeamList({ teams, isAdmin, onDelete }) {
  if (teams.length === 0) return <p>No squads yet.</p>;

  return (
    <div className="grid">
      {/* list rendering with keys */}
      {teams.map((t, i) => (
        <article className="card" key={t._id}>
          <span className="chip">{t.tag}</span>
          <h3>#{i + 1} {t.name}</h3>
          <p>Captain: {t.captain} · {t.region}</p>
          <p><b>{t.wins}</b> wins · <b>{t.points}</b> points</p>
          {isAdmin && <button className="btn danger" onClick={() => onDelete(t._id)}>Delete</button>}
        </article>
      ))}
    </div>
  );
}
