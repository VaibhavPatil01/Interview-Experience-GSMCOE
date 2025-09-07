import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
}, { timestamps: true });

const commentSchema = new mongoose.Schema({ 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  replies: [replySchema],
}, { timestamps: true }); 

const postSchema = new mongoose.Schema({  
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String, required: true, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  company: { type: String, required: true },
  role: { type: String, required: true },
  postType: { type: String, required: true }, 
  domain: { type: String, required: true },
  rating: { type: Number, required: true },
  status: { type: String, required: true },
  upVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  bookmarks: [mongoose.Schema.Types.ObjectId],
  tags: [String],
  comments: [commentSchema],
}, { timestamps: true });

export const Reply = mongoose.model('Reply', replySchema);
export const Comment = mongoose.model('Comment', commentSchema);
export const Post = mongoose.model('Post', postSchema);