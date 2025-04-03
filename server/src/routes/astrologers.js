const express = require('express');
const router = express.Router();
const { connectToDatabase } = require('../lib/mongodb');
const { ObjectId } = require('mongodb');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/user');
const AstrologerProfile = require('../models/astrologer');
const Message = require('../models/message');
const Chat = require('../models/chat');

// Get all verified astrologers
router.get('/', async (req, res) => {
  try {
    const astrologers = await User.find({ 
      role: 'astrologer',
      isVerified: true 
    }).select('-password');

    const formattedAstrologers = astrologers.map(astrologer => ({
      _id: astrologer._id,
      name: astrologer.name,
      email: astrologer.email,
      experience: astrologer.experience || '0 years',
      expertise: astrologer.expertise || [],
      languages: astrologer.languages || [],
      price: astrologer.price || {
        original: 500,
        discounted: 400
      },
      rating: astrologer.rating || 0,
      totalRatings: astrologer.totalRatings || 0,
      availability: {
        online: astrologer.availability?.online || false,
        startTime: astrologer.availability?.startTime || '09:00',
        endTime: astrologer.availability?.endTime || '18:00'
      },
      status: {
        chat: astrologer.availability?.online || false,
        call: astrologer.availability?.online || false
      },
      profileImage: astrologer.profileImage,
      isOnline: astrologer.availability?.online || false
    }));

    res.json(formattedAstrologers);
  } catch (error) {
    console.error('Error fetching astrologers:', error);
    res.status(500).json({ error: 'Failed to fetch astrologers' });
  }
});

// Get all users (only regular users, not other astrologers/admins)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'astrologer') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const users = await User.find({ 
      role: 'user'
    })
    .select('_id name email profilePicture createdAt')
    .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users for astrologer:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get astrologer's chat history
router.get('/chats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'astrologer') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // First get all chat sessions for this astrologer
    const chats = await Chat.find({
      astrologerId: req.user.id,
      // Don't show cancelled chats
      status: { $ne: 'cancelled' }
    })
    .populate({
      path: 'userId',
      select: 'name profileImage'
    })
    .populate('messages')
    .sort({ startTime: -1 });

    // Format the response
    const formattedChats = chats.map(chat => ({
      _id: chat._id,
      roomId: chat.roomId,
      userId: {
        _id: chat.userId._id,
        name: chat.userId.name,
        profileImage: chat.userId.profileImage
      },
      startTime: chat.startTime,
      endTime: chat.endTime,
      amount: chat.amount,
      status: chat.status,
      duration: chat.duration,
      lastMessage: chat.lastMessage,
      messages: chat.messages.map(msg => ({
        _id: msg._id,
        senderId: msg.senderId,
        message: msg.message,
        messageType: msg.messageType,
        timestamp: msg.timestamp
      }))
    }));

    res.json(formattedChats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Get astrologer's complete chat history with messages
router.get('/chats/history', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'astrologer') {
      console.log('User not authorized:', req.user);
      return res.status(403).json({ error: 'Not authorized' });
    }

    console.log('Fetching chat history for astrologer:', req.user.id);
    
    const chats = await Chat.aggregate([
      {
        $match: {
          astrologerId: new ObjectId(req.user.id),
          status: { $ne: 'cancelled' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          messages: {
            $ifNull: ['$messages', []]
          },
          lastMessage: {
            $ifNull: [{ $arrayElemAt: ['$messages.message', -1] }, 'No messages yet']
          }
        }
      },
      {
        $project: {
          _id: 1,
          roomId: 1,
          userId: '$userDetails._id',
          userName: '$userDetails.name',
          userAvatar: '$userDetails.profileImage',
          startTime: 1,
          endTime: 1,
          duration: 1,
          amount: 1,
          status: 1,
          lastMessage: 1,
          messages: 1
        }
      },
      { $sort: { startTime: -1 } }
    ]);

    console.log(`Found ${chats.length} chat sessions for astrologer ${req.user.id}`);
    
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Get chat messages
router.get('/chats/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      astrologerId: req.user.id
    }).populate('messages');

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json(chat.messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Update chat status
router.put('/chats/:chatId/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'astrologer') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { status } = req.body;
    const chat = await Chat.findOneAndUpdate(
      {
        _id: req.params.chatId,
        astrologerId: req.user.id
      },
      {
        status,
        ...(status === 'completed' ? { endTime: new Date() } : {})
      },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    console.error('Error updating chat status:', error);
    res.status(500).json({ error: 'Failed to update chat status' });
  }
});

// Get astrologer's earnings
router.get('/earnings', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'astrologer') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Aggregate earnings from chats
    const chats = await Chat.aggregate([
      {
        $match: {
          astrologerId: new ObjectId(req.user.id),
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          today: {
            $sum: {
              $cond: [{ $gte: ['$endTime', today] }, '$amount', 0]
            }
          },
          thisWeek: {
            $sum: {
              $cond: [{ $gte: ['$endTime', weekStart] }, '$amount', 0]
            }
          },
          thisMonth: {
            $sum: {
              $cond: [{ $gte: ['$endTime', monthStart] }, '$amount', 0]
            }
          },
          total: { $sum: '$amount' }
        }
      }
    ]);

    const earnings = chats[0] || {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      total: 0
    };

    res.json(earnings);
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
});

