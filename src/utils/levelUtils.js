export const POINTS_PER_LEVEL = 100;

export const getLevel = (points) => {
    return Math.floor(points / POINTS_PER_LEVEL) + 1;
};

export const getRank = (level) => {
    if (level >= 50) return "Galactic Hero 🌟";
    if (level >= 20) return "Captain Awesome 🚀";
    if (level >= 10) return "Super Sidekick 🦸";
    if (level >= 5) return "Junior Ranger 🧭";
    return "Novice Explorer 🎒";
};

export const getPointsToNextLevel = (points) => {
    return POINTS_PER_LEVEL - (points % POINTS_PER_LEVEL);
};
