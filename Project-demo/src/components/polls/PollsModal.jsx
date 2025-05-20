import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../common/Modal';
import './PollsModal.css';

const API_BASE_URL = 'http://localhost:3000/api';

const PollsModal = ({ isOpen, onClose }) => {
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPolls = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/polls/active`);
        setPolls(response.data.data);
      } catch (error) {
        console.error('Error fetching polls:', error);
        setError('Failed to fetch polls. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, [isOpen]);

  const handlePollClick = (poll) => {
    setSelectedPoll(poll);
  };

  const handleVote = async (pollId, optionId) => {
    try {
      // Make API call to record vote
      await axios.post(`${API_BASE_URL}/polls/${pollId}/vote`, {
        optionId
      });

      // Update local state with new vote
      setPolls(polls.map(poll => {
        if (poll._id === pollId) {
          return {
            ...poll,
            votesFor: poll.votesFor + 1,
            totalVotes: poll.totalVotes + 1
          };
        }
        return poll;
      }));

      // Update selected poll if it's the one being voted on
      if (selectedPoll && selectedPoll._id === pollId) {
        setSelectedPoll(polls.find(p => p._id === pollId));
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      setError('Failed to submit vote. Please try again.');
    }
  };

  const handleBackToPolls = () => {
    setSelectedPoll(null);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={selectedPoll ? 'Poll Results' : 'Live Polls'} 
      width="600px"
    >
      {loading ? (
        <div className="loading-spinner">Loading polls...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          {selectedPoll ? (
            <div className="poll-detail">
              <button className="back-btn" onClick={handleBackToPolls}>
                ← Back to all polls
              </button>
              <h3>{selectedPoll.title}</h3>
              
              <div className="poll-chart">
                <div className="chart-bar-container">
                  <div className="chart-label">
                    <span>Votes For</span>
                    <span>{Math.round((selectedPoll.votesFor / selectedPoll.totalVotes) * 100)}% ({selectedPoll.votesFor} votes)</span>
                  </div>
                  <div className="chart-bar-bg">
                    <div 
                      className="chart-bar-fill" 
                      style={{ width: `${(selectedPoll.votesFor / selectedPoll.totalVotes) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="chart-bar-container">
                  <div className="chart-label">
                    <span>Votes Against</span>
                    <span>{Math.round(((selectedPoll.totalVotes - selectedPoll.votesFor) / selectedPoll.totalVotes) * 100)}% ({selectedPoll.totalVotes - selectedPoll.votesFor} votes)</span>
                  </div>
                  <div className="chart-bar-bg">
                    <div 
                      className="chart-bar-fill" 
                      style={{ width: `${((selectedPoll.totalVotes - selectedPoll.votesFor) / selectedPoll.totalVotes) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="poll-actions">
                <div className="poll-options">
                  <button 
                    className="vote-btn"
                    onClick={() => handleVote(selectedPoll._id, 'for')}
                  >
                    Vote For
                  </button>
                  <button 
                    className="vote-btn"
                    onClick={() => handleVote(selectedPoll._id, 'against')}
                  >
                    Vote Against
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="polls-list">
              {polls.length === 0 ? (
                <p className="no-polls">No active polls at the moment.</p>
              ) : (
                polls.map(poll => (
                  <div 
                    key={poll._id} 
                    className="poll-card"
                    onClick={() => handlePollClick(poll)}
                  >
                    <h3>{poll.title}</h3>
                    <div className="poll-progress">
                      <div 
                        className="progress-bar"
                        style={{ width: `${(poll.votesFor / poll.totalVotes) * 100}%` }}
                      />
                    </div>
                    <div className="poll-meta">
                      <span>{poll.votesFor} votes for</span>
                      <span>{poll.totalVotes - poll.votesFor} votes against</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default PollsModal;