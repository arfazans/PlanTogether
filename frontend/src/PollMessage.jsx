import React, { useState } from 'react';
import axios from 'axios';

const PollMessage = ({ message, userid, onVoteUpdate }) => {
  const [voting, setVoting] = useState(false);
  
  const handleVote = async (optionIndex) => {
    if (voting) return;
    
    try {
      setVoting(true);
      
      const res = await axios.post(
        `http://localhost:9860/plan/plans/${message.pollData.planId}/vote`,
        { optionIndex },
        { withCredentials: true }
      );
      
      if (res.data.success && onVoteUpdate) {
        onVoteUpdate(res.data.pollMessage, res.data.plan);
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVoting(false);
    }
  };

  const getUserVote = () => {
    for (let i = 0; i < message.pollData.options.length; i++) {
      if (message.pollData.options[i].votes.some(vote => 
        (typeof vote === 'string' ? vote : vote._id) === userid
      )) {
        return i;
      }
    }
    return -1;
  };

  const userVote = getUserVote();
  const totalVotes = message.pollData.options.reduce((sum, option) => sum + option.votes.length, 0);

  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 shadow-lg">
      {/* Poll Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm">📊</span>
        </div>
        <div>
          <h4 className="font-semibold text-blue-900 text-sm">Plan Poll</h4>
          <p className="text-xs text-blue-600">by {message.senderId.name}</p>
        </div>
      </div>

      {/* Poll Question */}
      <h3 className="font-medium text-gray-800 mb-3 text-center">
        {message.pollData.question}
      </h3>

      {/* Poll Options */}
      <div className="space-y-2 mb-3">
        {message.pollData.options.map((option, index) => {
          const voteCount = option.votes.length;
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
          const isSelected = userVote === index;
          
          return (
            <button
              key={index}
              onClick={() => handleVote(index)}
              disabled={voting}
              className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                isSelected 
                  ? 'border-green-400 bg-green-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
              } ${voting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    isSelected ? 'text-green-700' : 'text-gray-700'
                  }`}>
                    {option.text}
                  </span>
                  {isSelected && <span className="text-green-500">✓</span>}
                </div>
                <span className={`text-xs font-semibold ${
                  isSelected ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {voteCount}
                </span>
              </div>
              
              {/* Progress Bar */}
              {totalVotes > 0 && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isSelected ? 'bg-green-400' : 'bg-blue-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Vote Summary */}
      <div className="text-center text-xs text-gray-500 border-t pt-2">
        {totalVotes === 0 ? (
          "No votes yet - be the first!"
        ) : (
          `${totalVotes} vote${totalVotes !== 1 ? 's' : ''} • ${message.pollData.options[0].votes.length} attending`
        )}
      </div>
    </div>
  );
};

export default PollMessage;