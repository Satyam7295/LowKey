import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";

export async function getNotifications(req, res) {
  const userId = req.user.id;

  const notifications = await Notification.find({ recipient: userId })
    .populate("sender", "username name profilePic")
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({
    success: true,
    notifications: notifications.map((n) => n.toJSON())
  });
}

export async function markAsRead(req, res) {
  const userId = req.user.id;
  const { notificationId } = req.params;

  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.recipient.toString() !== userId) {
    throw new ApiError(403, "Unauthorized");
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    success: true,
    notification: notification.toJSON()
  });
}

export async function markAllAsRead(req, res) {
  const userId = req.user.id;

  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );

  res.status(200).json({
    success: true,
    message: "All notifications marked as read"
  });
}

export async function deleteNotification(req, res) {
  const userId = req.user.id;
  const { notificationId } = req.params;

  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.recipient.toString() !== userId) {
    throw new ApiError(403, "Unauthorized");
  }

  await Notification.deleteOne({ _id: notificationId });

  res.status(200).json({
    success: true,
    message: "Notification deleted"
  });
}
