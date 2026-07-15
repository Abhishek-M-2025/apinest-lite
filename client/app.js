let collections = [];
let history = [];
let envVars = [];
let isSyncing = false;

window.addEventListener('DOMContentLoaded', () => {
  loadData();
  initUI();
  addQueryParamRow();
  addHeaderRow();
  addFormDataRow();
  addUrlEncodedRow();
  document.getElementById('body-json-text').addEventListener('input', validateJson);
});

function loadData() {
  const storedCols = localStorage.getItem('api_nest_collections');
  collections = storedCols ? JSON.parse(storedCols) : [];

  const storedHist = localStorage.getItem('api_nest_history');
  history = storedHist ? JSON.parse(storedHist) : [];

  const storedEnv = localStorage.getItem('api_nest_env_vars');
  envVars = storedEnv ? JSON.parse(storedEnv) : [
    { key: 'BASE_URL', value: 'https://jsonplaceholder.typicode.com' }
  ];
}

function saveData() {
  localStorage.setItem('api_nest_collections', JSON.stringify(collections));
  localStorage.setItem('api_nest_history', JSON.stringify(history));
  localStorage.setItem('api_nest_env_vars', JSON.stringify(envVars));
}

function initUI() {
  renderCollections();
  renderHistory();
  renderEnvVariables();
  onMethodChange();
  onBodyTypeChange();
}

function switchSidebarTab(tabName) {
  document.querySelectorAll('.sidebar-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`tab-btn-${tabName}`).classList.add('active');
  document.querySelectorAll('.sidebar-panel').forEach(panel => panel.classList.remove('active'));
  document.getElementById(`panel-${tabName}`).classList.add('active');
}

function switchRequestTab(event, tabId) {
  const header = event.target.parentElement;
  header.querySelectorAll('.tab-link').forEach(link => link.classList.remove('active'));
  event.target.classList.add('active');
  const parentCard = header.parentElement;
  parentCard.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
}

function switchResponseTab(event, tabId) {
  const header = event.target.parentElement;
  header.querySelectorAll('.tab-link').forEach(link => link.classList.remove('active'));
  event.target.classList.add('active');
  const parentCard = header.parentElement.parentElement;
  parentCard.querySelectorAll('.response-tab-panel').forEach(panel => panel.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
}

function addRow(tableId, keyPlaceholder, valPlaceholder, keyClass, valClass, onInput, keyVal = '', valVal = '') {
  const tbody = document.getElementById(tableId);
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" class="table-input ${keyClass}" placeholder="${keyPlaceholder}" value="${escapeHtml(keyVal)}"></td>
    <td><input type="text" class="table-input ${valClass}" placeholder="${valPlaceholder}" value="${escapeHtml(valVal)}"></td>
    <td>
      <button class="btn-remove-row">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </td>
  `;
  
  tr.querySelector('.btn-remove-row').onclick = () => {
    const rows = tbody.querySelectorAll('tr');
    if (rows.length === 1) {
      tr.querySelectorAll('input').forEach(i => i.value = '');
      if (onInput) onInput();
    } else {
      tr.remove();
      if (onInput) onInput();
    }
  };

  const inputs = tr.querySelectorAll('.table-input');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      const rows = tbody.querySelectorAll('tr');
      const lastRow = rows[rows.length - 1];
      if (lastRow.querySelector(`.${keyClass}`).value.trim() || lastRow.querySelector(`.${valClass}`).value.trim()) {
        addRow(tableId, keyPlaceholder, valPlaceholder, keyClass, valClass, onInput);
      }
      if (onInput) onInput();
    });
  });

  tbody.appendChild(tr);
}

const addQueryParamRow = (key = '', val = '') => addRow('params-table-body', 'parameter_key', 'value', 'param-key', 'param-value', syncUrlFromParams, key, val);
const addHeaderRow = (key = '', val = '') => addRow('headers-table-body', 'Header-Name', 'value', 'header-key', 'header-value', null, key, val);
const addFormDataRow = (key = '', val = '') => addRow('form-data-table-body', 'field_key', 'value', 'fd-key', 'fd-value', null, key, val);
const addUrlEncodedRow = (key = '', val = '') => addRow('urlencoded-table-body', 'field_key', 'value', 'urlenc-key', 'urlenc-value', null, key, val);

function onUrlInput() {
  syncParamsFromUrl();
}

function syncUrlFromParams() {
  if (isSyncing) return;
  const urlInput = document.getElementById('request-url');
  const urlStr = urlInput.value;
  const qIndex = urlStr.indexOf('?');
  const baseUrl = qIndex === -1 ? urlStr : urlStr.substring(0, qIndex);
  
  const searchParams = new URLSearchParams();
  let hasParams = false;
  document.querySelectorAll('#params-table-body tr').forEach(row => {
    const keyInput = row.querySelector('.param-key');
    const valInput = row.querySelector('.param-value');
    if (keyInput && valInput) {
      const key = keyInput.value.trim();
      const val = valInput.value.trim();
      if (key) {
        searchParams.append(key, val);
        hasParams = true;
      }
    }
  });
  urlInput.value = hasParams ? `${baseUrl}?${searchParams.toString()}` : baseUrl;
}

function syncParamsFromUrl() {
  const urlInput = document.getElementById('request-url');
  const urlStr = urlInput.value;
  const qIndex = urlStr.indexOf('?');
  
  isSyncing = true;
  const tbody = document.getElementById('params-table-body');
  tbody.innerHTML = '';
  
  if (qIndex !== -1) {
    const params = new URLSearchParams(urlStr.substring(qIndex + 1));
    for (const [key, value] of params.entries()) {
      addQueryParamRow(key, value);
    }
  }
  addQueryParamRow();
  isSyncing = false;
}

function onMethodChange() {
  const method = document.getElementById('request-method').value;
  const tabBody = document.getElementById('tab-req-body');
  if (method === 'GET') {
    tabBody.classList.add('hidden');
    if (tabBody.classList.contains('active')) {
      document.querySelector('.tab-link').click();
    }
  } else {
    tabBody.classList.remove('hidden');
  }
}

function onBodyTypeChange() {
  const selectedType = document.querySelector('input[name="body-type"]:checked').value;
  document.querySelectorAll('.body-editor-view').forEach(view => view.classList.remove('active'));
  document.getElementById(`body-view-${selectedType}`).classList.add('active');
}

function validateJson() {
  const text = document.getElementById('body-json-text').value.trim();
  const status = document.getElementById('json-format-status');
  if (!text) {
    status.innerText = "Empty Body";
    status.className = "editor-status";
    return;
  }
  try {
    JSON.parse(text);
    status.innerText = "Valid JSON";
    status.className = "editor-status valid";
  } catch (err) {
    status.innerText = `Invalid JSON: ${err.message}`;
    status.className = "editor-status invalid";
  }
}

function onAuthTypeChange() {
  const selectedAuth = document.getElementById('auth-type').value;
  document.querySelectorAll('.auth-field-view').forEach(view => view.classList.remove('active'));
  document.getElementById(`auth-view-${selectedAuth}`).classList.add('active');
}

function renderEnvVariables() {
  const container = document.getElementById('env-variables-list');
  container.innerHTML = envVars.length === 0 ? '<div class="empty-state">No variables configured.</div>' : '';
  
  envVars.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'env-var-row';
    row.innerHTML = `
      <input type="text" class="env-var-input env-key" value="${item.key}" placeholder="Key" oninput="updateEnvVar(${index}, 'key', this.value)">
      <input type="text" class="env-var-input env-value" value="${item.value}" placeholder="Value" oninput="updateEnvVar(${index}, 'value', this.value)">
      <button class="btn-remove-row" onclick="deleteEnvVar(${index})">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    container.appendChild(row);
  });
}

function addNewEnvVarRow() {
  envVars.push({ key: '', value: '' });
  renderEnvVariables();
  saveData();
}

function updateEnvVar(index, field, value) {
  envVars[index][field] = value;
  saveData();
}

function deleteEnvVar(index) {
  envVars.splice(index, 1);
  renderEnvVariables();
  saveData();
}

function replaceEnvVars(text) {
  if (typeof text !== 'string') return text;
  const lookup = {};
  envVars.forEach(item => {
    if (item.key.trim()) lookup[item.key.trim()] = item.value;
  });
  return text.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
    const trimmed = varName.trim();
    return lookup[trimmed] !== undefined ? lookup[trimmed] : match;
  });
}

