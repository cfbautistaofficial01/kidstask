import React, { useState } from 'react';
import { Quote, Sparkles } from 'lucide-react';
import { QUOTES } from '../data/quotes';

const QuoteCard = () => {
    const [quote] = useState(() => {
        return QUOTES[Math.floor(Math.random() * QUOTES.length)];
    });

    return (
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-2xl shadow-lg border-2 border-yellow-200 transform hover:scale-105 transition-transform duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-2 -mr-2 opacity-20">
                <Sparkles size={64} className="text-yellow-500" />
            </div>

            <div className="flex items-start gap-4">
                <div className="bg-yellow-400 p-3 rounded-full text-white shadow-sm">
                    <Quote size={24} fill="currentColor" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-yellow-800 mb-1">Daily Inspiration</h3>
                    <p className="text-xl font-medium text-gray-700 italic">"{quote}"</p>
                </div>
            </div>
        </div>
    );
};

export default QuoteCard;
