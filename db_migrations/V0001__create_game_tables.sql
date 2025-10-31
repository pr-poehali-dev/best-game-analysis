CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    coins INTEGER DEFAULT 1000,
    gems INTEGER DEFAULT 50,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    health INTEGER DEFAULT 100,
    max_health INTEGER DEFAULT 100,
    attack INTEGER DEFAULT 10,
    defense INTEGER DEFAULT 5,
    avatar VARCHAR(10) DEFAULT '🧙',
    online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    rarity VARCHAR(20) NOT NULL,
    price_coins INTEGER DEFAULT 0,
    price_gems INTEGER DEFAULT 0,
    attack_bonus INTEGER DEFAULT 0,
    defense_bonus INTEGER DEFAULT 0,
    health_bonus INTEGER DEFAULT 0,
    stackable BOOLEAN DEFAULT false,
    tradeable BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id),
    item_id INTEGER REFERENCES items(id),
    quantity INTEGER DEFAULT 1,
    equipped BOOLEAN DEFAULT false,
    acquired_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quests (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    reward_coins INTEGER DEFAULT 0,
    reward_gems INTEGER DEFAULT 0,
    reward_exp INTEGER DEFAULT 0,
    difficulty VARCHAR(20) NOT NULL,
    required_level INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS player_quests (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id),
    quest_id INTEGER REFERENCES quests(id),
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS battles (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id),
    enemy_name VARCHAR(100),
    enemy_icon VARCHAR(10),
    enemy_health INTEGER,
    enemy_attack INTEGER,
    player_health INTEGER,
    turn INTEGER DEFAULT 1,
    winner VARCHAR(50),
    reward_coins INTEGER DEFAULT 0,
    reward_exp INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    finished_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trades (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES players(id),
    buyer_id INTEGER REFERENCES players(id),
    item_id INTEGER REFERENCES items(id),
    price INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);
CREATE INDEX IF NOT EXISTS idx_inventory_player ON inventory(player_id);
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_battles_player ON battles(player_id);