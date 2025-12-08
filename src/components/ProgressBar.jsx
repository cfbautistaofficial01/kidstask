import React from 'react';
import { useApp } from '../context/AppContext';
import { Coins, Trophy, Award } from 'lucide-react';
import { getRank } from '../utils/levelUtils';

const ProgressBar = () => {
    const { currentProfile } = useApp();

    if (!currentProfile) return null;

    const points = currentProfile.points;

    // Calculate level and progress (every 100 points is a level)
    const pointsPerLevel = 100;
    const level = Math.floor(points / pointsPerLevel) + 1;
    const progress = ((points % pointsPerLevel) / pointsPerLevel) * 100;

    return (
        <div className="bg-white p-4 rounded-2xl shadow-md border-b-4 border-blue-200 mb-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-2 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-yellow-100 p-2 rounded-full">
                        <Coins className="text-yellow-500" size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Total Points</p>
                        <p className="text-3xl font-black text-gray-800 leading-none">{points}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="text-right">
                        <p className="text-xs text-blue-500 font-bold uppercase">Level {level} • {getRank(level)}</p>
                        <p className="text-xs text-gray-400">{points % pointsPerLevel} / {pointsPerLevel} to next level</p>
                    </div>
                    <div className="bg-blue-100 p-2 rounded-full">
                        <Trophy className="text-blue-500" size={24} />
                    </div>
                </div>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden border border-gray-200 shadow-inner relative z-10">
                <div
                    className="bg-gradient-to-r from-blue-400 to-purple-500 h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${Math.max(5, progress)}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
