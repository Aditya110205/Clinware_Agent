
# Clinware Intelligence Agent

A Java-based AI agent that acts as a Market Intelligence Researcher, providing comprehensive analysis about Clinware (a post-acute care AI company) by combining real-time news data with advanced AI analysis using Google's Gemini AI.

## 🎯 Project Overview

This intelligent agent demonstrates:
- **MCP (Model Context Protocol)** integration for extensible tool usage
- **Gemini 2.5 Flash AI** for intelligent content analysis
- **Automatic tool calling** - Agent decides when to search for news vs use internal knowledge
- **Structured intelligence reports** with funding, product, and market positioning insights

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                 ClinwareAgent                       │
│  (Main AI Agent - Decision Making & Orchestration)  │
└───────────────┬─────────────────┬───────────────────┘
                │                 │
                ▼                 ▼
    ┌───────────────────┐  ┌──────────────────┐
    │   MCPClient       │  │  Gemini 2.5 AI   │
    │ (News Retrieval)  │  │  (Analysis)      │
    └─────────┬─────────┘  └──────────────────┘
              │
              ▼
    ┌───────────────────┐
    │ Verge News MCP    │
    │ Server (Node.js)  │
    └───────────────────┘
```

### Components:

1. **ClinwareAgent.java** - Main orchestrator that:
   - Analyzes user queries
   - Decides when to fetch news
   - Calls Gemini AI for analysis
   - Formats responses

2. **MCPClient.java** - MCP protocol client that:
   - Manages MCP server lifecycle
   - Sends JSON-RPC requests
   - Parses news responses

3. **Config.java** - Environment configuration loader
   - Reads `.env` file
   - Manages API keys securely

4. **Verge News MCP Server** (Node.js) - News retrieval service that:
   - Implements MCP protocol
   - Fetches news via NewsAPI
   - Returns structured data

---

## 🚀 Features

### ✅ Intelligent Tool Calling
The agent automatically detects when a query requires news search:
```
Query: "What's the latest news about Clinware?"
→ Agent searches for news ✓

Query: "What is post-acute care?"
→ Uses internal knowledge ✓
```

### ✅ Comprehensive Analysis
Generates structured reports with:
- **Key Findings Summary**
- **Main Themes** (Funding, Products, Market Position)
- **Actionable Insights** for stakeholders

### ✅ MCP Protocol Integration
Full JSON-RPC 2.0 implementation with:
- Initialization handshake
- Tool listing
- Tool execution
- Error handling

---

## 📋 Prerequisites

- **Java 17+** - [Download](https://adoptium.net/)
- **Maven 3.6+** - [Download](https://maven.apache.org/download.cgi)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Gemini API Key** - [Get Free Key](https://aistudio.google.com/app/apikey)
- **NewsAPI Key** (Optional) - [Get Free Key](https://newsapi.org/register)

---

## 🛠️ Installation

### 1. Clone or Download the Project

```bash
cd C:\Users\YourName
git clone <your-repo-url>
cd clinware-agent
```

### 2. Create `.env` File

Create a file named `.env` in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
NEWS_API_KEY=your_news_api_key_here
```

**Important:** 
- Get Gemini key from: https://aistudio.google.com/app/apikey
- Get NewsAPI key from: https://newsapi.org/register (optional - uses mock data if not set)

### 3. Build the Project

```bash
mvn clean package
```

Expected output: `BUILD SUCCESS`

---

## ▶️ Running the Agent

### Option 1: Run with Java (Recommended)

```bash
java -cp target/clinware-agent-1.0-SNAPSHOT-jar-with-dependencies.jar com.clinware.agent.ClinwareAgent
```

### Option 2: Run from VS Code

1. Open `ClinwareAgent.java`
2. Click the **Run** button above the `main` method
3. View output in the integrated terminal

### Option 3: Maven Exec (if configured)

```bash
mvn exec:java -Dexec.mainClass="com.clinware.agent.ClinwareAgent"
```

---

## 📊 Example Output

```
╔════════════════════════════════════════════════════════════════╗
║        CLINWARE INTELLIGENCE AGENT                             ║
║        Market Intelligence Researcher                          ║
╚════════════════════════════════════════════════════════════════╝

✅ Configuration loaded successfully
✅ Clinware Intelligence Agent initialized
📱 Model: gemini-2.5-flash

======================================================================
💬 User Query: What's the latest news about Clinware's funding?
======================================================================

🚀 Starting Verge News MCP Server...
✅ Verge News MCP Server started successfully
🤖 Agent Decision: This query requires news search
🔍 Search Query: Clinware funding
📰 News Data Retrieved...

🤖 Agent Response:
Here's an analysis of the latest news regarding Clinware's funding:

### Summary of Key Findings:
- Clinware has successfully secured Series A funding...
- The funding will accelerate product development...
[... detailed analysis ...]

### Actionable Insights:
- For Investors: Monitor Clinware's growth trajectory...
- For Competitors: Assess competitive positioning...
```

---

## 🧪 Testing the Agent

The agent processes three example queries by default:

1. **"What's the latest news about Clinware's funding and products?"**
   - Tests: News search, funding analysis
   
2. **"Tell me about recent developments at Clinware"**
   - Tests: General news search, comprehensive analysis
   
