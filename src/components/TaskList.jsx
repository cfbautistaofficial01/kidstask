import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Circle, Star, Sparkles, Clock, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';

const TaskList = () => {
    const { tasks, toggleTask, isTaskCompletedToday, isTaskPending } = useApp();
    const [showToast, setShowToast] = useState(false);

    const handleTaskClick = (taskId, isCompleted, isPending) => {
        if (isPending) return; // Ignore clicks on pending items

        if (!isCompleted) {
            // Celebration logic only when marking COMPLETED
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.7 },
                colors: ['#FFD700', '#FF69B4', '#00BFFF', '#32CD32']
            });
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
        toggleTask(taskId);
    };

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                <Star className="text-yellow-400 fill-yellow-400" />
                My Chores
            </h2>

            {tasks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <Sparkles className="mx-auto text-yellow-400 mb-2" size={48} />
                    <p className="text-gray-400 font-medium">All chores done! Time to play!</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {tasks.filter(task => {
                        // Show if no assignment (all), empty assignment (all), or specifically assigned
                        if (!task.assignedTo || task.assignedTo.length === 0) return true;
                        return useApp().currentProfile && task.assignedTo.includes(useApp().currentProfile.id);
                    }).map(task => {
                        const isCompleted = isTaskCompletedToday(task.id);
                        const isPending = isTaskPending(task.id); // New check

                        return (
                            <button
                                key={task.id}
                                onClick={() => handleTaskClick(task.id, isCompleted, isPending)}
                                className={`
                  group w-full flex items-center justify-between p-5 rounded-2xl shadow-sm border-b-4 transition-all duration-300
                  ${isCompleted
                                        ? 'bg-green-50 border-green-200 opacity-60 scale-95'
                                        : (isPending
                                            ? 'bg-orange-50 border-orange-200 opacity-90'
                                            : 'bg-white border-gray-200 hover:border-blue-400 hover:-translate-y-1 hover:shadow-lg active:scale-95 active:border-gray-200 active:translate-y-0')
                                    }
                `}
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className={`
                    transition-colors duration-300
                    ${isCompleted ? 'text-green-500 scale-110' : (isPending ? 'text-orange-400' : 'text-gray-300 group-hover:text-blue-400')}
                  `}>
                                        {isCompleted
                                            ? <CheckCircle2 size={36} className="fill-green-100" />
                                            : (isPending
                                                ? <Clock size={36} className="animate-pulse" />
                                                : <Circle size={36} strokeWidth={2.5} />)
                                        }
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-lg leading-tight ${isCompleted ? 'text-green-800 line-through decoration-green-400 decoration-2' : (isPending ? 'text-orange-800' : 'text-gray-700')}`}>
                                            {task.text}
                                        </h3>
                                        {isPending && <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Waiting for Parent</span>}
                                    </div>
                                </div>

                                {!isCompleted && !isPending && (
                                    <div className="bg-yellow-100 px-3 py-1 rounded-full flex items-center gap-1">
                                        <span className="text-yellow-700 font-black text-sm">+{task.points}</span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}


            {/* Celebration Toast */}
            {/* Celebration Toast (Centered & Large) */}
            {showToast && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-none px-4">
                    <div className="bg-white p-8 rounded-[2rem] shadow-2xl border-8 border-yellow-300 flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-300 w-full max-w-sm">
                        <div className="bg-yellow-100 p-6 rounded-full shadow-inner ring-4 ring-yellow-50 animate-bounce">
                            <PartyPopper size={64} className="text-yellow-600" />
                        </div>
                        <div>
                            <h2 className="font-black text-gray-800 text-3xl uppercase tracking-tight mb-2">Great Job!</h2>
                            <p className="text-xl font-bold text-gray-500 leading-relaxed">
                                Mommy or Daddy will approve this soon! <br />
                                <span className="text-4xl mt-2 block">👨‍👩‍👧‍👦</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskList;
