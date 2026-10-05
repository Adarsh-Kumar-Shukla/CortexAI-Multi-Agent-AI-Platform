import { getModel } from "../config/llmModel"

export const chatAgent=async(state)=>{
  const llm=await getModel("chat")
  const prompt="you are CortextAI, an intelligent AI assistant."
  const response=await llm.invoke([
    {
      "role":"system",
      "content":prompt
    },
    {
      "role":"human",
      "content":state.prompt
    }
  ])
  return {
    ...state,
    aiResponse:response.content
  }
}