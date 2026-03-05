# 🚀 Quick Installation Guide

## WhatsApp Contact Exporter Chrome Extension

Everything is ready! Follow these simple steps to install your extension.

---

## ✅ Step 1: Verify Files

Make sure you have all these files in your folder:

```
extract contacts/
├── manifest.json
├── content.js
├── popup.html
├── popup.js
├── popup.css
├── background.js
├── icons/
│   ├── icon16.png ✓
│   ├── icon48.png ✓
│   └── icon128.png ✓
└── README.md
```

**All files are ready!** ✓

---

## 📦 Step 2: Install Extension in Chrome

### 1. Open Chrome Extensions Page

Choose one of these methods:

- **Method A**: Type `chrome://extensions/` in your address bar and press Enter
- **Method B**: Click the three dots menu (⋮) → More Tools → Extensions

### 2. Enable Developer Mode

- Look for the **"Developer mode"** toggle in the top-right corner
- Click it to turn it **ON** (it should turn blue)

### 3. Load Your Extension

- Click the **"Load unpacked"** button (appears after enabling Developer mode)
- Navigate to and select the **"extract contacts"** folder
- Click **"Select"** or **"Open"**

### 4. Verify Installation

You should see:
- ✅ "WhatsApp Contact Exporter" in your extensions list
- ✅ The extension icon in your Chrome toolbar
- ✅ No errors (if you see errors, check that all files are present)

---

## 🎯 Step 3: Use the Extension

### 1. Open WhatsApp Web

- Go to [https://web.whatsapp.com](https://web.whatsapp.com)
- Log in by scanning the QR code with your phone
- Wait for all your chats to load

### 2. Click the Extension Icon

- Find the WhatsApp Contact Exporter icon in your Chrome toolbar
- Click it to open the popup

### 3. Extract Contacts

**Options:**
- ☑️ **Include group chats** - Check to include groups in export
- ☑️ **Scroll to load all chats first** - Recommended for large contact lists

**Click "Extract Contacts"** and wait a few seconds

### 4. Export Your Data

Choose your preferred format:

- **📄 Export as CSV** - Opens in Excel, Google Sheets, etc.
- **📋 Export as JSON** - Structured data format
- **📋 Copy to Clipboard** - Quick paste into any document

---

## 📊 What You'll Get

### CSV Format (Excel-friendly)
```csv
Name,Phone Number,Is Group,Last Message,Timestamp
John Doe,+1234567890,No,Hey there!,10:30 AM
Family Group,N/A,Yes,See you tomorrow,Yesterday
```

### JSON Format (Developer-friendly)
```json
[
  {
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "isGroup": false,
    "lastMessage": "Hey there!",
    "timestamp": "10:30 AM",
    "index": 1
  }
]
```

---

## 🔧 Troubleshooting

### Extension doesn't appear in toolbar
- Go to `chrome://extensions/`
- Make sure the extension is **enabled** (toggle should be blue)
- Click the puzzle icon in toolbar → Pin the extension

### "Please open WhatsApp Web first" message
- Make sure you're on `web.whatsapp.com`
- Wait for WhatsApp to fully load
- Refresh the page if needed

### No contacts found
- Scroll down in your WhatsApp chat list first
- Enable "Scroll to load all chats first" option
- Make sure you have conversations in WhatsApp

### Phone numbers showing as "N/A"
- This is normal for saved contacts (WhatsApp shows names, not numbers)
- Unsaved contacts will show their phone numbers
- WhatsApp Web API has limited access to phone numbers

### Extension not working after Chrome update
- Go to `chrome://extensions/`
- Click the refresh icon (🔄) on the extension card
- Or remove and reload the extension

---

## 🔒 Privacy & Security

- ✅ **100% Local** - All processing happens in your browser
- ✅ **No External Servers** - No data is sent anywhere
- ✅ **No Storage** - Data is not saved permanently
- ✅ **Open Source** - You can review all the code

---

## 💡 Tips for Best Results

1. **Before extracting:**
   - Scroll through your chat list to load all contacts
   - Or enable "Scroll to load all chats first" option

2. **For large contact lists:**
   - Enable auto-scroll option
   - Wait for extraction to complete (may take 10-30 seconds)

3. **To update contacts:**
   - Simply run the extraction again
   - It will get the latest data from WhatsApp

4. **Organizing exported data:**
   - CSV files open directly in Excel/Google Sheets
   - JSON files can be imported into databases or apps

---

## 🎉 You're All Set!

Your WhatsApp Contact Exporter is ready to use!

**Quick Start:**
1. Open WhatsApp Web
2. Click extension icon
3. Click "Extract Contacts"
4. Export your data

---

## 📞 Need Help?

If you encounter any issues:
1. Check that you're using the latest version of Chrome
2. Make sure WhatsApp Web is fully loaded
3. Try refreshing the WhatsApp Web page
4. Reload the extension from `chrome://extensions/`

---

**Made with ❤️ for WhatsApp users**

*Note: This extension is not affiliated with WhatsApp or Meta Platforms, Inc.*
