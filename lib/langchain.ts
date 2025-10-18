import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

type ModelConfig = {
  modelName: string;
  temperature: number;
  maxTokens?: number;
  apiKey?: string;
};

export class LangChainService {
  private model: ChatOpenAI;

  constructor(config: ModelConfig) {
    if (!config.apiKey && !process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is required");
    }

    this.model = new ChatOpenAI({
      openAIApiKey: config.apiKey || process.env.OPENAI_API_KEY,
      modelName: config.modelName,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      streaming: true,
    });
  }

  async generateResponse(
    prompt: string,
    context: string = "",
    systemPrompt: string = "You are a helpful AI assistant."
  ): Promise<string> {
    try {
      const messages = [
        new SystemMessage({
          content: systemPrompt,
        }),
        new HumanMessage({
          content: context ? `${context}\n\n${prompt}` : prompt,
        }),
      ];

      const response = await this.model.invoke(messages);
      return typeof response.content === 'string' 
        ? response.content 
        : response.content.toString();
    } catch (error) {
      console.error("Error generating response:", error);
      throw new Error("Failed to generate response");
    }
  }

  // Add more LangChain utility methods as needed
}

// Default configuration
export const defaultModelConfig: ModelConfig = {
  modelName: "gpt-4-turbo-preview",
  temperature: 0.7,
  maxTokens: 2000,
};

// Singleton instance with optional API key override
export const langChainService = new LangChainService({
  ...defaultModelConfig,
  apiKey: process.env.OPENAI_API_KEY,
});
