
const STORAGE_KEY = 'tracknity_classrooms';

// Initialize with some default data if empty
const DEFAULT_CLASSROOMS = [
    { id: '101', name: 'Room 101', hasScreen: true },
    { id: '102', name: 'Room 102', hasScreen: false },
    { id: '304', name: 'Room 304', hasScreen: true },
];

export const getClassrooms = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CLASSROOMS));
            return DEFAULT_CLASSROOMS;
        }
        return JSON.parse(stored);
    } catch (e) {
        console.error("Failed to load classrooms", e);
        return [];
    }
};

export const addClassroom = (classroom) => {
    const current = getClassrooms();
    const newRoom = { ...classroom, id: Date.now().toString() };
    const updated = [...current, newRoom];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newRoom;
};

export const updateClassroom = (id, updates) => {
    const current = getClassrooms();
    const updated = current.map(room =>
        room.id === id ? { ...room, ...updates } : room
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
};

export const deleteClassroom = (id) => {
    const current = getClassrooms();
    const updated = current.filter(room => room.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
};
