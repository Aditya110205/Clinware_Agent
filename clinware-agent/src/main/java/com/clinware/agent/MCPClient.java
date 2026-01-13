package com.clinware.agent;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;

import java.io.*;
import java.util.concurrent.TimeUnit;

/**
 * MCP (Model Context Protocol) Client
 * Communicates with the Verge News MCP server via stdio
 */
public class MCPClient {
    
    private Process mcpProcess;
    private BufferedReader reader;
    private BufferedWriter writer;
    private final Gson gson;
    private int requestId = 1;

    public MCPClient() {
        this.gson = new Gson();
    }

    /**
     * Start the MCP server process
     */
    public void start() throws IOException {
        System.out.println("🚀 Starting Verge News MCP Server...");
        
        // Start the Verge News MCP server (local implementation)
        String projectRoot = System.getProperty("user.dir");
        String mcpServerPath = projectRoot + "\\verge-news-mcp\\index.js";
        
        // Check if the server file exists
        File serverFile = new File(mcpServerPath);
        if (!serverFile.exists()) {
            throw new IOException(
                "MCP Server not found at: " + mcpServerPath + "\n" +
                "Please ensure you created the verge-news-mcp folder with index.js"
            );
        }
        
        ProcessBuilder pb = new ProcessBuilder(
            "node", mcpServerPath
        );
        
        // Redirect error stream to see MCP server logs
        pb.redirectErrorStream(false);
        
        mcpProcess = pb.start();
        
        // Set up input/output streams
        reader = new BufferedReader(new InputStreamReader(mcpProcess.getInputStream()));
        writer = new BufferedWriter(new OutputStreamWriter(mcpProcess.getOutputStream()));
        
        // Start a thread to read stderr (server logs)
        startErrorStreamReader();
        
        // Wait a moment for server to start
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Initialize the connection
        initialize();
        
        System.out.println("✅ Verge News MCP Server started successfully");
    }

    /**
     * Start a thread to read and display server logs from stderr
     */
    private void startErrorStreamReader() {
        Thread errorThread = new Thread(() -> {
            try (BufferedReader errorReader = new BufferedReader(
                    new InputStreamReader(mcpProcess.getErrorStream()))) {
                String line;
                while ((line = errorReader.readLine()) != null) {
                    System.err.println("[MCP Server Log] " + line);
                }
            } catch (IOException e) {
                // Server stopped, ignore
            }
        });
        errorThread.setDaemon(true);
        errorThread.start();
    }

    /**
     * Initialize the MCP connection with a handshake
     */
    private void initialize() throws IOException {
        JsonObject initRequest = new JsonObject();
        initRequest.addProperty("jsonrpc", "2.0");
        initRequest.addProperty("id", requestId++);
        initRequest.addProperty("method", "initialize");
        
        JsonObject params = new JsonObject();
        params.addProperty("protocolVersion", "2024-11-05");
        
        JsonObject clientInfo = new JsonObject();
        clientInfo.addProperty("name", "clinware-agent");
        clientInfo.addProperty("version", "1.0.0");
        params.add("clientInfo", clientInfo);
        
        initRequest.add("params", params);
        
        sendRequest(initRequest);
        String response = readResponse();
        
        // Verify initialization succeeded
        JsonObject responseObj = gson.fromJson(response, JsonObject.class);
        if (responseObj.has("error")) {
            throw new IOException("MCP initialization failed: " + 
                responseObj.getAsJsonObject("error").get("message").getAsString());
        }
    }

    /**
     * Search for news using the MCP server
     */
    public String searchNews(String query) throws IOException {
        System.out.println("🔍 Searching for news: " + query);
        
        // Create the tool call request
        JsonObject toolRequest = new JsonObject();
        toolRequest.addProperty("jsonrpc", "2.0");
        toolRequest.addProperty("id", requestId++);
        toolRequest.addProperty("method", "tools/call");
        
        JsonObject params = new JsonObject();
        params.addProperty("name", "search_news");
        
        JsonObject arguments = new JsonObject();
        arguments.addProperty("query", query);
        params.add("arguments", arguments);
        
        toolRequest.add("params", params);
        
        // Send request and get response
        sendRequest(toolRequest);
        String response = readResponse();
        
        // Parse and extract the news content
        return parseNewsResponse(response);
    }

    /**
     * Send a JSON-RPC request to the MCP server
     */
    private void sendRequest(JsonObject request) throws IOException {
        String json = gson.toJson(request);
        writer.write(json);
        writer.newLine();
        writer.flush();
    }

    /**
     * Read a JSON-RPC response from the MCP server
     */
    private String readResponse() throws IOException {
        String line = reader.readLine();
        
        if (line == null) {
            throw new IOException("MCP server closed connection");
        }
        
        return line.trim();
    }

    /**
     * Parse the news response and extract article information
     */
    private String parseNewsResponse(String jsonResponse) {
        try {
            JsonObject response = gson.fromJson(jsonResponse, JsonObject.class);
            
            // Check for errors
            if (response.has("error")) {
                JsonObject error = response.getAsJsonObject("error");
                return "❌ Error: " + error.get("message").getAsString();
            }
            
            // Extract the result
            if (response.has("result")) {
                JsonObject result = response.getAsJsonObject("result");
                
                if (result.has("content")) {
                    JsonArray contentArray = result.getAsJsonArray("content");
                    
                    StringBuilder newsContent = new StringBuilder();
                    for (JsonElement element : contentArray) {
                        if (element.isJsonObject()) {
                            JsonObject contentObj = element.getAsJsonObject();
                            if (contentObj.has("text")) {
                                newsContent.append(contentObj.get("text").getAsString());
                                newsContent.append("\n");
                            }
                        }
                    }
                    
                    String content = newsContent.toString().trim();
                    if (!content.isEmpty()) {
                        return content;
                    }
                }
            }
            
            return "No news found for the query.";
            
        } catch (Exception e) {
            return "❌ Error parsing response: " + e.getMessage();
        }
    }

    /**
     * Stop the MCP server process
     */
    public void stop() {
        System.out.println("🛑 Stopping MCP Server...");
        
        try {
            if (writer != null) {
                writer.close();
            }
            if (reader != null) {
                reader.close();
            }
            if (mcpProcess != null) {
                mcpProcess.destroy();
                mcpProcess.waitFor(5, TimeUnit.SECONDS);
                if (mcpProcess.isAlive()) {
                    mcpProcess.destroyForcibly();
                }
            }
        } catch (Exception e) {
            System.err.println("⚠️  Error stopping MCP server: " + e.getMessage());
        }
        
        System.out.println("✅ MCP Server stopped");
    }

    /**
     * Check if the MCP server is running
     */
    public boolean isRunning() {
        return mcpProcess != null && mcpProcess.isAlive();
    }
}