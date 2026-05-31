class StorageService {
  constructor() {
    this.highestScores = {};
    this.highestScoreTimes = {};
    this.achievements = {};
    this.totalUndoCount = 0;
    this.totalWoodCleared = 0;
    this.totalIceCleared = 0;
    this.load();
  }

  load() {
    try {
      const scores = localStorage.getItem('game2048_highestScores');
      const times = localStorage.getItem('game2048_highestScoreTimes');
      const achievements = localStorage.getItem('game2048_achievements');
      const stats = localStorage.getItem('game2048_totalStats');
      if (scores) this.highestScores = JSON.parse(scores);
      if (times) this.highestScoreTimes = JSON.parse(times);
      if (achievements) this.achievements = JSON.parse(achievements);
      if (stats) {
        const parsed = JSON.parse(stats);
        this.totalUndoCount = parsed.totalUndoCount || 0;
        this.totalWoodCleared = parsed.totalWoodCleared || 0;
        this.totalIceCleared = parsed.totalIceCleared || 0;
      }
    } catch (e) {
      console.error('Failed to load storage:', e);
    }
  }

  save() {
    try {
      localStorage.setItem('game2048_highestScores', JSON.stringify(this.highestScores));
      localStorage.setItem('game2048_highestScoreTimes', JSON.stringify(this.highestScoreTimes));
      localStorage.setItem('game2048_achievements', JSON.stringify(this.achievements));
      localStorage.setItem('game2048_totalStats', JSON.stringify({
        totalUndoCount: this.totalUndoCount,
        totalWoodCleared: this.totalWoodCleared,
        totalIceCleared: this.totalIceCleared
      }));
    } catch (e) {
      console.error('Failed to save storage:', e);
    }
  }

  getHighestScore(mode, variant) {
    return this.highestScores[`${mode}_${variant}`] || 0;
  }

  setHighestScore(mode, variant, score, time = null) {
    const key = `${mode}_${variant}`;
    if (!this.highestScores[key] || score > this.highestScores[key]) {
      this.highestScores[key] = score;
      if (time !== null && mode === GAME_MODE.UNLIMITED) {
        this.highestScoreTimes[key] = time;
      }
      this.save();
      return true;
    }
    return false;
  }

  getHighestScoreTime(mode, variant) {
    return this.highestScoreTimes[`${mode}_${variant}`] || null;
  }

  isAchievementUnlocked(id) {
    return this.achievements[id] || false;
  }

  unlockAchievement(id) {
    if (!this.achievements[id]) {
      this.achievements[id] = true;
      this.save();
      return true;
    }
    return false;
  }

  incrementUndoCount() {
    this.totalUndoCount++;
    this.save();
  }

  incrementWoodCleared(count = 1) {
    this.totalWoodCleared += count;
    this.save();
  }

  incrementIceCleared(count = 1) {
    this.totalIceCleared += count;
    this.save();
  }
}