function renderCollections() {
  const container = document.getElementById('collections-list');
  container.innerHTML = collections.length === 0 ? '<div class="empty-state">No collections created yet.</div>' : '';
  
  collections.forEach((col, colIndex) => {
    const colDiv = document.createElement('div');
    colDiv.className = 'collection-item';
    colDiv.innerHTML = `
      <div class="collection-header" onclick="toggleCollectionAccordion(${colIndex})">
        <div class="collection-title">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
          </svg>
          <span>${escapeHtml(col.name)}</span>
        </div>
        <button class="btn-remove-row" onclick="event.stopPropagation(); deleteCollection(${colIndex})">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
      <div class="collection-requests collapsed" id="col-reqs-${colIndex}"></div>
    `;
    
    const reqsContainer = colDiv.querySelector('.collection-requests');
    if (col.requests.length === 0) {
      reqsContainer.innerHTML = '<div class="empty-state" style="padding: 1rem 0.5rem; font-size: 0.75rem;">No saved requests</div>';
    } else {
      col.requests.forEach((req, reqIndex) => {
        const reqItem = document.createElement('div');
        reqItem.className = 'saved-req-item';
        reqItem.onclick = () => loadRequest(req);
        reqItem.innerHTML = `
          <div class="saved-req-info">
            <span class="method-badge ${req.method}">${req.method}</span>
            <span class="req-name" title="${escapeHtml(req.name)}">${escapeHtml(req.name)}</span>
          </div>
          <button class="btn-remove-row" onclick="event.stopPropagation(); deleteSavedRequest(${colIndex}, ${reqIndex})">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 12px; height: 12px;">
              <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        `;
        reqsContainer.appendChild(reqItem);
      });
    }
    container.appendChild(colDiv);
  });
}

function toggleCollectionAccordion(colIndex) {
  document.getElementById(`col-reqs-${colIndex}`).classList.toggle('collapsed');
}

function openNewCollectionModal() {
  document.getElementById('new-collection-modal').classList.remove('hidden');
  document.getElementById('new-col-name').value = '';
  document.getElementById('new-col-name').focus();
}

function closeNewCollectionModal() {
  document.getElementById('new-collection-modal').classList.add('hidden');
}

function createCollection() {
  const name = document.getElementById('new-col-name').value.trim();
  if (!name) return;
  collections.push({ id: Date.now().toString(), name, requests: [] });
  saveData();
  renderCollections();
  closeNewCollectionModal();
}

function deleteCollection(index) {
  if (confirm(`Are you sure you want to delete the collection "${collections[index].name}"?`)) {
    collections.splice(index, 1);
    saveData();
    renderCollections();
  }
}

function deleteSavedRequest(colIndex, reqIndex) {
  collections[colIndex].requests.splice(reqIndex, 1);
  saveData();
  renderCollections();
}

function renderHistory() {
  const container = document.getElementById('history-list');
  container.innerHTML = history.length === 0 ? '<div class="empty-state">No request history.</div>' : '';
  
  history.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.onclick = () => loadRequest(item);
    
    const isError = item.status === 0 || item.status >= 400;
    const statusText = item.status === 0 ? 'ERR' : item.status;
    const statusClass = isError ? 'status-error' : 'status-success';
    
    let path = item.url;
    try {
      const cleanUrl = item.url.replace(/^(http|https):\/\//i, '');
      const firstSlash = cleanUrl.indexOf('/');
      if (firstSlash !== -1) {
        path = cleanUrl.substring(firstSlash);
      }
    } catch (e) {}

    div.innerHTML = `
      <div class="history-item-left">
        <span class="method-badge ${item.method}">${item.method}</span>
        <span class="history-url" title="${escapeHtml(item.url)}">${escapeHtml(path)}</span>
      </div>
      <span class="history-status ${statusClass}">${statusText}</span>
    `;
    container.appendChild(div);
  });
}

function addToHistory(requestData) {
  history.unshift(requestData);
  if (history.length > 30) history.pop();
  saveData();
  renderHistory();
}

function clearHistory() {
  if (confirm('Clear all request history?')) {
    history = [];
    saveData();
    renderHistory();
  }
}

