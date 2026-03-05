// Content script for WhatsApp Web Contact Exporter

function extractContacts() {
  const contacts = [];
  const processedNumbers = new Set();

  // Wait for WhatsApp to load - try multiple selectors
  const chatList = document.querySelector('[aria-label="Chat list"]') || 
                   document.querySelector('[aria-label*="chat"]') ||
                   document.querySelector('div[data-testid="chat-list"]') ||
                   document.querySelector('#pane-side') ||
                   document.querySelector('div[role="grid"]') ||
                   document.querySelector('div[class*="chat-list"]');

  console.log('Chat list found:', chatList);

  if (!chatList) {
    return {
      success: false,
      error: 'WhatsApp chat list not found. Make sure you are on WhatsApp Web and logged in.',
      contacts: []
    };
  }

  // Get all chat items - try multiple selectors
  let chatItems = chatList.querySelectorAll('div[role="listitem"]');
  
  if (chatItems.length === 0) {
    chatItems = chatList.querySelectorAll('[data-testid="cell-frame-container"]');
  }
  
  if (chatItems.length === 0) {
    chatItems = chatList.querySelectorAll('div[class*="chat"]');
  }
  
  if (chatItems.length === 0) {
    // Try to find any div that looks like a chat item
    chatItems = chatList.querySelectorAll('div > div > div');
  }

  console.log('Chat items found:', chatItems.length);

  if (chatItems.length === 0) {
    return {
      success: false,
      error: 'No chats found. Make sure you have some conversations in WhatsApp. Found chat list but no chat items.',
      contacts: []
    };
  }

  chatItems.forEach((chatItem, index) => {
    try {
      // Extract contact name - try multiple selectors
      let nameElement = chatItem.querySelector('span[dir="auto"][title]') ||
                       chatItem.querySelector('span[title]') ||
                       chatItem.querySelector('[data-testid="conversation-info-header-chat-title"]') ||
                       chatItem.querySelector('span[class*="ggj6brxn"]') ||
                       chatItem.querySelector('div[class*="_11JPr"] span');
      
      let name = null;
      
      if (nameElement) {
        name = nameElement.getAttribute('title') || nameElement.textContent.trim();
      } else {
        // Fallback: try to find any text that looks like a name
        const allSpans = chatItem.querySelectorAll('span');
        for (const span of allSpans) {
          const text = span.textContent.trim();
          if (text && text.length > 0 && text.length < 100 && !text.includes('\n')) {
            name = text;
            break;
          }
        }
      }

      if (!name || name.length === 0) {
        console.log('No name found for chat item', index);
        return;
      }

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
