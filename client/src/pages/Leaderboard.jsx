/**
 * Leaderboard Page - Global and Weekly Rankings
 */
import React, { useEffect, useState } from 'react';
import { Trophy, Zap, Medal } from 'lucide-react';
import api from '../services/api';
import './Leaderboard.css';

const MEDALS = ['🥇', '🥈', '🥉'];

const Leaderboard = () => {
  const [tab, setTab] = useState('global');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/leaderboard/${tab}`)
      .then(res => setData(res.data.leaderboard || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="page">
      <div className="container-sm">
        <div className="lb-header animate-fadeIn">
          <div className="lb-icon">
            <Trophy size={32} fill="#f59e0b" color="#f59e0b" />
          </div>
          <div>
            <div className="section-eyebrow">Rankings</div>
            <h1 style={{ marginBottom: 4 }}>Leaderboard</h1>
            <p style={{ color: 'var(--gray-500)' }}>Top players by score</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="lb-tabs animate-slideUp">
          <button
            className={`lb-tab ${tab === 'global' ? 'active' : ''}`}
            onClick={() => setTab('global')}
          >
            🌍 All Time
          </button>
          <button
            className={`lb-tab ${tab === 'weekly' ? 'active' : ''}`}
            onClick={() => setTab('weekly')}
          >
            📅 This Week
          </button>
        </div>

        {/* Top 3 Podium */}
        {!loading && data.length >= 3 && (
          <div className="podium animate-bounceIn">
            {[data[1], data[0], data[2]].map((player, pos) => {
              const actualRank = pos === 1 ? 1 : pos === 0 ? 2 : 3;
              const heights = ['160px', '200px', '140px'];
              return (
                <div key={pos} className={`podium-place rank-${actualRank}`} style={{ '--height': heights[pos] }}>
                  {player.avatar ? (
                    <img src={player.avatar} alt={player.name} className="avatar avatar-md podium-avatar" />
                  ) : (
                    <div className="avatar avatar-md podium-avatar">{player.name?.charAt(0)}</div>
                  )}
                  <div className="podium-medal">{MEDALS[actualRank - 1]}</div>
                  <div className="podium-name">{player.name?.split(' ')[0]}</div>
                  <div className="podium-score">{(player.totalScore || player.weeklyScore || 0).toLocaleString()}</div>
                  <div className="podium-block" style={{ height: heights[pos] }} />
                </div>
              );
            })}
          </div>
        )}

        {/* Full List */}
        <div className="lb-list card animate-slideUp">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : data.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--gray-500)' }}>
              <Medal size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p>No rankings yet. Play some games!</p>
            </div>
          ) : (
            data.map((player, i) => (
              <div key={i} className="lb-row">
                <div className="lb-rank">
                  {i < 3 ? MEDALS[i] : <span>#{i + 1}</span>}
                </div>
                {player.avatar ? (
                  <img src={player.avatar} alt={player.name} className="avatar avatar-md" />
                ) : (
                  <div className="avatar avatar-md">{player.name?.charAt(0)}</div>
                )}
                <div className="lb-info">
                  <div className="lb-name">{player.name}</div>
                  <div className="lb-meta">
                    {player.gamesPlayed} games · {player.wins} wins
                    {player.avgAccuracy ? ` · ${player.avgAccuracy}% accuracy` : ''}
                  </div>
                </div>
                <div className="lb-score-col">
                  <div className="lb-score-value">
                    <Zap size={14} fill="var(--blue-500)" color="var(--blue-500)" />
                    {(player.totalScore || player.weeklyScore || 0).toLocaleString()}
                  </div>
                  <div className="lb-score-label">points</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
