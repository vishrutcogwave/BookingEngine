import { useState } from 'react';
import { Plus, Minus, Users } from 'lucide-react';

const GuestSelector = ({ adults, children, onUpdate, onClose }) => {
  const [localAdults, setLocalAdults] = useState(adults);
  const [localChildren, setLocalChildren] = useState(children);

  const handleIncrement = (type) => {
    if (type === 'adults') {
      setLocalAdults(prev => Math.min(prev + 1, 10));
    } else {
      setLocalChildren(prev => Math.min(prev + 1, 10));
    }
  };

  const handleDecrement = (type) => {
    if (type === 'adults') {
      setLocalAdults(prev => Math.max(prev - 1, 1));
    } else {
      setLocalChildren(prev => Math.max(prev - 1, 0));
    }
  };

  const handleDone = () => {
    onUpdate(localAdults, localChildren);
    onClose();
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full sm:w-80 max-w-sm">
      <div className="flex items-center gap-2 mb-4">
        <Users size={20} className="text-cogwave-blue" />
        <h3 className="font-verdana font-semibold text-cogwave-blue text-lg">
          Select Guests
        </h3>
      </div>

      {/* Adults */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-verdana font-medium text-cogwave-blue">Adults</p>
            <p className="text-sm text-balance-gray">Age 13 or above</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDecrement('adults')}
              disabled={localAdults <= 1}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                ${localAdults <= 1 
                  ? 'border-balance-gray text-balance-gray cursor-not-allowed' 
                  : 'border-vivid-cyan text-vivid-cyan hover:bg-vivid-cyan hover:text-white'
                }`}
            >
              <Minus size={16} />
            </button>
            <span className="font-verdana font-semibold text-cogwave-blue w-8 text-center">
              {localAdults}
            </span>
            <button
              onClick={() => handleIncrement('adults')}
              disabled={localAdults >= 10}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                ${localAdults >= 10 
                  ? 'border-balance-gray text-balance-gray cursor-not-allowed' 
                  : 'border-vivid-cyan text-vivid-cyan hover:bg-vivid-cyan hover:text-white'
                }`}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Children */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-verdana font-medium text-cogwave-blue">Children</p>
            <p className="text-sm text-balance-gray">Age 0-12</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDecrement('children')}
              disabled={localChildren <= 0}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                ${localChildren <= 0 
                  ? 'border-balance-gray text-balance-gray cursor-not-allowed' 
                  : 'border-vivid-cyan text-vivid-cyan hover:bg-vivid-cyan hover:text-white'
                }`}
            >
              <Minus size={16} />
            </button>
            <span className="font-verdana font-semibold text-cogwave-blue w-8 text-center">
              {localChildren}
            </span>
            <button
              onClick={() => handleIncrement('children')}
              disabled={localChildren >= 10}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                ${localChildren >= 10 
                  ? 'border-balance-gray text-balance-gray cursor-not-allowed' 
                  : 'border-vivid-cyan text-vivid-cyan hover:bg-vivid-cyan hover:text-white'
                }`}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Done Button */}
      <button
        onClick={handleDone}
        className="w-full bg-vivid-cyan text-white py-3 rounded-lg font-verdana font-medium hover:bg-cogwave-blue transition-colors"
      >
        Done
      </button>
    </div>
  );
};

export default GuestSelector;