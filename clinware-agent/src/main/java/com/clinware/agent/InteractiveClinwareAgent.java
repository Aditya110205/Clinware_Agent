package com.clinware.agent;

import java.io.IOException;
import java.util.Scanner;
import java.util.concurrent.TimeUnit;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

/**
 * Interactive Clinware Intelligence Agent
 * Allows users to ask questions in real-time
 */
public class InteractiveClinwareAgent {
    
    private final String apiKey;
    private final MCPClient mcpClient;
    private final Gson gson;
    private final OkHttpClient httpClient;
    private static final String MODEL_NAME = "gemini-2.5-flash";
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/" + MODEL_NAME + ":generateContent";
    private boolean mcpServerRunning = false;

    public InteractiveClinwareAgent(String apiKey) {
        this.apiKey = apiKey;
        this.mcpClient = new MCPClient();
        this.gson = new Gson();
        this.httpClient = new OkHttpClient.Builder()
            .connectTimeout(60, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .build();
    }

    /**
     * Process a user query about Clinware
     */
    public String processQuery(String userQuery) {
        try {
            // Determine if we need to search for news
            if (needsNewsSearch(userQuery)) {
                System.out.println("\n🔍 Searching for latest information...");
                
                // Start MCP server if not already running
                if (!mcpServerRunning) {
                    mcpClient.start();
                    mcpServerRunning = true;
                }
                
                // Extract search terms from the query
                String searchQuery = extractSearchQuery(userQuery);
                
                // Fetch news using MCP
                String newsData = mcpClient.searchNews(searchQuery);
                
                // Generate response using Gemini with news context
                String response = generateResponseWithContext(userQuery, newsData);
                
                return response;
            } else {
                System.out.println("\n💭 Thinking...");
                
                // Use Gemini's internal knowledge
                String response = generateResponse(userQuery);
                return response;
            }
            
        } catch (Exception e) {
            return "❌ Error processing query: " + e.getMessage();
        }
    }

    /**
     * Determine if the query requires news search
     */
    private boolean needsNewsSearch(String query) {
        String lowerQuery = query.toLowerCase();
        
        // Keywords that indicate need for news search
        String[] newsKeywords = {
            "news", "latest", "recent", "update", "current",
            "funding", "product", "launch", "announcement",
            "development", "market", "what's new", "what is new",
            "today", "this week", "this month", "this year"
        };
        
        for (String keyword : newsKeywords) {
            if (lowerQuery.contains(keyword)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Extract the search query for news
     */
    private String extractSearchQuery(String userQuery) {
        String lowerQuery = userQuery.toLowerCase();
        
        if (lowerQuery.contains("funding")) {
            return "Clinware funding";
        } else if (lowerQuery.contains("product")) {
            return "Clinware products";
        } else if (lowerQuery.contains("partnership")) {
            return "Clinware partnerships";
        } else {
            return "Clinware";
        }
    }

    /**
     * Generate response using Gemini with news context
     */
    private String generateResponseWithContext(String userQuery, String newsContext) throws IOException {
        String prompt = String.format(
            "You are a Market Intelligence Researcher specializing in healthcare technology companies. " +
            "Your role is to analyze news and provide insights about Clinware, a post-acute care AI company.\n\n" +
            "Focus on:\n" +
            "- Funding rounds and financial developments\n" +
            "- Product launches and technological innovations\n" +
            "- Market positioning and competitive landscape\n" +
            "- Strategic partnerships and business developments\n\n" +
            "Based on the following recent news about Clinware:\n\n%s\n\n" +
            "Please answer this question: %s\n\n" +
            "Provide a clear, conversational response that directly answers the question.",
            newsContext,
            userQuery
        );

        return callGeminiAPI(prompt);
    }

    /**
     * Generate response using Gemini's internal knowledge only
     */
    private String generateResponse(String userQuery) throws IOException {
        String prompt = 
            "You are a helpful assistant with knowledge about healthcare technology companies, " +
            "particularly Clinware. Provide accurate, conversational information based on your training data.\n\n" +
            "Question: " + userQuery;

        return callGeminiAPI(prompt);
    }

    /**
     * Call Gemini API using REST
     */
    private String callGeminiAPI(String prompt) throws IOException {
        // Build request body
        JsonObject requestBody = new JsonObject();
        
        JsonObject content = new JsonObject();
        JsonObject part = new JsonObject();
        part.addProperty("text", prompt);
        
        com.google.gson.JsonArray parts = new com.google.gson.JsonArray();
        parts.add(part);
        content.add("parts", parts);
        
        com.google.gson.JsonArray contents = new com.google.gson.JsonArray();
        contents.add(content);
        requestBody.add("contents", contents);

        // Make API request
        RequestBody body = RequestBody.create(
            requestBody.toString(),
            MediaType.parse("application/json")
        );

        Request request = new Request.Builder()
            .url(GEMINI_API_URL + "?key=" + apiKey)
            .post(body)
            .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "No error details";
                throw new IOException("Gemini API error (HTTP " + response.code() + "): " + errorBody);
            }

            String responseBody = response.body().string();
            return extractTextFromGeminiResponse(responseBody);
        }
    }

    /**
     * Extract text from Gemini API JSON response
     */
    private String extractTextFromGeminiResponse(String jsonResponse) {
        try {
            JsonObject response = gson.fromJson(jsonResponse, JsonObject.class);
            
            if (response.has("candidates")) {
                com.google.gson.JsonArray candidates = response.getAsJsonArray("candidates");
                if (candidates.size() > 0) {
                    JsonObject candidate = candidates.get(0).getAsJsonObject();
                    if (candidate.has("content")) {
                        JsonObject content = candidate.getAsJsonObject("content");
                        if (content.has("parts")) {
                            com.google.gson.JsonArray parts = content.getAsJsonArray("parts");
                            if (parts.size() > 0) {
                                JsonObject part = parts.get(0).getAsJsonObject();
                                if (part.has("text")) {
                                    return part.get("text").getAsString();
                                }
                            }
                        }
                    }
                }
            }
            
            return "No response generated";
        } catch (Exception e) {
            return "Error parsing Gemini response: " + e.getMessage();
        }
    }

    /**
     * Cleanup resources
     */
    public void shutdown() {
        if (mcpServerRunning) {
            mcpClient.stop();
            mcpServerRunning = false;
        }
    }

    /**
     * Main method to run the interactive agent
     */
    public static void main(String[] args) {
        // Print header
        printHeader();

        // Load configuration
        Config.load();
        
        // Check if API key is configured
        if (!Config.isValid()) {
            System.err.println("❌ Error: GEMINI_API_KEY not found in .env file");
            System.err.println("Please add your Gemini API key to the .env file");
            System.exit(1);
        }

        // Get API key
        String apiKey = Config.getGeminiApiKey();
        
        // Create agent
        InteractiveClinwareAgent agent = new InteractiveClinwareAgent(apiKey);
        System.out.println("✅ Agent initialized and ready!");
        System.out.println("📱 Using model: " + MODEL_NAME);
        
        // Add shutdown hook to cleanup resources
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("\n\n👋 Shutting down agent...");
            agent.shutdown();
            System.out.println("✅ Goodbye!");
        }));

