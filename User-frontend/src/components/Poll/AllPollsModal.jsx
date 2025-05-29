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
      <div className="bg-navy-900 rounded-3xl p-10 w-full max-w-lg max-h-[90vh] overflow-y-auto relative shadow-2xl border border-navy-800">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white text-3xl font-light focus:outline-none"
        >
          <X size={32} />
        </button>
        <h2 className="text-3xl font-extrabold text-white text-center mb-10 tracking-wide w-full">All Active Polls</h2>

        {isLoading ? (
          <div className="text-center py-4 text-white">Loading polls...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-400">Error loading polls: {error}</div>
        ) : activePolls.length === 0 ? (
          <div className="text-center py-4 text-white">No active polls available.</div>
        ) : (
          <div className="space-y-4">
            {activePolls.map(poll => (
              <div 
                key={poll.id} 
                onClick={() => { onPollSelectForVoting(poll); onClose(); }}
                className="py-2 cursor-pointer hover:bg-navy-800 rounded-lg px-2 transition-colors"
              >
                <PollItem 
                  id={poll._id || poll.id}
                  title={poll.title || poll.question}
                  progress={0} // Progress is not needed in this view
                  isModal={true}
                  className="text-white"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPollsModal;