import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { Auth } from 'aws-amplify';

/**
 * BTR Bedrock Service
 * Handles AI chat functionality for document Q&A with regional context
 */
class BedrockService {
  constructor() {
    this.client = null;
    this.modelId = 'anthropic.claude-3-5-sonnet-20240620-v1:0';
  }

  /**
   * Initialize Bedrock client with user credentials
   */
  async initializeClient() {
    try {
      const credentials = await Auth.currentCredentials();
      this.client = new BedrockRuntimeClient({
        region: 'ap-southeast-1',
        credentials: Auth.essentialCredentials(credentials),
      });
    } catch (error) {
      console.error('Failed to initialize Bedrock client:', error);
      throw error;
    }
  }

  /**
   * Ask AI about treasury documents with regional context
   * @param {string} question - User's question
   * @param {string} documentContent - Document content for context
   * @param {string} userRegion - User's assigned region
   * @param {string} userRole - User's role (admin, super-admin)
   * @returns {Promise<string>} AI response
   */
  async askQuestion(question, documentContent = '', userRegion = '', userRole = 'admin') {
    if (!this.client) {
      await this.initializeClient();
    }

    try {
      // Build context-aware prompt
      let systemPrompt = `You are an AI assistant for the Bureau of Treasury document management system.

User Context:
- Region: ${userRegion}
- Role: ${userRole}
- Access Level: ${userRole === 'super-admin' ? 'All regions' : 'Regional only'}

Instructions:
- Provide helpful, accurate responses about treasury documents
- Use professional, government-appropriate language
- If document content is provided, base your answer on that content
- For super-admin users, provide cross-regional insights when relevant
- For regional users, focus on their specific region
- Always maintain confidentiality and security protocols`;

      let userPrompt = question;
      
      if (documentContent) {
        userPrompt = `Document Content: ${documentContent}

User Question: ${question}

Please analyze the document and provide a comprehensive answer.`;
      }

      const command = new InvokeModelCommand({
        modelId: this.modelId,
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: userPrompt
            }
          ]
        }),
        contentType: "application/json",
        accept: "application/json",
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      return responseBody.content[0].text;
      
    } catch (error) {
      console.error('Bedrock Service Error:', error);
      
      // Fallback response for errors
      return `I apologize, but I'm currently unable to process your request. Please try again later or contact your system administrator. Error: ${error.message}`;
    }
  }

  /**
   * Test Bedrock connection
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      const response = await this.askQuestion(
        "Hello, please confirm you're ready to assist with Bureau of Treasury documents.",
        "",
        "TEST",
        "admin"
      );
      return response.length > 0;
    } catch (error) {
      console.error('Bedrock connection test failed:', error);
      return false;
    }
  }
}

export default new BedrockService();
