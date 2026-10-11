import axios from "axios";
import { graph } from "../graph/graph.js";
import { addMessage } from "../config/memory.js";

export const agent = async (req, res) => {
  try {
    const { prompt, conversationId, agent: selectedAgent } = req.body;

    if (!prompt?.trim() || !conversationId) {
      return res.status(400).json({
        message: "Prompt and conversationId are required",
      });
    }

    // Save the user's message to MongoDB through the chat service
    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      role: "user",
      content: prompt,
    });

    // Run the selected agent
    const result = await graph.invoke({
      prompt,
      conversationId,
      agent: selectedAgent,
    });

    const answer = result.aiResponse ?? "";
    const images = result.images ?? [];

    // Save messages to conversational memory
    await addMessage(conversationId, "user", prompt);
    await addMessage(conversationId, "assistant", answer);

    // Save the assistant response to MongoDB
    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      role: "assistant",
      content: answer,
      images,
    });

    return res.status(200).json({
      answer,
      images,
    });
  } catch (error) {
    console.error(
      "Agent controller error:",
      error.response?.data || error.stack || error.message
    );

    return res.status(500).json({
      message: "Agent request failed",
      error: error.response?.data?.message || error.message,
    });
  }
};