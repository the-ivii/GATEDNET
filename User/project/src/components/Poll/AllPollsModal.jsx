import React from 'react';
import Modal from '../UI/Modal';
import useStore from '../../store/useStore';
import PollItem from './PollItem';

const AllPollsModal = ({ isOpen, onClose, onViewPoll }) => {
  const { activePolls, isLoading } = useStore();
  
  const calculateProgress = (poll) => {
    const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
    return Math.min(100, (totalVotes / 300) * 100);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ALL LIVE POLLS" width="lg">
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-4">Loading polls...</div>
        ) : activePolls.length === 0 ? (
          <div className="text-center py-4">No active polls at the moment</div>
        ) : (
          activePolls.map(poll => (
            <PollItem
              key={poll.id}
              id={poll.id}
              title={poll.title}
              progress={calculateProgress(poll)}
              onClick={onViewPoll}
            />
          ))
        )}
      </div>
    </Modal>
  );
};

export default AllPollsModal;