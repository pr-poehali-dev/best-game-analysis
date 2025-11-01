CREATE TABLE IF NOT EXISTS lyrium_players (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    race VARCHAR(20) NOT NULL,
    coins INTEGER DEFAULT 5000,
    gems INTEGER DEFAULT 100,
    premium_currency INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    health INTEGER DEFAULT 100,
    max_health INTEGER DEFAULT 100,
    attack INTEGER DEFAULT 10,
    defense INTEGER DEFAULT 5,
    magic_power INTEGER DEFAULT 0,
    range_bonus INTEGER DEFAULT 0,
    avatar VARCHAR(10) DEFAULT '🧙',
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lyrium_inventory (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    item_icon VARCHAR(10) NOT NULL,
    item_category VARCHAR(50),
    item_rarity VARCHAR(20),
    quantity INTEGER DEFAULT 1,
    equipped BOOLEAN DEFAULT FALSE,
    attack_bonus INTEGER DEFAULT 0,
    defense_bonus INTEGER DEFAULT 0,
    health_bonus INTEGER DEFAULT 0,
    acquired_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lyrium_chat (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL,
    username VARCHAR(50) NOT NULL,
    race VARCHAR(20) NOT NULL,
    level INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lyrium_mobs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    level INTEGER NOT NULL,
    is_boss BOOLEAN DEFAULT FALSE,
    health INTEGER NOT NULL,
    attack INTEGER NOT NULL,
    defense INTEGER DEFAULT 0,
    coins_reward INTEGER DEFAULT 0,
    gems_reward INTEGER DEFAULT 0,
    artifact_name VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS lyrium_battles (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL,
    mob_id INTEGER,
    player_level INTEGER NOT NULL,
    mob_level INTEGER NOT NULL,
    result VARCHAR(10),
    damage_dealt INTEGER DEFAULT 0,
    damage_received INTEGER DEFAULT 0,
    rewards_coins INTEGER DEFAULT 0,
    rewards_gems INTEGER DEFAULT 0,
    artifact_received VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lyrium_donat (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    price_rub INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    telegram_username VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lyrium_players_username ON lyrium_players(username);
CREATE INDEX IF NOT EXISTS idx_lyrium_chat_created ON lyrium_chat(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lyrium_inventory_player ON lyrium_inventory(player_id);
CREATE INDEX IF NOT EXISTS idx_lyrium_battles_player ON lyrium_battles(player_id);
