/**
 * QuizMaster AI
 * In-memory Game Cache
 */

class GameCache {
  constructor() {
    this.rooms = new Map();
  }

  set(roomCode, roomData) {
    this.rooms.set(roomCode, roomData);
  }

  get(roomCode) {
    return this.rooms.get(roomCode);
  }

  has(roomCode) {
    return this.rooms.has(roomCode);
  }

  delete(roomCode) {
    this.rooms.delete(roomCode);
  }

  update(roomCode, updater) {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    updater(room);

    this.rooms.set(roomCode, room);

    return room;
  }

  clear() {
    this.rooms.clear();
  }

  size() {
    return this.rooms.size;
  }
}

module.exports = new GameCache();