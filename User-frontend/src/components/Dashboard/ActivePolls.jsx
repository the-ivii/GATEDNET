import React, { useEffect, useState } from 'react';
import PollItem from '../Poll/PollItem';
import Card from '../UI/Card';
import useStore from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const ActivePolls = ({ onViewPoll, onPollSelect }) => {
  const { activePolls, fetchActivePolls, isLoading, pollError } = useStore();
  const navigate = useNavigate();
  const [showAllModal, setShowAllModal] = useState(false);
  
  useEffect(() => {
    console.log('ActivePolls component mounted or fetchActivePolls changed.');
    fetchActivePolls();
  }, [fetchActivePolls]);

  useEffect(() => {
    console.log('ActivePolls state updated:', { activePolls, isLoading, pollError });
  }, [activePolls, isLoading, pollError]);
  
  const calculateProgress = (poll) => {
    // Calculate progress based on actual vote count from backend
    const totalVotes = poll.options.reduce((sum, option) => sum + (option.votes ? option.votes.length : 0), 0);
    // You might want a more dynamic way to determine the 'total possible votes' 
    // or just show the raw vote count / percentages.
    // For now, let's use a placeholder total for a visual progress bar.
    const placeholderTotal = 10; // Example: show progress relative to 10 votes
    return Math.min(100, (totalVotes / placeholderTotal) * 100);
  };

  const renderPollList = (polls, isModal = false) => (
    <div>
      {polls.map(poll => (
        <PollItem
          key={poll._id || poll.id}
          id={poll._id || poll.id}
          title={poll.title || poll.question}
          progress={calculateProgress(poll)}
          onClick={() => onPollSelect(poll)}
          className={isModal ? "text-gray-900" : "text-white"}
        />
      ))}
    </div>
  );
  
  return (
    <>
      <Card 
        title="ACTIVE VOTES"
        footer={<span>SEE ALL LIVE POLLS</span>}
        onFooterClick={() => setShowAllModal(true)}
      >
        {isLoading ? (
          <div className="text-center py-4">Loading polls...</div>
        ) : pollError ? (
          <div className="text-center py-4 text-red-600 bg-red-100 rounded">{pollError}</div>
        ) : activePolls.length === 0 ? (
          <div className="text-center py-4">No active polls at the moment</div>
        ) : (
          renderPollList(activePolls.slice(0, 2))
        )}
      </Card>

      {/* All Polls Modal */}
      {showAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-navy-900 rounded-3xl p-0 w-full max-w-lg max-h-[80vh] overflow-y-auto relative shadow-2xl border border-navy-800">
            <button
              onClick={() => setShowAllModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white text-3xl font-light focus:outline-none"
            >
              <X size={32} />
            </button>
            <div className="w-full flex flex-col items-start px-8 py-8">
              <h2 className="text-3xl font-extrabold text-blue-400 mb-8 tracking-wide w-full text-center">All Active Polls</h2>
              <div className="w-full">
                {renderPollList(activePolls, true)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActivePolls;