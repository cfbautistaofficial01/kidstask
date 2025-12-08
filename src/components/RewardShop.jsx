import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Lock, Gift, AlertTriangle, ArrowRight, TrendingDown } from 'lucide-react';

const RewardShop = () => {
    const { rewards, currentProfile, redeemReward, depositPoints } = useApp();

    if (!currentProfile) return null;
    const points = currentProfile.points;
    const savedPoints = currentProfile.savedPoints || 0;

    const [confirmingReward, setConfirmingReward] = useState(null);
    const [insufficientReward, setInsufficientReward] = useState(null);
    const [showDepositModal, setShowDepositModal] = useState(false);

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
                    {/* Deposit to Super Goal Card */}
                    {currentProfile.milestone && (
                        <button
                            onClick={() => setShowDepositModal(true)}
                            className="relative p-4 rounded-2xl border-4 border-orange-200 bg-orange-50 hover:bg-orange-100 hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center gap-3 text-center shadow-sm"
                        >
                            <div className="p-3 rounded-full bg-orange-200 text-orange-600 mb-1">
                                <TrendingDown size={32} />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-800 text-sm uppercase tracking-wide">Piggy Bank</h3>
                                <p className="text-xs text-orange-600 font-bold mb-2">Grow your goal!</p>
                                <span className="px-2 py-1 rounded-full bg-orange-200 text-orange-700 text-xs font-black">
                                    Saved: {savedPoints}
                                </span>
                            </div>
                        </button>
                    )}

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



            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border-4 border-orange-200 animate-in zoom-in-95 duration-300 transform transition-all text-center">
                        <div className="bg-orange-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center animate-bounce">
                            <TrendingDown size={40} className="text-orange-500" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 mb-2">Fill the Piggy Bank! 🐷</h2>
                        <p className="text-gray-500 font-bold mb-6">Move points to your Super Goal.</p>

                        <div className="bg-blue-50 p-4 rounded-xl mb-6 flex justify-between items-center text-sm font-bold text-gray-400 uppercase">
                            <span>Wallet: <b className="text-blue-500">{points}</b></span>
                            <span>Saved: <b className="text-orange-500">{savedPoints}</b></span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <button
                                onClick={() => { depositPoints(50); setShowDepositModal(false); }}
                                disabled={points < 50}
                                className="py-3 rounded-xl font-bold bg-gray-100 hover:bg-orange-100 hover:text-orange-600 disabled:opacity-50 transition-all"
                            >
                                50 pts
                            </button>
                            <button
                                onClick={() => { depositPoints(100); setShowDepositModal(false); }}
                                disabled={points < 100}
                                className="py-3 rounded-xl font-bold bg-gray-100 hover:bg-orange-100 hover:text-orange-600 disabled:opacity-50 transition-all"
                            >
                                100 pts
                            </button>
                            <button
                                onClick={() => { depositPoints(points); setShowDepositModal(false); }}
                                disabled={points === 0}
                                className="col-span-2 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 active:scale-95 disabled:opacity-50 transition-all shadow-lg"
                            >
                                Save Everything! ({points})
                            </button>
                        </div>

                        <button
                            onClick={() => setShowDepositModal(false)}
                            className="text-gray-400 font-bold hover:text-gray-600"
                        >
                            Cancel
                        </button>
                    </div>
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
