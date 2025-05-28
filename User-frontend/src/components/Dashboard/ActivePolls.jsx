import React, { useEffect, useState } from 'react';
import PollItem from '../Poll/PollItem';
import Card from '../UI/Card';
import useStore from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const ActivePolls = ({ onViewPoll }) => {
  const { activePolls, fetchActivePolls, isLoading, error } = useStore();
  const navigate = useNavigate();
  const [showAllModal, setShowAllModal] = useState(false);
  
  useEffect(() => {
    console.log('ActivePolls component mounted or fetchActivePolls changed.');
    fetchActivePolls();
  }, [fetchActivePolls]);

  useEffect(() => {
    console.log('ActivePolls state updated:', { activePolls, isLoading, error });
  }, [activePolls, isLoading, error]);
  
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
          onClick={() => onViewPoll(poll._id || poll.id)}
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
        ) : error ? (
          <div className="text-center py-4 text-red-600 bg-red-100 rounded">{error}</div>
        ) : activePolls.length === 0 ? (
          <div className="text-center py-4">No active polls at the moment</div>
        ) : (
          renderPollList(activePolls.slice(0, 2))
        )}
      </Card>

      {/* All Polls Modal */}
      {showAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={() => setShowAllModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4">All Active Polls</h2>
            {renderPollList(activePolls, true)}
          </div>
        </div>
      )}
    </>
  );
};

export default ActivePolls;