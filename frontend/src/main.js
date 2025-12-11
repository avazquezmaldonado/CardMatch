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
    // Render spending pie chart
    renderSpendingChart(spending);
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
  
  // Get current profile and spending data from the form
  const profile = {
    creditScore: Number(document.getElementById('creditScore').value),
    accountsOpened24: Number(document.getElementById('accounts24').value),
    isStudent: !!document.getElementById('isStudent') && document.getElementById('isStudent').checked,
    preferredEcosystem: document.getElementById('ecosystem') ? document.getElementById('ecosystem').value : 'Any',
    travelFrequency: document.querySelector('input[name="travelFrequency"]:checked')?.value || 'Never',
    rewardPreference: document.querySelector('input[name="rewardPreference"]:checked')?.value || 'Cash Back'
  };
  
  const spending = {
    groceries: Number(document.getElementById('spend_groceries').value) || 0,
    dining: Number(document.getElementById('spend_dining').value) || 0,
    travel: Number(document.getElementById('spend_travel').value) || 0,
    other: Number(document.getElementById('spend_other').value) || 0
  };
  
  // Create JSON data with timestamp, profile, spending, and recommendations
  const exportData = {
    exportedAt: new Date().toISOString(),
    profile: profile,
    spending: spending,
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

// Import previously exported recommendations
function importResults(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Check if it's a JSON file
  if (!file.name.endsWith('.json')) {
    alert('Please select a valid JSON file.');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      
      // Validate the imported data structure
      if (!importedData.recommendations || !importedData.exportedAt) {
        alert('Invalid file format. Please select a file exported from CardMatch.');
        return;
      }
      
      // Store the imported recommendations
      lastRecommendations = importedData.recommendations;
      
      // If profile and spending data exists, populate the form
      if (importedData.profile) {
        document.getElementById('creditScore').value = importedData.profile.creditScore || 720;
        document.getElementById('accounts24').value = importedData.profile.accountsOpened24 || 0;
        if (document.getElementById('isStudent')) {
          document.getElementById('isStudent').checked = importedData.profile.isStudent || false;
        }
        if (document.getElementById('ecosystem')) {
          document.getElementById('ecosystem').value = importedData.profile.preferredEcosystem || 'Any';
        }
        
        // Set radio buttons
        if (importedData.profile.travelFrequency) {
          const travelEl = document.querySelector(`input[name="travelFrequency"][value="${importedData.profile.travelFrequency}"]`);
          if (travelEl) travelEl.checked = true;
        }
        if (importedData.profile.rewardPreference) {
          const rewardEl = document.querySelector(`input[name="rewardPreference"][value="${importedData.profile.rewardPreference}"]`);
          if (rewardEl) rewardEl.checked = true;
        }
      }
      
      if (importedData.spending) {
        document.getElementById('spend_groceries').value = importedData.spending.groceries || 0;
        document.getElementById('spend_dining').value = importedData.spending.dining || 0;
        document.getElementById('spend_travel').value = importedData.spending.travel || 0;
        document.getElementById('spend_other').value = importedData.spending.other || 0;
      }
      
      // Display the results
      renderResults(importedData.recommendations);
      
      // Render spending chart if spending data exists
      if (importedData.spending) {
        renderSpendingChart(importedData.spending);
      }
      
      // Show export button
      document.getElementById('btnExport').style.display = 'inline-block';
      
      // Show when this was originally exported
      const exportDate = new Date(importedData.exportedAt);
      const formattedDate = exportDate.toLocaleString();
      
      // Calculate total monthly spending
      const totalSpending = importedData.spending 
        ? Object.values(importedData.spending).reduce((a, b) => a + b, 0)
        : 0;
      
      // Add a detailed notice at the top of results
      const resultsEl = document.getElementById('results');
      const notice = document.createElement('div');
      notice.className = 'p-4 mb-4 bg-blue-50 border border-blue-200 rounded-lg text-sm';
      notice.innerHTML = `
        <div class="flex items-start gap-3">
          <div class="text-2xl">📁</div>
          <div class="flex-1">
            <div class="font-semibold text-blue-900 mb-2">Imported Previous Analysis</div>
            <div class="text-blue-800 space-y-1">
              <div><strong>Exported on:</strong> ${formattedDate}</div>
              ${importedData.profile ? `<div><strong>Credit Score:</strong> ${importedData.profile.creditScore}</div>` : ''}
              ${totalSpending > 0 ? `<div><strong>Total Monthly Spending:</strong> $${totalSpending}</div>` : ''}
            </div>
            <div class="mt-2 text-xs text-blue-700">
              ℹ️ The form has been populated with your previous profile and spending data.
            </div>
          </div>
        </div>
      `;
      resultsEl.insertBefore(notice, resultsEl.firstChild);
      
      // Scroll to results
      resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
    } catch (err) {
      console.error('Error parsing JSON:', err);
      alert('Error reading file. Please make sure it\'s a valid CardMatch export file.');
    }
  };
  
  reader.readAsText(file);
  
  // Reset file input so the same file can be imported again if needed
  event.target.value = '';
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
  
  // Create card visuals for top 3 recommended cards
  let cardsHtml = '<div class="cards-grid">';
  for (let i = 0; i < Math.min(3, bestOverall.length); i++) {
    const card = bestOverall[i];
    const cardType = getCardType(card.name);
    cardsHtml += createCreditCardHTML(card, i + 1, cardType);
  }
  cardsHtml += '</div>';
  
  // Show the results in the page
  el.innerHTML = `
    <div class="p-4 bg-white rounded shadow">
      <h3 class="font-semibold text-lg mb-2">Best by Category</h3>
      <ul class="list-disc ml-5 mb-4">${byCatHtml || '<li>No recommendations</li>'}</ul>
      
      <h3 class="font-semibold text-lg mb-4">Top 3 Recommended Cards</h3>
      ${cardsHtml}
    </div>
  `;
}

