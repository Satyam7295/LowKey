/**
 * ProfilePictureWithStatus Component
 * Displays profile picture with online status indicator
 * 
 * Props:
 * - src (string): Profile picture URL
 * - alt (string): Alt text for image
 * - isOnline (boolean): Whether the user is online
 * - size (string): Size of the profile picture 'sm', 'md', 'lg', 'xl' - default 'md'
 * - className (string): Additional CSS classes
 */

import OnlineIndicator from "./OnlineIndicator";

export default function ProfilePictureWithStatus({ 
  src, 
  alt, 
  isOnline, 
  size = "md",
  className = ""
}) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24"
  };

  return (
    <div className={`relative inline-block ${sizeClasses[size]} ${className}`}>
      <img
        src={src || "/default-avatar.png"}
        alt={alt}
        className={`${sizeClasses[size]} rounded-full object-cover border border-white/10`}
      />
      <OnlineIndicator isOnline={isOnline} size={size === "xl" ? "lg" : size} />
    </div>
  );
}
