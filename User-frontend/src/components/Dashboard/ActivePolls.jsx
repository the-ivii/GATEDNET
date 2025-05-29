import React, { useEffect, useState } from 'react';
import PollItem from '../Poll/PollItem';
import Card from '../UI/Card';
import useStore from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const ActivePolls = ({ onViewPoll, onPollSelect, onSeeAllClick, isModal = false }) => {
  const { activePolls, fetchActivePolls, isLoading, pollError } = useStore();
  const navigate = useNavigate();
  
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
          className={isModal ? "text-white" : "text-white"}
        />
      ))}
    </div>
  );
  
  return (
    <>
      {!isModal && (
        <Card 
          title="ACTIVE VOTES"
          footer={<span>SEE ALL LIVE POLLS</span>}
          onFooterClick={onSeeAllClick}
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
      )}
    </>
  );
};

export default ActivePolls;