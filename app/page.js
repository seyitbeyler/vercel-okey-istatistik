'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [finishType, setFinishType] = useState('');
  const [finishes, setFinishes] = useState([]);

  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editFinishType, setEditFinishType] = useState('');

  const fetchPlayers = async () => {
    const res = await fetch('/api/players');
    const data = await res.json();
    setPlayers(data);
  };

  const fetchFinishes = async () => {
    const res = await fetch('/api/finishes');
    const data = await res.json();
    setFinishes(data);
  };

  const addPlayer = async () => {
    if (!name) return;
    await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    setName('');
    fetchPlayers();
  };

  const addFinish = async () => {
    if (!selectedPlayer || !finishType) return;
    await fetch('/api/finishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: selectedPlayer, finish_type: finishType })
    });
    setSelectedPlayer('');
    setFinishType('');
    fetchFinishes();
    alert('Kayıt eklendi!');
  };

  const handleEdit = async () => {
    if (!editFinishType || !editingPlayerId) return;
    const playerFinishes = finishes.filter(f => f.player_id === editingPlayerId);
    const lastFinish = playerFinishes[playerFinishes.length - 1];
    if (!lastFinish) return alert('Güncellenecek kayıt yok.');

    await fetch('/api/finishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        player_id: editingPlayerId,
        finish_type: editFinishType
      })
    });

    setEditingPlayerId(null);
    setEditFinishType('');
    fetchFinishes();
    alert('Yeni kayıt olarak güncellendi.');
  };

  const handleDelete = async (playerId) => {
    const playerFinishes = finishes.filter(f => f.player_id === playerId);
    const lastFinish = playerFinishes[playerFinishes.length - 1];
    if (!lastFinish) return alert('Silinecek kayıt yok.');

    const confirmDelete = window.confirm('Son bitme kaydını silmek istediğine emin misin?');
    if (!confirmDelete) return;

    await fetch(`/api/finishes/${lastFinish.id}`, {
      method: 'DELETE'
    });

    fetchFinishes();
  };

  const handlePlayerDelete = async (playerId) => {
    const confirm = window.confirm('Oyuncuyu ve tüm bitme kayıtlarını silmek istiyor musun?');
    if (!confirm) return;

    await fetch(`/api/players/${playerId}`, {
      method: 'DELETE'
    });

    fetchPlayers();
    fetchFinishes();
  };

  useEffect(() => {
    fetchPlayers();
    fetchFinishes();
  }, []);

  const groupedStats = players.map((player) => {
    const playerFinishes = finishes.filter(f => f.player_id === player.id);
    const counts = {
      normal: 0,
      çift: 0,
      kafadan: 0,
      okeyle: 0,
      'çifte okey': 0,
      'kafadan okey': 0
    };
    playerFinishes.forEach(f => {
      if (f.finish_type in counts) {
        counts[f.finish_type]++;
      }
    });
    return {
      id: player.id,
      name: player.name,
      total:
        counts.normal +
        counts['çift'] +
        counts.kafadan +
        counts.okeyle +
        counts['çifte okey'] +
        counts['kafadan okey'],
      ...counts
    };
  });

  const mostFinishedPlayerId = groupedStats.reduce((max, player) => {
    return player.total > max.total ? player : max;
  }, { total: -1 }).id;

  return (
    <div style={{ padding: 20, maxWidth: '100%', margin: 'auto', fontFamily: 'sans-serif', overflowX: 'auto' }}>
      <h1 style={{ fontSize: '1.5rem' }}>101 Okey İstatistik</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Oyuncu adı"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 8, width: '100%', maxWidth: 400, fontSize: '1rem' }}
        />
        <button
          onClick={addPlayer}
          style={{ padding: 8, marginTop: 10, width: '100%', maxWidth: 150 }}
        >
          Ekle
        </button>
      </div>

      <h2>Oyuncular</h2>
      <ul>
        {players.map((p) => (
          <li key={p.id}>
            {p.name}
            <button
              onClick={() => handlePlayerDelete(p.id)}
              style={{ marginLeft: 10, color: 'red' }}
            >
              Sil
            </button>
          </li>
        ))}
      </ul>

      <hr style={{ margin: '30px 0' }} />
      <h2>Bitme Kaydı Ekle</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <select
          value={selectedPlayer}
          onChange={(e) => setSelectedPlayer(e.target.value)}
          style={{ padding: 8, fontSize: '1rem', width: '100%', maxWidth: 400 }}
        >
          <option value="">Oyuncu seç</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={finishType}
          onChange={(e) => setFinishType(e.target.value)}
          style={{ padding: 8, fontSize: '1rem', width: '100%', maxWidth: 400 }}
        >
          <option value="">Bitme türü seç</option>
          <option value="normal">Normal</option>
          <option value="çift">Çift</option>
          <option value="kafadan">Kafadan</option>
          <option value="okeyle">Okeyle</option>
          <option value="çifte okey">Çifte Okey</option>
          <option value="kafadan okey">Kafadan Okey</option>
        </select>

        <button onClick={addFinish} style={{ padding: 8, width: '100%', maxWidth: 150 }}>Kaydet</button>
      </div>

      <hr style={{ margin: '30px 0' }} />
      <h2>İstatistikler</h2>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1f2937', color: '#f9fafb' }}>
          <thead>
            <tr>
              <th style={thStyle}>Oyuncu</th>
              <th style={thStyle}>Normal</th>
              <th style={thStyle}>Çift</th>
              <th style={thStyle}>Kafadan</th>
              <th style={thStyle}>Okeyle</th>
              <th style={thStyle}>Çifte Okey</th>
              <th style={thStyle}>Kafadan Okey</th>
              <th style={thStyle}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {groupedStats.map((row) => (
              <tr
                key={row.id}
                style={{ backgroundColor: row.id === mostFinishedPlayerId ? '#065f46' : '#374151' }}
              >
                <td style={tdStyle}>
                  {row.name}
                  {row.id === mostFinishedPlayerId && <span style={{ marginLeft: 5, color: '#10b981' }}>⭐</span>}
                </td>
                <td style={tdStyle}>{row.normal}</td>
                <td style={tdStyle}>{row['çift']}</td>
                <td style={tdStyle}>{row.kafadan}</td>
                <td style={tdStyle}>{row.okeyle}</td>
                <td style={tdStyle}>{row['çifte okey']}</td>
                <td style={tdStyle}>{row['kafadan okey']}</td>
                <td style={tdStyle}>
                  {editingPlayerId === row.id ? (
                    <>
                      <select
                        value={editFinishType}
                        onChange={(e) => setEditFinishType(e.target.value)}
                        style={{ padding: 4 }}
                      >
                        <option value="">Tür seç</option>
                        <option value="normal">Normal</option>
                        <option value="çift">Çift</option>
                        <option value="kafadan">Kafadan</option>
                        <option value="okeyle">Okeyle</option>
                        <option value="çifte okey">Çifte Okey</option>
                        <option value="kafadan okey">Kafadan Okey</option>
                      </select>
                      <button onClick={handleEdit} style={{ marginLeft: 5 }}>Güncelle</button>
                      <button onClick={() => setEditingPlayerId(null)} style={{ marginLeft: 5 }}>İptal</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingPlayerId(row.id)}>Düzenle</button>
                      <button onClick={() => handleDelete(row.id)} style={{ marginLeft: 5, color: 'red' }}>Sil</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = {
  border: '1px solid #ccc',
  padding: '8px',
  backgroundColor: '#111827',
  color: '#f9fafb',
  fontSize: '0.9rem'
};

const tdStyle = {
  border: '1px solid #ccc',
  padding: '8px',
  fontSize: '0.9rem'
};