// Helper function to determine card type for styling
function getCardType(cardName) {
  cardName = cardName.toLowerCase();
  if (cardName.includes('amex') || cardName.includes('american express')) return 'amex';
  if (cardName.includes('mastercard') || cardName.includes('master card')) return 'mastercard';
  if (cardName.includes('chase')) return 'chase';
  if (cardName.includes('capital one')) return 'capital-one';
  if (cardName.includes('wells fargo') || cardName.includes('wellsfargo')) return 'wellsfargo';
  return 'visa';
}

// Map card names to image filenames
function getCardImagePath(cardName) {
  const nameToImage = {
    'Chase Freedom Flex': 'Chase-Freedom-Flex.png',
    'Chase Freedom Unlimited': 'Chase-Freedom-Unlimited.png',
    'Discover It Cash Back': 'Discoverit-Cash-Back.png',
    'Amex Blue Cash Preferred': 'AMEX-Cash-Preferred.png',
    'Amex Gold': 'AMEX-Gold.png',
    'Citi Custom Cash': 'CITI-Custom-Cash.png',
    'Wells Fargo Autograph': 'Wells-Fargo-Autograph.png',
    'Capital One SavorOne': 'Savor-One.png',
    'Capital One VentureOne': 'Venture-One.png',
    'Chase Sapphire Preferred': 'Chase-Sapphire-Preferred.png',
    'Bank of America Customized Cash Rewards': 'BOA-CC-Rewards.png',
    'Wells Fargo Active Cash': 'Wells-Fargo-Active-Cash.png',
    'Capital One Secured': 'CO-Secured.png',
    'Student Cash Back': 'Discoverit-Student-Cashback.png',
    'Amex Platinum': 'AMEX-Platinum.png',
    'Chase Sapphire Reserve': 'Chase-Reserved.png',
    'Discover It Student Chrome': 'Discoverit-Student-Chrome.png',
    'Capital One Venture X': 'VentureX.png',
    'Amazon Prime Visa': 'Amazon-Prime-Visa.png',
    'Target RedCard': 'Target-Red-Card.png',
    'Best Buy Visa': 'CITI-Best-Buy-Visa.png',
    'Navy Federal Cash Rewards': 'Navy-Federal-Cash-Rewards.png'
  };
  
  return nameToImage[cardName] || null;
}

// List of realistic cardholder names
const cardholderNames = [
  'JOHN DOE',
  'SARAH SMITH',
  'MICHAEL JOHNSON',
  'EMILY DAVIS',
  'DAVID WILSON',
  'JESSICA BROWN',
  'JAMES MARTINEZ',
  'ASHLEY GARCIA',
  'ROBERT RODRIGUEZ',
  'AMANDA LEE'
];

// Get a consistent name based on card index
function getCardholderName(index) {
  return cardholderNames[index % cardholderNames.length];
}

