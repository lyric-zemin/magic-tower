import React from 'react';

interface ControlsProps {
  exits: {
    north?: string;
    south?: string;
    east?: string;
    west?: string;
  };
  onMove: (direction: 'north' | 'south' | 'east' | 'west') => void;
}

const Controls: React.FC<ControlsProps> = ({ exits, onMove }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700 transition-all duration-300 hover:shadow-blue-500/20">
      <h2 className="text-xl font-bold mb-3 text-blue-400">移动</h2>
      <div className="grid grid-cols-3 gap-3">
        {/* 北 */}
        <div className="col-start-2">
          {exits.north && (
            <button
              className="w-full py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
              onClick={() => onMove('north')}
            >
              北
            </button>
          )}
        </div>
        
        {/* 西、东 */}
        <div className='row-start-2'>
          {exits.west && (
            <button
              className="w-full py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
              onClick={() => onMove('west')}
            >
              西
            </button>
          )}
        </div>
        <div className='row-start-2 col-start-3'>
          {exits.east && (
            <button
              className="w-full py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
              onClick={() => onMove('east')}
            >
              东
            </button>
          )}
        </div>
        
        {/* 南 */}
        <div className="row-start-3 col-start-2">
          {exits.south && (
            <button
              className="w-full py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
              onClick={() => onMove('south')}
            >
              南
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Controls;