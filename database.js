// ============================================
//   DATABASE MODULE — PostgreSQL
//   DEATH NOTE GAME / DEV BY AFGHANI
// ============================================

const { Pool } = require("pg");

// ============================================
//   CONFIG
// ============================================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("railway")
    ? { rejectUnauthorized: false }
    : false,
});

// ✅ Connection events
pool.on("connect", () => {
  console.log("✅ PostgreSQL connected");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL error:", err);
});

// ============================================
//   INIT DATABASE — Create Tables
// ============================================
async function initDatabase() {
  try {
    console.log("🗄️ Initializing database...");

    // ✅ جدول Users — فيه كل الألعاب
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id VARCHAR(20) PRIMARY KEY,
        username VARCHAR(100),
        
        -- ============================================
        -- ROULETTE
        -- ============================================
        roulette_coins INTEGER DEFAULT 100,
        roulette_total_spins INTEGER DEFAULT 0,
        roulette_total_wins INTEGER DEFAULT 0,
        roulette_biggest_win INTEGER DEFAULT 0,
        roulette_last_daily BIGINT DEFAULT 0,
        roulette_total_profit INTEGER DEFAULT 0,
        
        -- ============================================
        -- SLOTS
        -- ============================================
        slots_coins INTEGER DEFAULT 100,
        slots_total_spins INTEGER DEFAULT 0,
        slots_total_wins INTEGER DEFAULT 0,
        slots_jackpots INTEGER DEFAULT 0,
        slots_biggest_win INTEGER DEFAULT 0,
        slots_last_daily BIGINT DEFAULT 0,
        
        -- ============================================
        -- CANDY
        -- ============================================
        candy_best_score INTEGER DEFAULT 0,
        candy_total_score INTEGER DEFAULT 0,
        candy_games_played INTEGER DEFAULT 0,
        candy_total_matches INTEGER DEFAULT 0,
        candy_best_combo INTEGER DEFAULT 0,
        
        -- ============================================
        -- TRIVIA
        -- ============================================
        trivia_points INTEGER DEFAULT 0,
        trivia_games_played INTEGER DEFAULT 0,
        trivia_games_won INTEGER DEFAULT 0,
        trivia_correct_answers INTEGER DEFAULT 0,
        trivia_best_streak INTEGER DEFAULT 0,
        
        -- ============================================
        -- CRASH
        -- ============================================
        crash_points INTEGER DEFAULT 0,
        crash_total_words INTEGER DEFAULT 0,
        crash_games_played INTEGER DEFAULT 0,
        crash_games_won INTEGER DEFAULT 0,
        crash_correct_answers INTEGER DEFAULT 0,
        crash_best_streak INTEGER DEFAULT 0,
        
        -- ============================================
        -- XO
        -- ============================================
        xo_wins INTEGER DEFAULT 0,
        xo_losses INTEGER DEFAULT 0,
        xo_draws INTEGER DEFAULT 0,
        xo_xp INTEGER DEFAULT 0,
        xo_best_streak INTEGER DEFAULT 0,
        
        -- ============================================
        -- METADATA
        -- ============================================
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("✅ Table 'users' ready");
    console.log("✅ Database initialized successfully");
  } catch (err) {
    console.error("❌ Error initializing database:", err);
    throw err;
  }
}

// ============================================
//   HELPER — Create User if not exists
// ============================================
async function ensureUser(userId, username = null) {
  try {
    const existing = await pool.query(
      "SELECT user_id, username FROM users WHERE user_id = $1",
      [userId]
    );

    if (existing.rows.length === 0) {
      await pool.query(
        "INSERT INTO users (user_id, username) VALUES ($1, $2)",
        [userId, username || "Unknown"]
      );
      console.log(`👤 Created user: ${userId} (${username || "Unknown"})`);
    } else if (username && existing.rows[0].username !== username) {
      await pool.query(
        "UPDATE users SET username = $1 WHERE user_id = $2",
        [username, userId]
      );
    }
  } catch (err) {
    console.error("❌ Error in ensureUser:", err);
  }
}

// ============================================
//   GET USER — Generic
// ============================================
async function getUser(userId, username = null) {
  try {
    await ensureUser(userId, username);
    const result = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [userId]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error("❌ Error in getUser:", err);
    return null;
  }
}

