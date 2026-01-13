package com.clinware.agent;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * Configuration loader for environment variables
 * Loads API keys and settings from .env file
 */
public class Config {
    
    private static final Map<String, String> envVars = new HashMap<>();
    private static boolean loaded = false;

    /**
     * Load environment variables from .env file
     */
    public static void load() {
        if (loaded) {
            return;
        }

        // Try to find .env file in current directory or project root
        Path envPath = Paths.get(".env");
        if (!Files.exists(envPath)) {
            envPath = Paths.get("../.env");
        }
        if (!Files.exists(envPath)) {
            envPath = Paths.get("../../.env");
        }

        if (Files.exists(envPath)) {
            try (BufferedReader reader = new BufferedReader(new FileReader(envPath.toFile()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    
                    // Skip empty lines and comments
                    if (line.isEmpty() || line.startsWith("#")) {
                        continue;
                    }

                    // Parse KEY=VALUE
                    int equalsIndex = line.indexOf('=');
                    if (equalsIndex > 0) {
                        String key = line.substring(0, equalsIndex).trim();
                        String value = line.substring(equalsIndex + 1).trim();
                        
                        // Remove quotes if present
                        if (value.startsWith("\"") && value.endsWith("\"")) {
                            value = value.substring(1, value.length() - 1);
                        }
                        
                        envVars.put(key, value);
                    }
                }
                loaded = true;
                System.out.println("✅ Configuration loaded successfully");
            } catch (IOException e) {
                System.err.println("⚠️  Warning: Could not load .env file: " + e.getMessage());
            }
        } else {
            System.err.println("⚠️  Warning: .env file not found");
        }
    }

    /**
     * Get an environment variable
     * First checks .env file, then system environment variables
     */
    public static String get(String key) {
        if (!loaded) {
            load();
        }
        
        // Check .env file first
        String value = envVars.get(key);
        
        // Fall back to system environment variable
        if (value == null) {
            value = System.getenv(key);
        }
        
        return value;
    }

    /**
     * Get Gemini API key
     */
    public static String getGeminiApiKey() {
        String apiKey = get("GEMINI_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            throw new RuntimeException(
                "❌ GEMINI_API_KEY not found! Please add it to your .env file"
            );
        }
        return apiKey;
    }

    /**
     * Check if configuration is valid
     */
    public static boolean isValid() {
        try {
            getGeminiApiKey();
            return true;
        } catch (RuntimeException e) {
            return false;
        }
    }
}