// src/models/Match.ts (CORRECTED to remove Duplicate Index Warning)

import mongoose, { Schema, Document, Types } from 'mongoose';

// 1. Define the Match interface (No change here)
export interface IMatch extends Document {
    users: Types.ObjectId[]; // Array of two User IDs
    messages: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

// 2. Define the Match schema
const MatchSchema: Schema = new Schema({
    users: {
        type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        required: true,
        validate: [
            (val: Types.ObjectId[]) => val.length === 2, 
            'Match must involve exactly two users'
        ],
        // ❌ REMOVED: unique: true, 
        // We rely on the MatchSchema.index() below instead.
    },
    messages: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
        default: [],
    }
}, {
    timestamps: true,
});

// ✅ Explicit Index Definition (This is the one we keep)
// This ensures a match is unique regardless of the order of users ([A, B] == [B, A]).
MatchSchema.index({ users: 1 }, { unique: true }); 

const MatchModel = mongoose.model<IMatch>('Match', MatchSchema);
export default MatchModel;