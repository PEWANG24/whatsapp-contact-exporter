# 📱 WhatsApp Contact Exporter

> A Chrome extension to extract and export all your WhatsApp Web contacts to CSV or JSON format

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green.svg)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/version-1.0.0-brightgreen.svg)](https://github.com/pewang-company/whatsapp-contact-exporter)

## 🌟 Features

- ⚡ **Lightning Fast** - Extract 100+ contacts per second
- 🔒 **100% Private** - All processing happens locally in your browser
- 📊 **Multiple Formats** - Export to CSV, JSON, or clipboard
- 👥 **Group Support** - Include or exclude group chats
- 🔄 **Auto-Scroll** - Automatically load all chats before extraction
- 🎨 **Beautiful UI** - Modern gradient interface
- 📱 **Contact Details** - Name, phone number, last message, timestamp
- 🚀 **Lightweight** - Only ~30 KB total size

## 📥 Download

### Option 1: Download from Website
Visit [extensions.pewang.company/wa](https://extensions.pewang.company/wa) to download the latest version.

### Option 2: Clone from GitHub
```bash
git clone https://github.com/pewang-company/whatsapp-contact-exporter.git
cd whatsapp-contact-exporter
```

## 🚀 Installation

1. **Download the Extension**
   - Download the ZIP file from the website or clone this repository

2. **Extract Files**
   - If downloaded as ZIP, extract to a folder on your computer

3. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the extension folder
   - The extension icon will appear in your toolbar

## 📖 How to Use

1. **Open WhatsApp Web**
   - Navigate to [web.whatsapp.com](https://web.whatsapp.com)
   - Log in by scanning the QR code with your phone
   - Wait for all your chats to load

2. **Launch Extension**
   - Click the WhatsApp Contact Exporter icon in your Chrome toolbar
   - The popup interface will appear

3. **Configure Options**
   - ☑️ Include group chats (optional)
   - ☑️ Scroll to load all chats first (recommended)

4. **Extract Contacts**
   - Click the "Extract Contacts" button
   - Wait for the extraction to complete (usually 5-10 seconds)

5. **Export Data**
   - **CSV** - Opens in Excel, Google Sheets, etc.
   - **JSON** - Structured data format for developers
   - **Clipboard** - Quick paste into any document

## 📊 Export Formats

### CSV Format
```csv
Name,Phone Number,Is Group,Last Message,Timestamp
John Doe,+1234567890,No,Hey there!,10:30 AM
Family Group,N/A,Yes,See you tomorrow,Yesterday
```

### JSON Format
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

## 🔒 Privacy & Security

- ✅ **100% Local Processing** - All data processing happens in your browser
- ✅ **No External Servers** - No data is sent to any external servers
- ✅ **No Data Collection** - We don't collect, store, or track any data
- ✅ **No Analytics** - No tracking or analytics of any kind
- ✅ **Open Source** - Full source code available for review
- ✅ **Minimal Permissions** - Only requests necessary permissions

### Permissions Explained

- **activeTab** - To read WhatsApp Web page content when you click the extension
- **storage** - To save your preferences (include groups, etc.)
- **host_permissions (web.whatsapp.com)** - Extension only works on WhatsApp Web

## 🛠️ Technical Details

### Built With
- Manifest V3 (latest Chrome extension standard)
- Vanilla JavaScript (no dependencies)
- Pure HTML/CSS (no frameworks)

### File Structure
```
whatsapp-contact-exporter/
├── manifest.json          # Extension configuration
├── content.js             # Contact extraction logic
├── popup.html             # User interface
├── popup.js               # UI functionality
├── popup.css              # Styling
├── background.js          # Service worker
└── icons/                 # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### Browser Compatibility
- ✅ Google Chrome (latest)
- ✅ Microsoft Edge (Chromium-based)
- ✅ Brave Browser
- ✅ Any Chromium-based browser

## 🐛 Troubleshooting

### Extension doesn't appear
- Make sure Developer mode is enabled in `chrome://extensions/`
- Try reloading the extension
- Restart Chrome browser

### No contacts found
- Scroll down in your WhatsApp chat list to load more chats
- Enable "Scroll to load all chats first" option
- Make sure you have active conversations

### Phone numbers showing as "N/A"
- This is normal for saved contacts (WhatsApp shows names, not numbers)
- Unsaved contacts will show their phone numbers
- WhatsApp Web API has limited access to phone numbers

## 📝 Development

### Prerequisites
- Python 3.x (for icon generation)
- Pillow library: `pip install Pillow`

### Generate Icons
```bash
python3 generate_icons.py
```

### Testing Locally
1. Make changes to the code
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes on WhatsApp Web

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for WhatsApp users who need to export their contacts
- Inspired by the need for privacy-focused tools
- Thanks to all contributors and users

## ⚠️ Disclaimer

This extension is not affiliated with, endorsed by, or sponsored by WhatsApp or Meta Platforms, Inc. WhatsApp is a trademark of Meta Platforms, Inc.

## 📧 Support

- **Website**: [extensions.pewang.company/wa](https://extensions.pewang.company/wa)
- **Issues**: [GitHub Issues](https://github.com/pewang-company/whatsapp-contact-exporter/issues)
- **Company**: [Pewang Company](https://pewang.company)

## 🌟 Star History

If you find this project useful, please consider giving it a star on GitHub!

---

**Made with ❤️ by [Pewang Company](https://pewang.company)**
