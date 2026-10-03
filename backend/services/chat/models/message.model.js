import mongoose from "mongoose";

const messageSchema=new mongoose.Schema({
  consersationId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Conversation"
  },
  role:{
    type:String,
    enum:["user", "assistant"]
  },
  content:String
},{timestamps:true})

const Message=mongoose.Model("Message", messageSchema)
export default Message