function loadRequest(req) {
  document.getElementById('request-method').value = req.method;
  onMethodChange();
  document.getElementById('request-url').value = req.url;
  
  const paramsBody = document.getElementById('params-table-body');
  paramsBody.innerHTML = '';
  const qIndex = req.url.indexOf('?');
  if (qIndex !== -1) {
    const params = new URLSearchParams(req.url.substring(qIndex + 1));
    for (const [k, v] of params.entries()) {
      addQueryParamRow(k, v);
    }
  }
  if (paramsBody.querySelectorAll('tr').length === 0) addQueryParamRow();
  else addQueryParamRow();

  const headersBody = document.getElementById('headers-table-body');
  headersBody.innerHTML = '';
  if (req.headers && req.headers.length > 0) {
    req.headers.forEach(h => addHeaderRow(h.key, h.value));
  }
  addHeaderRow();

  const authType = req.auth ? req.auth.type : 'none';
  document.getElementById('auth-type').value = authType;
  onAuthTypeChange();

  if (req.auth) {
    if (authType === 'bearer') document.getElementById('auth-bearer-token').value = req.auth.token || '';
    else if (authType === 'basic') {
      document.getElementById('auth-basic-username').value = req.auth.username || '';
      document.getElementById('auth-basic-password').value = req.auth.password || '';
    } else if (authType === 'apikey') {
      document.getElementById('auth-apikey-key').value = req.auth.key || '';
      document.getElementById('auth-apikey-value').value = req.auth.value || '';
      document.getElementById('auth-apikey-addto').value = req.auth.addTo || 'header';
    }
  }

  const bodyType = req.bodyType || 'none';
  const radio = document.querySelector(`input[name="body-type"][value="${bodyType}"]`);
  if (radio) {
    radio.checked = true;
    onBodyTypeChange();
  }

  if (bodyType === 'json') {
    document.getElementById('body-json-text').value = req.body || '';
    validateJson();
  } else if (bodyType === 'text') {
    document.getElementById('body-raw-text').value = req.body || '';
  } else if (bodyType === 'form-data') {
    const fdBody = document.getElementById('form-data-table-body');
    fdBody.innerHTML = '';
    if (req.bodyFields && req.bodyFields.length > 0) {
      req.bodyFields.forEach(f => addFormDataRow(f.key, f.value));
    }
    addFormDataRow();
  } else if (bodyType === 'urlencoded') {
    const urlencBody = document.getElementById('urlencoded-table-body');
    urlencBody.innerHTML = '';
    if (req.bodyFields && req.bodyFields.length > 0) {
      req.bodyFields.forEach(f => addUrlEncodedRow(f.key, f.value));
    }
    addUrlEncodedRow();
  }
}

function openSaveRequestModal() {
  const select = document.getElementById('save-req-collection');
  select.innerHTML = '';
  if (collections.length === 0) {
    alert('Please create a Collection in the sidebar first before saving a request.');
    openNewCollectionModal();
    return;
  }
  collections.forEach((col, index) => {
    const opt = document.createElement('option');
    opt.value = index;
    opt.innerText = col.name;
    select.appendChild(opt);
  });
  const url = document.getElementById('request-url').value;
  document.getElementById('save-req-name').value = url ? `Req: ${url.substring(0, 30)}` : 'My Request';
  document.getElementById('save-request-modal').classList.remove('hidden');
}

function closeSaveRequestModal() {
  document.getElementById('save-request-modal').classList.add('hidden');
}

function saveRequest() {
  const name = document.getElementById('save-req-name').value.trim();
  const colIndex = parseInt(document.getElementById('save-req-collection').value);
  if (!name || isNaN(colIndex)) return;
  const requestObject = compileRequestObject();
  requestObject.name = name;
  collections[colIndex].requests.push(requestObject);
  saveData();
  renderCollections();
  closeSaveRequestModal();
}

