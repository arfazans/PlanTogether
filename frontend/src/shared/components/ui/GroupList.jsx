import GroupListItem from "./GroupListItem";

const GroupList = ({ groups, onGroupSelect, selectedGroupId }) => {
  return (
    <div className="p-4 space-y-2 h-full overflow-y-auto">
      {groups.map((group, index) => (
        <GroupListItem
          key={index}
          group={group}
          onClick={onGroupSelect}
          isSelected={selectedGroupId === group._id}
        />
      ))}
    </div>
  );
};

export default GroupList;