        // Start interactive loop
        Scanner scanner = new Scanner(System.in);
        
        printInstructions();
        
        while (true) {
            System.out.print("\n💬 You: ");
            String userInput = scanner.nextLine().trim();
            
            // Check for exit commands
            if (userInput.equalsIgnoreCase("exit") || 
                userInput.equalsIgnoreCase("quit") || 
                userInput.equalsIgnoreCase("bye")) {
                System.out.println("\n👋 Thank you for using Clinware Intelligence Agent!");
                agent.shutdown();
                break;
            }
            
            // Check for help command
            if (userInput.equalsIgnoreCase("help")) {
                printInstructions();
                continue;
            }
            
            // Skip empty queries
            if (userInput.isEmpty()) {
                continue;
            }
            
            // Process the query
            System.out.println("\n" + "─".repeat(70));
            String response = agent.processQuery(userInput);
            System.out.println("\n🤖 Agent: " + response);
            System.out.println("─".repeat(70));
        }
        
        scanner.close();
    }

    /**
     * Print welcome header
     */
    private static void printHeader() {
        System.out.println("\n");
        System.out.println("╔═══════════════════════════════════════════════════════════════╗");
        System.out.println("║                                                               ║");
        System.out.println("║        🏥 CLINWARE INTELLIGENCE AGENT 🤖                      ║");
        System.out.println("║        Market Intelligence Researcher                         ║");
        System.out.println("║                                                               ║");
        System.out.println("╚═══════════════════════════════════════════════════════════════╝");
        System.out.println();
    }

    /**
     * Print usage instructions
     */
    private static void printInstructions() {
        System.out.println("\n📚 How to use:");
        System.out.println("   • Ask any question about Clinware");
        System.out.println("   • Type 'help' to see this message again");
        System.out.println("   • Type 'exit', 'quit', or 'bye' to close the agent");
        System.out.println("\n💡 Example questions:");
        System.out.println("   • What's the latest news about Clinware?");
        System.out.println("   • Tell me about Clinware's recent funding");
        System.out.println("   • What products does Clinware offer?");
        System.out.println("   • What is Clinware's market position?");
    }
}