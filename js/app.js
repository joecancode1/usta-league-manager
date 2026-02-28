// ===== State =====
const state = {
  teams: [],
  matches: [],
};

// ===== Persistence =====
function loadState() {
  try {
    const saved = localStorage.getItem('usta-league-manager');
    if (saved) Object.assign(state, JSON.parse(saved));
  } catch (_) {}
}

function saveState() {
  localStorage.setItem('usta-league-manager', JSON.stringify(state));
}

// ===== Navigation =====
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.section).classList.add('active');
    if (btn.dataset.section === 'standings') renderStandings();
  });
});

// ===== Teams =====
document.getElementById('add-team-btn').addEventListener('click', () => {
  document.getElementById('team-form').classList.remove('hidden');
  document.getElementById('team-name').focus();
});

document.getElementById('cancel-team-btn').addEventListener('click', () => {
  clearTeamForm();
  document.getElementById('team-form').classList.add('hidden');
});

document.getElementById('save-team-btn').addEventListener('click', () => {
  const name = document.getElementById('team-name').value.trim();
  const captain = document.getElementById('team-captain').value.trim();
  const level = document.getElementById('team-level').value;

  if (!name || !level) {
    alert('Team name and NTRP level are required.');
    return;
  }

  state.teams.push({ id: Date.now(), name, captain, level, wins: 0, losses: 0, setsWon: 0, setsLost: 0 });
  saveState();
  renderTeams();
  populateMatchSelects();
  clearTeamForm();
  document.getElementById('team-form').classList.add('hidden');
});

function clearTeamForm() {
  document.getElementById('team-name').value = '';
  document.getElementById('team-captain').value = '';
  document.getElementById('team-level').value = '';
}

function renderTeams() {
  const list = document.getElementById('team-list');
  if (state.teams.length === 0) {
    list.innerHTML = '<li class="empty-state">No teams yet. Add one above.</li>';
    return;
  }
  list.innerHTML = state.teams.map(t => `
    <li class="card-item">
      <div class="info">
        <strong>${escape(t.name)}</strong>
        <span>Captain: ${escape(t.captain) || '—'} &nbsp;|&nbsp; NTRP: ${t.level}</span>
      </div>
      <button class="btn-danger" onclick="removeTeam(${t.id})">Remove</button>
    </li>
  `).join('');
}

function removeTeam(id) {
  if (!confirm('Remove this team?')) return;
  state.teams = state.teams.filter(t => t.id !== id);
  state.matches = state.matches.filter(m => m.homeId !== id && m.awayId !== id);
  saveState();
  renderTeams();
  renderMatches();
  populateMatchSelects();
}

// ===== Matches =====
document.getElementById('add-match-btn').addEventListener('click', () => {
  if (state.teams.length < 2) {
    alert('Add at least two teams before scheduling a match.');
    return;
  }
  populateMatchSelects();
  document.getElementById('match-form').classList.remove('hidden');
  document.getElementById('match-date').focus();
});

document.getElementById('cancel-match-btn').addEventListener('click', () => {
  clearMatchForm();
  document.getElementById('match-form').classList.add('hidden');
});

document.getElementById('save-match-btn').addEventListener('click', () => {
  const homeId = parseInt(document.getElementById('match-home').value);
  const awayId = parseInt(document.getElementById('match-away').value);
  const date = document.getElementById('match-date').value;
  const location = document.getElementById('match-location').value.trim();

  if (!homeId || !awayId || !date) {
    alert('Both teams and a date are required.');
    return;
  }
  if (homeId === awayId) {
    alert('Home and away teams must be different.');
    return;
  }

  state.matches.push({ id: Date.now(), homeId, awayId, date, location, homeScore: null, awayScore: null });
  saveState();
  renderMatches();
  clearMatchForm();
  document.getElementById('match-form').classList.add('hidden');
});

function clearMatchForm() {
  document.getElementById('match-home').value = '';
  document.getElementById('match-away').value = '';
  document.getElementById('match-date').value = '';
  document.getElementById('match-location').value = '';
}

function populateMatchSelects() {
  const options = state.teams.map(t => `<option value="${t.id}">${escape(t.name)}</option>`).join('');
  document.getElementById('match-home').innerHTML = `<option value="">-- Select --</option>${options}`;
  document.getElementById('match-away').innerHTML = `<option value="">-- Select --</option>${options}`;
}

function teamName(id) {
  const t = state.teams.find(t => t.id === id);
  return t ? t.name : 'Unknown';
}

function renderMatches() {
  const list = document.getElementById('match-list');
  if (state.matches.length === 0) {
    list.innerHTML = '<li class="empty-state">No matches scheduled yet.</li>';
    return;
  }
  const sorted = [...state.matches].sort((a, b) => a.date.localeCompare(b.date));
  list.innerHTML = sorted.map(m => {
    const result = m.homeScore !== null
      ? `${m.homeScore} – ${m.awayScore}`
      : '<em>Pending</em>';
    return `
      <li class="card-item">
        <div class="info">
          <strong>${escape(teamName(m.homeId))} vs ${escape(teamName(m.awayId))}</strong>
          <span>${m.date}${m.location ? ' &nbsp;|&nbsp; ' + escape(m.location) : ''} &nbsp;|&nbsp; ${result}</span>
        </div>
        <div style="display:flex;gap:0.5rem;align-items:center;">
          ${m.homeScore === null ? `<button class="btn-secondary" style="font-size:0.8rem;padding:0.3rem 0.7rem" onclick="recordResult(${m.id})">Score</button>` : ''}
          <button class="btn-danger" onclick="removeMatch(${m.id})">Remove</button>
        </div>
      </li>
    `;
  }).join('');
}

function recordResult(id) {
  const match = state.matches.find(m => m.id === id);
  if (!match) return;
  const home = prompt(`Sets won by ${teamName(match.homeId)}:`);
  const away = prompt(`Sets won by ${teamName(match.awayId)}:`);
  if (home === null || away === null) return;
  const h = parseInt(home), a = parseInt(away);
  if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
    alert('Please enter valid non-negative numbers.');
    return;
  }
  match.homeScore = h;
  match.awayScore = a;

  // Update team records
  const homeTeam = state.teams.find(t => t.id === match.homeId);
  const awayTeam = state.teams.find(t => t.id === match.awayId);
  if (homeTeam && awayTeam) {
    homeTeam.setsWon += h; homeTeam.setsLost += a;
    awayTeam.setsWon += a; awayTeam.setsLost += h;
    if (h > a) { homeTeam.wins++; awayTeam.losses++; }
    else if (a > h) { awayTeam.wins++; homeTeam.losses++; }
  }

  saveState();
  renderMatches();
}

function removeMatch(id) {
  if (!confirm('Remove this match?')) return;
  state.matches = state.matches.filter(m => m.id !== id);
  saveState();
  renderMatches();
}

// ===== Standings =====
function renderStandings() {
  const tbody = document.getElementById('standings-body');
  if (state.teams.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No teams yet.</td></tr>';
    return;
  }
  const sorted = [...state.teams].sort((a, b) => b.wins - a.wins || b.setsWon - a.setsWon);
  tbody.innerHTML = sorted.map((t, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${escape(t.name)}</strong></td>
      <td>${t.wins}</td>
      <td>${t.losses}</td>
      <td>${t.setsWon}</td>
      <td>${t.setsLost}</td>
    </tr>
  `).join('');
}

// ===== Utility =====
function escape(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ===== Init =====
loadState();
renderTeams();
renderMatches();
populateMatchSelects();