// ============================================
//   ============================================
//   ROULETTE FUNCTIONS
//   ============================================
// ============================================

async function getRouletteUser(userId, username = null) {
  try {
    await ensureUser(userId, username);
    const result = await pool.query(
      `SELECT 
        user_id,
        username,
        roulette_coins AS coins,
        roulette_total_spins AS total_spins,
        roulette_total_wins AS total_wins,
        roulette_biggest_win AS biggest_win,
        roulette_last_daily AS last_daily,
        roulette_total_profit AS total_profit
      FROM users WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error("❌ Error in getRouletteUser:", err);
    return null;
  }
}

async function updateRouletteUser(userId, data) {
  try {
    await pool.query(
      `UPDATE users SET
        roulette_coins = $1,
        roulette_total_spins = $2,
        roulette_total_wins = $3,
        roulette_biggest_win = $4,
        roulette_last_daily = $5,
        roulette_total_profit = $6,
        updated_at = NOW()
      WHERE user_id = $7`,
      [
        data.coins,
        data.total_spins,
        data.total_wins,
        data.biggest_win,
        data.last_daily,
        data.total_profit,
        userId,
      ]
    );
  } catch (err) {
    console.error("❌ Error in updateRouletteUser:", err);
  }
}

async function getRouletteLeaderboard(limit = 10) {
  try {
    const result = await pool.query(
      `SELECT 
        user_id, 
        username, 
        roulette_coins AS coins,
        roulette_total_spins AS total_spins,
        roulette_total_wins AS total_wins
      FROM users
      WHERE roulette_total_spins > 0
      ORDER BY roulette_coins DESC
      LIMIT $1`,
      [limit]
    );
    return result.rows;
  } catch (err) {
    console.error("❌ Error in getRouletteLeaderboard:", err);
    return [];
  }
}

async function giveAllRoulette(amount) {
  try {
    const result = await pool.query(
      `UPDATE users 
       SET roulette_coins = roulette_coins + $1, 
           updated_at = NOW()`,
      [amount]
    );
    return result.rowCount;
  } catch (err) {
    console.error("❌ Error in giveAllRoulette:", err);
    return 0;
  }
}

// ============================================
//   ============================================
//   SLOTS FUNCTIONS
//   ============================================
// ============================================

async function getSlotsUser(userId, username = null) {
  try {
    await ensureUser(userId, username);
    const result = await pool.query(
      `SELECT 
        user_id,
        username,
        slots_coins AS coins,
        slots_total_spins AS total_spins,
        slots_total_wins AS total_wins,
        slots_jackpots AS jackpots,
        slots_biggest_win AS biggest_win,
        slots_last_daily AS last_daily
      FROM users WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error("❌ Error in getSlotsUser:", err);
    return null;
  }
}

async function updateSlotsUser(userId, data) {
  try {
    await pool.query(
      `UPDATE users SET
        slots_coins = $1,
        slots_total_spins = $2,
        slots_total_wins = $3,
        slots_jackpots = $4,
        slots_biggest_win = $5,
        slots_last_daily = $6,
        updated_at = NOW()
      WHERE user_id = $7`,
      [
        data.coins,
        data.total_spins,
        data.total_wins,
        data.jackpots,
        data.biggest_win,
        data.last_daily,
        userId,
      ]
    );
  } catch (err) {
    console.error("❌ Error in updateSlotsUser:", err);
  }
}

async function getSlotsLeaderboard(limit = 10) {
  try {
    const result = await pool.query(
      `SELECT 
        user_id, 
        username, 
        slots_coins AS coins,
        slots_total_spins AS total_spins,
        slots_jackpots AS jackpots
      FROM users
      WHERE slots_total_spins > 0
      ORDER BY slots_coins DESC
      LIMIT $1`,
      [limit]
    );
    return result.rows;
  } catch (err) {
    console.error("❌ Error in getSlotsLeaderboard:", err);
    return [];
  }
}

async function giveAllSlots(amount) {
  try {
    const result = await pool.query(
      `UPDATE users 
       SET slots_coins = slots_coins + $1, 
           updated_at = NOW()`,
      [amount]
    );
    return result.rowCount;
  } catch (err) {
    console.error("❌ Error in giveAllSlots:", err);
    return 0;
  }
}

// ============================================
//   ============================================
//   CANDY FUNCTIONS
//   ============================================
// ============================================

async function getCandyUser(userId, username = null) {
  try {
    await ensureUser(userId, username);
    const result = await pool.query(
      `SELECT 
        user_id,
        username,
        candy_best_score AS best_score,
        candy_total_score AS total_score,
        candy_games_played AS games_played,
        candy_total_matches AS total_matches,
        candy_best_combo AS best_combo
      FROM users WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error("❌ Error in getCandyUser:", err);
    return null;
  }
}

async function updateCandyUser(userId, data) {
  try {
    await pool.query(
      `UPDATE users SET
        candy_best_score = $1,
        candy_total_score = $2,
        candy_games_played = $3,
        candy_total_matches = $4,
        candy_best_combo = $5,
        updated_at = NOW()
      WHERE user_id = $6`,
      [
        data.best_score,
        data.total_score,
        data.games_played,
        data.total_matches,
        data.best_combo,
        userId,
      ]
    );
  } catch (err) {
    console.error("❌ Error in updateCandyUser:", err);
  }
}

async function getCandyLeaderboard(limit = 10) {
  try {
    const result = await pool.query(
      `SELECT 
        user_id, 
        username, 
        candy_best_score AS best_score,
        candy_games_played AS games_played,
        candy_total_matches AS total_matches,
        candy_best_combo AS best_combo
      FROM users
      WHERE candy_games_played > 0
      ORDER BY candy_best_score DESC
      LIMIT $1`,
      [limit]
    );
    return result.rows;
  } catch (err) {
    console.error("❌ Error in getCandyLeaderboard:", err);
    return [];
  }
}

// ============================================
//   ============================================
//   TRIVIA FUNCTIONS
//   ============================================
// ============================================

async function getTriviaUser(userId, username = null) {
  try {
    await ensureUser(userId, username);
    const result = await pool.query(
      `SELECT 
        user_id,
        username,
        trivia_points AS points,
        trivia_games_played AS games_played,
        trivia_games_won AS games_won,
        trivia_correct_answers AS correct_answers,
        trivia_best_streak AS best_streak
      FROM users WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error("❌ Error in getTriviaUser:", err);
    return null;
  }
}

async function updateTriviaUser(userId, data) {
  try {
    await pool.query(
      `UPDATE users SET
        trivia_points = $1,
        trivia_games_played = $2,
        trivia_games_won = $3,
        trivia_correct_answers = $4,
        trivia_best_streak = $5,
        updated_at = NOW()
      WHERE user_id = $6`,
      [
        data.points,
        data.games_played,
        data.games_won,
        data.correct_answers,
        data.best_streak,
        userId,
      ]
    );
  } catch (err) {
    console.error("❌ Error in updateTriviaUser:", err);
  }
}

async function getTriviaLeaderboard(limit = 10) {
  try {
    const result = await pool.query(
      `SELECT 
        user_id, 
        username, 
        trivia_points AS points,
        trivia_games_played AS games_played,
        trivia_games_won AS games_won,
        trivia_correct_answers AS correct_answers,
        trivia_best_streak AS best_streak
      FROM users
      WHERE trivia_points > 0
      ORDER BY trivia_points DESC
      LIMIT $1`,
      [limit]
    );
    return result.rows;
  } catch (err) {
    console.error("❌ Error in getTriviaLeaderboard:", err);
    return [];
  }
}

// ============================================
//   ============================================
//   CRASH FUNCTIONS
//   ============================================
// ============================================

async function getCrashUser(userId, username = null) {
  try {
    await ensureUser(userId, username);
    const result = await pool.query(
      `SELECT 
        user_id,
        username,
        crash_points AS points,
        crash_total_words AS total_words,
        crash_games_played AS games_played,
        crash_games_won AS games_won,
        crash_correct_answers AS correct_answers,
        crash_best_streak AS best_streak
      FROM users WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error("❌ Error in getCrashUser:", err);
    return null;
  }
}

async function updateCrashUser(userId, data) {
  try {
    await pool.query(
      `UPDATE users SET
        crash_points = $1,
        crash_total_words = $2,
        crash_games_played = $3,
        crash_games_won = $4,
        crash_correct_answers = $5,
        crash_best_streak = $6,
        updated_at = NOW()
      WHERE user_id = $7`,
      [
        data.points,
        data.total_words,
        data.games_played,
        data.games_won,
        data.correct_answers,
        data.best_streak,
        userId,
      ]
    );
  } catch (err) {
    console.error("❌ Error in updateCrashUser:", err);
  }
}

async function getCrashLeaderboard(limit = 10) {
  try {
    const result = await pool.query(
      `SELECT 
        user_id, 
        username, 
        crash_points AS points,
        crash_total_words AS total_words,
        crash_games_played AS games_played,
        crash_games_won AS games_won,
        crash_correct_answers AS correct_answers,
        crash_best_streak AS best_streak
      FROM users
      WHERE crash_points > 0
      ORDER BY crash_points DESC
      LIMIT $1`,
      [limit]
    );
    return result.rows;
  } catch (err) {
    console.error("❌ Error in getCrashLeaderboard:", err);
    return [];
  }
}

// ============================================
//   ============================================
//   XO FUNCTIONS
//   ============================================
// ============================================

async function getXoUser(userId, username = null) {
  try {
    await ensureUser(userId, username);
    const result = await pool.query(
      `SELECT 
        user_id,
        username,
        xo_wins AS wins,
        xo_losses AS losses,
        xo_draws AS draws,
        xo_xp AS xp,
        xo_best_streak AS best_streak
      FROM users WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error("❌ Error in getXoUser:", err);
    return null;
  }
}

async function updateXoUser(userId, data) {
  try {
    await pool.query(
      `UPDATE users SET
        xo_wins = $1,
        xo_losses = $2,
        xo_draws = $3,
        xo_xp = $4,
        xo_best_streak = $5,
        updated_at = NOW()
      WHERE user_id = $6`,
      [
        data.wins,
        data.losses,
        data.draws,
        data.xp,
        data.best_streak,
        userId,
      ]
    );
  } catch (err) {
    console.error("❌ Error in updateXoUser:", err);
  }
}

// ============================================
//   ADMIN FUNCTIONS
// ============================================

async function giveUserRoulette(userId, amount, username = null) {
  try {
    await ensureUser(userId, username);
    await pool.query(
      `UPDATE users SET roulette_coins = roulette_coins + $1, updated_at = NOW() WHERE user_id = $2`,
      [amount, userId]
    );
    const result = await pool.query(
      `SELECT roulette_coins FROM users WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0]?.roulette_coins || 0;
  } catch (err) {
    console.error("❌ Error in giveUserRoulette:", err);
    return 0;
  }
}

async function giveUserSlots(userId, amount, username = null) {
  try {
    await ensureUser(userId, username);
    await pool.query(
      `UPDATE users SET slots_coins = slots_coins + $1, updated_at = NOW() WHERE user_id = $2`,
      [amount, userId]
    );
    const result = await pool.query(
      `SELECT slots_coins FROM users WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0]?.slots_coins || 0;
  } catch (err) {
    console.error("❌ Error in giveUserSlots:", err);
    return 0;
  }
}

async function resetUserRoulette(userId) {
  try {
    await pool.query(
      `UPDATE users SET roulette_coins = 100, updated_at = NOW() WHERE user_id = $1`,
      [userId]
    );
  } catch (err) {
    console.error("❌ Error in resetUserRoulette:", err);
  }
}

async function resetUserSlots(userId) {
  try {
    await pool.query(
      `UPDATE users SET slots_coins = 100, updated_at = NOW() WHERE user_id = $1`,
      [userId]
    );
  } catch (err) {
    console.error("❌ Error in resetUserSlots:", err);
  }
}

// ============================================
//   EXPORT
// ============================================
module.exports = {
  pool,
  initDatabase,
  getUser,
  ensureUser,
  
  // Roulette
  getRouletteUser,
  updateRouletteUser,
  getRouletteLeaderboard,
  giveAllRoulette,
  giveUserRoulette,
  resetUserRoulette,
  
  // Slots
  getSlotsUser,
  updateSlotsUser,
  getSlotsLeaderboard,
  giveAllSlots,
  giveUserSlots,
  resetUserSlots,
  
  // Candy
  getCandyUser,
  updateCandyUser,
  getCandyLeaderboard,
  
  // Trivia
  getTriviaUser,
  updateTriviaUser,
  getTriviaLeaderboard,
  
  // Crash
  getCrashUser,
  updateCrashUser,
  getCrashLeaderboard,
  
  // XO
  getXoUser,
  updateXoUser,
};
