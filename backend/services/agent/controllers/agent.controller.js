import axios from "axios";
import { graph } from "../graph/graph.js";
import { addMessage } from "../config/memory.js";

export const agent = async (req, res, next) => {
  try {
    const { prompt, conversationId, agent: selectedAgent } = req.body;
    const file=req.file
    const userId=req.headers["x-user-id"]

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
      userId,
      file
    });

    const answer = result.aiResponse ?? "";
    const images = result.images ?? [];
    const artifacts = result.artifacts ?? []

    // Save messages to conversational memory
    await addMessage(conversationId, "user", prompt);
    await addMessage(conversationId, "assistant", answer);

    // Save the assistant response to MongoDB
    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      role: "assistant",
      content: answer,
      images,
      artifacts
    });
    return res.status(200).json({
      answer,
      images,
      artifacts
    });
  } catch (error) {
    next(error)
  }
};