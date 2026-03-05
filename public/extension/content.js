// Content script for WhatsApp Web Contact Exporter

// Query through Shadow DOM (WhatsApp Web may use it)
function querySelectorAllDeep(selector, root = document) {
  const result = [];
  function walk(r) {
    if (!r || !r.querySelectorAll) return;
    try {
      r.querySelectorAll(selector).forEach(el => result.push(el));
      r.querySelectorAll('*').forEach(node => {
        if (node.shadowRoot) walk(node.shadowRoot);
      });
    } catch (e) {}
  }
  walk(root);
  return result;
}

function querySelectorDeep(selector, root = document) {
  const all = querySelectorAllDeep(selector, root);
  return all[0] || null;
}

function extractContacts() {
  const contacts = [];
  const processedNumbers = new Set();

  console.log('WhatsApp Contact Exporter: Starting extraction...');

  // Find chat list - try normal DOM first, then pierce shadow DOM
  let chatList = document.querySelector('#pane-side') ||
                 querySelectorDeep('#pane-side') ||
                 document.querySelector('[aria-label="Chat list"]') ||
                 querySelectorDeep('[aria-label="Chat list"]') ||
                 querySelectorDeep('[data-testid="chat-list"]');

  if (!chatList) {
    // Try finding by role or structure
    const withListitems = querySelectorAllDeep('div[role="listitem"]');
    if (withListitems.length > 0) {
      chatList = withListitems[0].closest('div[role="listbox"]') ||
                 withListitems[0].closest('div[role="grid"]') ||
                 withListitems[0].parentElement?.parentElement;
      console.log('Found chat list via listitem parent:', chatList);
    }
  }

  if (!chatList) {
    console.error('Chat list not found. Document body children:', document.body?.children?.length);
    return {
      success: false,
      error: 'WhatsApp chat list not found. Make sure you are logged in and can see your chats. Try refreshing the page.',
      contacts: []
    };
  }

  // Get chat rows - WhatsApp Web uses various patterns
  let chatItems = [];

  // Pattern 1: data-testid (modern WhatsApp Web)
  chatItems = Array.from(chatList.querySelectorAll('[data-testid="cell-frame-container"]'));
  if (chatItems.length === 0) {
    chatItems = Array.from(querySelectorAllDeep('[data-testid="cell-frame-container"]', chatList));
  }

  // Pattern 2: role="listitem"
  if (chatItems.length === 0) {
    chatItems = Array.from(chatList.querySelectorAll('div[role="listitem"]'));
  }
  if (chatItems.length === 0) {
    chatItems = Array.from(querySelectorAllDeep('div[role="listitem"]', chatList));
  }

  // Pattern 3: focusable list item (tabindex="0" + focusable)
  if (chatItems.length === 0) {
    chatItems = Array.from(chatList.querySelectorAll('[tabindex="0"]'));
    chatItems = chatItems.filter(el => {
      const hasName = el.querySelector('span[dir="auto"]') || el.querySelector('[title]');
      const hasAvatar = el.querySelector('img') || el.querySelector('canvas');
      return hasName && (hasAvatar || el.querySelector('span'));
    });
  }

  // Pattern 4: divs that look like chat rows (avatar + text)
  if (chatItems.length === 0) {
    const allDivs = chatList.querySelectorAll('div');
    chatItems = Array.from(allDivs).filter(div => {
      const hasImg = div.querySelector('img, canvas');
      const spans = div.querySelectorAll('span');
      const hasReasonableText = Array.from(spans).some(s => {
        const t = s.textContent.trim();
        return t.length >= 2 && t.length <= 80 && !/^\d{1,2}:\d{2}$/.test(t);
      });
      return hasImg && spans.length >= 1 && hasReasonableText;
    });
    // Prefer direct children of scroll container to avoid nested duplicates
    if (chatItems.length > 1) {
      const scrollParent = chatList.querySelector('[style*="overflow"]') || chatList;
      const direct = Array.from(scrollParent.children).filter(c => c.querySelector('img, canvas'));
      if (direct.length > 0) chatItems = direct;
    }
  }

  console.log('Chat items found:', chatItems.length);

  if (chatItems.length === 0) {
    return {
      success: false,
      error: 'No chats found. Make sure:\n• You are logged into WhatsApp Web\n• Chats are visible on the left\n• The page has fully loaded\n• Try refreshing (F5)',
      contacts: []
    };
  }

  chatItems.forEach((chatItem, index) => {
    try {
      let name = null;

      // 1. title attribute (contact name tooltip)
      const withTitle = chatItem.querySelectorAll('[title]');
      for (const el of withTitle) {
        const t = (el.getAttribute('title') || '').trim();
        if (t.length > 0 && t.length < 100 && !/^\d{1,2}:\d{2}/.test(t)) {
          name = t;
          break;
        }
      }

      // 2. span[dir="auto"] (common for names)
      if (!name) {
        const auto = chatItem.querySelector('span[dir="auto"]');
        if (auto) name = auto.textContent.trim();
      }

      // 3. First substantial span text
      if (!name) {
        const spans = chatItem.querySelectorAll('span');
        for (const span of spans) {
          const t = span.textContent.trim();
          if (t.length >= 2 && t.length <= 80 && !/^\d{1,2}:\d{2}$/.test(t) && !/^\d+$/.test(t)) {
            name = t;
            break;
          }
        }
      }

      if (!name) return;

      const identifier = name;
      if (processedNumbers.has(identifier)) return;
      processedNumbers.add(identifier);

      let phoneNumber = /^\+?\d[\d\s\-\(\)]{8,}$/.test(name)
        ? name.replace(/\D/g, '')
        : null;
      if (!phoneNumber) {
        const aria = chatItem.getAttribute('aria-label') || '';
        const match = aria.match(/\+?\d[\d\s\-\(\)]{8,}/);
        if (match) phoneNumber = match[0].replace(/\D/g, '');
      }

      const lastMsgEl = chatItem.querySelector('span[dir="ltr"]') || chatItem.querySelector('[data-testid="last-msg-text"]');
      const lastMessage = lastMsgEl ? lastMsgEl.textContent.trim().substring(0, 100) : '';
      const timeEl = chatItem.querySelector('[data-testid="cell-frame-secondary"] span') || chatItem.querySelector('span[aria-label*="at"]');
      const timestamp = timeEl ? timeEl.textContent.trim() : '';
      const isGroup = !!chatItem.querySelector('[data-testid="default-group"], [data-icon="default-group"]') || /group/i.test(name);

      contacts.push({
        name,
        phoneNumber: phoneNumber || 'N/A',
        isGroup,
        lastMessage,
        timestamp,
        index: index + 1
      });
    } catch (err) {
      console.error('Error processing item:', err);
    }
  });

  console.log('Extracted contacts:', contacts.length);
  return {
    success: true,
    contacts,
    totalChats: chatItems.length,
    extractedAt: new Date().toISOString()
  };
}

function scrollChatList() {
  const chatList = document.querySelector('#pane-side') ||
                  querySelectorDeep('#pane-side') ||
                  document.querySelector('[aria-label="Chat list"]');
  if (chatList) {
    chatList.scrollTop = chatList.scrollHeight;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractContacts') {
    try {
      sendResponse(extractContacts());
    } catch (e) {
      sendResponse({ success: false, error: String(e.message), contacts: [] });
    }
    return true;
  }
  if (request.action === 'scrollChatList') {
    scrollChatList();
    sendResponse({ success: true });
    return true;
  }
  if (request.action === 'checkWhatsApp') {
    const isWhatsApp = window.location.hostname === 'web.whatsapp.com';
    const hasPane = !!document.querySelector('#pane-side') || !!querySelectorDeep('#pane-side');
    const hasList = !!document.querySelector('[aria-label="Chat list"]');
    sendResponse({ isWhatsApp, isLoaded: hasPane || hasList });
    return true;
  }
});

console.log('WhatsApp Contact Exporter: Content script loaded');
