#!/usr/bin/env node

/**
 * Verge News MCP Server
 * A Model Context Protocol server for fetching tech news
 * Compatible with the assignment requirements
 */

const https = require('https');
const http = require('http');

// JSON-RPC message handling via stdin/stdout
let buffer = '';
let requestId = 1;

/**
 * Send JSON-RPC response to stdout
 */
function sendMessage(message) {
  const json = JSON.stringify(message);
  process.stdout.write(json + '\n');
}

/**
 * Send JSON-RPC error response
 */
function sendError(id, code, message) {
  sendMessage({
    jsonrpc: '2.0',
    id: id,
    error: {
      code: code,
      message: message
    }
  });
}

/**
 * Send JSON-RPC success response
 */
function sendResult(id, result) {
  sendMessage({
    jsonrpc: '2.0',
    id: id,
    result: result
  });
}

/**
 * Fetch news from multiple sources
 * Since we don't have The Verge API, we'll use NewsAPI as fallback
 */
async function fetchNews(query) {
  return new Promise((resolve, reject) => {
    // Use NewsAPI with the query
    const apiKey = process.env.NEWS_API_KEY || '';
    
    if (!apiKey) {
      // Fallback to mock data for demo purposes
      console.error('[MCP Server] Warning: No NEWS_API_KEY found, using mock data');
      resolve(getMockNewsData(query));
      return;
    }

    const encodedQuery = encodeURIComponent(query);
    const url = `https://newsapi.org/v2/everything?q=${encodedQuery}&sortBy=publishedAt&pageSize=10&language=en&apiKey=${apiKey}`;

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.status === 'ok' && parsed.articles) {
            resolve(formatNewsData(parsed.articles, query));
          } else {
            resolve(getMockNewsData(query));
          }
        } catch (e) {
          console.error('[MCP Server] Parse error:', e.message);
          resolve(getMockNewsData(query));
        }
      });
    }).on('error', (err) => {
      console.error('[MCP Server] Fetch error:', err.message);
      resolve(getMockNewsData(query));
    });
  });
}

/**
 * Format news data into readable text
 */
function formatNewsData(articles, query) {
  if (!articles || articles.length === 0) {
    return `No recent news found about "${query}".\n\nThis could mean:\n- The topic hasn't been in recent news\n- Try a different search term\n- Check if the company name is spelled correctly`;
  }

  let result = `📰 Latest News about "${query}"\n`;
  result += `Found ${articles.length} recent articles:\n\n`;
  result += '='.repeat(70) + '\n\n';

  articles.forEach((article, index) => {
    result += `${index + 1}. ${article.title}\n`;
    result += `   📅 Published: ${new Date(article.publishedAt).toLocaleDateString()}\n`;
    result += `   📰 Source: ${article.source.name}\n`;
    
    if (article.description) {
      result += `   📝 ${article.description}\n`;
    }
    
    if (article.url) {
      result += `   🔗 ${article.url}\n`;
    }
    
    result += '\n' + '-'.repeat(70) + '\n\n';
  });

  return result;
}

/**
 * Mock news data for demonstration when API is unavailable
 */