// Create credit card HTML with actual card images
function createCreditCardHTML(card, position, cardType) {
  const annual = card.estimates ? card.estimates.annual : 0;
  const imagePath = getCardImagePath(card.name);
  const annualFee = card.annualFee || 0;
  const level = card.level || 'Mid';
  
  // Map level to display text and color
  const levelMap = {
    'Beginner': { text: 'Beginner', color: '#10b981' },
    'Mid': { text: 'Mid-Tier', color: '#3b82f6' },
    'Premium': { text: 'Premium', color: '#8b5cf6' },
    'Student': { text: 'Student', color: '#10b981' },
    'Secured': { text: 'Secured', color: '#6b7280' },
    'Store': { text: 'Store Card', color: '#f59e0b' }
  };
  
  const levelInfo = levelMap[level] || levelMap['Mid'];
  
  // Build reward categories display
  let rewardsDisplay = '';
  if (card.rewardCategories && card.rewardCategories.length > 0) {
    const rewardBadges = card.rewardCategories
      .map(r => `<span class="reward-badge">${r.rate}x ${r.category}</span>`)
      .join('');
    rewardsDisplay = `<div class="reward-categories">${rewardBadges}</div>`;
  } else {
    rewardsDisplay = `<div style="margin-top: 4px; opacity: 0.7; font-size: 12px;">Standard rewards</div>`;
  }
  
  // Annual fee display
  const feeDisplay = annualFee > 0 
    ? `<div class="card-annual-fee">Annual Fee: $${annualFee}</div>`
    : `<div class="card-annual-fee no-fee">No Annual Fee</div>`;
  
  return `
    <div class="card-display-container">
      <div class="card-image-wrapper">
        ${imagePath 
          ? `<img src="../assets/${imagePath}" alt="${card.name}" class="card-image" />` 
          : `<div class="card-placeholder">${card.name}</div>`
        }
      </div>
      <div class="card-rewards-info">
        <div class="card-header-info">
          <strong>${card.name}</strong>
          <span class="card-level-badge" style="background: ${levelInfo.color}">${levelInfo.text}</span>
        </div>
        <div class="card-rewards">💰 Estimated Annual Rewards: $${annual}</div>
        <div class="card-rewards-subtitle">Based on your spending habits</div>
        ${rewardsDisplay}
        ${feeDisplay}
      </div>
    </div>
  `;
}

// Render spending pie chart using D3
function renderSpendingChart(spending) {
  // Prepare data for the pie chart
  const chartData = Object.entries(spending)
    .filter(([key, value]) => value > 0)
    .map(([key, value]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      value: value
    }));

  // If no spending data, hide the chart
  if (chartData.length === 0) {
    document.getElementById('chartSection').style.display = 'none';
    return;
  }

  // Show the chart section
  document.getElementById('chartSection').style.display = 'block';

  // Clear previous chart
  d3.select("#spendingChart").selectAll("*").remove();

  // Set dimensions
  const width = 300;
  const height = 300;
  const radius = Math.min(width, height) / 2 - 15;

  // Create SVG
  const svg = d3.select("#spendingChart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  // Create pie layout
  const pie = d3.pie().value(d => d.value);
  const arc = d3.arc().innerRadius(0).outerRadius(radius);

  // Color scale
  const colors = d3.scaleOrdinal()
    .domain(chartData.map(d => d.label))
    .range(["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"]);

  // Create groups for each slice
  const g = svg.selectAll(".arc")
    .data(pie(chartData))
    .enter()
    .append("g")
    .attr("class", "arc");

  // Add paths (pie slices)
  g.append("path")
    .attr("d", arc)
    .attr("fill", d => colors(d.data.label))
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .style("opacity", 0.9)
    .style("cursor", "pointer")
    .on("mouseenter", function() {
      d3.select(this).style("opacity", 1);
    })
    .on("mouseleave", function() {
      d3.select(this).style("opacity", 0.9);
    });

  // Add labels with percentage
  g.append("text")
    .attr("transform", d => {
      const centroid = arc.centroid(d);
      return `translate(${centroid})`;
    })
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .attr("fill", "white")
    .attr("font-weight", "bold")
    .attr("font-size", "12px")
    .text(d => {
      const total = chartData.reduce((sum, item) => sum + item.value, 0);
      const percent = ((d.data.value / total) * 100).toFixed(1);
      return `${percent}%`;
    });

  // Add legend
  const legend = d3.select("#spendingChart").append("svg")
    .attr("width", width)
    .attr("height", 150)
    .selectAll("g")
    .data(chartData)
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(20, ${i * 25 + 10})`);

  legend.append("rect")
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", d => colors(d.label));

  legend.append("text")
    .attr("x", 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .attr("font-size", "14px")
    .text(d => `${d.label}: $${d.value}`);
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
  document.getElementById('fileImport').addEventListener('change', importResults);
});
