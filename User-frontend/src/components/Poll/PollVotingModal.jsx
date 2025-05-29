import React, { useState } from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import useStore from '../../store/useStore';
import { X } from 'lucide-react';

const PollVotingModal = ({ isOpen, onClose, poll }) => {
  const { castVote, isLoading, pollError } = useStore();
  const [selectedOption, setSelectedOption] = useState(null);

  const handleVote = async () => {
    if (selectedOption === null) {
      alert('Please select an option to vote.');
      return;
    }
    try {
      await castVote(poll._id, selectedOption);
      onClose(true); // Pass true to indicate a successful vote
    } catch (err) {
      console.error('Error casting vote:', err);
      // Show the specific error message from the backend if available
    }
  };

  const handleViewResults = () => {
    onClose(true); // Show results for this poll
  };

  if (!isOpen || !poll) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-navy-900 rounded-3xl p-10 w-full max-w-md mx-auto flex flex-col items-center justify-center shadow-2xl border border-navy-800 relative">
        <button
          onClick={() => onClose(false)}
          className="absolute top-6 right-6 text-gray-400 hover:text-white text-3xl font-light focus:outline-none"
        >
          <X size={32} />
        </button>

        <h2 className="text-3xl font-extrabold text-white text-center mb-10 tracking-wide w-full">{poll.title || poll.question}</h2>

        <div className="space-y-6 w-full flex flex-col items-center justify-center">
          {poll.options.map((option, index) => (
            <div
              key={index}
              className={`flex items-center p-4 rounded-xl cursor-pointer transition-colors border-2 w-full max-w-lg mx-auto ${selectedOption === index ? 'border-blue-500 bg-blue-950' : 'border-navy-800 bg-navy-800 hover:bg-navy-700'}`}
              onClick={() => setSelectedOption(index)}
            >
              <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${selectedOption === index ? 'border-blue-400 bg-blue-500' : 'border-blue-400 bg-navy-900'}`}> 
                {selectedOption === index && <span className="w-3 h-3 bg-white rounded-full block" />}
              </span>
              <span className="text-white text-lg font-semibold">{option.text || option.name}</span>
            </div>
          ))}
        </div>

        {pollError && <div className="text-red-400 mt-4 text-center w-full">{pollError}</div>}

        <button
          onClick={handleVote}
          disabled={isLoading || selectedOption === null}
          className="mt-10 w-full py-4 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
        >
          {isLoading ? 'Submitting Vote...' : 'Vote'}
        </button>
        <button
          onClick={handleViewResults}
          className="mt-4 w-full py-3 rounded-xl text-lg font-bold text-blue-400 border-2 border-blue-500 bg-transparent hover:bg-blue-950 transition-all"
        >
          View Results
        </button>
      </div>
    </div>
  );
};

export default PollVotingModal; 