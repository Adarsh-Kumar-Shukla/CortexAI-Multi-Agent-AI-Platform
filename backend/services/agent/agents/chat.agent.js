import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages"
import { getModel } from "../config/llmModel.js"
import { getMemory } from "../config/memory.js"

export const chatAgent=async(state)=>{
  const llm=await getModel("chat")
  const history=await getMemory(state.conversationId)
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
  const messages=[
    new SystemMessage(prompt)
  ]

  history.forEach(msg => {
    if(msg.role=="user"){
      messages.push(new HumanMessage(msg.content))
    }
    if(msg.role=="assistant"){
      messages.push(new AIMessage(msg.content))
    }
  });

  messages.push(new HumanMessage(state.prompt))

  console.log(messages)


  
  const response=await llm.invoke(messages)
  return {
    ...state,
    aiResponse:response.content
  }
}