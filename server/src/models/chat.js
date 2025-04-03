const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true 
    },
    astrologerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: {
      type: Date,
      default: Date.now,  
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number,
      default: 0, 
    },
    amount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    lastMessage: {
      type: String,
      default: "",
    },
    messages: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId(),
          required: true
        },
        senderId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "User",
          required: true
        },
        message: {
          type: String,
          required: true
        },
        messageType: { 
          type: String, 
          enum: ["text", "audio", "video", "image"],
          default: "text"
        },
        fileUrl: String,
        timestamp: { 
          type: Date, 
          default: Date.now 
        },
        isDeleted: {
          type: Boolean,
          default: false
        },
        deletedAt: Date,
        reactions: [String],
        quotedMessage: {
          id: String,
          content: String,
          sender: {
            name: String
          }
        }
      },
    ],
  },
  { timestamps: true }
);

chatSchema.index({ userId: 1, astrologerId: 1 });
chatSchema.index({ "messages._id": 1 });
chatSchema.index({ astrologerId: 1, status: 1 });
chatSchema.index({ roomId: 1 });

// Add these indexes for better query performance
chatSchema.index({ 'messages.timestamp': 1 });
chatSchema.index({ 'messages.senderId': 1 });
chatSchema.index({ startTime: -1 });

// Add pre-save middleware to update lastMessage
chatSchema.pre('save', function(next) {
  if (this.messages && this.messages.length > 0) {
    const lastMsg = this.messages[this.messages.length - 1];
    this.lastMessage = lastMsg.message;
  }
  next();
});

// Add index for faster sorting
chatSchema.index({ endTime: 1 });

module.exports = mongoose.model("Chat", chatSchema);
