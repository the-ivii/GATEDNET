import React, { useState } from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import useStore from '../../store/useStore';
import { X } from 'lucide-react';

const PollVotingModal = ({ isOpen, onClose, poll }) => {
  const { castVote, isLoading, error } = useStore();
  const [selectedOption, setSelectedOption] = useState(null);

  const handleVote = async () => {
    if (selectedOption === null) {
      alert('Please select an option to vote.');
      return;
    }
    // Assuming single choice for now. Adjust if multiple choices are needed.
    try {
      await castVote(poll._id, selectedOption);
      onClose(); // Close modal on successful vote
    } catch (err) {
      console.error('Error casting vote:', err);
      // Display error to user (e.g., using a toast or error state)
      alert('Failed to cast vote. Please try again.');
    }
  };

  if (!isOpen || !poll) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-4">{poll.title || poll.question}</h2>

        <div className="space-y-4">
          {poll.options.map((option, index) => (
            <div
              key={index}
              className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${selectedOption === index ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
              onClick={() => setSelectedOption(index)}
            >
              <input
                type="radio"
                name="pollOption"
                value={index}
                checked={selectedOption === index}
                onChange={() => setSelectedOption(index)}
                className="mr-3"
              />
              <span>{option.text || option.name}</span>
            </div>
          ))}
        </div>

        {error && <div className="text-red-600 mt-4">{error}</div>}

        <Button
          onClick={handleVote}
          disabled={isLoading || selectedOption === null}
          className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Submitting Vote...' : 'Vote'}
        </Button>
      </div>
    </div>
  );
};

export default PollVotingModal; 