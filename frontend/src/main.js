async function recommend() {
  const creditScore = Number(document.getElementById('creditScore').value);
  const accountsOpened24 = Number(document.getElementById('accounts24').value);
  const isStudent = !!document.getElementById('isStudent') && document.getElementById('isStudent').checked;
  
  const profile = { creditScore, accountsOpened24, isStudent };
  
  const ecosystem = document.getElementById('ecosystem') ? document.getElementById('ecosystem').value : 'Any';
  const travelFrequencyEl = document.querySelector('input[name="travelFrequency"]:checked');
  const travelFrequency = travelFrequencyEl ? travelFrequencyEl.value : 'Never';
  const rewardPreferenceEl = document.querySelector('input[name="rewardPreference"]:checked');
  const rewardPreference = rewardPreferenceEl ? rewardPreferenceEl.value : 'Cash Back';
  
  const spending = {
    groceries: Number(document.getElementById('spend_groceries').value) || 0,
    dining: Number(document.getElementById('spend_dining').value) || 0,
    travel: Number(document.getElementById('spend_travel').value) || 0,
    other: Number(document.getElementById('spend_other').value) || 0
  };
  
  profile.preferredEcosystem = ecosystem;
  profile.travelFrequency = travelFrequency;
  profile.rewardPreference = rewardPreference;
  
  const body = { profile, spending };
  console.log('Recommendation request body:', JSON.parse(JSON.stringify(body)));
  
  try {
    const res = await fetch('http://localhost:4000/api/cards/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    renderResults(json);
  } catch (err) {
    console.error('Fetch error:', err);
    alert('Error fetching recommendations. Make sure backend is running on port 4000.');
  }
}

function renderResults(data) {
  const el = document.getElementById('results');
  el.innerHTML = '';
  if (!data) return;
  
  const bestByCategory = data.bestByCategory || {};
  const bestOverall = data.bestOverall || [];
  
  const byCatHtml = Object.entries(bestByCategory)
    .map(([cat, v]) => `<li><strong>${cat}</strong>: ${v.name} (${v.rate}% back)</li>`)
    .join('');
  
  const overallHtml = bestOverall
    .slice(0, 3)
    .map((o) => `<li class="mb-2"><strong>${o.name}</strong> — $${o.estimates.annual}/yr</li>`)
    .join('');
  
  el.innerHTML = `
    <div class="p-4 bg-white rounded shadow">
      <h3 class="font-semibold text-lg mb-2">Best by Category</h3>
      <ul class="list-disc ml-5 mb-4">${byCatHtml || '<li>No recommendations</li>'}</ul>
      
      <h3 class="font-semibold text-lg mb-2">Top 3 Recommended Cards</h3>
      <ul class="list-decimal ml-5">${overallHtml || '<li>No recommendations</li>'}</ul>
    </div>
  `;
}

function loadSample() {
  document.getElementById('creditScore').value = 740;
  document.getElementById('accounts24').value = 0;
  document.getElementById('spend_groceries').value = 500;
  document.getElementById('spend_dining').value = 150;
  document.getElementById('spend_travel').value = 200;
  document.getElementById('spend_other').value = 0;
}

document.getElementById('btnRecommend').addEventListener('click', recommend);
document.getElementById('btnLoadSample').addEventListener('click', loadSample);
