// Content script for WhatsApp Web Contact Exporter

function extractContacts() {
  const contacts = [];
  const processedNumbers = new Set();

  console.log('Starting contact extraction...');
  
  // Method 1: Try to find the main chat container
  let chatList = document.querySelector('#pane-side');
  console.log('Method 1 - #pane-side:', chatList);
  
  if (!chatList) {
    // Method 2: Look for aria-label
    chatList = document.querySelector('[aria-label="Chat list"]');
    console.log('Method 2 - aria-label Chat list:', chatList);
  }
  
  if (!chatList) {
    // Method 3: Look for the scrollable container
    const scrollables = document.querySelectorAll('div[style*="overflow"]');
    console.log('Method 3 - Found scrollable divs:', scrollables.length);
    for (const el of scrollables) {
      if (el.querySelectorAll('div[role="listitem"]').length > 0) {
        chatList = el;
        console.log('Method 3 - Found chat list in scrollable:', chatList);
        break;
      }
    }
  }
  
  if (!chatList) {
    // Method 4: Just get the whole left panel
    chatList = document.querySelector('div[id^="app"] > div > div > div:first-child');
    console.log('Method 4 - Left panel:', chatList);
  }

  if (!chatList) {
    console.error('Could not find chat list container');
    return {
      success: false,
      error: 'WhatsApp chat list not found. Make sure you are on WhatsApp Web and logged in. Try refreshing the page.',
      contacts: []
    };
  }

  // Get all chat items - be very aggressive
  let chatItems = Array.from(chatList.querySelectorAll('div[role="listitem"]'));
  console.log('Found listitem elements:', chatItems.length);
  
  if (chatItems.length === 0) {
    // Try to find divs that contain contact names
    const allDivs = Array.from(chatList.querySelectorAll('div'));
    chatItems = allDivs.filter(div => {
      const spans = div.querySelectorAll('span');
      return spans.length > 0 && div.querySelector('img, svg');
    });
    console.log('Found divs with spans and images:', chatItems.length);
  }

  if (chatItems.length === 0) {
    console.error('No chat items found. DOM structure:', chatList.innerHTML.substring(0, 500));
    return {
      success: false,
      error: 'No chats found. Please make sure:\n1. You are logged into WhatsApp Web\n2. You can see your chats on the left side\n3. WhatsApp is fully loaded\n4. Try refreshing the page',
      contacts: []
    };
  }
  
  console.log('Processing', chatItems.length, 'chat items...');

  chatItems.forEach((chatItem, index) => {
    try {
      let name = null;
      
      // Method 1: Look for title attribute
      const titleElements = chatItem.querySelectorAll('[title]');
      for (const el of titleElements) {
        const title = el.getAttribute('title');
        if (title && title.length > 0 && title.length < 100) {
          name = title;
          break;
        }
      }
      
      // Method 2: Look for specific span with dir="auto"
      if (!name) {
        const autoSpan = chatItem.querySelector('span[dir="auto"]');
        if (autoSpan) {
          name = autoSpan.textContent.trim();
        }
      }
      
      // Method 3: Find the largest text content that looks like a name
      if (!name) {
        const allSpans = Array.from(chatItem.querySelectorAll('span'));
        const candidates = allSpans
          .map(span => span.textContent.trim())
          .filter(text => text && text.length > 0 && text.length < 100 && !text.match(/^\d+:\d+/) && !text.match(/^[0-9]+$/));
        
        if (candidates.length > 0) {
          // Get the longest text as it's likely the name
          name = candidates.reduce((a, b) => a.length > b.length ? a : b);
        }
      }

      if (!name || name.length === 0) {
        console.log('No name found for chat item', index, chatItem);
        return;
      }
      
      console.log('Found contact:', name);

      // Try to extract phone number from various sources
      let phoneNumber = null;
      
      // Method 1: Check if name is a phone number
      const phoneRegex = /^\+?\d[\d\s\-\(\)]+$/;
      if (phoneRegex.test(name)) {
        phoneNumber = name.replace(/[\s\-\(\)]/g, '');
      }

      // Method 2: Look for phone number in aria-label or other attributes
      const ariaLabel = chatItem.getAttribute('aria-label') || '';
      const phoneMatch = ariaLabel.match(/\+?\d[\d\s\-\(\)]{8,}/);
      if (phoneMatch) {
        phoneNumber = phoneMatch[0].replace(/[\s\-\(\)]/g, '');
      }

      // Extract last message preview (optional)
      const lastMessageElement = chatItem.querySelector('span[dir="ltr"]') ||
                                 chatItem.querySelector('[data-testid="last-msg-text"]');
      const lastMessage = lastMessageElement ? lastMessageElement.textContent.trim() : '';

      // Extract timestamp (optional)
      const timeElement = chatItem.querySelector('div[data-testid="cell-frame-secondary"] span') ||
                         chatItem.querySelector('span[aria-label*="at"]');
      const timestamp = timeElement ? timeElement.textContent.trim() : '';

      // Check if it's a group
      const isGroup = chatItem.querySelector('[data-testid="default-group"]') !== null ||
                     chatItem.querySelector('[data-icon="default-group"]') !== null ||
                     name.toLowerCase().includes('group');

      // Create unique identifier
      const identifier = phoneNumber || name;
      
      if (!processedNumbers.has(identifier)) {
        processedNumbers.add(identifier);
        
        contacts.push({
          name: name,
          phoneNumber: phoneNumber || 'N/A',
          isGroup: isGroup,
          lastMessage: lastMessage.substring(0, 100),
          timestamp: timestamp,
          index: index + 1
        });
      }
    } catch (error) {
      console.error('Error processing chat item:', error);
    }
  });

  return {
    success: true,
    contacts: contacts,
    totalChats: chatItems.length,
    extractedAt: new Date().toISOString()
  };
}

function scrollChatList() {
  const chatList = document.querySelector('[aria-label="Chat list"]') || 
                   document.querySelector('div[data-testid="chat-list"]') ||
                   document.querySelector('#pane-side');
  
  if (chatList) {
    chatList.scrollTop = chatList.scrollHeight;
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractContacts') {
    const result = extractContacts();
    sendResponse(result);
    return true;
  }
  
  if (request.action === 'scrollChatList') {
    scrollChatList();
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'checkWhatsApp') {
    const isWhatsApp = window.location.hostname === 'web.whatsapp.com';
    const isLoaded = document.querySelector('[aria-label="Chat list"]') !== null ||
                    document.querySelector('#pane-side') !== null;
    
    sendResponse({ 
      isWhatsApp: isWhatsApp,
      isLoaded: isLoaded
    });
    return true;
  }
});

console.log('WhatsApp Contact Exporter: Content script loaded');
