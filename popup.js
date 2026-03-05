let extractedContacts = [];

// Runs in PAGE context (same as WhatsApp) - must be self-contained, no outer refs
function extractInPage() {
  function qsAllDeep(selector, root) {
    root = root || document;
    var result = [];
    function walk(r) {
      if (!r || !r.querySelectorAll) return;
      try {
        r.querySelectorAll(selector).forEach(function(el) { result.push(el); });
        r.querySelectorAll('*').forEach(function(node) {
          if (node.shadowRoot) walk(node.shadowRoot);
        });
      } catch (e) {}
    }
    walk(root);
    return result;
  }
  function qsDeep(selector, root) {
    var all = qsAllDeep(selector, root);
    return all[0] || null;
  }
  var contacts = [], seen = {};
  var chatList = document.querySelector('#pane-side') || qsDeep('#pane-side') ||
    document.querySelector('[aria-label="Chat list"]') || qsDeep('[aria-label="Chat list"]');
  if (!chatList) {
    var listitems = qsAllDeep('div[role="listitem"]');
    if (listitems.length > 0)
      chatList = listitems[0].closest('div[role="listbox"]') || listitems[0].closest('div[role="grid"]') ||
        (listitems[0].parentElement && listitems[0].parentElement.parentElement);
  }
  if (!chatList)
    return { success: false, error: 'Chat list not found. Refresh the page and try again.', contacts: [] };
  var chatItems = Array.from(chatList.querySelectorAll('[data-testid="cell-frame-container"]'));
  if (chatItems.length === 0) chatItems = Array.from(qsAllDeep('[data-testid="cell-frame-container"]', chatList));
  if (chatItems.length === 0) chatItems = Array.from(chatList.querySelectorAll('div[role="listitem"]'));
  if (chatItems.length === 0) chatItems = Array.from(qsAllDeep('div[role="listitem"]', chatList));
  if (chatItems.length === 0) {
    var withTabindex = chatList.querySelectorAll('[tabindex="0"]');
    chatItems = Array.from(withTabindex).filter(function(el) {
      return (el.querySelector('span[dir="auto"]') || el.querySelector('[title]')) &&
        (el.querySelector('img') || el.querySelector('canvas') || el.querySelector('span'));
    });
  }
  if (chatItems.length === 0) {
    var divs = chatList.querySelectorAll('div');
    chatItems = Array.from(divs).filter(function(div) {
      var hasImg = div.querySelector('img, canvas');
      var spans = div.querySelectorAll('span');
      var ok = false;
      spans.forEach(function(s) {
        var t = s.textContent.trim();
        if (t.length >= 2 && t.length <= 80 && !/^\d{1,2}:\d{2}$/.test(t)) ok = true;
      });
      return hasImg && spans.length >= 1 && ok;
    });
  }
  if (chatItems.length === 0)
    return { success: false, error: 'No chats found. Make sure chats are visible and the page is fully loaded.', contacts: [] };
  chatItems.forEach(function(chatItem, index) {
    try {
      var name = null;
      var titles = chatItem.querySelectorAll('[title]');
      for (var i = 0; i < titles.length; i++) {
        var t = (titles[i].getAttribute('title') || '').trim();
        if (t.length > 0 && t.length < 100 && !/^\d{1,2}:\d{2}/.test(t)) { name = t; break; }
      }
      if (!name) { var auto = chatItem.querySelector('span[dir="auto"]'); if (auto) name = auto.textContent.trim(); }
      if (!name) {
        var spans = chatItem.querySelectorAll('span');
        for (var j = 0; j < spans.length; j++) {
          var txt = spans[j].textContent.trim();
          if (txt.length >= 2 && txt.length <= 80 && !/^\d{1,2}:\d{2}$/.test(txt) && !/^\d+$/.test(txt)) { name = txt; break; }
        }
      }
      if (!name || seen[name]) return;
      seen[name] = true;
      var phone = /^\+?\d[\d\s\-\(\)]{8,}$/.test(name) ? name.replace(/\D/g, '') : null;
      if (!phone) { var aria = chatItem.getAttribute('aria-label') || ''; var m = aria.match(/\+?\d[\d\s\-\(\)]{8,}/); if (m) phone = m[0].replace(/\D/g, ''); }
      var lastMsgEl = chatItem.querySelector('span[dir="ltr"]') || chatItem.querySelector('[data-testid="last-msg-text"]');
      var lastMessage = lastMsgEl ? lastMsgEl.textContent.trim().substring(0, 100) : '';
      var timeEl = chatItem.querySelector('[data-testid="cell-frame-secondary"] span') || chatItem.querySelector('span[aria-label*="at"]');
      var timestamp = timeEl ? timeEl.textContent.trim() : '';
      var isGroup = !!chatItem.querySelector('[data-testid="default-group"], [data-icon="default-group"]') || /group/i.test(name);
      contacts.push({ name: name, phoneNumber: phone || 'N/A', isGroup: isGroup, lastMessage: lastMessage, timestamp: timestamp, index: index + 1 });
    } catch (err) {}
  });
  return { success: true, contacts: contacts, totalChats: chatItems.length, extractedAt: new Date().toISOString() };
}

