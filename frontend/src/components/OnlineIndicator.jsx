/**
 * OnlineIndicator Component
 * Displays a green dot on profile pictures when user is online
 * 
 * Props:
 * - isOnline (boolean): Whether the user is online
 * - size (string): Size of the indicator 'sm', 'md', 'lg' - default 'md'
 */

export default function OnlineIndicator({ isOnline, size = "md" }) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4"
  };

  const borderClasses = {
    sm: "border",
    md: "border-2",
    lg: "border-2"
  };

  if (!isOnline) return null;

  return (
    <div className={`${sizeClasses[size]} ${borderClasses[size]} border-white rounded-full bg-green-500 absolute -bottom-0.5 -right-0.5 shadow-lg shadow-green-500/50`} />
  );
}