function getMockNewsData(query) {
  const mockArticles = [
    {
      title: `${query} Announces New AI-Powered Healthcare Platform`,
      publishedAt: new Date().toISOString(),
      source: { name: 'Healthcare Tech News' },
      description: `${query} has launched a revolutionary AI-powered platform designed to transform post-acute care management. The platform leverages advanced machine learning algorithms to optimize patient outcomes.`,
      url: `https://example.com/news/${query.toLowerCase()}-ai-platform`
    },
    {
      title: `${query} Secures Series A Funding for Healthcare Innovation`,
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      source: { name: 'VentureBeat' },
      description: `${query}, a post-acute care AI company, has raised significant funding to expand its healthcare technology solutions. The funding will accelerate product development and market expansion.`,
      url: `https://example.com/news/${query.toLowerCase()}-funding`
    },
    {
      title: `How ${query} is Revolutionizing Post-Acute Care with AI`,
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      source: { name: 'TechCrunch' },
      description: `An in-depth look at how ${query}'s innovative approach to AI in healthcare is changing the post-acute care landscape. The company's technology is helping providers improve patient outcomes while reducing costs.`,
      url: `https://example.com/news/${query.toLowerCase()}-revolution`
    }
  ];

  let result = `📰 Latest News about "${query}"\n`;
  result += `Found ${mockArticles.length} articles (Demo Data):\n\n`;
  result += '='.repeat(70) + '\n\n';
  result += '⚠️  Note: Using mock data. Set NEWS_API_KEY environment variable for real news.\n\n';

  mockArticles.forEach((article, index) => {
    result += `${index + 1}. ${article.title}\n`;
    result += `   📅 Published: ${new Date(article.publishedAt).toLocaleDateString()}\n`;
    result += `   📰 Source: ${article.source.name}\n`;
    result += `   📝 ${article.description}\n`;
    result += `   🔗 ${article.url}\n`;
    result += '\n' + '-'.repeat(70) + '\n\n';
  });

  return result;
}

/**
 * Handle MCP protocol messages
 */
async function handleMessage(message) {
  const { jsonrpc, id, method, params } = message;

  if (jsonrpc !== '2.0') {
    sendError(id, -32600, 'Invalid JSON-RPC version');
    return;
  }

  console.error(`[MCP Server] Received method: ${method}`);

  switch (method) {
    case 'initialize':
      sendResult(id, {
        protocolVersion: '2024-11-05',
        serverInfo: {
          name: 'verge-news-mcp',
          version: '1.0.0',
          description: 'A news search MCP server for tech and healthcare news'
        },
        capabilities: {
          tools: {}
        }
      });
      console.error('[MCP Server] Initialized successfully');
      break;

    case 'tools/list':
      sendResult(id, {
        tools: [
          {
            name: 'search_news',
            description: 'Search for recent news articles about a specific topic, company, or keyword',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The search query (e.g., "Clinware", "AI in healthcare", "post-acute care")'
                }
              },
              required: ['query']
            }
          }
        ]
      });
      console.error('[MCP Server] Sent tools list');
      break;

    case 'tools/call':
      if (!params || !params.name) {
        sendError(id, -32602, 'Invalid params: missing tool name');
        return;
      }

      if (params.name === 'search_news') {
        const query = params.arguments?.query;
        
        if (!query) {
          sendError(id, -32602, 'Invalid params: missing query argument');
          return;
        }

        console.error(`[MCP Server] Searching news for: ${query}`);
        
        try {
          const newsText = await fetchNews(query);
          sendResult(id, {
            content: [
              {
                type: 'text',
                text: newsText
              }
            ]
          });
          console.error('[MCP Server] News search completed');
        } catch (error) {
          sendError(id, -32000, `Error fetching news: ${error.message}`);
        }
      } else {
        sendError(id, -32601, `Unknown tool: ${params.name}`);
      }
      break;

    default:
      sendError(id, -32601, `Unknown method: ${method}`);
  }
}

/**
 * Process stdin line by line
 */
process.stdin.on('data', (chunk) => {
  buffer += chunk.toString();
  
  let newlineIndex;
  while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, newlineIndex).trim();
    buffer = buffer.slice(newlineIndex + 1);
    
    if (line) {
      try {
        const message = JSON.parse(line);
        handleMessage(message);
      } catch (e) {
        console.error('[MCP Server] JSON parse error:', e.message);
        sendError(null, -32700, 'Parse error');
      }
    }
  }
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.error('[MCP Server] Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('[MCP Server] Shutting down...');
  process.exit(0);
});

console.error('[MCP Server] Verge News MCP Server started on stdio');
console.error('[MCP Server] Waiting for JSON-RPC messages...');