import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Lock, Plus } from 'lucide-react';
import PinPad from './PinPad';
import ParentPanel from './ParentPanel';

const ProfileSelector = () => {
    const { profiles, switchProfile, parentPin } = useApp();
    const [showPinPad, setShowPinPad] = useState(false);
    const [showParentPanel, setShowParentPanel] = useState(false);

    // Kid Login State
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [showKidPinPad, setShowKidPinPad] = useState(false);

    const handleParentPinSuccess = () => {
        setShowPinPad(false);
        setShowParentPanel(true);
    };

    const handleProfileClick = (profile) => {
        if (profile.pin) {
            setSelectedProfile(profile);
            setShowKidPinPad(true);
        } else {
            switchProfile(profile.id);
        }
    };

    const handleKidPinSuccess = () => {
        switchProfile(selectedProfile.id);
        setShowKidPinPad(false);
        setSelectedProfile(null);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-blue-50 relative">

            <button
                onClick={() => setShowPinPad(true)}
                className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-sm text-gray-400 hover:text-blue-500 transition-colors"
            >
                <Lock size={20} />
            </button>

            <h1 className="text-4xl font-black text-blue-500 mb-2 tracking-tight">
                Bautista<span className="text-yellow-500">SuperKids</span>
            </h1>
            <p className="text-gray-500 font-bold mb-10 text-lg">Who is playing today?</p>

            {profiles.length === 0 ? (
                <div className="text-center bg-white p-8 rounded-3xl shadow-lg max-w-sm w-full border-2 border-dashed border-gray-200">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="text-gray-400" size={32} />
                    </div>
                    <p className="text-gray-500 font-bold mb-4">No profiles found.</p>
                    <button
                        onClick={() => setShowPinPad(true)}
                        className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto"
                    >
                        <Plus size={20} /> Add First Kid
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-5xl">
                    {profiles.map(profile => (
                        <button
                            key={profile.id}
                            onClick={() => handleProfileClick(profile)}
                            className="flex flex-col items-center bg-white p-6 rounded-3xl shadow-lg border-2 border-transparent hover:border-blue-300 hover:scale-105 transition-all text-center group"
                        >
                            <div className="bg-blue-100 p-4 rounded-full mb-3 group-hover:bg-blue-200 transition-colors">
                                <User size={40} className="text-blue-500" />
                            </div>
                            <span className="font-black text-gray-700 text-xl">{profile.name}</span>
                            <span className="text-yellow-500 font-bold text-sm mt-1">{profile.points} Points</span>
                        </button>
                    ))}
                    <button
                        onClick={() => setShowPinPad(true)}
                        className="flex flex-col items-center justify-center bg-blue-50 p-6 rounded-3xl border-2 border-dashed border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all text-center group opacity-60 hover:opacity-100"
                    >
                        <div className="bg-white p-3 rounded-full mb-2">
                            <Plus size={24} className="text-blue-400" />
                        </div>
                        <span className="font-bold text-blue-400 text-sm">Add New</span>
                    </button>
                </div>
            )}

            {showPinPad && (
                <PinPad
                    correctPin={parentPin}
                    onSuccess={handleParentPinSuccess}
                    onClose={() => setShowPinPad(false)}
                />
            )}

            {showKidPinPad && selectedProfile && (
                <PinPad
                    title={`Hi ${selectedProfile.name}!`}
                    message="Enter your secret code"
                    correctPin={selectedProfile.pin}
                    onSuccess={handleKidPinSuccess}
                    onClose={() => {
                        setShowKidPinPad(false);
                        setSelectedProfile(null);
                    }}
                />
            )}

            {showParentPanel && (
                <ParentPanel
                    initialTab="profiles"
                    onClose={() => setShowParentPanel(false)}
                />
            )}
            {/* Footer */}
            <div className="absolute bottom-4 text-center w-full pointer-events-none opacity-50">
                <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">
                    Built by Vervant TechLab IT Solutions
                </p>
            </div>
        </div>
    );
};

export default ProfileSelector;
