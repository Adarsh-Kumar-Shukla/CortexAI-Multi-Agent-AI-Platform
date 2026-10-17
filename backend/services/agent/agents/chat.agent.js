import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { getModel } from "../config/llmModel.js";
import { getMemory } from "../config/memory.js";
import { deductCredits } from "../utils/deductCredits.js";

export const chatAgent = async (state) => {
  try {
    const llm = await getModel("chat");
    const history = await getMemory(state.conversationId);
    const searchContext = state.serachResults
      ? `Web Search Results: ${JSON.stringify(state.serachResults)} Answer the user using only the above search results.`
      : "";

    const prompt = `you are CortextAI, an intelligent AI assistant. 

  ${searchContext}
  If searchContext exists: 
  - Use search results to answer.
  - Do not mention internal tools.

  Roles:
  - For simple questions, greetings, and short queries, response naturally in plain text.
  - For technical , education, coding, or detailed topics, use clean Markdown.
  
  Formatting:
    - Use # for titles and ## for sections.
    - Leave a blank line for lists.
    - Use numbered lists for steps.
    - Use fenced code blocks with language tags for code.
    - Keep paragraphs shorts and readable.
    - Never write headings and content on the same line.
    - Never generate large walls of text.
  `;
    const messages = [new SystemMessage(prompt)];

    history.forEach((msg) => {
      if (msg.role == "user") {
        messages.push(new HumanMessage(msg.content));
      }
      if (msg.role == "assistant") {
        messages.push(new AIMessage(msg.content));
      }
    });

    messages.push(new HumanMessage(state.prompt));

    const response = await llm.invoke(messages);
    await deductCredits(state.userId, "chat")
    return {
      ...state,
      aiResponse: response.content,
    };
  } catch (error) {
    return {
      ...state,
      aiResponse: `Failed to generate response.`,
    };
  }
};
