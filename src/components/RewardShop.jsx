import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Lock, Gift, AlertTriangle, ArrowRight, TrendingDown } from 'lucide-react';

const RewardShop = () => {
    const { rewards, currentProfile, redeemReward } = useApp();

    if (!currentProfile) return null;
    const points = currentProfile.points;

    const [confirmingReward, setConfirmingReward] = useState(null);
    const [insufficientReward, setInsufficientReward] = useState(null);

    const handleRedeemClick = (reward) => {
        if (points < reward.cost) {
            setInsufficientReward(reward);
            return;
        }
        setConfirmingReward(reward);
    };

    const confirmPurchase = () => {
        if (confirmingReward) {
            redeemReward(confirmingReward);
            setConfirmingReward(null);
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                <Gift className="text-purple-500" />
                Reward Shop
            </h2>

            {rewards.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    Ask parents to add rewards!
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {rewards.map(reward => {
                        const canAfford = points >= reward.cost;
                        return (
                            <button
                                key={reward.id}
                                onClick={() => handleRedeemClick(reward)}
                                // disabled={!canAfford} // Removed disable to allow clicking for motivation
                                className={`
                  relative p-4 rounded-2xl border-b-4 text-center transition-all duration-300 flex flex-col items-center gap-3
                  ${canAfford
                                        ? 'bg-white border-purple-200 hover:border-purple-400 hover:-translate-y-1 hover:shadow-lg active:scale-95'
                                        : 'bg-gray-50 border-gray-200 opacity-60 grayscale hover:opacity-80 hover:scale-[1.02] cursor-pointer' // Added hover effects for locked items
                                    }
                `}
                            >
                                <div className={`p-4 rounded-full ${canAfford ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-400'}`}>
                                    <Gift size={32} />
                                </div>

                                <div className="w-full">
                                    <span className="block font-bold text-gray-800 text-sm leading-tight mb-2 h-10 flex items-center justify-center overflow-hidden">{reward.text}</span>
                                    <span className={`
                    inline-block px-3 py-1 rounded-full text-xs font-black
                    ${canAfford ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-500'}
                  `}>
                                        {reward.cost} Points
                                    </span>
                                </div>

                                {!canAfford && (
                                    <div className="absolute top-2 right-2">
                                        <Lock size={16} className="text-gray-400" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}


            {/* Smart Confirmation Modal */}
            {confirmingReward && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border-4 border-purple-200 animate-in zoom-in-95 duration-300 relative overflow-hidden">

                        <h2 className="text-2xl font-black text-gray-800 mb-4 text-center">Wait! Is this wise? 🤔</h2>

                        <div className="bg-purple-50 p-4 rounded-xl mb-6">
                            <div className="flex justify-between items-center text-sm font-bold text-gray-400 uppercase mb-2">
                                <span>Wallet</span>
                                <span>Cost</span>
                                <span>New Balance</span>
                            </div>
                            <div className="flex justify-between items-center font-black text-xl text-gray-800">
                                <span>{points}</span>
                                <span className="text-red-500">- {confirmingReward.cost}</span>
                                <div className="flex items-center gap-1 text-purple-600">
                                    <ArrowRight size={20} />
                                    <span>{points - confirmingReward.cost}</span>
                                </div>
                            </div>
                        </div>

                        {currentProfile.milestone && currentProfile.milestone.target > 0 && (
                            <div className="bg-orange-50 p-4 rounded-xl mb-6 border border-orange-100">
                                <h3 className="flex items-center gap-2 text-orange-600 font-bold mb-2">
                                    <TrendingDown size={20} />
                                    Super Goal Impact
                                </h3>
                                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-2">
                                    {/* Background: Current Progress */}
                                    <div
                                        className="bg-gray-300 h-full w-full"
                                        style={{ width: `${Math.min(100, (points / currentProfile.milestone.target) * 100)}%` }}
                                    >
                                        {/* Foreground: New Progress */}
                                        <div
                                            className="bg-orange-400 h-full transition-all"
                                            style={{ width: `${Math.min(100, ((points - confirmingReward.cost) / currentProfile.milestone.target) * 100) / (Math.min(100, (points / currentProfile.milestone.target) * 100)) * 100}%` }} // Simplified visual logic: render the new progress bar ON TOP of the old one? specific width calculation needed
                                        />
                                    </div>
                                </div>
                                {/* Correct Approach: Render two bars or use width relative to container */}
                                <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-2">
                                    {/* Old Progress (Grayed out to show loss) */}
                                    <div
                                        className="absolute top-0 left-0 h-full bg-gray-400"
                                        style={{ width: `${Math.min(100, (points / currentProfile.milestone.target) * 100)}%` }}
                                    />
                                    {/* New Progress (Orange) */}
                                    <div
                                        className="absolute top-0 left-0 h-full bg-orange-500 transition-all"
                                        style={{ width: `${Math.min(100, ((points - confirmingReward.cost) / currentProfile.milestone.target) * 100)}%` }}
                                    />
                                </div>

                                <p className="text-xs text-orange-800 font-bold text-center">
                                    Progress drops from {Math.round((points / currentProfile.milestone.target) * 100)}% to {Math.round(((points - confirmingReward.cost) / currentProfile.milestone.target) * 100)}%
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmingReward(null)}
                                className="flex-1 py-4 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 active:scale-95 transition-all shadow-lg text-lg flex items-center justify-center gap-2"
                            >
                                <Lock size={20} />
                                No, I'll Save!
                            </button>
                            <button
                                onClick={confirmPurchase}
                                className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-xl font-bold hover:bg-gray-200 hover:text-gray-600 active:scale-95 transition-all"
                            >
                                Buy Anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Insufficient Points Modal */}
            {insufficientReward && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border-4 border-gray-200 animate-in zoom-in-95 duration-300 relative overflow-hidden text-center">
                        <div className="bg-gray-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <Lock size={40} className="text-gray-400" />
                        </div>

                        <h2 className="text-xl font-black text-gray-800 mb-2">Almost there!</h2>
                        <p className="text-gray-500 font-bold mb-6">
                            You need <span className="text-purple-600 text-lg">{insufficientReward.cost - points}</span> more points to unlock this reward.
                        </p>

                        <button
                            onClick={() => setInsufficientReward(null)}
                            className="w-full py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 active:scale-95 transition-all shadow-lg"
                        >
                            Okay, I'll do more tasks! 🚀
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RewardShop;
