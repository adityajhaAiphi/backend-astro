const express = require("express");
const Chat = require("../models/chat"); // Import your Chat model
const mongoose = require("mongoose");
const router = express.Router();

// Helper function to sanitize chatId
const sanitizeChatId = (chatId) => chatId.trim();

// Debug middleware for this router
router.use((req, res, next) => {
  console.log('Chat Route:', req.method, req.path);
  next();
});

// ✅ Save a new message in chat
router.post("/save-message", async (req, res) => {
  try {
    console.log('Received save message request:', {
      body: req.body,
      headers: req.headers
    });

    const { chatId, senderId, message, messageType = 'text', fileUrl = null, quotedMessage } = req.body;

    if (!chatId || !senderId || !message) {
      console.log('Missing required fields:', { chatId, senderId, message });
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields",
        received: { chatId, senderId, message }
      });
    }

    const sanitizedChatId = sanitizeChatId(chatId);
    console.log('Processing message for sanitized chatId:', sanitizedChatId);
    
    // First try to find by MongoDB _id
    let chat;
    try {
      if (mongoose.Types.ObjectId.isValid(sanitizedChatId)) {
        chat = await Chat.findById(sanitizedChatId);
        console.log('Lookup by _id:', chat ? 'Found' : 'Not found');
      }
    } catch (idError) {
      console.error('Error in _id lookup:', idError.message);
    }
    
    // If not found, try by roomId
    if (!chat) {
      chat = await Chat.findOne({ roomId: sanitizedChatId });
      console.log('Lookup by roomId:', chat ? 'Found' : 'Not found');
    }

    // If chat doesn't exist, create a new one
    if (!chat) {
      console.log('Creating new chat for roomId:', sanitizedChatId);
      const [userId, astrologerId] = sanitizedChatId.split('_').sort();
      
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(astrologerId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user IDs in chatId",
          details: { userId, astrologerId }
        });
      }
      
      // Create new chat with all required fields
      chat = new Chat({
        roomId: sanitizedChatId,
        userId: new mongoose.Types.ObjectId(userId),
        astrologerId: new mongoose.Types.ObjectId(astrologerId),
        startTime: new Date(),
        status: 'active',
        messages: [],
        lastMessage: message // Add this to satisfy the schema
      });

      // Save the new chat first
      await chat.save();
      console.log('New chat created:', chat._id);
    }

    // Add the new message
    const newMessage = {
      senderId: new mongoose.Types.ObjectId(senderId),
      message,
      messageType,
      fileUrl,
      timestamp: new Date(),
      quotedMessage
    };
    
    chat.messages.push(newMessage);
    chat.lastMessage = message;
    await chat.save();
    console.log('Message saved successfully');

    res.status(201).json({ 
      success: true, 
      message: "Chat message saved",
      chatId: chat._id,
      messageId: chat.messages[chat.messages.length - 1]._id
    });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to save message' 
    });
  }
});

// ✅ Fetch chat messages for a session
router.get("/get-messages/:chatId", async (req, res) => {
  try {
    const sanitizedChatId = sanitizeChatId(req.params.chatId);
    console.log('Fetching messages for chatId:', sanitizedChatId);
    
    // First try to find by MongoDB _id
    let chat;
    try {
      if (mongoose.Types.ObjectId.isValid(sanitizedChatId)) {
        chat = await Chat.findById(sanitizedChatId);
        console.log('Lookup by _id:', chat ? 'Found' : 'Not found');
      }
    } catch (idError) {
      console.error('Error in _id lookup:', idError.message);
    }
    
    // If not found, try by roomId
    if (!chat) {
      chat = await Chat.findOne({ roomId: sanitizedChatId });
      console.log('Lookup by roomId:', chat ? 'Found' : 'Not found');
    }

    if (!chat) {
      console.log('Chat not found for ID:', sanitizedChatId);
      // Create empty chat structure for new conversations
      return res.status(200).json({ 
        success: true, 
        messages: [],
        roomId: sanitizedChatId
      });
    }

    res.status(200).json({ success: true, messages: chat.messages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Delete a message
router.delete("/messages/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;
    console.log('Deleting message with ID:', messageId); // Add logging

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid message ID format" 
      });
    }

    // Find the chat containing this message
    const chat = await Chat.findOne({
      "messages._id": new mongoose.Types.ObjectId(messageId)
    });

    if (!chat) {
      return res.status(404).json({ 
        success: false, 
        error: "Message not found" 
      });
    }

    // Update the message to mark it as deleted
    const result = await Chat.updateOne(
      { 
        "messages._id": new mongoose.Types.ObjectId(messageId)
      },
      { 
        $set: { 
          "messages.$.isDeleted": true,
          "messages.$.deletedAt": new Date()
        } 
      }
    );

    console.log('Update result:', result); // Add logging

    res.json({ 
      success: true, 
      message: "Message deleted successfully" 
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to delete message" 
    });
  }
});

// ✅ Add reaction to a message
router.post("/messages/:messageId/react", async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reaction } = req.body;
    console.log('Adding reaction:', { messageId, reaction }); // Add logging

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid message ID format" 
      });
    }

    if (!reaction) {
      return res.status(400).json({ 
        success: false, 
        error: "Reaction is required" 
      });
    }

    // Find the chat containing this message
    const chat = await Chat.findOne({
      "messages._id": new mongoose.Types.ObjectId(messageId)
    });

    if (!chat) {
      return res.status(404).json({ 
        success: false, 
        error: "Message not found" 
      });
    }

    // Add the reaction to the message
    const result = await Chat.updateOne(
      { 
        "messages._id": new mongoose.Types.ObjectId(messageId)
      },
      { 
        $push: { 
          "messages.$.reactions": reaction 
        } 
      }
    );

    console.log('Update result:', result); // Add logging

    res.json({ 
      success: true, 
      message: "Reaction added successfully" 
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to add reaction" 
    });
  }
});

module.exports = router;