function compileRequestObject() {
  const method = document.getElementById('request-method').value;
  const url = document.getElementById('request-url').value.trim();
  
  const headers = [];
  document.querySelectorAll('#headers-table-body tr').forEach(row => {
    const key = row.querySelector('.header-key').value.trim();
    const value = row.querySelector('.header-value').value.trim();
    if (key) headers.push({ key, value });
  });

  const authType = document.getElementById('auth-type').value;
  const auth = { type: authType };
  if (authType === 'bearer') auth.token = document.getElementById('auth-bearer-token').value.trim();
  else if (authType === 'basic') {
    auth.username = document.getElementById('auth-basic-username').value.trim();
    auth.password = document.getElementById('auth-basic-password').value.trim();
  } else if (authType === 'apikey') {
    auth.key = document.getElementById('auth-apikey-key').value.trim();
    auth.value = document.getElementById('auth-apikey-value').value.trim();
    auth.addTo = document.getElementById('auth-apikey-addto').value;
  }

  const bodyType = document.querySelector('input[name="body-type"]:checked').value;
  let body = '';
  let bodyFields = [];
  
  if (bodyType === 'json') body = document.getElementById('body-json-text').value;
  else if (bodyType === 'text') body = document.getElementById('body-raw-text').value;
  else if (bodyType === 'form-data' || bodyType === 'urlencoded') {
    const selector = bodyType === 'form-data' ? '#form-data-table-body tr' : '#urlencoded-table-body tr';
    const keyClass = bodyType === 'form-data' ? '.fd-key' : '.urlenc-key';
    const valClass = bodyType === 'form-data' ? '.fd-value' : '.urlenc-value';
    document.querySelectorAll(selector).forEach(row => {
      const key = row.querySelector(keyClass).value.trim();
      const value = row.querySelector(valClass).value.trim();
      if (key) bodyFields.push({ key, value });
    });
  }

  return { method, url, headers, auth, bodyType, body, bodyFields };
}

async function sendRequest() {
  const urlInput = document.getElementById('request-url');
  let rawUrl = urlInput.value.trim();
  if (!rawUrl) {
    alert('Please enter a request URL');
    return;
  }
  
  if (!/^https?:\/\//i.test(rawUrl)) {
    rawUrl = 'http://' + rawUrl;
    urlInput.value = rawUrl;
  }

  const sendBtn = document.getElementById('btn-send-request');
  const spinner = document.getElementById('send-spinner');
  const btnText = sendBtn.querySelector('.btn-text');
  
  sendBtn.disabled = true;
  spinner.classList.remove('hidden');
  btnText.innerText = 'Sending...';

  document.getElementById('response-placeholder').classList.add('hidden');
  document.getElementById('response-content-panels').classList.add('hidden');
  document.getElementById('response-meta-container').classList.add('hidden');
  document.getElementById('response-body-code').innerHTML = '';
  document.getElementById('response-headers-body').innerHTML = '';

  try {
    const reqObj = compileRequestObject();
    const resolvedUrl = replaceEnvVars(reqObj.url);
    const method = reqObj.method;
    
    const resolvedHeaders = {};
    reqObj.headers.forEach(h => {
      resolvedHeaders[replaceEnvVars(h.key)] = replaceEnvVars(h.value);
    });

    let finalUrl = resolvedUrl;
    if (reqObj.auth.type === 'bearer') {
      const token = replaceEnvVars(reqObj.auth.token);
      if (token) resolvedHeaders['Authorization'] = `Bearer ${token}`;
    } else if (reqObj.auth.type === 'basic') {
      const username = replaceEnvVars(reqObj.auth.username);
      const password = replaceEnvVars(reqObj.auth.password);
      if (username || password) {
        resolvedHeaders['Authorization'] = `Basic ${btoa(username + ':' + password)}`;
      }
    } else if (reqObj.auth.type === 'apikey') {
      const key = replaceEnvVars(reqObj.auth.key);
      const val = replaceEnvVars(reqObj.auth.value);
      if (key) {
        if (reqObj.auth.addTo === 'header') {
          resolvedHeaders[key] = val;
        } else {
          const sep = finalUrl.includes('?') ? '&' : '?';
          finalUrl = `${finalUrl}${sep}${encodeURIComponent(key)}=${encodeURIComponent(val)}`;
        }
      }
    }

    let resolvedBody = '';
    const bodyType = reqObj.bodyType;
    if (bodyType === 'json') {
      resolvedBody = replaceEnvVars(reqObj.body);
      if (resolvedBody.trim()) {
        JSON.parse(resolvedBody);
        resolvedHeaders['Content-Type'] = 'application/json';
      }
    } else if (bodyType === 'text') {
      resolvedBody = replaceEnvVars(reqObj.body);
      if (!resolvedHeaders['Content-Type']) resolvedHeaders['Content-Type'] = 'text/plain';
    } else if (bodyType === 'form-data' || bodyType === 'urlencoded') {
      const fieldsObj = {};
      reqObj.bodyFields.forEach(f => {
        fieldsObj[replaceEnvVars(f.key)] = replaceEnvVars(f.value);
      });
      resolvedBody = fieldsObj;
      resolvedHeaders['Content-Type'] = bodyType === 'form-data' ? 'multipart/form-data' : 'application/x-www-form-urlencoded';
    }

    const proxyResponse = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: finalUrl,
        method: method,
        headers: resolvedHeaders,
        body: resolvedBody
      })
    });

    const responseData = await proxyResponse.json();
    renderResponse(responseData);

    addToHistory({
      method: method,
      url: reqObj.url,
      headers: reqObj.headers,
      auth: reqObj.auth,
      bodyType: reqObj.bodyType,
      body: reqObj.body,
      bodyFields: reqObj.bodyFields,
      status: responseData.status,
      timestamp: Date.now()
    });

  } catch (error) {
    renderResponse({
      status: 0,
      statusText: 'Network Error',
      headers: {},
      body: error.message || 'Failed to connect to proxy.',
      time: 0,
      size: 0
    });
  } finally {
    sendBtn.disabled = false;
    spinner.classList.add('hidden');
    btnText.innerText = 'Send';
  }
}

