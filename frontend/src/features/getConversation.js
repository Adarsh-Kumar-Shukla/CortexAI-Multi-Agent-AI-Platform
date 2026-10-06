import api from "../../utils/axios.js"

export const getConversations=async()=>{
  try {
    const {data}=await api.get("/api/chat/get-conversation")
    return data
    console.log(data)
  } catch (error) {
    return []
    console.log(error)
  }
}
