import React from 'react';
import type { Room } from '../types/index';

interface RoomDescriptionProps {
  room: Room;
}

const RoomDescription: React.FC<RoomDescriptionProps> = ({ room }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700 transition-all duration-300 hover:shadow-blue-500/20">
      <h2 className="text-xl font-bold mb-2 text-blue-300">当前房间</h2>
      <p className="text-gray-300 leading-relaxed">{room.description}</p>
    </div>
  );
};

export default RoomDescription;