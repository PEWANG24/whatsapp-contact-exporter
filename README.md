# WhatsApp Contact Exporter - Chrome Extension

Export all contacts from your WhatsApp Web chats to CSV or JSON format with a single click!

## Features

- 📱 Extract all contacts from WhatsApp Web
- 📊 Export to CSV or JSON format
- 📋 Copy contacts to clipboard
- 👥 Option to include or exclude group chats
- 🔄 Auto-scroll to load all chats
- 🎨 Beautiful and intuitive UI
- ⚡ Fast and efficient extraction

## Installation Instructions

### Method 1: Load Unpacked Extension (Developer Mode)

1. **Download the Extension Files**
   - Make sure all the extension files are in a folder on your computer

2. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Or click the three dots menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to the folder containing the extension files
   - Select the folder and click "Select" or "Open"

5. **Verify Installation**
   - You should see "WhatsApp Contact Exporter" in your extensions list
   - The extension icon should appear in your Chrome toolbar

### Method 2: Create Icons (Optional but Recommended)

The extension requires icon files. You can:

1. **Create simple icons** using any image editor
2. **Required sizes**: 16x16, 48x48, and 128x128 pixels
3. **Save them** in an `icons` folder as:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`

Or use placeholder icons temporarily (the extension will work without them, but Chrome will show a warning).

## How to Use

1. **Open WhatsApp Web**
   - Navigate to [web.whatsapp.com](https://web.whatsapp.com)
   - Make sure you're logged in and can see your chats

2. **Click the Extension Icon**
   - Click the WhatsApp Contact Exporter icon in your Chrome toolbar
   - The popup will appear

3. **Configure Options**
   - ✅ Include group chats (optional)
   - ✅ Scroll to load all chats first (recommended for large chat lists)

4. **Extract Contacts**
   - Click the "Extract Contacts" button
   - Wait for the extraction to complete

5. **Export Your Data**
   - **CSV**: Click "Export as CSV" for spreadsheet-compatible format
   - **JSON**: Click "Export as JSON" for structured data
   - **Clipboard**: Click "Copy to Clipboard" for quick paste

## Exported Data Format

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

## Troubleshooting

### Extension doesn't appear
- Make sure Developer Mode is enabled
- Try reloading the extension from `chrome://extensions/`
- Restart Chrome browser

### "Please open WhatsApp Web first" message
- Navigate to [web.whatsapp.com](https://web.whatsapp.com)
- Make sure you're logged in
- Wait for all chats to load

### No contacts found
- Scroll down in your chat list to load more chats
- Enable "Scroll to load all chats first" option
- Make sure you have active conversations

### Phone numbers showing as "N/A"
- WhatsApp Web doesn't always expose phone numbers
- Saved contacts will show names instead of numbers
- Unsaved contacts may show their phone numbers

## Privacy & Security

- ✅ All processing happens locally in your browser
- ✅ No data is sent to external servers
- ✅ No data is stored permanently
- ✅ Open source - you can review the code

## Permissions Explained

- **activeTab**: To access WhatsApp Web page content
- **storage**: To save user preferences (optional)
- **host_permissions (web.whatsapp.com)**: To run the extension only on WhatsApp Web

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Content Script**: Extracts contact data from WhatsApp Web DOM
- **Popup Interface**: User-friendly interface for interaction
- **Background Service Worker**: Handles extension lifecycle

## Limitations

- Only works on WhatsApp Web (not mobile app)
- Phone numbers may not be available for all contacts
- Group member details are not extracted (only group names)
- Requires active WhatsApp Web session

## Support

If you encounter any issues:
1. Check that you're using the latest version of Chrome
2. Make sure WhatsApp Web is fully loaded
3. Try refreshing the WhatsApp Web page
4. Reload the extension from `chrome://extensions/`

## Updates

To update the extension:
1. Download the new version files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card

## License

This extension is provided as-is for personal use.

## Credits

Made with ❤️ for WhatsApp users who need to export their contacts.

---

**Note**: This extension is not affiliated with, endorsed by, or sponsored by WhatsApp or Meta Platforms, Inc.