function renderResponse(res) {
  const metaContainer = document.getElementById('response-meta-container');
  metaContainer.classList.remove('hidden');

  const statusBadge = document.getElementById('res-status-badge');
  const code = res.status;
  const statusMsg = res.statusText || (res.status === 0 ? 'Network Error' : 'Unknown');
  statusBadge.innerText = `${code} ${statusMsg}`;
  
  statusBadge.className = 'meta-badge';
  if (code >= 200 && code < 300) statusBadge.classList.add('status-2xx');
  else if (code >= 300 && code < 400) statusBadge.classList.add('status-3xx');
  else if (code >= 400 && code < 500) statusBadge.classList.add('status-4xx');
  else statusBadge.classList.add('status-5xx');

  document.getElementById('res-time').innerText = `${res.time} ms`;

  const sizeBytes = res.size || 0;
  let formattedSize = `${sizeBytes} B`;
  if (sizeBytes >= 1024 * 1024) formattedSize = `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`;
  else if (sizeBytes >= 1024) formattedSize = `${(sizeBytes / 1024).toFixed(2)} KB`;
  document.getElementById('res-size').innerText = formattedSize;

  document.getElementById('response-content-panels').classList.remove('hidden');

  const headersTbody = document.getElementById('response-headers-body');
  headersTbody.innerHTML = '';
  
  const headersKeys = Object.keys(res.headers || {});
  if (headersKeys.length === 0) {
    headersTbody.innerHTML = '<tr><td colspan="2" style="text-align: center; color: var(--text-muted);">No response headers received</td></tr>';
  } else {
    headersKeys.sort().forEach(key => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${escapeHtml(key)}</td><td>${escapeHtml(res.headers[key])}</td>`;
      headersTbody.appendChild(tr);
    });
  }

  const codeBlock = document.getElementById('response-body-code');
  const bodyText = res.body || '';

  if (!bodyText) {
    codeBlock.innerHTML = '<span style="color: var(--text-muted);">Empty Response Body</span>';
    return;
  }

  let isJson = false;
  let parsedJson = null;
  try {
    parsedJson = JSON.parse(bodyText);
    isJson = true;
  } catch (e) {}

  if (isJson && parsedJson !== null) {
    codeBlock.innerHTML = syntaxHighlightJson(parsedJson);
  } else {
    codeBlock.innerText = bodyText;
  }
}

function copyResponseToClipboard() {
  const codeBlock = document.getElementById('response-body-code');
  if (!codeBlock.innerText || codeBlock.innerText === 'Empty Response Body') return;
  
  navigator.clipboard.writeText(codeBlock.innerText).then(() => {
    const copyBtn = document.getElementById('btn-copy-response');
    const copyText = document.getElementById('copy-btn-text');
    copyBtn.style.borderColor = 'var(--success)';
    copyText.innerText = 'Copied!';
    setTimeout(() => {
      copyBtn.style.borderColor = '';
      copyText.innerText = 'Copy Response';
    }, 2000);
  });
}

function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function syntaxHighlightJson(jsonObj) {
  let jsonStr = escapeHtml(JSON.stringify(jsonObj, null, 2));
  return jsonStr.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, match => {
    let cls = 'json-number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'json-key';
        return `<span class="${cls}">${match.replace(/:$/, '')}</span>:`;
      }
      cls = 'json-string';
    } else if (/true|false/.test(match)) {
      cls = 'json-boolean';
    } else if (/null/.test(match)) {
      cls = 'json-null';
    }
    return `<span class="${cls}">${match}</span>`;
  });
}
