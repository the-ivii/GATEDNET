import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import useStore from '../../store/useStore';
import PollItem from '../Poll/PollItem'; // Assuming PollItem can be reused

const AllPollsModal = ({ isOpen, onClose, onPollSelectForVoting }) => {
  const { activePolls, fetchActivePolls, isLoading, error } = useStore();

  useEffect(() => {
    if (isOpen) {
      fetchActivePolls(); // Ensure all polls are fetched when modal opens
    }
  }, [isOpen, fetchActivePolls]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">All Active Polls</h2>

        {isLoading ? (
          <div className="text-center py-4">Loading polls...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">Error loading polls: {error}</div>
        ) : activePolls.length === 0 ? (
          <div className="text-center py-4">No active polls available.</div>
        ) : (
          <div className="space-y-4">
            {activePolls.map(poll => (
              <div 
                key={poll.id} 
                onClick={() => onPollSelectForVoting(poll)}
                className="cursor-pointer hover:bg-gray-100 p-3 rounded-lg transition-colors text-gray-900"
              >
                <PollItem poll={poll} isModal={true} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPollsModal;