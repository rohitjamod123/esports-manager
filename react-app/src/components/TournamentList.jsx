export default function TournamentList({ tournaments }) {
  return (
    <div className="grid">
      {tournaments.map((t) => (
        <article className="card" key={t._id}>
          <span className={`status ${t.status}`}>{t.status}</span>
          <h3>{t.title}</h3>
          <p className="prize">₹{t.prize.toLocaleString('en-IN')}</p>
          <p>{t.mode} · {new Date(t.startDate).toLocaleDateString('en-IN')}</p>
          <p>{t.teams.length}/{t.slots} squads registered</p>
        </article>
      ))}
    </div>
  );
}
