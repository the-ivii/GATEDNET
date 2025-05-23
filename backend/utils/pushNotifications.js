const admin = require('firebase-admin');
const User = require('../models/User');

// Send notification to multiple users
const sendToUsers = async (userIds, notification) => {
  try {
    const users = await User.find({
      _id: { $in: userIds },
      'preferences.notifications.push': true
    });

    const tokens = users.reduce((acc, user) => {
      return acc.concat(user.fcmTokens.map(t => t.token));
    }, []);

    if (tokens.length === 0) {
      return { success: false, message: 'No valid FCM tokens found' };
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {},
      tokens
    };

    const response = await admin.messaging().sendMulticast(message);
    
    // Handle failed tokens
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });

      // Remove failed tokens from users
      await User.updateMany(
        { 'fcmTokens.token': { $in: failedTokens } },
        { $pull: { fcmTokens: { token: { $in: failedTokens } } } }
      );
    }

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    };
  } catch (error) {
    console.error('Push notification error:', error);
    return { success: false, error: error.message };
  }
};

// Send notification to all users in a society
const sendToSociety = async (societyId, notification) => {
  try {
    const users = await User.find({
      societyId,
      'preferences.notifications.push': true
    });

    const userIds = users.map(user => user._id);
    return await sendToUsers(userIds, notification);
  } catch (error) {
    console.error('Society push notification error:', error);
    return { success: false, error: error.message };
  }
};

// Send notification to users with specific roles
const sendToRoles = async (societyId, roles, notification) => {
  try {
    const users = await User.find({
      societyId,
      role: { $in: roles },
      'preferences.notifications.push': true
    });

    const userIds = users.map(user => user._id);
    return await sendToUsers(userIds, notification);
  } catch (error) {
    console.error('Role-based push notification error:', error);
    return { success: false, error: error.message };
  }
};

// Send notification to a single user
const sendToUser = async (userId, notification) => {
  try {
    const user = await User.findOne({
      _id: userId,
      'preferences.notifications.push': true
    });

    if (!user || user.fcmTokens.length === 0) {
      return { success: false, message: 'No valid FCM tokens found' };
    }

    const tokens = user.fcmTokens.map(t => t.token);
    const message = {
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {},
      tokens
    };

    const response = await admin.messaging().sendMulticast(message);
    
    // Handle failed tokens
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });

      // Remove failed tokens
      user.fcmTokens = user.fcmTokens.filter(t => !failedTokens.includes(t.token));
      await user.save();
    }

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    };
  } catch (error) {
    console.error('Single user push notification error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendToUsers,
  sendToSociety,
  sendToRoles,
  sendToUser
}; 