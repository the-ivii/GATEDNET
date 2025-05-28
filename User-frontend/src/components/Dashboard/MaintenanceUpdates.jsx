import React, { useEffect, useState } from 'react';
import Card from '../UI/Card';
import useStore from '../../store/useStore';
import { X } from 'lucide-react';

const MaintenanceUpdates = () => {
  const { maintenanceUpdates, fetchMaintenanceUpdates, isLoading, error } = useStore();
  const [showAllModal, setShowAllModal] = useState(false);
  
  useEffect(() => {
    fetchMaintenanceUpdates();
  }, [fetchMaintenanceUpdates]);
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
      case 'pending':
        return (
          <span className="px-3 py-1 bg-yellow-400 text-yellow-900 font-medium rounded">
            {status.toUpperCase()}
          </span>
        );
      case 'in-progress':
        return (
          <span className="px-3 py-1 bg-blue-400 text-blue-900 font-medium rounded">
            IN PROGRESS
          </span>
        );
      case 'resolved':
        return (
          <span className="px-3 py-1 bg-green-400 text-green-900 font-medium rounded">
            RESOLVED
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-300 text-gray-800 font-medium rounded">
            {status ? status.toUpperCase() : 'UNKNOWN'}
          </span>
        );
    }
  };

  const renderUpdatesList = (updates) => (
    <div className="space-y-4">
      {updates.map(update => (
        <div key={update._id || update.id} className="flex justify-between items-center">
          <div className="text-lg">{update.title}</div>
          <div>{getStatusBadge(update.status)}</div>
        </div>
      ))}
    </div>
  );
  
  return (
    <>
      <Card 
        title="MAINTENANCE UPDATES"
        footer={<span>SEE ALL UPDATES</span>}
        onFooterClick={() => setShowAllModal(true)}
      >
        {isLoading ? (
          <div className="text-center py-4">Loading updates...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-600 bg-red-100 rounded">{error}</div>
        ) : maintenanceUpdates.length === 0 ? (
          <div className="text-center py-4">No maintenance updates</div>
        ) : (
          renderUpdatesList(maintenanceUpdates.slice(0, 2))
        )}
      </Card>

      {/* All Updates Modal */}
      {showAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={() => setShowAllModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4">All Maintenance Updates</h2>
            {renderUpdatesList(maintenanceUpdates)}
          </div>
        </div>
      )}
    </>
  );
};

export default MaintenanceUpdates;