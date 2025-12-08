import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { INITIAL_TASKS, INITIAL_REWARDS } from '../data/initialData';

const Onboarding = ({ mode = 'login' }) => {
    const [step, setStep] = useState(mode); // login, setup
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Setup state
    const [familyName, setFamilyName] = useState('');
    const [pin, setPin] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isRegistering) {
                await createUserWithEmailAndPassword(auth, email, password);
                setStep('setup'); // Go to setup after registration
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                // App.jsx will auto-redirect if profile exists
            }
        } catch (err) {
            setError(err.message.replace('Firebase:', '').trim());
        } finally {
            setLoading(false);
        }
    };

    const handleSetup = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = auth.currentUser;
            if (!user) return;

            // Create initial family document
            await setDoc(doc(db, 'families', user.uid), {
                familyName,
                pin,
                createdAt: new Date().toISOString(),
                tasks: INITIAL_TASKS,
                rewards: INITIAL_REWARDS,
                profiles: [], // Start empty, let them add in Parent Mode or next step
                history: {}
            });

            // App.jsx will detect this and switch to main app
        } catch (err) {
            console.error("Setup Error:", err);
            setError(`Setup failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (step === 'login') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-blue-50">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full">
                    <div className="text-center mb-8">
                        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="text-blue-500" size={32} />
                        </div>
                        <h1 className="text-2xl font-black text-gray-800">SuperKid Quest</h1>
                        <p className="text-gray-500">Family Login</p>
                    </div>

                    {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">{error}</div>}

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full p-3 rounded-xl border bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-blue-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full p-3 rounded-xl border bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-blue-200"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-500 text-white py-4 rounded-xl font-bold hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (isRegistering ? 'Create Family Account' : 'Sign In')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsRegistering(!isRegistering)}
                            className="text-sm text-gray-400 font-bold hover:text-blue-500"
                        >
                            {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-blue-50">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full animation-fade-in">
                <h2 className="text-2xl font-black text-gray-800 mb-2">Welcome! 👋</h2>
                <p className="text-gray-500 mb-8">Let's set up your family profile.</p>

                <form onSubmit={handleSetup} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Family Name</label>
                        <input
                            type="text"
                            placeholder="e.g. The Smiths"
                            value={familyName}
                            onChange={e => setFamilyName(e.target.value)}
                            className="w-full p-3 rounded-xl border bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-blue-200"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Parent PIN (4 digits)</label>
                        <input
                            type="text"
                            maxLength={4}
                            placeholder="1234"
                            value={pin}
                            onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                            className="w-full p-3 rounded-xl border bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-blue-200"
                            required
                        />
                        <p className="text-xs text-gray-400 mt-1">Used to access settings.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white py-4 rounded-xl font-bold hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <>All Set! <ArrowRight size={20} /></>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;
