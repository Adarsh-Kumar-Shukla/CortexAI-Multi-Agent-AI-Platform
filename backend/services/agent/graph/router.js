import { getModel } from "../config/llmModel.js"

export const router=async (state)=>{
  const llm=await getModel("router")
  const prompt=`You are an agent router. 
  Available agents:- chat, search, coding, pdf, ppt, vision. 
  Rules:- 
  For Chat: General conversation, explanations, learning, quetions. 
  For Search: Current events, latest information, news, recents developments, internet lookup. 
  For coding: Generate code, debug code, build projects, architecture, API design. 
  For PDF: Questions about generate PDFs, or document context. 
  For PPT: Questions about generate ppts or ppt context. 
  For Vision: Generate image, create image.
  Return ONLY one word: Chat, Search, Coding, PDF, PPT, Vision. 
  User Query: ${state.prompt}`

  const response=(await llm).invoke(prompt)
  console.log(response)

  return {
    ...state,
    agent:(await response).content.trim().toLowerCase()
  }
}