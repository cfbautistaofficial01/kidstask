import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trash2, Plus, X, Settings, User, CheckCircle, XCircle, History, Clock, Lock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const ParentPanel = ({ onClose, initialTab = 'tasks' }) => {
    const { tasks, setTasks, rewards, setRewards, profiles, addProfile, updateProfile, removeProfile, parentPin, updateParentPin, pendingApprovals, logs, approveTask, rejectTask } = useApp();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [newItem, setNewItem] = useState({ text: '', value: '', assignedTo: [], milestoneDeadline: '', timeOfDay: 'any' });
    const [editingItem, setEditingItem] = useState(null);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newItem.text) return;

        // -- UPDATE MODE --
        if (editingItem) {
            if (activeTab === 'profiles') {
                const updates = { name: newItem.text, pin: newItem.value };
                if (newItem.milestoneName && newItem.milestoneTarget) {
                    updates.milestone = {
                        name: newItem.milestoneName,
                        target: parseInt(newItem.milestoneTarget),
                        deadline: newItem.milestoneDeadline || null
                    };
                }
                await updateProfile(editingItem.id, updates);
            } else if (activeTab === 'tasks') {
                setTasks(prev => prev.map(t => t.id === editingItem.id ? { ...t, text: newItem.text, points: parseInt(newItem.value), assignedTo: newItem.assignedTo, timeOfDay: newItem.timeOfDay } : t));
            } else {
                setRewards(prev => prev.map(r => r.id === editingItem.id ? { ...r, text: newItem.text, cost: parseInt(newItem.value) } : r));
            }
            setEditingItem(null);
        }
        // -- CREATE MODE --
        else {
            if (activeTab === 'profiles') {
                const profileData = { name: newItem.text, pin: newItem.value };
                if (newItem.milestoneName && newItem.milestoneTarget) {
                    profileData.milestone = {
                        name: newItem.milestoneName,
                        target: parseInt(newItem.milestoneTarget),
                        deadline: newItem.milestoneDeadline || null
                    };
                }
                addProfile(profileData.name, profileData.pin, profileData.milestone);
            } else {
                if (!newItem.value) return;
                const item = {
                    id: uuidv4(),
                    text: newItem.text,
                    [activeTab === 'tasks' ? 'points' : 'cost']: parseInt(newItem.value),
                };
                if (activeTab === 'tasks') {
                    item.completed = false;
                    item.assignedTo = newItem.assignedTo || [];
                    item.timeOfDay = newItem.timeOfDay || 'any';
                    setTasks(prev => [...prev, item]);
                } else {
                    setRewards(prev => [...prev, item]);
                }
            }
        }
        setNewItem({ text: '', value: '', milestoneName: '', milestoneTarget: '', milestoneDeadline: '', assignedTo: [], timeOfDay: 'any' });
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        if (activeTab === 'profiles') {
            setNewItem({
                text: item.name,
                value: item.pin || '',
                milestoneName: item.milestone?.name || '',
                milestoneTarget: item.milestone?.target || '',
                milestoneDeadline: item.milestone?.deadline || ''
            });
        } else {
            setNewItem({
                text: item.text,
                value: item.points || item.cost,
                assignedTo: item.assignedTo || [],
                timeOfDay: item.timeOfDay || 'any'
            });
        }
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
        setNewItem({ text: '', value: '', milestoneName: '', milestoneTarget: '', milestoneDeadline: '', assignedTo: [], timeOfDay: 'any' });
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete this item?')) {
            if (editingItem?.id === id) handleCancelEdit();

            if (activeTab === 'tasks') {
                setTasks(prev => prev.filter(t => t.id !== id));
            } else if (activeTab === 'rewards') {
                setRewards(prev => prev.filter(r => r.id !== id));
            } else {
                removeProfile(id);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-50 z-40 overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center shadow-sm z-10">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Settings size={20} /> Parent Mode
                </h2>
                <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20} /></button>
            </div>

            <div className="p-4 max-w-5xl mx-auto pb-20">

                <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm border overflow-x-auto sticky top-[73px] z-10">
                    {['tasks', 'rewards', 'profiles', 'approvals', 'history', 'settings'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); handleCancelEdit(); }}
                            className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all capitalize whitespace-nowrap ${activeTab === tab ? 'bg-blue-500 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {['tasks', 'rewards', 'profiles'].includes(activeTab) && (
                    <form onSubmit={handleAdd} className={`p-4 rounded-xl mb-6 shadow-sm border transition-colors ${editingItem ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-blue-100'}`}>
                        <h3 className={`font-bold mb-3 ${editingItem ? 'text-yellow-700' : 'text-gray-700'}`}>
                            {editingItem ? 'Edit Item' : `Add New ${activeTab === 'profiles' ? 'Kid Profile' : (activeTab === 'tasks' ? 'Task' : 'Reward')}`}
                        </h3>

                        <div className="flex flex-col sm:flex-row gap-2 mb-3">
                            <input
                                type="text"
                                placeholder={activeTab === 'profiles' ? "Kid's Name" : (activeTab === 'tasks' ? "e.g. Clean Room" : "e.g. New Toy")}
                                className="flex-1 p-3 rounded-lg border bg-white focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                value={newItem.text}
                                onChange={e => setNewItem({ ...newItem, text: e.target.value })}
                                required
                            />
                            <input
                                type={activeTab === 'profiles' ? "text" : "number"}
                                placeholder={activeTab === 'profiles' ? "PIN" : "Pts"}
                                className="w-full sm:w-24 p-3 rounded-lg border bg-white focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                value={newItem.value}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (activeTab === 'profiles') {
                                        setNewItem({ ...newItem, value: val.replace(/\D/g, '').slice(0, 4) })
                                    } else {
                                        setNewItem({ ...newItem, value: val })
                                    }
                                }}
                                required
                            />
                        </div>

                        {/* Milestone Fields (Only for Profiles) */}
                        {activeTab === 'profiles' && (
                            <div className="flex flex-col sm:flex-row gap-2 mb-3 animate-in fade-in slide-in-from-top-2">
                                <div className="flex-1 flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Milestone Goal (e.g. Ukulele)"
                                        className="flex-1 p-3 rounded-lg border bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm"
                                        value={newItem.milestoneName || ''}
                                        onChange={e => setNewItem({ ...newItem, milestoneName: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Target Pts"
                                        className="w-24 p-3 rounded-lg border bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm"
                                        value={newItem.milestoneTarget || ''}
                                        onChange={e => setNewItem({ ...newItem, milestoneTarget: e.target.value })}
                                    />
                                </div>
                                <input
                                    type="datetime-local"
                                    className="w-full sm:w-auto p-3 rounded-lg border bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm text-gray-500"
                                    value={newItem.milestoneDeadline || ''}
                                    onChange={e => setNewItem({ ...newItem, milestoneDeadline: e.target.value })}
                                />
                            </div>
                        )}
                        {activeTab === 'tasks' && (
                            <div className="mb-3 animate-in fade-in slide-in-from-top-2 space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Assign To (Optional)</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setNewItem({ ...newItem, assignedTo: [] })} // Clear = All
                                            className={`px-3 py-1 rounded-full text-xs font-bold border ${newItem.assignedTo?.length === 0 ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-400 border-gray-200'}`}
                                        >
                                            All Kids
                                        </button>
                                        {profiles.map(p => {
                                            const isSelected = newItem.assignedTo?.includes(p.id);
                                            return (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const current = newItem.assignedTo || [];
                                                        let next;
                                                        if (isSelected) {
                                                            next = current.filter(id => id !== p.id);
                                                        } else {
                                                            next = [...current, p.id];
                                                        }
                                                        setNewItem({ ...newItem, assignedTo: next });
                                                    }}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold border ${isSelected ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-500 border-gray-200'}`}
                                                >
                                                    {p.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Schedule</label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { id: 'any', label: 'Any Time', icon: '♾️' },
                                            { id: 'morning', label: 'Morning (6am-12pm)', icon: '🌅' },
                                            { id: 'afternoon', label: 'Afternoon (1pm-5:30pm)', icon: '☀️' },
                                            { id: 'evening', label: 'Evening (6pm-12am)', icon: '🌙' }
                                        ].map(time => (
                                            <button
                                                key={time.id}
                                                type="button"
                                                onClick={() => setNewItem({ ...newItem, timeOfDay: time.id })}
                                                className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${newItem.timeOfDay === time.id ? 'bg-purple-500 text-white border-purple-500 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-purple-300'}`}
                                            >
                                                <span className="mr-1">{time.icon}</span> {time.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            {editingItem && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="px-4 py-3 bg-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-300 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    {activeTab === 'profiles' && (
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (window.confirm(`Reset points for ${editingItem.name} to 0? This cannot be undone.`)) {
                                                    await updateProfile(editingItem.id, { points: 0 });
                                                    alert('Points reset to 0!');
                                                    handleCancelEdit();
                                                }
                                            }}
                                            className="px-4 py-3 bg-red-100 text-red-500 rounded-xl font-bold hover:bg-red-200 transition-all border border-red-200"
                                        >
                                            Reset Pts
                                        </button>
                                    )}
                                </>
                            )}
                            <button
                                type="submit"
                                className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${editingItem ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                            >
                                {editingItem ? <Settings size={20} /> : <Plus size={20} />}
                                {editingItem ? 'Update' : 'Add Item'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="space-y-3">
                    <h3 className="font-bold text-gray-400 text-sm uppercase px-1">
                        {activeTab === 'history' ? 'Activity Log' : (activeTab === 'approvals' ? 'Pending Requests' : (activeTab === 'settings' ? 'Global Settings' : 'Current List'))}
                    </h3>

                    <div className={`grid gap-3 ${activeTab === 'history' || activeTab === 'settings' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>

                        {activeTab === 'settings' ? (
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-md mx-auto w-full">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="bg-gray-100 p-3 rounded-full">
                                        <Lock size={24} className="text-gray-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-800">Security</h4>
                                        <p className="text-sm text-gray-400">Manage parent access</p>
                                    </div>
                                </div>

                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const pin = e.target.pin.value;
                                    if (pin.length !== 4) return alert('PIN must be 4 digits');
                                    await updateParentPin(pin);
                                    alert('Master PIN updated successfully!');
                                    e.target.reset();
                                }}>
                                    <label className="block text-sm font-bold text-gray-500 mb-2">Change Master PIN</label>
                                    <div className="flex gap-2">
                                        <input
                                            name="pin"
                                            type="text"
                                            placeholder="Enter new 4-digit PIN"
                                            maxLength={4}
                                            pattern="\d{4}"
                                            className="flex-1 p-3 rounded-lg border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none transition-all font-mono text-center tracking-widest text-lg"
                                            required
                                        />
                                        <button className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors">
                                            Save
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Current PIN is <b>{parentPin}</b></p>
                                </form>
                            </div>
                        ) : activeTab === 'approvals' ? (
                            pendingApprovals.map(p => {
                                const kid = profiles.find(k => k.id === p.kidId);
                                const task = tasks.find(t => t.id === p.taskId);
                                if (!kid || !task) return null;
                                return (
                                    <div key={`${p.taskId}-${p.timestamp}`} className="bg-white p-4 rounded-xl border border-orange-200 shadow-sm flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-gray-800">{kid.name}</p>
                                            <p className="text-sm text-gray-500">completed <b>{task.text}</b></p>
                                            <p className="text-xs text-orange-400 flex items-center gap-1 mt-1"><Clock size={12} /> Waiting for approval</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => rejectTask(p)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><XCircle size={24} /></button>
                                            <button onClick={() => approveTask(p)} className="p-2 bg-green-50 text-green-500 rounded-lg hover:bg-green-100"><CheckCircle size={24} /></button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : activeTab === 'history' ? (
                            [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 50).map(log => (
                                <div key={log.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center text-sm">
                                    <div>
                                        <div className="font-bold text-gray-700">{log.action}</div>
                                        <div className="text-gray-500">{log.details}</div>
                                        <div className="text-xs text-gray-300 mt-1">{new Date(log.timestamp).toLocaleString()}</div>
                                    </div>
                                    {log.points !== 0 && (
                                        <span className={`font-bold ${log.points > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {log.points > 0 ? '+' : ''}{log.points}
                                        </span>
                                    )}
                                </div>
                            ))
                        ) : activeTab === 'profiles' ? (
                            profiles.map(p => (
                                <div key={p.id} className={`flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm ${editingItem?.id === p.id ? 'border-yellow-400 ring-2 ring-yellow-100' : 'border-gray-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-full">
                                            <User size={20} className="text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{p.name}</p>
                                            <p className="text-xs text-gray-400">PIN: {p.pin || 'None'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg">{p.points} pts</span>
                                        <button onClick={() => handleEdit(p)} className="text-gray-300 hover:text-blue-500 p-2 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Settings size={20} />
                                        </button>
                                        <button onClick={() => handleDelete(p.id)} className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            (activeTab === 'tasks' ? tasks : rewards).map(item => (
                                <div key={item.id} className={`flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm ${editingItem?.id === item.id ? 'border-yellow-400 ring-2 ring-yellow-100' : 'border-gray-100'}`}>
                                    <div>
                                        <p className="font-bold text-gray-800">{item.text}</p>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === 'tasks' ? 'bg-yellow-100 text-yellow-700' : 'bg-purple-100 text-purple-700'}`}>
                                            {item.points || item.cost} pts
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleEdit(item)} className="text-gray-300 hover:text-blue-500 p-2 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Settings size={20} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {activeTab === 'approvals' && pendingApprovals.length === 0 && <p className="text-center text-gray-400 py-8">No pending approvals</p>}
                    {activeTab === 'history' && logs.length === 0 && <p className="text-center text-gray-400 py-8">No history yet</p>}

                    {['tasks', 'rewards', 'profiles'].includes(activeTab) &&
                        ((activeTab === 'tasks' ? tasks : (activeTab === 'rewards' ? rewards : profiles)).length === 0) && (
                            <p className="text-center text-gray-400 py-4 italic">List is empty</p>
                        )}
                </div>

                <div className="mt-8 text-center space-y-2">
                    <p className="text-xs text-gray-300">Default PIN is {parentPin}</p>
                    <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest opacity-50">
                        Built by Vervant TechLab IT Solutions
                    </p>
                </div>
            </div>
        </div>
    );
};
export default ParentPanel;