3. **"What is Clinware's market positioning in post-acute care?"**
   - Tests: Market analysis, competitive insights

### Custom Queries

To test with your own queries, modify the `queries` array in `ClinwareAgent.java`:

```java
String[] queries = {
    "Your custom query here",
    "Another query..."
};
```

---

## 📁 Project Structure

```
clinware-agent/
├── pom.xml                          # Maven configuration
├── .env                             # API keys (DO NOT COMMIT)
├── .gitignore                       # Git ignore rules
├── README.md                        # This file
│
├── src/main/java/com/clinware/agent/
│   ├── ClinwareAgent.java          # Main AI agent
│   ├── MCPClient.java              # MCP protocol client
│   └── Config.java                 # Configuration loader
│
├── verge-news-mcp/
│   ├── index.js                    # MCP news server
│   └── package.json                # Node.js configuration
│
└── target/                         # Compiled output (generated)
    └── clinware-agent-1.0-SNAPSHOT-jar-with-dependencies.jar
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini API key for AI analysis |
| `NEWS_API_KEY` | ⚠️ Optional | NewsAPI key for real news (uses mock data if not set) |

### Maven Dependencies

- **google-cloud-vertexai** (1.3.0) - Gemini AI SDK
- **gson** (2.10.1) - JSON processing
- **okhttp3** (4.12.0) - HTTP client
- **slf4j-simple** (2.0.9) - Logging

---

## 🐛 Troubleshooting

### Issue: "GEMINI_API_KEY not found"

**Solution:**
1. Verify `.env` file exists in project root
2. Check no extra spaces: `GEMINI_API_KEY=AIza...`
3. Restart the application

### Issue: "MCP Server not found"

**Solution:**
1. Verify `verge-news-mcp/index.js` exists
2. Check Node.js is installed: `node --version`
3. Ensure file path is correct in `MCPClient.java`

### Issue: "Build Failure"

**Solution:**
```bash
# Clean and rebuild
mvn clean install -U

# If still fails, check Java version
java -version  # Should be 17+
```

### Issue: Mock Data Instead of Real News

**Solution:**
- Add `NEWS_API_KEY` to `.env` file
- Get free key from: https://newsapi.org/register

---

## 🚀 Advanced Usage

### Add Custom Queries Interactively

Modify `ClinwareAgent.java` main method:

```java
Scanner scanner = new Scanner(System.in);
while (true) {
    System.out.print("\nEnter query (or 'quit'): ");
    String query = scanner.nextLine();
    
    if (query.equalsIgnoreCase("quit")) break;
    
    String response = agent.processQuery(query);
    System.out.println(response);
}
```

### Export Results to File

```java
try (FileWriter writer = new FileWriter("analysis.txt")) {
    writer.write(response);
}
```

### Integrate Additional MCP Servers

1. Add new MCP server in separate folder
2. Create client class (similar to `MCPClient.java`)
3. Integrate into `ClinwareAgent` decision logic

---

## 📚 Technical Details

### MCP Protocol Implementation

The agent implements Model Context Protocol (MCP) with:

1. **Initialization Handshake**
   ```json
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{...}}
   ```

2. **Tool Listing**
   ```json
   {"jsonrpc":"2.0","id":2,"method":"tools/list"}
   ```

3. **Tool Execution**
   ```json
   {"jsonrpc":"2.0","id":3,"method":"tools/call","params":{...}}
   ```

### Gemini API Integration

Uses Google Generative AI REST API:
- Endpoint: `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent`
- Authentication: API Key via query parameter
- Request: JSON with content parts
- Response: Structured JSON with generated text

---

## 🔒 Security Notes

1. **Never commit `.env` file** - Contains sensitive API keys
2. **Use `.gitignore`** - Already configured to exclude `.env`
3. **Rotate API keys** regularly
4. **Limit API key permissions** to minimum required scope

---

## 🎓 Learning Resources

- [MCP Protocol Specification](https://github.com/modelcontextprotocol/servers)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Maven Documentation](https://maven.apache.org/guides/)
- [Java 17 Features](https://www.oracle.com/java/technologies/javase/17-relnote-issues.html)

---

## 📝 Assignment Requirements Checklist

- ✅ Java-based AI Agent using Google GenAI SDK
- ✅ MCP server integration (Verge News MCP)
- ✅ Automatic tool calling decision logic
- ✅ System instructions for market intelligence focus
- ✅ Identifies funding, products, market positioning
- ✅ Java 17+ with Maven build system
- ✅ Successful MCP handshake implementation
- ✅ Tool output parsing and injection into LLM
- ✅ Error handling for timeouts and failures

---

## 👨‍💻 Author

**Your Name**
- Email: your.email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)

---

## 📄 License

This project is created for educational purposes as part of a technical assessment.

---

## 🙏 Acknowledgments

- Google Gemini AI for powerful language models
- NewsAPI for news data access
- Anthropic's MCP specification for protocol design
- Maven community for build tooling

---

## 📞 Support

For issues or questions:
1. Check the **Troubleshooting** section above
2. Review error messages in the console output
3. Verify all prerequisites are installed
4. Check API keys are valid and active

---

**Last Updated:** January 2026
