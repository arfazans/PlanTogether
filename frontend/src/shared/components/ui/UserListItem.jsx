import aman from "../../../assets/aman.jpg";

const UserListItem = ({ user, onlineUsers, unreadUsers, recentMessages, onClick, isSelected }) => {
  return (
    <div
      onClick={() => onClick(user._id)}
      className={`cursor-pointer p-3 rounded-lg transition-all duration-300 ease-in-out flex items-center ${
        isSelected
          ? "bg-neutral-500 shadow-md shadow-gray-400/50"
          : "bg-neutral-700 hover:bg-neutral-600 hover:shadow-lg hover:shadow-gray-500/50 hover:scale-[1.02]"
      }`}
    >
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mr-3">
        <img
          src={user.profileImage || aman}
          alt="User Avatar"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <h1 className="text-white font-semibold text-sm truncate">
            {user.name}
          </h1>
          {onlineUsers.includes(String(user._id)) && (
            <span className="text-green-400 text-xs font-semibold">online</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <p className={`text-gray-300 text-xs truncate flex-1 ${
            unreadUsers[user._id] ? "font-bold text-white" : ""
          }`}>
            {recentMessages[user._id] || "No messages yet"}
          </p>
          {unreadUsers[user._id] && (
            <span className="w-2 h-2 rounded-full bg-white flex-shrink-0"></span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListItem;