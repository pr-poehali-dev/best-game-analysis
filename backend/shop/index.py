import json
import os
from typing import Dict, Any
import psycopg2

ITEMS_DATA = [
    {'name': 'Деревянный меч', 'icon': '🗡️', 'category': 'weapon', 'rarity': 'common', 'price_coins': 50, 'attack_bonus': 5, 'description': 'Простое оружие для новичков'},
    {'name': 'Железный меч', 'icon': '⚔️', 'category': 'weapon', 'rarity': 'common', 'price_coins': 120, 'attack_bonus': 12, 'description': 'Надежный клинок'},
    {'name': 'Стальной меч', 'icon': '🔪', 'category': 'weapon', 'rarity': 'rare', 'price_coins': 250, 'attack_bonus': 20, 'description': 'Острый как бритва'},
    {'name': 'Огненный меч', 'icon': '🔥', 'category': 'weapon', 'rarity': 'epic', 'price_gems': 50, 'attack_bonus': 35, 'description': 'Пылает в руках'},
    {'name': 'Ледяной меч', 'icon': '❄️', 'category': 'weapon', 'rarity': 'epic', 'price_gems': 55, 'attack_bonus': 38, 'description': 'Замораживает врагов'},
    {'name': 'Меч молний', 'icon': '⚡', 'category': 'weapon', 'rarity': 'epic', 'price_gems': 60, 'attack_bonus': 42, 'description': 'Бьет током'},
    {'name': 'Экскалибур', 'icon': '🗡️', 'category': 'weapon', 'rarity': 'legendary', 'price_gems': 200, 'attack_bonus': 80, 'description': 'Легендарный меч короля'},
    {'name': 'Драконий клинок', 'icon': '🐉', 'category': 'weapon', 'rarity': 'legendary', 'price_gems': 250, 'attack_bonus': 95, 'description': 'Выкован из чешуи дракона'},
    
    {'name': 'Кожаная броня', 'icon': '🛡️', 'category': 'armor', 'rarity': 'common', 'price_coins': 60, 'defense_bonus': 5, 'description': 'Базовая защита'},
    {'name': 'Кольчуга', 'icon': '⛓️', 'category': 'armor', 'rarity': 'common', 'price_coins': 150, 'defense_bonus': 12, 'description': 'Прочная защита'},
    {'name': 'Стальная броня', 'icon': '🛡️', 'category': 'armor', 'rarity': 'rare', 'price_coins': 300, 'defense_bonus': 22, 'description': 'Отличная защита'},
    {'name': 'Рыцарская броня', 'icon': '🏰', 'category': 'armor', 'rarity': 'epic', 'price_gems': 45, 'defense_bonus': 35, 'description': 'Броня рыцаря'},
    {'name': 'Алмазная броня', 'icon': '💎', 'category': 'armor', 'rarity': 'epic', 'price_gems': 65, 'defense_bonus': 45, 'description': 'Сверкает как алмаз'},
    {'name': 'Драконья броня', 'icon': '🐲', 'category': 'armor', 'rarity': 'legendary', 'price_gems': 180, 'defense_bonus': 70, 'description': 'Из драконьей чешуи'},
    {'name': 'Броня богов', 'icon': '👑', 'category': 'armor', 'rarity': 'legendary', 'price_gems': 300, 'defense_bonus': 100, 'description': 'Божественная защита'},
    
    {'name': 'Малое зелье здоровья', 'icon': '🧪', 'category': 'potion', 'rarity': 'common', 'price_coins': 20, 'health_bonus': 20, 'stackable': True, 'description': '+20 HP'},
    {'name': 'Зелье здоровья', 'icon': '⚗️', 'category': 'potion', 'rarity': 'common', 'price_coins': 50, 'health_bonus': 50, 'stackable': True, 'description': '+50 HP'},
    {'name': 'Большое зелье', 'icon': '🍶', 'category': 'potion', 'rarity': 'rare', 'price_coins': 100, 'health_bonus': 100, 'stackable': True, 'description': '+100 HP'},
    {'name': 'Эликсир жизни', 'icon': '💊', 'category': 'potion', 'rarity': 'epic', 'price_gems': 30, 'health_bonus': 200, 'stackable': True, 'description': '+200 HP'},
    {'name': 'Зелье бессмертия', 'icon': '🌟', 'category': 'potion', 'rarity': 'legendary', 'price_gems': 100, 'health_bonus': 500, 'stackable': True, 'description': 'Полное восстановление'},
    
    {'name': 'Лук', 'icon': '🏹', 'category': 'weapon', 'rarity': 'common', 'price_coins': 80, 'attack_bonus': 8, 'description': 'Дальнобойное оружие'},
    {'name': 'Арбалет', 'icon': '🎯', 'category': 'weapon', 'rarity': 'rare', 'price_coins': 200, 'attack_bonus': 18, 'description': 'Мощный арбалет'},
    {'name': 'Волшебный лук', 'icon': '✨', 'category': 'weapon', 'rarity': 'epic', 'price_gems': 70, 'attack_bonus': 40, 'description': 'Стреляет магическими стрелами'},
    
    {'name': 'Деревянный щит', 'icon': '🛡️', 'category': 'shield', 'rarity': 'common', 'price_coins': 40, 'defense_bonus': 3, 'description': 'Простой щит'},
    {'name': 'Железный щит', 'icon': '🔰', 'category': 'shield', 'rarity': 'common', 'price_coins': 90, 'defense_bonus': 8, 'description': 'Крепкий щит'},
    {'name': 'Магический щит', 'icon': '🌀', 'category': 'shield', 'rarity': 'epic', 'price_gems': 50, 'defense_bonus': 25, 'description': 'Отражает магию'},
    {'name': 'Щит героя', 'icon': '⭐', 'category': 'shield', 'rarity': 'legendary', 'price_gems': 150, 'defense_bonus': 50, 'description': 'Непробиваемый'},
    
    {'name': 'Кольцо силы', 'icon': '💍', 'category': 'ring', 'rarity': 'rare', 'price_coins': 180, 'attack_bonus': 10, 'description': '+10 к атаке'},
    {'name': 'Кольцо защиты', 'icon': '💎', 'category': 'ring', 'rarity': 'rare', 'price_coins': 180, 'defense_bonus': 10, 'description': '+10 к защите'},
    {'name': 'Кольцо жизни', 'icon': '❤️', 'category': 'ring', 'rarity': 'epic', 'price_gems': 40, 'health_bonus': 50, 'description': '+50 к макс. HP'},
    {'name': 'Всевластия кольцо', 'icon': '🔮', 'category': 'ring', 'rarity': 'legendary', 'price_gems': 200, 'attack_bonus': 30, 'defense_bonus': 30, 'description': 'Абсолютная мощь'},
    
    {'name': 'Боевой топор', 'icon': '🪓', 'category': 'weapon', 'rarity': 'common', 'price_coins': 110, 'attack_bonus': 11, 'description': 'Тяжелое оружие'},
    {'name': 'Молот войны', 'icon': '🔨', 'category': 'weapon', 'rarity': 'rare', 'price_coins': 220, 'attack_bonus': 19, 'description': 'Сокрушительный удар'},
    {'name': 'Мьёльнир', 'icon': '⚒️', 'category': 'weapon', 'rarity': 'legendary', 'price_gems': 220, 'attack_bonus': 90, 'description': 'Молот Тора'},
    
    {'name': 'Посох мага', 'icon': '🪄', 'category': 'magic', 'rarity': 'rare', 'price_coins': 240, 'attack_bonus': 16, 'description': 'Магическое оружие'},
    {'name': 'Огненный посох', 'icon': '🔥', 'category': 'magic', 'rarity': 'epic', 'price_gems': 75, 'attack_bonus': 45, 'description': 'Огненная магия'},
    {'name': 'Ледяной посох', 'icon': '🧊', 'category': 'magic', 'rarity': 'epic', 'price_gems': 75, 'attack_bonus': 45, 'description': 'Ледяная магия'},
    {'name': 'Посох архимага', 'icon': '✨', 'category': 'magic', 'rarity': 'legendary', 'price_gems': 280, 'attack_bonus': 100, 'description': 'Высшая магия'},
    
    {'name': 'Шлем воина', 'icon': '⛑️', 'category': 'helmet', 'rarity': 'common', 'price_coins': 70, 'defense_bonus': 4, 'description': 'Базовая защита головы'},
    {'name': 'Королевская корона', 'icon': '👑', 'category': 'helmet', 'rarity': 'legendary', 'price_gems': 250, 'defense_bonus': 40, 'attack_bonus': 20, 'description': 'Корона правителя'},
    
    {'name': 'Кинжал', 'icon': '🗡️', 'category': 'weapon', 'rarity': 'common', 'price_coins': 45, 'attack_bonus': 6, 'description': 'Быстрое оружие'},
    {'name': 'Отравленный кинжал', 'icon': '☠️', 'category': 'weapon', 'rarity': 'epic', 'price_gems': 55, 'attack_bonus': 35, 'description': 'Ядовитый урон'},
    
    {'name': 'Копье', 'icon': '🔱', 'category': 'weapon', 'rarity': 'rare', 'price_coins': 180, 'attack_bonus': 17, 'description': 'Длинное оружие'},
    {'name': 'Трезубец Посейдона', 'icon': '🌊', 'category': 'weapon', 'rarity': 'legendary', 'price_gems': 240, 'attack_bonus': 92, 'description': 'Власть над морями'},
    
    {'name': 'Рапира', 'icon': '🤺', 'category': 'weapon', 'rarity': 'rare', 'price_coins': 190, 'attack_bonus': 18, 'description': 'Элегантное оружие'},
    {'name': 'Катана', 'icon': '⚔️', 'category': 'weapon', 'rarity': 'epic', 'price_gems': 80, 'attack_bonus': 48, 'description': 'Оружие самурая'},
    
    {'name': 'Мушкет', 'icon': '🔫', 'category': 'weapon', 'rarity': 'rare', 'price_coins': 280, 'attack_bonus': 22, 'description': 'Огнестрельное оружие'},
    {'name': 'Плазменная пушка', 'icon': '🚀', 'category': 'weapon', 'rarity': 'legendary', 'price_gems': 350, 'attack_bonus': 110, 'description': 'Оружие будущего'},
    
    {'name': 'Амулет силы', 'icon': '📿', 'category': 'amulet', 'rarity': 'rare', 'price_coins': 160, 'attack_bonus': 8, 'description': 'Усиливает атаку'},
    {'name': 'Амулет стойкости', 'icon': '🔱', 'category': 'amulet', 'rarity': 'rare', 'price_coins': 160, 'defense_bonus': 8, 'description': 'Усиливает защиту'},
    {'name': 'Амулет жизни', 'icon': '💚', 'category': 'amulet', 'rarity': 'epic', 'price_gems': 45, 'health_bonus': 60, 'description': '+60 к макс. HP'},
    {'name': 'Амулет бессмертного', 'icon': '🌟', 'category': 'amulet', 'rarity': 'legendary', 'price_gems': 190, 'health_bonus': 150, 'description': 'Огромный запас здоровья'},
    
    {'name': 'Перчатки вора', 'icon': '🧤', 'category': 'gloves', 'rarity': 'common', 'price_coins': 55, 'attack_bonus': 3, 'description': 'Ловкие руки'},
    {'name': 'Перчатки силы', 'icon': '✊', 'category': 'gloves', 'rarity': 'epic', 'price_gems': 50, 'attack_bonus': 25, 'description': 'Невероятная сила'},
    
    {'name': 'Сапоги путника', 'icon': '👢', 'category': 'boots', 'rarity': 'common', 'price_coins': 50, 'defense_bonus': 2, 'description': 'Удобная обувь'},
    {'name': 'Сапоги-скороходы', 'icon': '👟', 'category': 'boots', 'rarity': 'epic', 'price_gems': 60, 'defense_bonus': 20, 'description': 'Увеличивают скорость'},
    
    {'name': 'Плащ невидимости', 'icon': '🧥', 'category': 'cloak', 'rarity': 'legendary', 'price_gems': 280, 'defense_bonus': 50, 'description': 'Делает невидимым'},
    {'name': 'Плащ героя', 'icon': '🦸', 'category': 'cloak', 'rarity': 'epic', 'price_gems': 70, 'defense_bonus': 30, 'description': 'Защита героя'},
    
    {'name': 'Книга заклинаний', 'icon': '📖', 'category': 'magic', 'rarity': 'rare', 'price_coins': 200, 'attack_bonus': 15, 'description': 'Древние заклинания'},
    {'name': 'Том запретной магии', 'icon': '📕', 'category': 'magic', 'rarity': 'legendary', 'price_gems': 260, 'attack_bonus': 88, 'description': 'Темная магия'},
    
    {'name': 'Кристалл маны', 'icon': '💠', 'category': 'magic', 'rarity': 'rare', 'price_coins': 140, 'attack_bonus': 12, 'description': 'Источник магии'},
    {'name': 'Сфера всевидения', 'icon': '🔮', 'category': 'magic', 'rarity': 'legendary', 'price_gems': 270, 'attack_bonus': 50, 'defense_bonus': 40, 'description': 'Видит будущее'},
    
    {'name': 'Факел', 'icon': '🔦', 'category': 'tool', 'rarity': 'common', 'price_coins': 15, 'stackable': True, 'description': 'Освещает путь'},
    {'name': 'Кирка', 'icon': '⛏️', 'category': 'tool', 'rarity': 'common', 'price_coins': 60, 'description': 'Для добычи руды'},
    {'name': 'Удочка', 'icon': '🎣', 'category': 'tool', 'rarity': 'common', 'price_coins': 50, 'description': 'Для рыбалки'},
    
    {'name': 'Хлеб', 'icon': '🍞', 'category': 'food', 'rarity': 'common', 'price_coins': 5, 'health_bonus': 5, 'stackable': True, 'description': '+5 HP'},
    {'name': 'Мясо', 'icon': '🍖', 'category': 'food', 'rarity': 'common', 'price_coins': 15, 'health_bonus': 15, 'stackable': True, 'description': '+15 HP'},
    {'name': 'Золотое яблоко', 'icon': '🍎', 'category': 'food', 'rarity': 'epic', 'price_gems': 20, 'health_bonus': 100, 'stackable': True, 'description': 'Мгновенное лечение'},
    
    {'name': 'Свиток огня', 'icon': '📜', 'category': 'scroll', 'rarity': 'rare', 'price_coins': 120, 'attack_bonus': 30, 'stackable': True, 'description': 'Одноразовое заклинание'},
    {'name': 'Свиток льда', 'icon': '🗒️', 'category': 'scroll', 'rarity': 'rare', 'price_coins': 120, 'attack_bonus': 30, 'stackable': True, 'description': 'Замораживает врагов'},
    {'name': 'Свиток телепорта', 'icon': '🌀', 'category': 'scroll', 'rarity': 'epic', 'price_gems': 35, 'stackable': True, 'description': 'Быстрое перемещение'},
    
    {'name': 'Руна силы', 'icon': '🔷', 'category': 'rune', 'rarity': 'epic', 'price_gems': 40, 'attack_bonus': 20, 'description': 'Постоянный бонус'},
    {'name': 'Руна защиты', 'icon': '🔶', 'category': 'rune', 'rarity': 'epic', 'price_gems': 40, 'defense_bonus': 20, 'description': 'Постоянная защита'},
    {'name': 'Руна бессмертия', 'icon': '♾️', 'category': 'rune', 'rarity': 'legendary', 'price_gems': 300, 'health_bonus': 200, 'description': 'Огромный запас HP'},
    
    {'name': 'Святая вода', 'icon': '💧', 'category': 'potion', 'rarity': 'rare', 'price_coins': 90, 'health_bonus': 60, 'stackable': True, 'description': 'Очищает и лечит'},
    {'name': 'Эликсир силы', 'icon': '⚡', 'category': 'potion', 'rarity': 'epic', 'price_gems': 45, 'attack_bonus': 30, 'stackable': True, 'description': 'Временное усиление'},
    {'name': 'Эликсир защиты', 'icon': '🛡️', 'category': 'potion', 'rarity': 'epic', 'price_gems': 45, 'defense_bonus': 30, 'stackable': True, 'description': 'Временная защита'},
    
    {'name': 'Компас', 'icon': '🧭', 'category': 'tool', 'rarity': 'common', 'price_coins': 40, 'description': 'Указывает путь'},
    {'name': 'Карта сокровищ', 'icon': '🗺️', 'category': 'tool', 'rarity': 'rare', 'price_coins': 200, 'description': 'Ведет к богатствам'},
    {'name': 'Ключ от сокровищницы', 'icon': '🔑', 'category': 'tool', 'rarity': 'epic', 'price_gems': 80, 'description': 'Открывает тайные двери'},
    
    {'name': 'Флаг гильдии', 'icon': '🚩', 'category': 'decoration', 'rarity': 'rare', 'price_coins': 150, 'description': 'Символ гильдии'},
    {'name': 'Трон', 'icon': '👑', 'category': 'decoration', 'rarity': 'legendary', 'price_gems': 400, 'description': 'Место правителя'},
    
    {'name': 'Питомец: Собака', 'icon': '🐕', 'category': 'pet', 'rarity': 'common', 'price_coins': 200, 'attack_bonus': 5, 'description': 'Верный друг'},
    {'name': 'Питомец: Кот', 'icon': '🐈', 'category': 'pet', 'rarity': 'common', 'price_coins': 180, 'defense_bonus': 5, 'description': 'Ловкий спутник'},
    {'name': 'Питомец: Волк', 'icon': '🐺', 'category': 'pet', 'rarity': 'rare', 'price_coins': 350, 'attack_bonus': 15, 'description': 'Хищный зверь'},
    {'name': 'Питомец: Орел', 'icon': '🦅', 'category': 'pet', 'rarity': 'rare', 'price_coins': 320, 'attack_bonus': 12, 'description': 'Зоркий охотник'},
    {'name': 'Питомец: Феникс', 'icon': '🔥', 'category': 'pet', 'rarity': 'legendary', 'price_gems': 320, 'attack_bonus': 60, 'health_bonus': 100, 'description': 'Возрождается из пепла'},
    {'name': 'Питомец: Дракон', 'icon': '🐉', 'category': 'pet', 'rarity': 'legendary', 'price_gems': 500, 'attack_bonus': 100, 'defense_bonus': 50, 'description': 'Могущественный дракон'},
    
    {'name': 'Скин: Рыцарь', 'icon': '⚔️', 'category': 'skin', 'rarity': 'rare', 'price_coins': 250, 'tradeable': False, 'description': 'Облик рыцаря'},
    {'name': 'Скин: Маг', 'icon': '🧙', 'category': 'skin', 'rarity': 'rare', 'price_coins': 250, 'tradeable': False, 'description': 'Облик мага'},
    {'name': 'Скин: Ассасин', 'icon': '🥷', 'category': 'skin', 'rarity': 'epic', 'price_gems': 70, 'tradeable': False, 'description': 'Облик убийцы'},
    {'name': 'Скин: Король', 'icon': '🤴', 'category': 'skin', 'rarity': 'legendary', 'price_gems': 250, 'tradeable': False, 'description': 'Королевский облик'},
    {'name': 'Скин: Ангел', 'icon': '👼', 'category': 'skin', 'rarity': 'legendary', 'price_gems': 280, 'tradeable': False, 'description': 'Небесный облик'},
    {'name': 'Скин: Демон', 'icon': '😈', 'category': 'skin', 'rarity': 'legendary', 'price_gems': 280, 'tradeable': False, 'description': 'Адский облик'},
]

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Shop management - get items, buy items
    Args: event with httpMethod, body (playerId, itemId, action)
    Returns: HTTP response with items or purchase result
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            cur.execute("SELECT COUNT(*) FROM t_p64683754_best_game_analysis.items")
            count = cur.fetchone()[0]
            
            if count == 0:
                for item in ITEMS_DATA:
                    cur.execute(
                        "INSERT INTO t_p64683754_best_game_analysis.items (name, icon, description, category, rarity, price_coins, price_gems, attack_bonus, defense_bonus, health_bonus, stackable, tradeable) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                        (
                            item['name'], item['icon'], item.get('description', ''),
                            item['category'], item['rarity'],
                            item.get('price_coins', 0), item.get('price_gems', 0),
                            item.get('attack_bonus', 0), item.get('defense_bonus', 0),
                            item.get('health_bonus', 0), item.get('stackable', False),
                            item.get('tradeable', True)
                        )
                    )
                conn.commit()
            
            cur.execute("SELECT id, name, icon, description, category, rarity, price_coins, price_gems, attack_bonus, defense_bonus, health_bonus FROM t_p64683754_best_game_analysis.items ORDER BY rarity, price_coins, price_gems")
            items = cur.fetchall()
            
            result = []
            for item in items:
                result.append({
                    'id': item[0],
                    'name': item[1],
                    'icon': item[2],
                    'description': item[3],
                    'category': item[4],
                    'rarity': item[5],
                    'priceCoins': item[6],
                    'priceGems': item[7],
                    'attackBonus': item[8],
                    'defenseBonus': item[9],
                    'healthBonus': item[10]
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'items': result})
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            player_id = body_data.get('playerId')
            item_id = body_data.get('itemId')
            
            cur.execute("SELECT coins, gems FROM t_p64683754_best_game_analysis.players WHERE id = %s", (player_id,))
            player = cur.fetchone()
            
            if not player:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Игрок не найден'})
                }
            
            cur.execute("SELECT price_coins, price_gems, attack_bonus, defense_bonus, health_bonus FROM t_p64683754_best_game_analysis.items WHERE id = %s", (item_id,))
            item = cur.fetchone()
            
            if not item:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Предмет не найден'})
                }
            
            price_coins, price_gems = item[0], item[1]
            
            if price_gems > 0 and player[1] < price_gems:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Недостаточно кристаллов'})
                }
            
            if price_coins > 0 and player[0] < price_coins:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Недостаточно монет'})
                }
            
            if price_gems > 0:
                cur.execute("UPDATE t_p64683754_best_game_analysis.players SET gems = gems - %s WHERE id = %s", (price_gems, player_id))
            if price_coins > 0:
                cur.execute("UPDATE t_p64683754_best_game_analysis.players SET coins = coins - %s WHERE id = %s", (price_coins, player_id))
            
            cur.execute(
                "INSERT INTO t_p64683754_best_game_analysis.inventory (player_id, item_id, quantity) VALUES (%s, %s, 1)",
                (player_id, item_id)
            )
            
            cur.execute(
                "UPDATE t_p64683754_best_game_analysis.players SET attack = attack + %s, defense = defense + %s, max_health = max_health + %s WHERE id = %s",
                (item[2], item[3], item[4], player_id)
            )
            
            conn.commit()
            
            cur.execute("SELECT coins, gems, attack, defense, max_health FROM t_p64683754_best_game_analysis.players WHERE id = %s", (player_id,))
            updated_player = cur.fetchone()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'coins': updated_player[0],
                    'gems': updated_player[1],
                    'attack': updated_player[2],
                    'defense': updated_player[3],
                    'maxHealth': updated_player[4]
                })
            }
    
    finally:
        cur.close()
        conn.close()