const Notification = require('../models/Notification');

// @desc    Get logged in user's notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {

  try {

    const notifications = await Notification.find({
      user: req.user._id
    })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: notifications.length,
      notifications
    });

  } catch (err) {

    next(err);

  }

};

// @desc    Create notification
// @route   POST /api/notifications
// @access  Private
exports.createNotification = async (req, res, next) => {

  try {

    const notification = await Notification.create({

      user: req.user._id,

      title: req.body.title,

      message: req.body.message,

      type: req.body.type

    });

    res.status(201).json({

      success: true,

      notification

    });

  } catch (err) {

    next(err);

  }

};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {

  try {

    const notification = await Notification.findById(
      req.params.id
    );

    if (!notification) {

      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });

    }

    if (
      notification.user.toString() !==
      req.user._id.toString()
    ) {

      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });

    }

    notification.read = true;

    await notification.save();

    res.json({
      success: true,
      notification
    });

  } catch (err) {

    next(err);

  }

};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {

  try {

    await Notification.updateMany(

      {
        user: req.user._id,
        read: false
      },

      {
        read: true
      }

    );

    res.json({

      success: true,

      message: 'All notifications marked as read'

    });

  } catch (err) {

    next(err);

  }

};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {

  try {

    const notification = await Notification.findById(
      req.params.id
    );

    if (!notification) {

      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });

    }

    if (
      notification.user.toString() !==
      req.user._id.toString()
    ) {

      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });

    }

    await notification.deleteOne();

    res.json({

      success: true,

      message: 'Notification deleted'

    });

  } catch (err) {

    next(err);

  }

};