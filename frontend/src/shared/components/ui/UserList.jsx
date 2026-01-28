import UserListItem from "./UserListItem";

const UserList = ({ users, onlineUsers, unreadUsers, recentMessages, onUserSelect, selectedUserId }) => {
  return (
    <div className="p-4 space-y-2 h-full overflow-y-auto">
      {users.map((user, index) => (
        <UserListItem
          key={index}
          user={user}
          onlineUsers={onlineUsers}
          unreadUsers={unreadUsers}
          recentMessages={recentMessages}
          onClick={onUserSelect}
          isSelected={selectedUserId === user._id}
        />
      ))}
    </div>
  );
};

export default UserList;