const GroupListItem = ({ group, onClick, isSelected }) => {
  return (
    <div
      onClick={() => onClick(group._id)}
      className={`cursor-pointer p-3 rounded-lg transition-all duration-300 ease-in-out flex items-center ${
        isSelected
          ? "bg-neutral-500 shadow-md shadow-gray-400/50"
          : "bg-neutral-700 hover:bg-neutral-600 hover:shadow-lg hover:shadow-gray-500/50 hover:scale-[1.02]"
      }`}
    >
      <div className="w-10 h-10 rounded-full flex-shrink-0 mr-3 bg-blue-500 flex items-center justify-center">
        <span className="text-white font-bold text-sm">
          {group.name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="mb-1">
          <h1 className="text-white font-semibold text-sm truncate">
            {group.name}
          </h1>
        </div>
        <div>
          <p className="text-gray-300 text-xs truncate">
            {group.members.length} members
          </p>
        </div>
      </div>
    </div>
  );
};

export default GroupListItem;