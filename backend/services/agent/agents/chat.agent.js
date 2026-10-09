import { getModel } from "../config/llmModel.js"

export const chatAgent=async(state)=>{
  const llm=await getModel("chat")
  const prompt=`you are CortextAI, an intelligent AI assistant. 

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
  `
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