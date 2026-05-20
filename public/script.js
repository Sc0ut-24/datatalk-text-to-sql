const queryInput = document.getElementById('query');
const executeBtn = document.getElementById('executeBtn');
const sqlOnlyBtn = document.getElementById('sqlOnlyBtn');
const loading = document.getElementById('loading');
const errorBox = document.getElementById('error');
const sqlResult = document.getElementById('sqlResult');
const tableResult = document.getElementById('tableResult');
const emptyState = document.getElementById('emptyState');
const sqlCode = document.getElementById('sqlCode');
const tableContainer = document.getElementById('tableContainer');

executeBtn.addEventListener('click', () => executeQuery(false));
sqlOnlyBtn.addEventListener('click', () => executeQuery(true));

async function executeQuery(dryRun = false) {
  const query = queryInput.value.trim();

  if (!query) {
    showError('Please enter a query');
    return;
  }

  hideAllResults();
  showLoading(true);

  try {
    const response = await fetch('/api/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, dryRun }),
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.error || 'Failed to execute query');
      return;
    }

    showSql(data.sql);

    if (!dryRun && data.rows && data.rows.length > 0) {
      showTable(data.rows);
    } else if (!dryRun) {
      showError('Query executed but returned no results');
    }
  } catch (error) {
    showError(error instanceof Error ? error.message : 'An error occurred');
  } finally {
    showLoading(false);
  }
}

function showSql(sql) {
  sqlCode.textContent = sql;
  sqlResult.style.display = 'block';
}

function showTable(rows) {
  if (!rows || rows.length === 0) {
    tableContainer.innerHTML = '<p>No rows returned</p>';
    tableResult.style.display = 'block';
    return;
  }

  const keys = Object.keys(rows[0]);
  let html = '<table><thead><tr>';

  keys.forEach(key => {
    html += `<th>${escapeHtml(key)}</th>`;
  });

  html += '</tr></thead><tbody>';

  rows.forEach(row => {
    html += '<tr>';
    keys.forEach(key => {
      let value = row[key];
      if (value === null || value === undefined) {
        value = 'NULL';
      }
      html += `<td>${escapeHtml(String(value))}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  tableContainer.innerHTML = html;
  tableResult.style.display = 'block';
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.style.display = 'block';
}

function showLoading(show) {
  loading.style.display = show ? 'flex' : 'none';
}

function hideAllResults() {
  errorBox.style.display = 'none';
  sqlResult.style.display = 'none';
  tableResult.style.display = 'none';
  emptyState.style.display = 'none';
}

function copySql() {
  const sql = sqlCode.textContent;
  navigator.clipboard.writeText(sql).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓ Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  });
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Show empty state on load
queryInput.addEventListener('input', () => {
  if (!queryInput.value.trim()) {
    hideAllResults();
    emptyState.style.display = 'block';
  }
});
