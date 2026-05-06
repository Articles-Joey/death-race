const adjectives = [
    'Fierce', 'Shadow', 'Iron', 'Ghost', 'Steel', 'Silent', 'Vicious', 'Turbo', 
    'Agile', 'Brave', 'Lethal', 'Dashing', 'Savage', 'Brutal', 'Grumpy', 'Mighty',
    'Raging', 'Keen', 'Deadly', 'Titan', 'Nimble', 'Primal', 'Quick', 'Radiant',
    'Faded', 'Gravel', 'Vibrant', 'Wild', 'Zesty', 'Thunder', 'Storm'
];

const nouns = [
    'Racer', 'Striker', 'Ghost', 'Bullet', 'Demon', 'Raptor', 'Viper', 'Phantom',
    'Cobra', 'Titan', 'Reaper', 'Slayer', 'Hunter', 'Edge', 'Claw', 'Fang',
    'Drifter', 'Outback', 'Rider', 'Warrior', 'Breaker', 'Blaze', 'Crash', 'Thunder',
    'Bolt', 'Hazard', 'Nitro', 'Turbo', 'Surge', 'Vector'
];

/**
 * Generates a random fighter-themed nickname.
 * @returns {string} A random nickname like "IronRacer" or "ShadowStriker".
 */
export const generateRandomNickname = () => {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 100);
    return `${adj}${noun}${num}`;
};