// Get single astrologer
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const astrologer = await User.findById(req.params.id)
      .select('-password') // Exclude password
      .lean(); // Convert to plain JavaScript object
    
    if (!astrologer) {
      return res.status(404).json({
        success: false,
        error: 'Astrologer not found'
      });
    }

    // Format the response
    const formattedAstrologer = {
      _id: astrologer._id,
      name: astrologer.name,
      email: astrologer.email,
      experience: astrologer.experience || '0 years',
      expertise: astrologer.expertise || [],
      languages: astrologer.languages || [],
      price: astrologer.price || {
        original: 500,
        discounted: 400
      },
      rating: astrologer.rating || 0,
      totalRatings: astrologer.totalRatings || 0,
      availability: astrologer.availability || {
        online: false,
        startTime: '09:00',
        endTime: '18:00'
      },
      status: astrologer.status || {
        chat: false,
        call: false
      },
      profileImage: astrologer.profileImage,
      isOnline: astrologer.isOnline || false
    };

    res.json({
      success: true,
      astrologer: formattedAstrologer
    });
  } catch (error) {
    console.error('Error fetching astrologer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch astrologer details'
    });
  }
});

// Create astrologer
router.post('/', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    
    const astrologer = {
      name: req.body.name,
      email: req.body.email,
      image: req.body.image || 'https://via.placeholder.com/150',
      rating: 0,
      languages: req.body.languages || [],
      expertise: req.body.expertise || [],
      experience: req.body.experience || '0 years',
      price: {
        original: req.body.price || 500,
        discounted: req.body.discountedPrice || 400,
      },
      consultations: 0,
      status: {
        chat: true,
        call: true,
      },
      bestPrice: false,
      description: req.body.description || '',
      availability: 'Online',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('astrologers').insertOne(astrologer);
    
    return res.status(201).json({
      ...astrologer,
      _id: result.insertedId
    });
  } catch (error) {
    console.error('Error creating astrologer:', error);
    return res.status(500).json({ error: 'Failed to create astrologer' });
  }
});

// Get astrologer profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'astrologer') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    let profile = await AstrologerProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      // Create default profile if it doesn't exist
      profile = await AstrologerProfile.create({
        userId: req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: '',
        experience: '',
        expertise: [],
        languages: [],
        about: '',
        price: {
          original: 0,
          discounted: 0
        },
        availability: {
          online: false,
          startTime: '09:00',
          endTime: '18:00'
        },
        rating: 0,
        totalRatings: 0,
        isVerified: true // Add this to show in consult-astro page
      });

      // Also update the user document
      await User.findByIdAndUpdate(req.user.id, {
        experience: profile.experience,
        expertise: profile.expertise,
        languages: profile.languages,
        price: profile.price,
        rating: profile.rating,
        totalRatings: profile.totalRatings,
        profileImage: profile.profileImage,
        isVerified: true
      });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update astrologer profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'astrologer') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const isOnline = req.body.availability.online;

    // Update both AstrologerProfile and User documents
    const [profile] = await Promise.all([
      AstrologerProfile.findOneAndUpdate(
        { userId: req.user.id },
        { 
          ...req.body,
          status: {
            chat: isOnline,
            call: isOnline
          },
          updatedAt: new Date()
        },
        { new: true, upsert: true }
      ),
      User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        experience: req.body.experience,
        expertise: req.body.expertise,
        languages: req.body.languages,
        price: req.body.price,
        profileImage: req.body.profileImage,
        availability: {
          online: isOnline,
          startTime: req.body.availability.startTime,
          endTime: req.body.availability.endTime
        },
        status: {
          chat: isOnline,
          call: isOnline
        },
        isOnline: isOnline
      }, { new: true })
    ]);

    res.json({
      ...profile.toObject(),
      isOnline,
      status: {
        chat: isOnline,
        call: isOnline
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Debug endpoint to check if chat sessions exist
router.get('/debug/chats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'astrologer') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // First check whether the astrologer exists
    const astrologer = await User.findById(req.user.id);
    if (!astrologer) {
      return res.status(404).json({ error: 'Astrologer not found' });
    }

    // Check if any chats exist for this astrologer
    const chatCount = await Chat.countDocuments({ astrologerId: req.user.id });
    
    // Get a simple list of all chats for this astrologer
    const chats = await Chat.find({ astrologerId: req.user.id })
      .select('_id roomId userId status startTime')
      .populate('userId', 'name email')
      .lean();

    return res.json({
      success: true,
      astrologer: {
        id: astrologer._id,
        name: astrologer.name,
        email: astrologer.email
      },
      chatCount,
      chats
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Test endpoint to create a sample chat session
router.post('/debug/create-test-chat', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'astrologer') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // First find a user that isn't the astrologer
    const user = await User.findOne({ 
      _id: { $ne: req.user.id },
      role: 'user'
    });

    if (!user) {
      return res.status(404).json({ error: 'No users found to create test chat' });
    }

    // Create a room ID
    const roomId = [req.user.id, user._id].sort().join('_');

    // Check if a chat already exists with this room ID
    let chat = await Chat.findOne({ roomId });

    if (!chat) {
      // Create a new chat
      chat = new Chat({
        roomId,
        astrologerId: req.user.id,
        userId: user._id,
        startTime: new Date(),
        status: 'active',
        lastMessage: 'This is a test message',
        messages: [
          {
            senderId: user._id,
            message: 'Hello, I need a consultation',
            messageType: 'text',
            timestamp: new Date(Date.now() - 60000)
          },
          {
            senderId: req.user.id,
            message: 'Hi there! How can I help you today?',
            messageType: 'text',
            timestamp: new Date()
          }
        ]
      });

      await chat.save();
    }

    return res.json({
      success: true,
      message: 'Test chat created successfully',
      chat: {
        id: chat._id,
        roomId: chat.roomId,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        messages: chat.messages
      }
    });
  } catch (error) {
    console.error('Error creating test chat:', error);
    res.status(500).json({ error: 'Failed to create test chat' });
  }
});

module.exports = router;