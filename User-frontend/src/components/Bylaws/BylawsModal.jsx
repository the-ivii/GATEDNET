import React from 'react';
import { X } from 'lucide-react';

const BylawsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Replace with the actual path to your PDF file
  const pdfUrl = '/society_bylaws.pdf'; 

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] relative flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">Society By-Laws</h2>

        <div className="flex-grow">
            <iframe 
                src={pdfUrl}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="Society By-Laws"
            ></iframe>
        </div>

      </div>
    </div>
  );
};

export default BylawsModal; 