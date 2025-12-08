import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import { v4 as uuidv4 } from 'uuid';
import { getLevel, getRank } from '../utils/levelUtils';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [familyData, setFamilyData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Local state for UI selection
    const [currentProfileId, setCurrentProfileId] = useState(null);
    const [dailySummary, setDailySummary] = useState({ show: false, stats: null });

    // 1. Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                setFamilyData(null);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // 2. Data Listener (only if user logged in)
    useEffect(() => {
        if (!user) return;

        const unsubDoc = onSnapshot(doc(db, 'families', user.uid), (docSnap) => {
            if (docSnap.exists()) {
                setFamilyData(docSnap.data());
            } else {
                console.log("No family doc found for user:", user.uid);
                setFamilyData(null);
            }
            setLoading(false);
        }, (err) => {
            console.error("Firestore Read Error:", err);
            setLoading(false);
        });

        return () => unsubDoc();
    }, [user]);

    // Actions
    const getFamilyRef = () => doc(db, 'families', user.uid);

    // -- Tasks --
    const toggleTask = async (taskId) => {
        if (!currentProfileId || !familyData) return;

        const date = getTodayDate();
        const history = familyData.history || {};
        const dayHistory = history[date] || {};
        const userHistory = dayHistory[currentProfileId] || [];
        const pendingApprovals = familyData.pendingApprovals || [];
        const pendingItem = pendingApprovals.find(p => p.taskId === taskId && p.kidId === currentProfileId && p.date === date);

        // Check if currently completed
        const isCompleted = userHistory.includes(taskId);

        // Calculate new history list
        let newUserHistory;
        let pointsChange = 0;

        const task = familyData.tasks.find(t => t.id === taskId);
        if (!task) return;

        if (isCompleted) {
            // Undo Completion
            newUserHistory = userHistory.filter(id => id !== taskId);
            pointsChange = -task.points;

            // Log it
            addLog("Undo Task", `${currentProfile.name} undid "${task.text}"`, -task.points);

            // Update History + Points directly (since it was already approved/done)
            const updatedHistory = {
                ...history,
                [date]: { ...dayHistory, [currentProfileId]: newUserHistory }
            };
            const updatedProfiles = familyData.profiles.map(p => {
                if (p.id === currentProfileId) return { ...p, points: Math.max(0, p.points + pointsChange) };
                return p;
            });

            await updateDoc(getFamilyRef(), {
                history: updatedHistory,
                profiles: updatedProfiles
            });

        } else if (pendingItem) {
            // Undo Pending (Cancel request)
            await updateDoc(getFamilyRef(), {
                pendingApprovals: arrayRemove(pendingItem)
            });
        } else {
            // Request Approval (Add to Pending)
            const newPending = { taskId, kidId: currentProfileId, date, timestamp: Date.now() };
            await updateDoc(getFamilyRef(), {
                pendingApprovals: arrayUnion(newPending)
            });
            // No confetti yet!
        }

        // Note: The direct updateDoc is done inside the conditional blocks above now.
    };

    const redeemReward = async (reward) => {
        if (!currentProfileId || !familyData) return;

        const profile = familyData.profiles.find(p => p.id === currentProfileId);
        if (!profile) return;

        if (profile.points >= reward.cost) {
            const updatedProfiles = familyData.profiles.map(p => {
                if (p.id === currentProfileId) {
                    return { ...p, points: p.points - reward.cost };
                }
                return p;
            });

            await updateDoc(getFamilyRef(), { profiles: updatedProfiles });
            addLog("Reward Redeemed", `${profile.name} redeemed "${reward.text}"`, -reward.cost);
            fireConfetti();
            return true;
        }
        return false;
    };

    const depositPoints = async (amount) => {
        if (!currentProfileId || amount <= 0 || !familyData) return;
        const profile = familyData.profiles.find(p => p.id === currentProfileId);
        if (!profile || amount > profile.points) return;

        try {
            const newWallet = profile.points - amount;
            const newSaved = (profile.savedPoints || 0) + amount;

            const updatedProfiles = familyData.profiles.map(p => {
                if (p.id === currentProfileId) {
                    return { ...p, points: newWallet, savedPoints: newSaved };
                }
                return p;
            });

            await updateDoc(getFamilyRef(), { profiles: updatedProfiles });
            addLog("Deposit", `${profile.name} deposited ${amount} to Goal`, 0);
            fireConfetti();
        } catch (error) {
            console.error("Error depositing:", error);
        }
    };

    // -- Admin Actions --
    const updateTasks = async (newTasks) => {
        await updateDoc(getFamilyRef(), { tasks: newTasks });
    };
    const updateRewards = async (newRewards) => {
        await updateDoc(getFamilyRef(), { rewards: newRewards });
    };

    const addProfile = async (name, pin, milestone = null) => {
        const newProfile = { id: uuidv4(), name, pin, points: 0, savedPoints: 0, theme: 'purple' };
        if (milestone) newProfile.milestone = milestone;

        await updateDoc(getFamilyRef(), {
            profiles: arrayUnion(newProfile)
        });
    };

    const updateProfile = async (id, updates) => {
        const updatedProfiles = familyData.profiles.map(p => {
            if (p.id === id) {
                return { ...p, ...updates };
            }
            return p;
        });
        await updateDoc(getFamilyRef(), { profiles: updatedProfiles });
    };

    const removeProfile = async (id) => {
        const profileToRemove = familyData.profiles.find(p => p.id === id);
        if (profileToRemove) {
            await updateDoc(getFamilyRef(), {
                profiles: arrayRemove(profileToRemove)
            });
            if (currentProfileId === id) setCurrentProfileId(null);
        }
    };

    const switchProfile = async (profileId) => {
        const profile = familyData.profiles.find(p => p.id === profileId);
        if (!profile) return;

        const date = getTodayDate();
        const currentPeriod = getCurrentPeriod(); // 'morning', 'afternoon', 'evening' or 'any'

        // Check if first login of the *period* (not just day)
        // We show summary if:
        // 1. It's a new day
        // 2. OR it's the same day but a NEW period (e.g., logged in morning, now it's afternoon)
        if (profile.lastLoginDate !== date || profile.lastLoginPeriod !== currentPeriod) {

            // Filter tasks for THIS period only (to show relevant stats)
            const tasksForKid = familyData.tasks.filter(t => {
                const assigned = !t.assignedTo || t.assignedTo.length === 0 || t.assignedTo.includes(profileId);
                const timeMatch = isTaskActiveNow(t); // Re-use our time logic
                return assigned && timeMatch;
            });

            // Calculate potential points for THIS period
            const totalPoints = tasksForKid.reduce((acc, t) => acc + t.points, 0);

            setDailySummary({
                show: true,
                stats: {
                    tasksCount: tasksForKid.length,
                    totalPoints: totalPoints,
                    date: date,
                    kidName: profile.name,
                    period: currentPeriod // Pass period to UI
                }
            });

            // Update last login date AND period
            const updatedProfiles = familyData.profiles.map(p => {
                if (p.id === profileId) return { ...p, lastLoginDate: date, lastLoginPeriod: currentPeriod };
                return p;
            });
            await updateDoc(getFamilyRef(), { profiles: updatedProfiles });
        } else {
            // No summary needed
            setDailySummary({ show: false, stats: null });
        }

        setCurrentProfileId(profileId);
    };

    const approveTask = async (pendingItem) => {
        // Move from Pending to History
        const { taskId, kidId, date } = pendingItem;
        const task = familyData.tasks.find(t => t.id === taskId);
        const kid = familyData.profiles.find(p => p.id === kidId);

        if (!task || !kid) return;

        // 1. Remove from Pending
        const pendingUpdate = { pendingApprovals: arrayRemove(pendingItem) };

        // 2. Add to History
        const history = familyData.history || {};
        const dayHistory = history[date] || {};
        const userHistory = dayHistory[kidId] || [];
        const newUserHistory = [...userHistory, taskId];

        const updatedHistory = {
            ...history,
            [date]: { ...dayHistory, [kidId]: newUserHistory }
        };

        // 3. Add Points & Check Level Up
        const oldPoints = kid.points;
        const newPoints = oldPoints + task.points;
        const oldLevel = getLevel(oldPoints);
        const newLevel = getLevel(newPoints);

        const updatedProfiles = familyData.profiles.map(p => {
            if (p.id === kidId) return { ...p, points: newPoints };
            return p;
        });

        // 4. Log
        const newLog = createLog("Task Approved", `${kid.name} completed "${task.text}"`, task.points);

        // 5. Level Up Notification
        let newNotifications = [];
        if (newLevel > oldLevel) {
            newNotifications.push({
                id: uuidv4(),
                kidId: kidId,
                type: 'levelup',
                level: newLevel,
                rank: getRank(newLevel),
                message: `You reached Level ${newLevel}!`,
                timestamp: Date.now()
            });
        }

        await updateDoc(getFamilyRef(), {
            ...pendingUpdate,
            history: updatedHistory,
            profiles: updatedProfiles,
            logs: arrayUnion(newLog)
        });

        if (newNotifications.length > 0) {
            await updateDoc(getFamilyRef(), {
                notifications: arrayUnion(...newNotifications)
            });
            fireConfetti(); // Extra confetti for level up!
        }
    };

    const rejectTask = async (pendingItem) => {
        await updateDoc(getFamilyRef(), {
            pendingApprovals: arrayRemove(pendingItem)
        });
        const kid = familyData.profiles.find(p => p.id === pendingItem.kidId);
        const task = familyData.tasks.find(t => t.id === pendingItem.taskId);
        if (kid && task) {
            addLog("Task Rejected", `Parent rejected "${task.text}" for ${kid.name}`, 0);

            // Add Notification
            const notification = {
                id: uuidv4(),
                kidId: pendingItem.kidId,
                type: 'rejection',
                taskName: task.text,
                message: "This task was disapproved.",
                timestamp: Date.now()
            };
            await updateDoc(getFamilyRef(), {
                notifications: arrayUnion(notification)
            });
        }
    };

    const dismissNotification = async (notification) => {
        await updateDoc(getFamilyRef(), {
            notifications: arrayRemove(notification)
        });
    };

    const addLog = async (action, details, points = 0) => {
        const log = createLog(action, details, points);
        await updateDoc(getFamilyRef(), {
            logs: arrayUnion(log)
        });
    };

    const createLog = (action, details, points) => ({
        id: uuidv4(),
        action,
        details,
        points,
        timestamp: new Date().toISOString()
    });

    // Helpers
    const getTodayDate = () => new Date().toISOString().split('T')[0];

    const currentProfile = familyData?.profiles?.find(p => p.id === currentProfileId) || null;

    const isTaskPending = (taskId) => {
        if (!currentProfileId || !familyData?.pendingApprovals) return false;
        const date = getTodayDate();
        return familyData.pendingApprovals.some(p => p.taskId === taskId && p.kidId === currentProfileId && p.date === date);
    };

    const isTaskCompletedToday = (taskId) => {
        if (!currentProfileId || !familyData?.history) return false;
        const date = getTodayDate();
        const completed = familyData.history[date]?.[currentProfileId] || [];
        return completed.includes(taskId);
    };

    const fireConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FF6347', '#4682B4', '#32CD32']
        });
    };

    const isTaskActiveNow = (task) => {
        if (!task.timeOfDay || task.timeOfDay === 'any') return true;

        const hour = new Date().getHours();
        let currentPeriod = 'any';
        if (hour >= 6 && hour < 12) currentPeriod = 'morning';
        else if (hour >= 13 && hour < 18) currentPeriod = 'afternoon';
        else if (hour >= 18 || hour < 6) currentPeriod = 'evening';

        return task.timeOfDay === currentPeriod;
    };

    const getCurrentPeriod = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 13 && hour < 18) return 'afternoon';
        if (hour >= 18 || hour < 6) return 'evening';
        return 'any';
    };

    const value = {
        user,
        loading,
        familyData, // Expose raw data
        tasks: familyData?.tasks || [],
        rewards: familyData?.rewards || [],
        profiles: familyData?.profiles || [],
        pendingApprovals: familyData?.pendingApprovals || [],
        logs: familyData?.logs || [],
        notifications: familyData?.notifications || [],
        parentPin: familyData?.pin || '1234',

        // Actions
        setTasks: async (fnOrVal) => {
            // Adapt standard useState pattern to Firestore
            const newVal = fnOrVal instanceof Function ? fnOrVal(familyData.tasks) : fnOrVal;
            await updateTasks(newVal);
        },
        setRewards: async (fnOrVal) => {
            const newVal = fnOrVal instanceof Function ? fnOrVal(familyData.rewards) : fnOrVal;
            await updateRewards(newVal);
        },

        addProfile, updateProfile, removeProfile,
        currentProfile, setCurrentProfileId,
        toggleTask,
        redeemReward, depositPoints,
        approveTask, rejectTask, addLog, dismissNotification,
        isTaskCompletedToday, isTaskPending, isTaskActiveNow, getCurrentPeriod,
        getTodayDate,
        switchProfile, dailySummary, setDailySummary
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
