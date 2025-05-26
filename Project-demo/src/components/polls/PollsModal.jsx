import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { pollService } from '../../services/api';
import './PollsModal.css';

const PollsModal = ({ isOpen, onClose }) => {
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolls = async () => {
      setLoading(true);
      try {
        const response = await pollService.getActive();
        setPolls(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching polls:', error);
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchPolls();
    }
  }, [isOpen]);

  const handlePollClick = (poll) => {
    setSelectedPoll(poll);
  };

  const handleVote = async (pollId, optionIndex) => {
    try {
      await pollService.vote(pollId, optionIndex);
      
      // Refresh polls after voting
      const response = await pollService.getActive();
      setPolls(response.data);
      
      // Update selected poll if it's the one being voted on
      if (selectedPoll && selectedPoll._id === pollId) {
        setSelectedPoll(response.data.find(p => p._id === pollId));
      }
    } catch (error) {
      console.error('Error voting on poll:', error);
    }
  };

  const handleBackToPolls = () => {
    setSelectedPoll(null);
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Active Polls" width="600px">
        <div className="loading-spinner">Loading polls...</div>
      </Modal>
    );
  }

  if (selectedPoll) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={selectedPoll.title} width="600px">
        <div className="poll-details">
          <p className="poll-description">{selectedPoll.description}</p>
          <div className="poll-options">
            {selectedPoll.options.map((option, index) => (
              <button
                key={index}
                className="poll-option"
                onClick={() => handleVote(selectedPoll._id, index)}
                disabled={selectedPoll.hasVoted}
              >
                <span className="option-text">{option.text}</span>
                <span className="vote-count">{option.votes.length} votes</span>
              </button>
            ))}
          </div>
          <div className="poll-footer">
            <span className="end-date">
              Ends on: {new Date(selectedPoll.endDate).toLocaleDateString()}
            </span>
            <button className="back-button" onClick={handleBackToPolls}>
              Back to Polls
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Active Polls" width="600px">
      <div className="polls-list">
        {polls.length === 0 ? (
          <div className="no-polls">No active polls</div>
        ) : (
          polls.map(poll => (
            <div
              key={poll._id}
              className="poll-item"
              onClick={() => handlePollClick(poll)}
            >
              <h3 className="poll-title">{poll.title}</h3>
              <p className="poll-description">{poll.description}</p>
              <div className="poll-meta">
                <span className="end-date">
                  Ends on: {new Date(poll.endDate).toLocaleDateString()}
                </span>
                <span className="total-votes">
                  {poll.options.reduce((total, option) => total + option.votes.length, 0)} votes
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default PollsModal;