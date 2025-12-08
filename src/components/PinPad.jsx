import React, { useState } from 'react';
import { Delete } from 'lucide-react';

const PinPad = ({ onSuccess, onClose, correctPin, title = "Parents Only", message = "Enter PIN to access settings" }) => {
    const [input, setInput] = useState('');
    const [error, setError] = useState(false);

    const handleNum = (num) => {
        if (input.length < 4) {
            const newInput = input + num;
            setInput(newInput);
            setError(false);

            if (newInput.length === 4) {
                if (newInput === correctPin) {
                    onSuccess();
                } else {
                    setError(true);
                    setTimeout(() => setInput(''), 500);
                }
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`bg-white p-6 rounded-3xl shadow-2xl max-w-sm w-full ${error ? 'animate-shake' : ''}`}>
                <h3 className="text-center font-bold text-2xl text-gray-800 mb-2">{title}</h3>
                <p className="text-center text-gray-400 text-sm mb-6">{message}</p>

                <div className="flex justify-center gap-4 mb-8">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`w-4 h-4 rounded-full transition-colors ${i < input.length ? (error ? 'bg-red-500' : 'bg-blue-500') : 'bg-gray-200'}`} />
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                        <button key={n} onClick={() => handleNum(n)} className="h-16 rounded-2xl bg-gray-50 font-bold text-2xl text-gray-700 active:bg-blue-500 active:text-white transition-colors shadow-sm border border-gray-100">
                            {n}
                        </button>
                    ))}
                    <div />
                    <button onClick={() => handleNum(0)} className="h-16 rounded-2xl bg-gray-50 font-bold text-2xl text-gray-700 active:bg-blue-500 active:text-white transition-colors shadow-sm border border-gray-100">0</button>
                    <button onClick={() => setInput(prev => prev.slice(0, -1))} className="h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center active:bg-red-500 active:text-white transition-colors">
                        <Delete />
                    </button>
                </div>

                <button onClick={onClose} className="w-full py-4 text-gray-400 font-bold hover:text-gray-600">Cancel</button>
            </div>
        </div>
    );
};

export default PinPad;