document.addEventListener('DOMContentLoaded', async () => {
  const extractBtn = document.getElementById('extractBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const exportJsonBtn = document.getElementById('exportJsonBtn');
  const copyBtn = document.getElementById('copyBtn');
  const includeGroupsCheckbox = document.getElementById('includeGroups');
  const scrollFirstCheckbox = document.getElementById('scrollFirst');

  // Check if we're on WhatsApp Web
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url.includes('web.whatsapp.com')) {
    document.getElementById('notWhatsApp').classList.remove('hidden');
    document.getElementById('mainContent').classList.add('hidden');
    return;
  }

  // Ensure content script is injected
  async function ensureContentScript() {
    try {
      // Try to ping the content script
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'checkWhatsApp' });
      return response;
    } catch (error) {
      // Content script not loaded, inject it
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        // Wait a bit for the script to initialize
        await new Promise(resolve => setTimeout(resolve, 500));
        return await chrome.tabs.sendMessage(tab.id, { action: 'checkWhatsApp' });
      } catch (injectError) {
        console.error('Failed to inject content script:', injectError);
        return null;
      }
    }
  }

  // Check if WhatsApp is loaded
  ensureContentScript().then(response => {
    if (!response || !response.isLoaded) {
      showStatus('Please wait for WhatsApp Web to fully load...', 'warning');
    }
  }).catch(error => {
    showStatus('Error: Could not connect to WhatsApp Web. Please refresh the page.', 'error');
  });

  extractBtn.addEventListener('click', async () => {
    await extractContacts();
  });

  exportCsvBtn.addEventListener('click', () => {
    exportAsCSV();
  });

  exportJsonBtn.addEventListener('click', () => {
    exportAsJSON();
  });

  copyBtn.addEventListener('click', () => {
    copyToClipboard();
  });

  async function extractContacts() {
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');
    
    extractBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Scroll first if option is selected (uses content script)
      try { await ensureContentScript(); } catch (_) {}

      // Scroll first if option is selected
      if (scrollFirstCheckbox.checked) {
        showStatus('Scrolling to load all chats...', 'info');
        
        // Scroll multiple times to load all chats
        for (let i = 0; i < 5; i++) {
          try {
            await chrome.tabs.sendMessage(tab.id, { action: 'scrollChatList' });
            await sleep(800);
          } catch (error) {
            console.error('Scroll error:', error);
          }
        }
        
        await sleep(1000);
      }

      showStatus('Extracting contacts...', 'info');

      // Run extractor in PAGE context (same as WhatsApp) so we see the real DOM
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: extractInPage,
          world: 'MAIN'
        });
        if (chrome.runtime.lastError) {
          showStatus('Error: ' + chrome.runtime.lastError.message, 'error');
          resetButton();
          return;
        }
        const response = results && results[0] && results[0].result;
        if (!response) {
          showStatus('Error: No response from page.', 'error');
          resetButton();
          return;
        }
        if (!response.success) {
          showStatus('Error: ' + response.error, 'error');
          resetButton();
          return;
        }

        extractedContacts = response.contacts || [];

        if (!includeGroupsCheckbox.checked) {
          extractedContacts = extractedContacts.filter(contact => !contact.isGroup);
        }

        if (extractedContacts.length === 0) {
          showStatus('No contacts found!', 'warning');
          resetButton();
          return;
        }

        showStatus(`Successfully extracted ${extractedContacts.length} contacts!`, 'success');
        displayResults();
        resetButton();
      } catch (error) {
        showStatus('Error: ' + (error.message || 'Could not extract contacts'), 'error');
        resetButton();
      }

    } catch (error) {
      showStatus('Error: ' + error.message, 'error');
      resetButton();
    }
  }

  function displayResults() {
    const resultsDiv = document.getElementById('results');
    const resultCount = document.getElementById('resultCount');
    const previewList = document.getElementById('previewList');

    resultCount.textContent = `Total contacts: ${extractedContacts.length}`;
    
    // Show preview of first 10 contacts
    const preview = extractedContacts.slice(0, 10);
    previewList.innerHTML = preview.map(contact => `
      <div class="preview-item">
        <div class="preview-name">${escapeHtml(contact.name)}</div>
        <div class="preview-phone">${escapeHtml(contact.phoneNumber)}</div>
        ${contact.isGroup ? '<span class="group-badge">Group</span>' : ''}
      </div>
    `).join('');

    if (extractedContacts.length > 10) {
      previewList.innerHTML += `<div class="preview-more">... and ${extractedContacts.length - 10} more</div>`;
    }

    resultsDiv.classList.remove('hidden');
  }

  function exportAsCSV() {
    const headers = ['Name', 'Phone Number', 'Is Group', 'Last Message', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...extractedContacts.map(contact => [
        `"${contact.name.replace(/"/g, '""')}"`,
        `"${contact.phoneNumber}"`,
        contact.isGroup ? 'Yes' : 'No',
        `"${contact.lastMessage.replace(/"/g, '""')}"`,
        `"${contact.timestamp}"`
      ].join(','))
    ].join('\n');

    downloadFile(csvContent, 'whatsapp-contacts.csv', 'text/csv');
    showStatus('CSV file downloaded!', 'success');
  }

  function exportAsJSON() {
    const jsonContent = JSON.stringify(extractedContacts, null, 2);
    downloadFile(jsonContent, 'whatsapp-contacts.json', 'application/json');
    showStatus('JSON file downloaded!', 'success');
  }

  function copyToClipboard() {
    const text = extractedContacts.map(contact => 
      `${contact.name}\t${contact.phoneNumber}\t${contact.isGroup ? 'Group' : 'Contact'}`
    ).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      showStatus('Copied to clipboard!', 'success');
      copyBtn.textContent = '✓ Copied!';
      setTimeout(() => {
        copyBtn.textContent = '📋 Copy to Clipboard';
      }, 2000);
    }).catch(err => {
      showStatus('Failed to copy: ' + err.message, 'error');
    });
  }

  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.classList.remove('hidden');
  }

  function resetButton() {
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');
    
    extractBtn.disabled = false;
    btnText.classList.remove('hidden');
    btnLoader.classList.add('hidden');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
});
