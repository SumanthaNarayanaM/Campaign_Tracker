import React, { useEffect, useState } from 'react';
import './styles.css';
const API = process.env.REACT_APP_API || 'https://campaign-tracker-vlru.onrender.com/api' || 'http://localhost:5000/api';

function App() {
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState({ campaignName: '', clientName: '', startDate: '', status: 'Active' });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchCampaigns(); }, []);

  async function fetchCampaigns() {
  try {
    setLoading(true);
    const res = await fetch(`${API}/campaigns`); 
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
    const data = await res.json();
    setCampaigns(data);
  } catch (err) {
    console.error('Error fetching campaigns:', err);
    setCampaigns([]); 
  } finally {
    setLoading(false);
  }
}

  async function addCampaign(e) {
  e.preventDefault();
  if (!form.campaignName || !form.clientName || !form.startDate) {
    return alert('Please fill required fields');
  }
  try {
    setLoading(true);
    const res = await fetch(`${API}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const contentType = res.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? await res.json() : null;

    if (res.ok) {
      const newC = body || {}; 
      setCampaigns(prev => [newC, ...prev]);
      setForm({ campaignName: '', clientName: '', startDate: '', status: 'Active' });
    } else {
      const msg = (body && (body.error || body.message)) || `Failed: ${res.status} ${res.statusText}`;
      alert(msg);
    }
  } catch (err) {
    console.error('Add campaign failed:', err);
    alert('Network or server error. Check console/logs.');
  } finally {
    setLoading(false);
  }
}

  async function updateStatus(id, status) {
    try {
      const res = await fetch(`${API}/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        setCampaigns(prev => prev.map(c => c.id === id ? updated : c));
      }
    } catch (e) { console.error(e); }
  }

  async function deleteCampaign(id) {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      const res = await fetch(`${API}/campaigns/${id}`, { method: 'DELETE' });
      if (res.ok) setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (e) { console.error(e); }
  }

  const filtered = campaigns.filter(c => {
    if (filter !== 'All' && c.status !== filter) return false;
    if (search && !(`${c.campaignName} ${c.clientName}`.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'Active').length,
    paused: campaigns.filter(c => c.status === 'Paused').length,
    completed: campaigns.filter(c => c.status === 'Completed').length,
  };

  return (
    <div className="container">
      <header>
        <h1>Campaign Tracker</h1>
      </header>

      <section className="card">
        <h2>Add Campaign</h2>
        <form onSubmit={addCampaign} className="form">
          <input placeholder="Campaign Name" value={form.campaignName} onChange={e=>setForm({...form, campaignName: e.target.value})} />
          <input placeholder="Client Name" value={form.clientName} onChange={e=>setForm({...form, clientName: e.target.value})} />
          <input type="date" value={form.startDate} onChange={e=>setForm({...form, startDate: e.target.value})} />
          <select value={form.status} onChange={e=>setForm({...form, status: e.target.value})}>
            <option>Active</option>
            <option>Paused</option>
            <option>Completed</option>
          </select>
          <button type="submit">Add</button>
        </form>
      </section>

      <section className="card">
        <div className="toolbar">
          <div className="filters">
            <label>Filter:</label>
            <select value={filter} onChange={e=>setFilter(e.target.value)}>
              <option>All</option>
              <option>Active</option>
              <option>Paused</option>
              <option>Completed</option>
            </select>
            <input placeholder="Search" value={search} onChange={e=>setSearch(e.target.value)} />
            <button onClick={fetchCampaigns}>Refresh</button>
          </div>
          <div className="summary">
            <strong>Total:</strong> {stats.total} &nbsp; <strong>Active:</strong> {stats.active}
          </div>
        </div>

        <h2>Campaigns</h2>
        {loading ? <div>Loading...</div> : (
          <table className="campaign-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Client</th>
                <th>Start Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>{c.campaignName}</td>
                  <td>{c.clientName}</td>
                  <td>{new Date(c.startDate).toLocaleDateString()}</td>
                  <td>
                    <select value={c.status} onChange={e=>updateStatus(c.id, e.target.value)}>
                      <option>Active</option>
                      <option>Paused</option>
                      <option>Completed</option>
                    </select>
                  </td>
                  <td>
                    <button className="btn-danger" onClick={()=>deleteCampaign(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && (<tr><td colSpan="5">No campaigns found.</td></tr>)}
            </tbody>
          </table>
        )}
      </section>
      <footer className="footer"> Simple Campaign Tracker powred by Sumantha Narayana M</footer>
      </div>
  );
}

export default App;
