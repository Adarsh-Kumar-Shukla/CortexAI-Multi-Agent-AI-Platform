import { getModel } from "../config/llmModel.js";

export const router = async (state) => {
  const llm = await getModel("router");

  const prompt = `You are an agent router.

Available agents:
- chat
- search
- coding
- pdf
- ppt
- vision

Rules:
- For Chat: General conversation, explanations, learning, questions.
- For Search: Current events, latest information, news, recent developments, internet lookup.
- For Coding: Generate code, debug code, build projects, architecture, API design.
- For PDF: Questions about generating PDFs or document context.
- For PPT: Questions about generating PPTs or PPT context.
- For Vision: Generate image, create image.

Return ONLY one word:
Chat, Search, Coding, PDF, PPT, Vision.

User Query: ${state.prompt}`;

  const response = await llm.invoke(prompt);

  console.log(response);

  return {
    ...state,
    agent: response.content.trim().toLowerCase(),
  };
};