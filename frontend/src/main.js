async function recommend() {
  // Read existing profile fields
  const creditScore = Number(document.getElementById('creditScore').value);
  const accountsOpened24 = Number(document.getElementById('accounts24').value);
  // derive isStudent if the UI doesn't expose it directly (simple heuristic: low age not available, so rely on checkbox later)
  const isStudent = !!document.getElementById('isStudent') && document.getElementById('isStudent').checked;
  const profile = { creditScore, accountsOpened24, isStudent };
  // Read new extended profile fields
  const ecosystem = document.getElementById('ecosystem') ? document.getElementById('ecosystem').value : 'Any';
  const travelFrequencyEl = document.querySelector('input[name="travelFrequency"]:checked');
  const travelFrequency = travelFrequencyEl ? travelFrequencyEl.value : 'Never';
  const rewardPreferenceEl = document.querySelector('input[name="rewardPreference"]:checked');
  const rewardPreference = rewardPreferenceEl ? rewardPreferenceEl.value : 'Cash Back';
  const spending = {
    groceries: Number(document.getElementById('spend_groceries').value) || 0,
    dining: Number(document.getElementById('spend_dining').value) || 0,
    travel: Number(document.getElementById('spend_travel').value) || 0
  };
  // read owned cards from dynamically generated checkboxes and convert to card NAMES (required)
  const ownedCards = Array.from(document.querySelectorAll('input[name="owned_card"]:checked')).map(cb => {
    // each checkbox's sibling span holds the name text; prefer using dataset if available
    const label = cb.parentElement && cb.parentElement.querySelector('span');
    return label ? label.textContent.split(' (')[0] : cb.value;
  });

  // build the extended profile expected by backend
  profile.preferredEcosystem = ecosystem;
  profile.travelFrequency = travelFrequency;
  profile.rewardPreference = rewardPreference;

  const body = { profile, spending, ownedCards };
  console.log('Recommendation request body:', JSON.parse(JSON.stringify(body)));
  const res = await fetch('http://localhost:4000/api/cards/recommend', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  const json = await res.json();
  renderResults(json);
}

function renderResults(data) {
  const el = document.getElementById('results');
  el.innerHTML = '';
  if (!data) return;
  const bestByCategory = data.bestByCategory || {};
  const bestOverall = data.bestOverall || [];

  const byCatHtml = Object.entries(bestByCategory).map(([cat, v]) => `<li><strong>${cat}</strong>: ${v.name} (${v.rate}% back)</li>`).join('');
  const overallHtml = bestOverall.slice(0, 3).map((o, idx) => `<li>${idx + 1}. ${o.name} — $${o.estimates.annual}/yr ${o.owned ? '(you own this)' : ''}</li>`).join('');

  el.innerHTML = `
    <div class="p-4 bg-white rounded shadow">
      <h3 class="font-semibold text-lg mb-2">Best by Category</h3>
      <ul class="list-disc ml-5 mb-4">${byCatHtml}</ul>

      <h3 class="font-semibold text-lg mb-2">Top 3 Recommended Cards</h3>
      <ul class="list-decimal ml-5">${overallHtml}</ul>
    </div>
  `;
}

function loadSample() {
  // load sample spending/profile from data files (via fetch) or just set default values
  document.getElementById('creditScore').value = 740;
  document.getElementById('accounts24').value = 0;
  document.getElementById('spend_groceries').value = 500;
  document.getElementById('spend_dining').value = 150;
  document.getElementById('spend_travel').value = 200;
}

document.getElementById('btnRecommend').addEventListener('click', recommend);
document.getElementById('btnLoadSample').addEventListener('click', loadSample);

// small helper to fetch card list (unused but handy)
async function fetchCards() {
  const res = await fetch('http://localhost:4000/api/cards');
  return res.json();
}

// populate owned cards checkboxes using the card catalog
async function populateOwnedCards() {
  try {
    const cards = await fetchCards();
    const container = document.getElementById('ownedCardsList');
    if (!container) return;
    container.innerHTML = '';
    cards.forEach(card => {
      // create a checkbox per card with name=owned_card and value=card.id
      const id = `owned_card_${card.id}`;
      const wrapper = document.createElement('label');
      wrapper.className = 'flex items-center gap-2';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'owned_card';
      input.id = id;
      input.value = card.id;
      const span = document.createElement('span');
      span.textContent = `${card.name} (${card.issuer})`;
      wrapper.appendChild(input);
      wrapper.appendChild(span);
      container.appendChild(wrapper);
    });
  } catch (err) {
    console.error('Could not populate owned cards', err);
  }
}

// run on load
populateOwnedCards();
