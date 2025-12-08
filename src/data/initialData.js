import { v4 as uuidv4 } from 'uuid';

export const INITIAL_TASKS = [
    { id: uuidv4(), text: 'Brush Teeth', points: 10, completed: false, icon: 'Smile' },
    { id: uuidv4(), text: 'Make Bed', points: 20, completed: false, icon: 'Bed' },
    { id: uuidv4(), text: 'Clean Toys', points: 30, completed: false, icon: 'ToyBrick' },
];

export const INITIAL_REWARDS = [
    { id: uuidv4(), text: '15 mins iPad', cost: 50, icon: 'Tablet' },
    { id: uuidv4(), text: 'Ice Cream', cost: 100, icon: 'IceCream' },
    { id: uuidv4(), text: '$5 Cash', cost: 500, icon: 'Banknote' },
];
