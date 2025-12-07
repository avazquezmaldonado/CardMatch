// Get recommendation button handler
// This function reads all the form inputs and sends them to the backend
// Store current recommendations for export
let lastRecommendations = null;

async function recommend() {
  // Get credit score from input
  const creditScore = Number(document.getElementById('creditScore').value);
  // Get number of accounts opened in last 24 months
  const accountsOpened24 = Number(document.getElementById('accounts24').value);
  // Check if user checked the student checkbox
  const isStudent = !!document.getElementById('isStudent') && document.getElementById('isStudent').checked;
  
  // Create profile object with basic info
  const profile = { creditScore, accountsOpened24, isStudent };
  
  // Get ecosystem preference (Chase, Amex, etc)
  const ecosystem = document.getElementById('ecosystem') ? document.getElementById('ecosystem').value : 'Any';
  // Get selected travel frequency radio button
  const travelFrequencyEl = document.querySelector('input[name="travelFrequency"]:checked');
  const travelFrequency = travelFrequencyEl ? travelFrequencyEl.value : 'Never';
  // Get selected reward preference radio button
  const rewardPreferenceEl = document.querySelector('input[name="rewardPreference"]:checked');
  const rewardPreference = rewardPreferenceEl ? rewardPreferenceEl.value : 'Cash Back';
  
  // Get monthly spending amounts from form
  const spending = {
    groceries: Number(document.getElementById('spend_groceries').value) || 0,
    dining: Number(document.getElementById('spend_dining').value) || 0,
    travel: Number(document.getElementById('spend_travel').value) || 0,
    other: Number(document.getElementById('spend_other').value) || 0
  };
  
  // Add the preferences to the profile object
  profile.preferredEcosystem = ecosystem;
  profile.travelFrequency = travelFrequency;
  profile.rewardPreference = rewardPreference;
  
  // Create request body with profile and spending info
  const body = { profile, spending };
  console.log('Sending request to backend:', body);
  
  // Try to fetch recommendations from the backend
  try {
    const res = await fetch('http://localhost:4000/api/cards/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    // Check if there was an error response
    if (!res.ok) {
      alert('Error: ' + (json.error || 'Unknown error'));
      return;
    }
    // Store recommendations for export
    lastRecommendations = json;
    // Display the results on the page
    renderResults(json);
    // Show export button
    document.getElementById('btnExport').style.display = 'inline-block';
  } catch (err) {
    console.error('Error:', err);
    alert('Error fetching recommendations. Make sure backend is running on port 4000.');
  }
}

// Export recommendations as JSON file
function exportResults() {
  // If no recommendations, don't export
  if (!lastRecommendations) {
    alert('No recommendations to export. Please get recommendations first.');
    return;
  }
  
  // Create JSON data with timestamp
  const exportData = {
    exportedAt: new Date().toISOString(),
    recommendations: lastRecommendations
  };
  
  // Convert to JSON string
  const json = JSON.stringify(exportData, null, 2);
  
  // Create a blob and download link
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cardmatch-recommendations-${Date.now()}.json`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Display the recommendation results on the page
function renderResults(data) {
  // Get the results section
  const el = document.getElementById('results');
  // Clear any previous results
  el.innerHTML = '';
  // If no data, don't show anything
  if (!data) return;
  
  // Get the best cards by category and best overall cards
  const bestByCategory = data.bestByCategory || {};
  const bestOverall = data.bestOverall || [];
  
  // Create HTML for best by category section
  let byCatHtml = '';
  for (const [cat, v] of Object.entries(bestByCategory)) {
    byCatHtml += `<li><strong>${cat}</strong>: ${v.name} (${v.rate}% back)</li>`;
  }
  
  // Create HTML for top 3 recommended cards
  let overallHtml = '';
  for (let i = 0; i < Math.min(3, bestOverall.length); i++) {
    const card = bestOverall[i];
    overallHtml += `<li class="mb-2"><strong>${card.name}</strong> — $${card.estimates.annual}/yr</li>`;
  }
  
  // Show the results in the page
  el.innerHTML = `
    <div class="p-4 bg-white rounded shadow">
      <h3 class="font-semibold text-lg mb-2">Best by Category</h3>
      <ul class="list-disc ml-5 mb-4">${byCatHtml || '<li>No recommendations</li>'}</ul>
      
      <h3 class="font-semibold text-lg mb-2">Top 3 Recommended Cards</h3>
      <ul class="list-decimal ml-5">${overallHtml || '<li>No recommendations</li>'}</ul>
    </div>
  `;
}

// Load sample data into the form
function loadSample() {
  // Set example credit score
  document.getElementById('creditScore').value = 740;
  // Set example accounts opened
  document.getElementById('accounts24').value = 0;
  // Set example spending amounts
  document.getElementById('spend_groceries').value = 500;
  document.getElementById('spend_dining').value = 150;
  document.getElementById('spend_travel').value = 200;
  document.getElementById('spend_other').value = 0;
}

// Save form data to localStorage
function saveFormData() {
  const formData = {
    creditScore: document.getElementById('creditScore').value,
    accounts24: document.getElementById('accounts24').value,
    isStudent: document.getElementById('isStudent') ? document.getElementById('isStudent').checked : false,
    ecosystem: document.getElementById('ecosystem') ? document.getElementById('ecosystem').value : '',
    travelFrequency: document.querySelector('input[name="travelFrequency"]:checked') ? document.querySelector('input[name="travelFrequency"]:checked').value : '',
    rewardPreference: document.querySelector('input[name="rewardPreference"]:checked') ? document.querySelector('input[name="rewardPreference"]:checked').value : '',
    spend_groceries: document.getElementById('spend_groceries').value,
    spend_dining: document.getElementById('spend_dining').value,
    spend_travel: document.getElementById('spend_travel').value,
    spend_other: document.getElementById('spend_other').value
  };
  localStorage.setItem('cardmatchFormData', JSON.stringify(formData));
}

// Load form data from localStorage
function loadFormData() {
  const saved = localStorage.getItem('cardmatchFormData');
  if (saved) {
    try {
      const formData = JSON.parse(saved);
      if (formData.creditScore) document.getElementById('creditScore').value = formData.creditScore;
      if (formData.accounts24) document.getElementById('accounts24').value = formData.accounts24;
      if (formData.isStudent && document.getElementById('isStudent')) document.getElementById('isStudent').checked = formData.isStudent;
      if (formData.ecosystem && document.getElementById('ecosystem')) document.getElementById('ecosystem').value = formData.ecosystem;
      if (formData.spend_groceries) document.getElementById('spend_groceries').value = formData.spend_groceries;
      if (formData.spend_dining) document.getElementById('spend_dining').value = formData.spend_dining;
      if (formData.spend_travel) document.getElementById('spend_travel').value = formData.spend_travel;
      if (formData.spend_other) document.getElementById('spend_other').value = formData.spend_other;
      // Set radio buttons
      if (formData.travelFrequency) {
        const travelEl = document.querySelector(`input[name="travelFrequency"][value="${formData.travelFrequency}"]`);
        if (travelEl) travelEl.checked = true;
      }
      if (formData.rewardPreference) {
        const rewardEl = document.querySelector(`input[name="rewardPreference"][value="${formData.rewardPreference}"]`);
        if (rewardEl) rewardEl.checked = true;
      }
    } catch (e) {
      console.error('Error loading form data:', e);
    }
  }
}

// Add event listeners when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadFormData();
  document.getElementById('btnRecommend').addEventListener('click', function() {
    recommend();
    saveFormData();
  });
  document.getElementById('btnLoadSample').addEventListener('click', loadSample);
  document.getElementById('btnExport').addEventListener('click', exportResults);
});
