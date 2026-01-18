# Granola MCP Server (Windows Edition)

A Model Context Protocol (MCP) server that connects Granola.ai meeting data with Claude Desktop, enabling AI-powered meeting intelligence queries on Windows.

## Overview

This MCP server allows you to:
- Search your meeting history with natural language
- Access full meeting transcripts
- Retrieve meeting notes and documents
- Analyze patterns across meetings (participants, topics, frequency)
- Query meeting data directly from Claude Desktop

**Key Features:**
- ✅ 100% Local Processing - All data stays on your machine
- ✅ No External API Calls - Zero data sent elsewhere
- ✅ Read-Only Access - Server only reads from cache
- ✅ Windows Compatible - Designed specifically for Windows paths
- ✅ Timezone Intelligence - Automatic local timezone display

## Prerequisites

- **Windows 10 or later**
- **Python 3.12 or higher** ([Download Python](https://www.python.org/downloads/))
- **Granola.ai installed** with meeting history
- **Claude Desktop** ([Download Claude](https://claude.ai/download))
- **uv package manager** (recommended) or pip

## Installation

### Step 1: Install uv (Recommended)

Open PowerShell and run:
```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Or use pip if you prefer:
```powershell
pip install uv
```

### Step 2: Clone or Download this Repository

```powershell
cd %USERPROFILE%
git clone <repository-url> granola-mcp-server
cd granola-mcp-server
```

### Step 3: Install Dependencies

```powershell
uv sync
```

Or with pip:
```powershell
pip install -e .
```

### Step 4: Locate Your Granola Cache File

The server needs to know where Granola stores its cache. Common Windows locations:

1. **Check AppData Roaming:**
   ```
   %APPDATA%\Granola\cache-v3.json
   ```

2. **Check Local AppData:**
   ```
   %LOCALAPPDATA%\Granola\cache-v3.json
   ```

3. **Search manually:**
   - Press `Windows Key + E` to open File Explorer
   - Paste `%APPDATA%` in the address bar
   - Look for a "Granola" folder
   - Find the cache file (usually named `cache-v3.json`)

**Note the full path** - you'll need it for configuration!

### Step 5: Configure Claude Desktop

1. **Open Claude Desktop config file:**
   - Press `Windows Key + R`
   - Type: `%APPDATA%\Claude\claude_desktop_config.json`
   - Press Enter

2. **If the file doesn't exist**, create it with this content:
   ```json
   {
     "mcpServers": {
       "granola": {
         "command": "python",
         "args": [
           "-m",
           "granola_mcp_server.server"
         ],
         "env": {
           "PYTHONPATH": "C:\\Users\\YOUR_USERNAME\\granola-mcp-server"
         }
       }
     }
   }
   ```

3. **If the file exists**, add the `granola` section to the `mcpServers` object.

4. **Replace `YOUR_USERNAME`** with your actual Windows username.

5. **Optional: Specify custom cache path** (if Granola is in a non-standard location):
   ```json
   {
     "mcpServers": {
       "granola": {
         "command": "python",
         "args": [
           "-m",
           "granola_mcp_server.server"
         ],
         "env": {
           "PYTHONPATH": "C:\\Users\\YOUR_USERNAME\\granola-mcp-server",
           "GRANOLA_CACHE_PATH": "C:\\path\\to\\your\\Granola\\cache-v3.json"
         }
       }
     }
   }
   ```

### Step 6: Restart Claude Desktop

Close and reopen Claude Desktop for the changes to take effect.

## Usage

Once configured, you can ask Claude to interact with your Granola meeting data:

### Example Queries

**Search Meetings:**
```
"Search for meetings about quarterly planning"
"Find meetings with John from this week"
"Show me yesterday's meetings"
```

**Get Transcripts:**
```
"Get the transcript from yesterday's team meeting"
"What was discussed in the client call on Monday?"
"Show me the full conversation from meeting ID abc123"
```

**Analyze Patterns:**
```
"Analyze participant patterns from last month"
"Show meeting frequency trends"
"What topics have been discussed most this quarter?"
```

**Access Meeting Details:**
```
"Get details for meeting abc123"
"Show me documents from the product review meeting"
"Who attended the standup this morning?"
```

## Available MCP Tools

The server exposes five tools to Claude:

### 1. `search_meetings`
Search meetings by title, content, or participants
- **Parameters:**
  - `query` (string): Search term
  - `limit` (integer, optional): Max results (default: 10)

### 2. `get_meeting_details`
Get comprehensive meeting information
- **Parameters:**
  - `meeting_id` (string): Meeting identifier

### 3. `get_meeting_transcript`
Access full meeting transcript with speaker identification
- **Parameters:**
  - `meeting_id` (string): Meeting identifier

### 4. `get_meeting_documents`
Retrieve meeting notes and documents
- **Parameters:**
  - `meeting_id` (string): Meeting identifier

### 5. `analyze_meeting_patterns`
Analyze trends across meetings
- **Parameters:**
  - `pattern_type` (string): One of "topics", "participants", or "frequency"
  - `date_range` (object, optional): Start and end dates

## Troubleshooting

### "Cache file not found"

**Problem:** Server can't locate your Granola cache.

**Solutions:**
1. Verify Granola is installed and has processed meetings
2. Manually find the cache file (see Step 4 above)
3. Set the `GRANOLA_CACHE_PATH` environment variable in Claude config:
   ```json
   "env": {
     "GRANOLA_CACHE_PATH": "C:\\Users\\YourName\\AppData\\Roaming\\Granola\\cache-v3.json"
   }
   ```

### "Module not found" or "Import error"

**Problem:** Python can't find the granola_mcp_server module.

**Solutions:**
1. Ensure you're using the correct Python version (3.12+):
   ```powershell
   python --version
   ```
2. Verify the `PYTHONPATH` in your Claude config points to the correct directory
3. Try using absolute path to Python:
   ```json
   "command": "C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Programs\\Python\\Python312\\python.exe"
   ```

### "Server not appearing in Claude Desktop"

**Solutions:**
1. Check Claude Desktop logs:
   - Location: `%APPDATA%\Claude\logs\`
   - Look for `mcp-server-granola.log`
2. Verify JSON syntax in `claude_desktop_config.json` (use [JSONLint](https://jsonlint.com/))
3. Ensure all backslashes in paths are doubled (`\\`) or use forward slashes (`/`)
4. Restart Claude Desktop after config changes

### "Permission denied" errors

**Solutions:**
1. Run Claude Desktop as administrator (right-click > Run as administrator)
2. Check that the Granola cache file has read permissions
3. Ensure Python has permission to access the Granola directory

### Testing the Server Manually

Test if the server can load your cache:

```powershell
cd granola-mcp-server
python -m granola_mcp_server.server
```

The server should start and print initialization messages. Press `Ctrl+C` to stop.

## Environment Variables

You can configure the server using environment variables:

- `GRANOLA_CACHE_PATH`: Custom path to Granola cache file
- `GRANOLA_PARSE_PANELS`: Set to "0" to disable document panel parsing (default: "1")
- `TZ`: Set timezone (e.g., "America/New_York", "America/Los_Angeles")

## How It Works

1. **Cache Reading:** The server reads Granola's local cache file (`cache-v3.json`)
2. **Data Parsing:** Parses nested JSON structures containing meetings, transcripts, and documents
3. **MCP Protocol:** Exposes tools via the Model Context Protocol
4. **Claude Integration:** Claude Desktop can call these tools to query your meeting data

**Data Flow:**
```
Granola.ai → Local Cache File → MCP Server → Claude Desktop → You
```

All processing happens locally on your machine.

## Privacy & Security

- ✅ **100% Local:** No data leaves your computer
- ✅ **Read-Only:** Server only reads the cache, never modifies it
- ✅ **No Network:** Zero external API calls
- ✅ **Respects Permissions:** Uses existing Granola access controls

## Development

### Project Structure
```
granola-mcp-server/
├── granola_mcp_server/
│   ├── __init__.py        # Package initialization
│   ├── models.py          # Pydantic data models
│   └── server.py          # Main MCP server implementation
├── pyproject.toml         # Project dependencies
└── README.md             # This file
```

### Running Tests

Test the server with sample cache data:

```powershell
python -m granola_mcp_server.server
```

### Adding Dependencies

```powershell
uv add package-name
```

## Limitations

- **Windows Only:** This version is optimized for Windows (macOS/Linux versions available separately)
- **Local Cache:** Only accesses data that Granola has cached locally
- **Cache Format:** Depends on Granola's cache structure (may change with updates)
- **Python 3.12+:** Requires modern Python version

## Credits

- Based on the granola-ai-mcp-server project by proofgeist
- Inspired by the cobblehillmachine/granola-claude-mcp repository
- Adapted for Windows compatibility

## License

MIT License - See LICENSE file for details

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review Claude Desktop logs in `%APPDATA%\Claude\logs\`
3. Verify your Granola cache file exists and is readable
4. Ensure all paths use Windows format (double backslashes or forward slashes)

---

**Note:** This is an unofficial integration. Granola.ai and Anthropic are not affiliated with this project.
