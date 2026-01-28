import React, { useState, useEffect, useContext } from 'react'
import Navbar from '../../shared/components/layout/Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';
import { NoteContext } from '../../ContextApi/CreateContext';
import bg1 from '../../assets/bg-1.jpg';
import bg2 from '../../assets/bg-2.jpg';
import bg9 from '../../assets/bg-9.png';
import bg10 from '../../assets/bg-10.png';
import bg11 from '../../assets/bg-11.png';
import bg12 from '../../assets/bg-12.png';

function GroupsManagementPage() {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [allGroups, setAllGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  const { userId } = useContext(NoteContext);
  const backgroundImages = [bg1, bg2, bg9, bg10, bg11, bg12];

  // Fetch all groups and user's groups
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all groups (you'll need to create this endpoint)
        const allGroupsRes = await axios.get('http://localhost:9860/group/all-groups', {
          withCredentials: true
        });

        // Fetch user's groups
        const userGroupsRes = await axios.get('http://localhost:9860/group/my-groups', {
          withCredentials: true
        });

        if (allGroupsRes.data.success) {
          setAllGroups(allGroupsRes.data.groups);
          setFilteredGroups(allGroupsRes.data.groups);
        }

        if (userGroupsRes.data.success) {
          setUserGroups(userGroupsRes.data.groups);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter groups based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredGroups(allGroups);
    } else {
      const filtered = allGroups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGroups(filtered);
    }
  }, [searchTerm, allGroups]);



  // Check if user is member of a group
  const isUserMember = (groupId) => {
    return userGroups.some(userGroup => userGroup._id === groupId);
  };

  // Handle search
  const handleSearch = () => {
    // Search is handled by useEffect above
  };

  // Handle join group with invite code
  const handleJoinWithCode = async () => {
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    try {
      const res = await axios.post('http://localhost:9860/group/join',
        { inviteCode: inviteCode.trim() },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success('Successfully joined group! Go to Groups tab in dashboard to chat.');
        setInviteCode('');
        // Refresh data
        const userGroupsRes = await axios.get('http://localhost:9860/group/my-groups', {
          withCredentials: true
        });
        if (userGroupsRes.data.success) {
          setUserGroups(userGroupsRes.data.groups);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join group');
    }
  };

  // Handle join group by button click
  const handleJoinGroup = async (groupId) => {
    try {
      const res = await axios.post('http://localhost:9860/group/request-join',
        { groupId },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success('Join request sent to group creator!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send join request');
    }
  };

  // Handle create group
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    try {
      const res = await axios.post('http://localhost:9860/group/create',
        {
          name: groupName.trim(),
          description: groupDescription.trim()
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(`Group created! Invite code: ${res.data.group.inviteCode}`);
        setShowCreateModal(false);
        setGroupName('');
        setGroupDescription('');

        // Refresh data
        const [allGroupsRes, userGroupsRes] = await Promise.all([
          axios.get('http://localhost:9860/group/all-groups', { withCredentials: true }),
          axios.get('http://localhost:9860/group/my-groups', { withCredentials: true })
        ]);

        if (allGroupsRes.data.success) {
          setAllGroups(allGroupsRes.data.groups);
          setFilteredGroups(allGroupsRes.data.groups);
        }
        if (userGroupsRes.data.success) {
          setUserGroups(userGroupsRes.data.groups);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create group');
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) =>
        (prevIndex + 1) % backgroundImages.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  return (
    <div className="h-screen w-full relative overflow-x-hidden overflow-y-hidden">
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      <div
        className='absolute inset-0 transition-all duration-1000 ease-in-out'
        style={{
          backgroundImage: `url(${backgroundImages[currentBgIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <Navbar />

      <main className="relative z-10 h-screen overflow-hidden">
        <div className='h-full w-full flex items-center justify-center pt-14 px-4'>
          <div className="max-w-[85rem] w-full px-2 sm:px-4 lg:px-6 mx-auto h-fit">
            <div className="flex flex-col">
              <div className="-m-1.5 overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block align-middle">
                  <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-2xs overflow-hidden dark:bg-neutral-900/90 dark:border-neutral-700 max-h-[70vh] flex flex-col">

                    {/* Header */}
                    <div className="px-3 sm:px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-shrink-0">
                          <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-200">
                            Groups
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-neutral-400">
                            Create groups, chat together, and make plans happen.
                          </p>
                        </div>

                        {/* Search and Actions Section */}
                        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              placeholder="Search groups..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full sm:w-40 lg:w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-600 dark:text-white"
                            />
                            <button
                              onClick={handleSearch}
                              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                            >
                              Search
                            </button>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              placeholder="Enter invite code..."
                              value={inviteCode}
                              onChange={(e) => setInviteCode(e.target.value)}
                              className="w-full sm:w-32 lg:w-40 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-neutral-800 dark:border-neutral-600 dark:text-white"
                            />
                            <button
                              onClick={handleJoinWithCode}
                              className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-nowrap"
                            >
                              Join
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="py-2 px-4 inline-flex items-center justify-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 whitespace-nowrap"
                          >
                            Create Group
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                      <thead className="bg-gray-50 dark:bg-neutral-800 sticky top-0 z-10">
                        <tr>
                          <th scope="col" className="px-3 sm:px-6 py-3 text-start">
                            <span className="text-xs font-semibold uppercase text-gray-800 dark:text-neutral-200">
                              Group Name
                            </span>
                          </th>
                          <th scope="col" className="px-3 sm:px-6 py-3 text-start hidden sm:table-cell">
                            <span className="text-xs font-semibold uppercase text-gray-800 dark:text-neutral-200">
                              Description
                            </span>
                          </th>
                          <th scope="col" className="px-3 sm:px-6 py-3 text-start hidden md:table-cell">
                            <span className="text-xs font-semibold uppercase text-gray-800 dark:text-neutral-200">
                              Category
                            </span>
                          </th>
                          <th scope="col" className="px-3 sm:px-6 py-3 text-start hidden lg:table-cell">
                            <span className="text-xs font-semibold uppercase text-gray-800 dark:text-neutral-200">
                              Active Plans
                            </span>
                          </th>
                          <th scope="col" className="px-3 sm:px-6 py-3 text-start">
                            <span className="text-xs font-semibold uppercase text-gray-800 dark:text-neutral-200">
                              Members
                            </span>
                          </th>
                          <th scope="col" className="px-3 sm:px-6 py-3 text-end">
                            <span className="text-xs font-semibold uppercase text-gray-800 dark:text-neutral-200">
                              Action
                            </span>
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                        {loading ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                              Loading groups...
                            </td>
                          </tr>
                        ) : filteredGroups.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                              {searchTerm ? 'No groups found matching your search.' : 'No groups available.'}
                            </td>
                          </tr>
                        ) : (
                          filteredGroups.map((group) => (
                            <tr key={group._id} className="bg-white hover:bg-gray-50 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                              <td className="px-3 sm:px-6 py-2">
                                <div className="text-sm text-blue-600 decoration-2 hover:underline dark:text-blue-500 truncate max-w-[150px]">
                                  {group.name}
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-2 hidden sm:table-cell">
                                <p className="text-sm text-gray-500 dark:text-neutral-500 truncate max-w-[200px]">
                                  {group.description || 'No description'}
                                </p>
                              </td>
                              <td className="px-3 sm:px-6 py-2 hidden md:table-cell">
                                <span className="inline-flex items-center gap-1.5 py-1 px-2 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  General
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-2 hidden lg:table-cell">
                                <span className="inline-flex items-center gap-1.5 py-1 px-2 rounded-lg text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  Active
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-2">
                                <div className="flex -space-x-2">
                                  {group.members.slice(0, 3).map((member, index) => (
                                    <div key={index} className="inline-block size-6 rounded-full bg-gray-600 ring-2 ring-white dark:ring-neutral-900"></div>
                                  ))}
                                  {group.members.length > 3 && (
                                    <div className="inline-flex justify-center items-center size-6 bg-gray-100 text-xs rounded-full ring-2 ring-white dark:bg-neutral-500 dark:text-white dark:ring-neutral-900">
                                      <span className="font-medium">{group.members.length - 3}+</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-2 text-end">
                                {isUserMember(group._id) ? (
                                  <span className="text-green-600 font-medium text-sm whitespace-nowrap">
                                    You're in
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleJoinGroup(group._id)}
                                    className="text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                                  >
                                    Join
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      </table>
                    </div>

                    {/* Footer */}
                    <div className="px-3 sm:px-6 py-4 border-t border-gray-200 dark:border-neutral-700 flex-shrink-0">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600 dark:text-neutral-400">
                          <span className="font-semibold text-gray-800 dark:text-neutral-200">{filteredGroups.length}</span> groups
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Create Group Popup */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Create New Group</h3>

            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name..."
              className="w-full px-3 py-2 mb-3 border rounded-lg"
            />

            <textarea
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="Description (optional)..."
              rows={3}
              className="w-full px-3 py-2 mb-4 border rounded-lg resize-none"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setGroupName('');
                  setGroupDescription('');
                }}
                className="flex-1 px-4 py-2 border hover:bg-gray-200 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupsManagementPage