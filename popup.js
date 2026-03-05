let extractedContacts = [];

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

  // Check if WhatsApp is loaded
  chrome.tabs.sendMessage(tab.id, { action: 'checkWhatsApp' }, (response) => {
    if (chrome.runtime.lastError || !response || !response.isLoaded) {
      showStatus('Please wait for WhatsApp Web to fully load...', 'warning');
    }
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

      // Scroll first if option is selected
      if (scrollFirstCheckbox.checked) {
        showStatus('Scrolling to load all chats...', 'info');
        
        // Scroll multiple times to load all chats
        for (let i = 0; i < 5; i++) {
          await chrome.tabs.sendMessage(tab.id, { action: 'scrollChatList' });
          await sleep(800);
        }
        
        await sleep(1000);
      }

      showStatus('Extracting contacts...', 'info');

      chrome.tabs.sendMessage(tab.id, { action: 'extractContacts' }, (response) => {
        if (chrome.runtime.lastError) {
          showStatus('Error: ' + chrome.runtime.lastError.message, 'error');
          resetButton();
          return;
        }

        if (!response.success) {
          showStatus('Error: ' + response.error, 'error');
          resetButton();
          return;
        }

        extractedContacts = response.contacts;

        // Filter out groups if option is unchecked
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
      });

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
