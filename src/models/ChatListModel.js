import { Schema, model } from "mongoose";

const ChatListSchema = new Schema({
    user1: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    user2: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    latest_chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
});

const ChatList = model("ChatList", ChatListSchema);

export default ChatList;
