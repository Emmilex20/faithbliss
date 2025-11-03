// src/models/Message.ts

import mongoose, { Schema, Document, Types } from 'mongoose';

// 1. Define the Message interface
export interface IMessage extends Document {
    matchId: Types.ObjectId;
    senderId: Types.ObjectId;
    content: string;
    readBy: Types.ObjectId[]; // For read receipts
    createdAt: Date;
}

// 2. Define the Message schema
const MessageSchema: Schema = new Schema({
    matchId: {
        type: Schema.Types.ObjectId,
        ref: 'Match',
        required: true,
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
    },
    readBy: {
        type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        default: [],
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt (for message editing/deletion)
});

const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);
export default MessageModel;