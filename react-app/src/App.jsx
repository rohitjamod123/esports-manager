import { useState, useEffect } from 'react';
import api, { errorText } from './api';
import Login from './components/Login';
import TeamForm from './components/TeamForm';
import TeamList from './components/TeamList';
import TournamentList from './components/TournamentList';

export default function App() {
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [tab, setTab] = useState('teams');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

  // useEffect: load data once when the component mounts
  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [t, tr] = await Promise.all([api.get('/teams?sort=-points'), api.get('/tournaments?sort=startDate')]);
      setTeams(t.data);
      setTournaments(tr.data);
      setError('');
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  async function removeTeam(id) {
    if (!window.confirm('Delete this squad?')) return;
    try { await api.delete(`/teams/${id}`); loadData(); }
    catch (err) { setError(errorText(err)); }
  }

  return (
    <div className="app">
      <header className="top">
        <h1>BOOYAH<span>ARENA</span> <small>React dashboard</small></h1>
        {user
          ? <div>Hi, {user.name} ({user.role}) <button className="btn ghost" onClick={logout}>Logout</button></div>
          : <Login onLogin={setUser} />}
      </header>

      <nav className="tabs">
        <button className={tab === 'teams' ? 'on' : ''} onClick={() => setTab('teams')}>Squads ({teams.length})</button>
        <button className={tab === 'tournaments' ? 'on' : ''} onClick={() => setTab('tournaments')}>Tournaments ({tournaments.length})</button>
      </nav>

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}

      {/* conditional rendering */}
      {!loading && tab === 'teams' && (
        <>
          {user && <TeamForm onAdded={loadData} />}
          <TeamList teams={teams} isAdmin={user?.role === 'admin'} onDelete={removeTeam} />
        </>
      )}
      {!loading && tab === 'tournaments' && <TournamentList tournaments={tournaments} />}
    </div>
  );
}
