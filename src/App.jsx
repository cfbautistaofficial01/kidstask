import React, { useState, useEffect, useRef } from 'react';
import QuoteCard from './components/QuoteCard';
import ProgressBar from './components/ProgressBar';
import TaskList from './components/TaskList';
import RewardShop from './components/RewardShop';
import ParentPanel from './components/ParentPanel';
import PinPad from './components/PinPad';
import ProfileSelector from './components/ProfileSelector';
import Onboarding from './components/Onboarding';
import MilestoneCard from './components/MilestoneCard';
import { useApp } from './context/AppContext';
import { Lock, LogOut, Calendar, Loader2, Frown, PartyPopper, Trophy, TrendingUp, Zap, Star, Sun, CloudSun, Moon, CheckCircle, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';

function App() {
  const { user, loading, familyData, parentPin, currentProfile, setCurrentProfileId, notifications, dismissNotification, dailySummary, setDailySummary } = useApp();
  const [showParentPanel, setShowParentPanel] = useState(false);
  const [showPinPad, setShowPinPad] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimer = useRef(null);

  // Idle Monitor Logic
  const resetIdleTimer = () => {
    setIsIdle(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setIsIdle(true);
    }, 900000); // 15 minutes
  };

  // Notification Logic
  const activeNotification = notifications.find(n => n.kidId === currentProfile?.id);

  useEffect(() => {
    // Events to track activity
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => resetIdleTimer();

    events.forEach(event => document.addEventListener(event, handleActivity));
    resetIdleTimer(); // Init

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      events.forEach(event => document.removeEventListener(event, handleActivity));
    };
  }, []);

  // Function to format date beautifully
  const formattedDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  // Calculate incomplete tasks for dynamic encouragement
  // Only count tasks that are visible right now!
  const activeTasks = useApp().tasks.filter(t => useApp().isTaskActiveNow(t));
  const completedTasksToday = activeTasks.filter(t => useApp().isTaskCompletedToday(t.id)).length;
  const incompleteTasks = activeTasks.filter(t => !useApp().isTaskCompletedToday(t.id)).length;

  let OverlayIcon = Frown;
  let overlayColor = "text-blue-500";
  let overlayTitle = "I'm bored...";
  let overlayMessage = "Are you still there?";

  // Strict Idle Logic: If 0 tasks done, always sad.
  if (completedTasksToday === 0) {
    OverlayIcon = Frown;
    overlayColor = "text-blue-500";
    overlayTitle = "Idle again...";
    overlayMessage = "Let's do at least one task! 😢";
  } else if (incompleteTasks === 0) {
    OverlayIcon = PartyPopper;
    overlayColor = "text-yellow-500";
    overlayTitle = "All Done!";
    overlayMessage = "You are a superstar! 🌟";
  } else if (incompleteTasks === 1) {
    OverlayIcon = Trophy;
    overlayColor = "text-orange-500";
    overlayTitle = "Just One More!";
    overlayMessage = "You can do this! 🏆";
  } else if (incompleteTasks === 2) {
    OverlayIcon = TrendingUp;
    overlayColor = "text-green-500";
    overlayTitle = "Getting Close!";
    overlayMessage = "Keep up the momentum! 🚀";
  } else {
    OverlayIcon = Zap;
    overlayColor = "text-purple-500";
    overlayTitle = "Let's Get Moving!";
    overlayMessage = "Power up and do some tasks! ⚡";
  }

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  // 2. Auth Check + Onboarding
  if (!user) {
    return <Onboarding mode="login" />;
  }

  // 3. Setup Check
  if (user && !familyData) {
    return <Onboarding mode="setup" />;
  }

  // 4. Profile Check
  if (!currentProfile) {
    return <ProfileSelector />;
  }

  const handleParentClick = () => {
    setShowPinPad(true);
  };

  const handlePinSuccess = () => {
    setShowPinPad(false);
    setShowParentPanel(true);
  };

  return (
    <div className="min-h-screen flex flex-col pb-6 selection:bg-yellow-200">
      {/* Header */}
      <header className="p-4 flex flex-col gap-2 sticky top-0 bg-blue-50/90 backdrop-blur-sm z-30 mb-2 shadow-sm border-b border-blue-100 transition-all">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 w-14 h-14 rounded-full flex items-center justify-center font-black text-white shadow-sm border-4 border-white">
              <span className="text-2xl">{currentProfile.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-800 leading-none">
                Hi, {currentProfile.name}!
              </h1>
              <div className="flex flex-col text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
                <span className="text-blue-500 text-sm">{formattedDay}</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleParentClick}
              className="bg-white p-2.5 rounded-xl shadow-sm border text-gray-400 hover:text-gray-600 active:scale-95 transition-all"
              aria-label="Parent Settings"
            >
              <Lock size={18} />
            </button>
            <button
              onClick={() => setCurrentProfileId(null)}
              className="bg-red-50 p-2.5 rounded-xl shadow-sm border border-red-100 text-red-400 hover:text-red-500 active:scale-95 transition-all"
              aria-label="Switch User"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 max-w-7xl mx-auto space-y-8 mt-4 flex-grow w-full">
        {/* Milestone Card */}
        {currentProfile.milestone && (
          <MilestoneCard
            milestone={currentProfile.milestone}
            currentPoints={currentProfile.points}
            savedPoints={currentProfile.savedPoints}
          />
        )}

        <QuoteCard />
        <ProgressBar />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TaskList />
          <RewardShop />
        </div>
      </main>

      {/* Footer / Copyright */}
      {/* Footer / Copyright */}
      {/* Footer / Copyright */}
      <footer className="w-full text-center py-6 opacity-30 text-[10px] font-bold mt-auto pointer-events-none">
        Built by Vervant TechLab IT Solutions
      </footer>

      {/* Full Screen Idle Overlay */}
      {isIdle && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-blue-900/60 backdrop-blur-md animate-in fade-in duration-700 cursor-pointer" onClick={() => setIsIdle(false)}>
          <div className="bg-white p-10 rounded-full shadow-2xl animate-bounce mb-8 ring-8 ring-blue-200">
            <OverlayIcon size={120} className={overlayColor} />
          </div>
          <h2 className="text-5xl font-black text-white drop-shadow-lg mb-4 text-center tracking-tight">{overlayTitle}</h2>
          <p className="text-white/90 text-2xl font-bold animate-pulse">{overlayMessage}</p>
        </div>
      )}

      {/* Daily Summary Modal */}
      {dailySummary && dailySummary.show && dailySummary.stats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-500">
          <div className="bg-gradient-to-br from-blue-400 to-purple-500 p-1 rounded-[2rem] shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-500">
            <div className="bg-white rounded-[1.8rem] p-8 flex flex-col items-center text-center relative overflow-hidden">

              {/* Background decoration */}
              {/* Background decoration - Dynamic Color */}
              <div className={`absolute top-0 left-0 w-full h-32 rounded-b-[50%] -z-10 opacity-50 transition-colors duration-500
                ${dailySummary.stats.period === 'morning' ? 'bg-yellow-100' :
                  dailySummary.stats.period === 'afternoon' ? 'bg-orange-100' :
                    dailySummary.stats.period === 'evening' ? 'bg-indigo-100' : 'bg-blue-100'
                }
              `}></div>

              {/* Dynamic Icon */}
              <div className={`p-5 rounded-full shadow-lg ring-4 mb-6 animate-bounce transition-colors duration-500
                ${dailySummary.stats.period === 'morning' ? 'bg-yellow-400 ring-yellow-200' :
                  dailySummary.stats.period === 'afternoon' ? 'bg-orange-400 ring-orange-200' :
                    dailySummary.stats.period === 'evening' ? 'bg-indigo-500 ring-indigo-300' : 'bg-blue-400 ring-blue-200'
                }
              `}>
                {dailySummary.stats.period === 'morning' && <Sun size={48} className="text-white fill-white" />}
                {dailySummary.stats.period === 'afternoon' && <CloudSun size={48} className="text-white fill-white" />}
                {dailySummary.stats.period === 'evening' && <Moon size={48} className="text-white fill-white" />}
                {dailySummary.stats.period === 'any' && <Zap size={48} className="text-white fill-white" />}
              </div>

              <h2 className="text-3xl font-black text-gray-800 mb-2">
                Good {dailySummary.stats.period === 'any' ? 'Day' : dailySummary.stats.period.charAt(0).toUpperCase() + dailySummary.stats.period.slice(1)}<br />
                <span className="text-blue-500">{dailySummary.stats.kidName}!</span>
                {dailySummary.stats.period === 'morning' ? ' ☀️' : dailySummary.stats.period === 'afternoon' ? ' 🌤️' : dailySummary.stats.period === 'evening' ? ' 🌙' : ' 🚀'}
              </h2>
              <p className="text-gray-400 font-bold mb-8">
                {dailySummary.stats.period === 'morning' ? "Rise and shine! Ready for tasks?" :
                  dailySummary.stats.period === 'afternoon' ? "Keep up the great work!" :
                    dailySummary.stats.period === 'evening' ? "Almost done for the day?" : "Ready to be awesome?"}
              </p>

              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-100 flex flex-col items-center">
                  <CheckCircle size={32} className="text-blue-500 mb-2" />
                  <span className="text-2xl font-black text-gray-800">{dailySummary.stats.tasksCount}</span>
                  <span className="text-xs font-bold text-gray-400 uppercase">Tasks</span>
                </div>
                <div className="bg-yellow-50 p-4 rounded-2xl border-2 border-yellow-100 flex flex-col items-center">
                  <Coins size={32} className="text-yellow-500 mb-2" />
                  <span className="text-2xl font-black text-gray-800">{dailySummary.stats.totalPoints}</span>
                  <span className="text-xs font-bold text-gray-400 uppercase">Points</span>
                </div>
              </div>

              <button
                onClick={() => setDailySummary({ ...dailySummary, show: false })}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-black text-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Let's Go! 🚀
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Notification Modal (Rejection/Golden Rule) */}
      {activeNotification && !isIdle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className={`bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border-4 ${activeNotification.type === 'levelup' ? 'border-yellow-400' : 'border-yellow-200'} animate-in zoom-in-95 duration-300 relative overflow-hidden`}>

            {/* Decorative Background */}
            <div className={`absolute top-0 left-0 w-full h-24 -z-10 rounded-t-3xl border-b ${activeNotification.type === 'levelup' ? 'bg-yellow-100 border-yellow-200' : 'bg-red-50 border-red-100'}`}></div>

            {activeNotification.type === 'levelup' ? (
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50 to-white -z-20 opacity-50"></div>
                <div className="bg-yellow-400 p-4 rounded-full shadow-lg ring-4 ring-yellow-200 -mt-2 mb-4 animate-bounce">
                  <Star size={48} className="text-white" fill="white" />
                </div>

                <h2 className="text-3xl font-black text-blue-600 mb-1 uppercase tracking-tight">Level Up!</h2>
                <p className="text-gray-400 font-bold mb-2">You reached Level {activeNotification.level}</p>

                <div className="bg-blue-500 text-white px-6 py-2 rounded-full font-black text-xl shadow-lg transform rotate-[-2deg] mb-6">
                  {activeNotification.rank}
                </div>

                <p className="text-gray-500 text-sm mb-6 max-w-xs">{activeNotification.message}</p>

                <button
                  onClick={() => dismissNotification(activeNotification)}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-xl text-lg flex items-center justify-center gap-2"
                >
                  <PartyPopper size={20} />
                  Wahoo!
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="bg-white p-4 rounded-full shadow-lg ring-4 ring-red-50 -mt-2 mb-4">
                  <Frown size={48} className="text-red-500" />
                </div>

                <h2 className="text-2xl font-black text-gray-800 mb-1">Oh No! Task Disapproved</h2>
                <p className="text-gray-500 font-bold mb-6">"{activeNotification.taskName}"</p>

                <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-200 w-full mb-6">
                  <h3 className="text-xs font-black text-yellow-600 uppercase tracking-widest mb-1">Golden Rule 🌟</h3>
                  <p className="text-sm font-bold text-gray-700 italic">"Honesty is the best policy. Only mark tasks as done when you have truly finished them!"</p>
                </div>

                <button
                  onClick={() => dismissNotification(activeNotification)}
                  className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black active:scale-95 transition-all shadow-lg"
                >
                  I Understand
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showPinPad && (
        <PinPad
          correctPin={parentPin}
          onSuccess={handlePinSuccess}
          onClose={() => setShowPinPad(false)}
        />
      )}

      {showParentPanel && (
        <ParentPanel onClose={() => setShowParentPanel(false)} />
      )}
    </div>
  );
}

export default App;
