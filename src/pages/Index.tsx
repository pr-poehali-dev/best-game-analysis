import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Player {
  username: string;
  coins: number;
  gems: number;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  avatar: string;
}

interface ShopItem {
  id: number;
  name: string;
  icon: string;
  description: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  priceCoins: number;
  priceGems: number;
  attackBonus: number;
  defenseBonus: number;
  healthBonus: number;
}

interface InventoryItem extends ShopItem {
  quantity: number;
}

const SHOP_ITEMS: ShopItem[] = [
  {id: 1, name: 'Деревянный меч', icon: '🗡️', category: 'weapon', rarity: 'common', priceCoins: 50, priceGems: 0, attackBonus: 5, defenseBonus: 0, healthBonus: 0, description: 'Простое оружие для новичков'},
  {id: 2, name: 'Железный меч', icon: '⚔️', category: 'weapon', rarity: 'common', priceCoins: 120, priceGems: 0, attackBonus: 12, defenseBonus: 0, healthBonus: 0, description: 'Надежный клинок'},
  {id: 3, name: 'Стальной меч', icon: '🔪', category: 'weapon', rarity: 'rare', priceCoins: 250, priceGems: 0, attackBonus: 20, defenseBonus: 0, healthBonus: 0, description: 'Острый как бритва'},
  {id: 4, name: 'Огненный меч', icon: '🔥', category: 'weapon', rarity: 'epic', priceCoins: 0, priceGems: 50, attackBonus: 35, defenseBonus: 0, healthBonus: 0, description: 'Пылает в руках'},
  {id: 5, name: 'Ледяной меч', icon: '❄️', category: 'weapon', rarity: 'epic', priceCoins: 0, priceGems: 55, attackBonus: 38, defenseBonus: 0, healthBonus: 0, description: 'Замораживает врагов'},
  {id: 6, name: 'Меч молний', icon: '⚡', category: 'weapon', rarity: 'epic', priceCoins: 0, priceGems: 60, attackBonus: 42, defenseBonus: 0, healthBonus: 0, description: 'Бьет током'},
  {id: 7, name: 'Экскалибур', icon: '🗡️', category: 'weapon', rarity: 'legendary', priceCoins: 0, priceGems: 200, attackBonus: 80, defenseBonus: 0, healthBonus: 0, description: 'Легендарный меч короля'},
  {id: 8, name: 'Драконий клинок', icon: '🐉', category: 'weapon', rarity: 'legendary', priceCoins: 0, priceGems: 250, attackBonus: 95, defenseBonus: 0, healthBonus: 0, description: 'Выкован из чешуи дракона'},
  {id: 9, name: 'Кожаная броня', icon: '🛡️', category: 'armor', rarity: 'common', priceCoins: 60, priceGems: 0, attackBonus: 0, defenseBonus: 5, healthBonus: 0, description: 'Базовая защита'},
  {id: 10, name: 'Кольчуга', icon: '⛓️', category: 'armor', rarity: 'common', priceCoins: 150, priceGems: 0, attackBonus: 0, defenseBonus: 12, healthBonus: 0, description: 'Прочная защита'},
  {id: 11, name: 'Стальная броня', icon: '🛡️', category: 'armor', rarity: 'rare', priceCoins: 300, priceGems: 0, attackBonus: 0, defenseBonus: 22, healthBonus: 0, description: 'Отличная защита'},
  {id: 12, name: 'Рыцарская броня', icon: '🏰', category: 'armor', rarity: 'epic', priceCoins: 0, priceGems: 45, attackBonus: 0, defenseBonus: 35, healthBonus: 0, description: 'Броня рыцаря'},
  {id: 13, name: 'Алмазная броня', icon: '💎', category: 'armor', rarity: 'epic', priceCoins: 0, priceGems: 65, attackBonus: 0, defenseBonus: 45, healthBonus: 0, description: 'Сверкает как алмаз'},
  {id: 14, name: 'Драконья броня', icon: '🐲', category: 'armor', rarity: 'legendary', priceCoins: 0, priceGems: 180, attackBonus: 0, defenseBonus: 70, healthBonus: 0, description: 'Из драконьей чешуи'},
  {id: 15, name: 'Броня богов', icon: '👑', category: 'armor', rarity: 'legendary', priceCoins: 0, priceGems: 300, attackBonus: 0, defenseBonus: 100, healthBonus: 0, description: 'Божественная защита'},
  {id: 16, name: 'Малое зелье', icon: '🧪', category: 'potion', rarity: 'common', priceCoins: 20, priceGems: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 20, description: '+20 HP'},
  {id: 17, name: 'Зелье здоровья', icon: '⚗️', category: 'potion', rarity: 'common', priceCoins: 50, priceGems: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 50, description: '+50 HP'},
  {id: 18, name: 'Большое зелье', icon: '🍶', category: 'potion', rarity: 'rare', priceCoins: 100, priceGems: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 100, description: '+100 HP'},
  {id: 19, name: 'Эликсир жизни', icon: '💊', category: 'potion', rarity: 'epic', priceCoins: 0, priceGems: 30, attackBonus: 0, defenseBonus: 0, healthBonus: 200, description: '+200 HP'},
  {id: 20, name: 'Зелье бессмертия', icon: '🌟', category: 'potion', rarity: 'legendary', priceCoins: 0, priceGems: 100, attackBonus: 0, defenseBonus: 0, healthBonus: 500, description: 'Полное восстановление'},
  {id: 21, name: 'Лук', icon: '🏹', category: 'weapon', rarity: 'common', priceCoins: 80, priceGems: 0, attackBonus: 8, defenseBonus: 0, healthBonus: 0, description: 'Дальнобойное оружие'},
  {id: 22, name: 'Арбалет', icon: '🎯', category: 'weapon', rarity: 'rare', priceCoins: 200, priceGems: 0, attackBonus: 18, defenseBonus: 0, healthBonus: 0, description: 'Мощный арбалет'},
  {id: 23, name: 'Волшебный лук', icon: '✨', category: 'weapon', rarity: 'epic', priceCoins: 0, priceGems: 70, attackBonus: 40, defenseBonus: 0, healthBonus: 0, description: 'Магические стрелы'},
  {id: 24, name: 'Деревянный щит', icon: '🛡️', category: 'shield', rarity: 'common', priceCoins: 40, priceGems: 0, attackBonus: 0, defenseBonus: 3, healthBonus: 0, description: 'Простой щит'},
  {id: 25, name: 'Железный щит', icon: '🔰', category: 'shield', rarity: 'common', priceCoins: 90, priceGems: 0, attackBonus: 0, defenseBonus: 8, healthBonus: 0, description: 'Крепкий щит'},
  {id: 26, name: 'Магический щит', icon: '🌀', category: 'shield', rarity: 'epic', priceCoins: 0, priceGems: 50, attackBonus: 0, defenseBonus: 25, healthBonus: 0, description: 'Отражает магию'},
  {id: 27, name: 'Щит героя', icon: '⭐', category: 'shield', rarity: 'legendary', priceCoins: 0, priceGems: 150, attackBonus: 0, defenseBonus: 50, healthBonus: 0, description: 'Непробиваемый'},
  {id: 28, name: 'Кольцо силы', icon: '💍', category: 'ring', rarity: 'rare', priceCoins: 180, priceGems: 0, attackBonus: 10, defenseBonus: 0, healthBonus: 0, description: '+10 к атаке'},
  {id: 29, name: 'Кольцо защиты', icon: '💎', category: 'ring', rarity: 'rare', priceCoins: 180, priceGems: 0, attackBonus: 0, defenseBonus: 10, healthBonus: 0, description: '+10 к защите'},
  {id: 30, name: 'Кольцо жизни', icon: '❤️', category: 'ring', rarity: 'epic', priceCoins: 0, priceGems: 40, attackBonus: 0, defenseBonus: 0, healthBonus: 50, description: '+50 к макс HP'},
  {id: 31, name: 'Всевластия кольцо', icon: '🔮', category: 'ring', rarity: 'legendary', priceCoins: 0, priceGems: 200, attackBonus: 30, defenseBonus: 30, healthBonus: 0, description: 'Абсолютная мощь'},
  {id: 32, name: 'Боевой топор', icon: '🪓', category: 'weapon', rarity: 'common', priceCoins: 110, priceGems: 0, attackBonus: 11, defenseBonus: 0, healthBonus: 0, description: 'Тяжелое оружие'},
  {id: 33, name: 'Молот войны', icon: '🔨', category: 'weapon', rarity: 'rare', priceCoins: 220, priceGems: 0, attackBonus: 19, defenseBonus: 0, healthBonus: 0, description: 'Сокрушительный удар'},
  {id: 34, name: 'Мьёльнир', icon: '⚒️', category: 'weapon', rarity: 'legendary', priceCoins: 0, priceGems: 220, attackBonus: 90, defenseBonus: 0, healthBonus: 0, description: 'Молот Тора'},
  {id: 35, name: 'Посох мага', icon: '🪄', category: 'magic', rarity: 'rare', priceCoins: 240, priceGems: 0, attackBonus: 16, defenseBonus: 0, healthBonus: 0, description: 'Магическое оружие'},
  {id: 36, name: 'Огненный посох', icon: '🔥', category: 'magic', rarity: 'epic', priceCoins: 0, priceGems: 75, attackBonus: 45, defenseBonus: 0, healthBonus: 0, description: 'Огненная магия'},
  {id: 37, name: 'Ледяной посох', icon: '🧊', category: 'magic', rarity: 'epic', priceCoins: 0, priceGems: 75, attackBonus: 45, defenseBonus: 0, healthBonus: 0, description: 'Ледяная магия'},
  {id: 38, name: 'Посох архимага', icon: '✨', category: 'magic', rarity: 'legendary', priceCoins: 0, priceGems: 280, attackBonus: 100, defenseBonus: 0, healthBonus: 0, description: 'Высшая магия'},
  {id: 39, name: 'Шлем воина', icon: '⛑️', category: 'helmet', rarity: 'common', priceCoins: 70, priceGems: 0, attackBonus: 0, defenseBonus: 4, healthBonus: 0, description: 'Защита головы'},
  {id: 40, name: 'Королевская корона', icon: '👑', category: 'helmet', rarity: 'legendary', priceCoins: 0, priceGems: 250, attackBonus: 20, defenseBonus: 40, healthBonus: 0, description: 'Корона правителя'},
  {id: 41, name: 'Кинжал', icon: '🗡️', category: 'weapon', rarity: 'common', priceCoins: 45, priceGems: 0, attackBonus: 6, defenseBonus: 0, healthBonus: 0, description: 'Быстрое оружие'},
  {id: 42, name: 'Отравленный кинжал', icon: '☠️', category: 'weapon', rarity: 'epic', priceCoins: 0, priceGems: 55, attackBonus: 35, defenseBonus: 0, healthBonus: 0, description: 'Ядовитый урон'},
  {id: 43, name: 'Копье', icon: '🔱', category: 'weapon', rarity: 'rare', priceCoins: 180, priceGems: 0, attackBonus: 17, defenseBonus: 0, healthBonus: 0, description: 'Длинное оружие'},
  {id: 44, name: 'Трезубец Посейдона', icon: '🌊', category: 'weapon', rarity: 'legendary', priceCoins: 0, priceGems: 240, attackBonus: 92, defenseBonus: 0, healthBonus: 0, description: 'Власть над морями'},
  {id: 45, name: 'Рапира', icon: '🤺', category: 'weapon', rarity: 'rare', priceCoins: 190, priceGems: 0, attackBonus: 18, defenseBonus: 0, healthBonus: 0, description: 'Элегантное оружие'},
  {id: 46, name: 'Катана', icon: '⚔️', category: 'weapon', rarity: 'epic', priceCoins: 0, priceGems: 80, attackBonus: 48, defenseBonus: 0, healthBonus: 0, description: 'Оружие самурая'},
  {id: 47, name: 'Мушкет', icon: '🔫', category: 'weapon', rarity: 'rare', priceCoins: 280, priceGems: 0, attackBonus: 22, defenseBonus: 0, healthBonus: 0, description: 'Огнестрельное'},
  {id: 48, name: 'Плазменная пушка', icon: '🚀', category: 'weapon', rarity: 'legendary', priceCoins: 0, priceGems: 350, attackBonus: 110, defenseBonus: 0, healthBonus: 0, description: 'Оружие будущего'},
  {id: 49, name: 'Амулет силы', icon: '📿', category: 'amulet', rarity: 'rare', priceCoins: 160, priceGems: 0, attackBonus: 8, defenseBonus: 0, healthBonus: 0, description: 'Усиливает атаку'},
  {id: 50, name: 'Амулет стойкости', icon: '🔱', category: 'amulet', rarity: 'rare', priceCoins: 160, priceGems: 0, attackBonus: 0, defenseBonus: 8, healthBonus: 0, description: 'Усиливает защиту'},
  {id: 51, name: 'Амулет жизни', icon: '💚', category: 'amulet', rarity: 'epic', priceCoins: 0, priceGems: 45, attackBonus: 0, defenseBonus: 0, healthBonus: 60, description: '+60 к макс HP'},
  {id: 52, name: 'Амулет бессмертного', icon: '🌟', category: 'amulet', rarity: 'legendary', priceCoins: 0, priceGems: 190, attackBonus: 0, defenseBonus: 0, healthBonus: 150, description: 'Огромный запас HP'},
  {id: 53, name: 'Перчатки вора', icon: '🧤', category: 'gloves', rarity: 'common', priceCoins: 55, priceGems: 0, attackBonus: 3, defenseBonus: 0, healthBonus: 0, description: 'Ловкие руки'},
  {id: 54, name: 'Перчатки силы', icon: '✊', category: 'gloves', rarity: 'epic', priceCoins: 0, priceGems: 50, attackBonus: 25, defenseBonus: 0, healthBonus: 0, description: 'Невероятная сила'},
  {id: 55, name: 'Сапоги путника', icon: '👢', category: 'boots', rarity: 'common', priceCoins: 50, priceGems: 0, attackBonus: 0, defenseBonus: 2, healthBonus: 0, description: 'Удобная обувь'},
  {id: 56, name: 'Сапоги-скороходы', icon: '👟', category: 'boots', rarity: 'epic', priceCoins: 0, priceGems: 60, attackBonus: 0, defenseBonus: 20, healthBonus: 0, description: 'Увеличивают скорость'},
  {id: 57, name: 'Плащ невидимости', icon: '🧥', category: 'cloak', rarity: 'legendary', priceCoins: 0, priceGems: 280, attackBonus: 0, defenseBonus: 50, healthBonus: 0, description: 'Делает невидимым'},
  {id: 58, name: 'Плащ героя', icon: '🦸', category: 'cloak', rarity: 'epic', priceCoins: 0, priceGems: 70, attackBonus: 0, defenseBonus: 30, healthBonus: 0, description: 'Защита героя'},
  {id: 59, name: 'Книга заклинаний', icon: '📖', category: 'magic', rarity: 'rare', priceCoins: 200, priceGems: 0, attackBonus: 15, defenseBonus: 0, healthBonus: 0, description: 'Древние заклинания'},
  {id: 60, name: 'Том запретной магии', icon: '📕', category: 'magic', rarity: 'legendary', priceCoins: 0, priceGems: 260, attackBonus: 88, defenseBonus: 0, healthBonus: 0, description: 'Темная магия'},
  {id: 61, name: 'Кристалл маны', icon: '💠', category: 'magic', rarity: 'rare', priceCoins: 140, priceGems: 0, attackBonus: 12, defenseBonus: 0, healthBonus: 0, description: 'Источник магии'},
  {id: 62, name: 'Сфера всевидения', icon: '🔮', category: 'magic', rarity: 'legendary', priceCoins: 0, priceGems: 270, attackBonus: 50, defenseBonus: 40, healthBonus: 0, description: 'Видит будущее'},
  {id: 63, name: 'Факел', icon: '🔦', category: 'tool', rarity: 'common', priceCoins: 15, priceGems: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 0, description: 'Освещает путь'},
  {id: 64, name: 'Кирка', icon: '⛏️', category: 'tool', rarity: 'common', priceCoins: 60, priceGems: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 0, description: 'Для добычи руды'},
  {id: 65, name: 'Удочка', icon: '🎣', category: 'tool', rarity: 'common', priceCoins: 50, priceGems: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 0, description: 'Для рыбалки'},
  {id: 66, name: 'Хлеб', icon: '🍞', category: 'food', rarity: 'common', priceCoins: 5, priceGems: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 5, description: '+5 HP'},
  {id: 67, name: 'Мясо', icon: '🍖', category: 'food', rarity: 'common', priceCoins: 15, priceGems: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 15, description: '+15 HP'},
  {id: 68, name: 'Золотое яблоко', icon: '🍎', category: 'food', rarity: 'epic', priceCoins: 0, priceGems: 20, attackBonus: 0, defenseBonus: 0, healthBonus: 100, description: 'Мгновенное лечение'},
  {id: 69, name: 'Свиток огня', icon: '📜', category: 'scroll', rarity: 'rare', priceCoins: 120, priceGems: 0, attackBonus: 30, defenseBonus: 0, healthBonus: 0, description: 'Одноразовое заклинание'},
  {id: 70, name: 'Свиток льда', icon: '🗒️', category: 'scroll', rarity: 'rare', priceCoins: 120, priceGems: 0, attackBonus: 30, defenseBonus: 0, healthBonus: 0, description: 'Замораживает врагов'},
  {id: 71, name: 'Свиток телепорта', icon: '🌀', category: 'scroll', rarity: 'epic', priceCoins: 0, priceGems: 35, attackBonus: 0, defenseBonus: 0, healthBonus: 0, description: 'Быстрое перемещение'},
  {id: 72, name: 'Руна силы', icon: '🔷', category: 'rune', rarity: 'epic', priceCoins: 0, priceGems: 40, attackBonus: 20, defenseBonus: 0, healthBonus: 0, description: 'Постоянный бонус'},
  {id: 73, name: 'Руна защиты', icon: '🔶', category: 'rune', rarity: 'epic', priceCoins: 0, priceGems: 40, attackBonus: 0, defenseBonus: 20, healthBonus: 0, description: 'Постоянная защита'},
  {id: 74, name: 'Руна бессмертия', icon: '♾️', category: 'rune', rarity: 'legendary', priceCoins: 0, priceGems: 300, attackBonus: 0, defenseBonus: 0, healthBonus: 200, description: 'Огромный запас HP'},
  {id: 75, name: 'Святая вода', icon: '💧', category: 'potion', rarity: 'rare', priceCoins: 90, priceGems: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 60, description: 'Очищает и лечит'},
  {id: 76, name: 'Эликсир силы', icon: '⚡', category: 'potion', rarity: 'epic', priceCoins: 0, priceGems: 45, attackBonus: 30, defenseBonus: 0, healthBonus: 0, description: 'Временное усиление'},
  {id: 77, name: 'Эликсир защиты', icon: '🛡️', category: 'potion', rarity: 'epic', priceCoins: 0, priceGems: 45, attackBonus: 0, defenseBonus: 30, healthBonus: 0, description: 'Временная защита'},
  {id: 78, name: 'Компас', icon: '🧭', category: 'tool', rarity: 'common', priceCoins: 40, priceGems: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 0, description: 'Указывает путь'},
  {id: 79, name: 'Карта сокровищ', icon: '🗺️', category: 'tool', rarity: 'rare', priceCoins: 200, priceGems: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 0, description: 'Ведет к богатствам'},
  {id: 80, name: 'Ключ сокровищницы', icon: '🔑', category: 'tool', rarity: 'epic', priceCoins: 0, priceGems: 80, attackBonus: 0, defenseBonus: 0, healthBonus: 0, description: 'Открывает тайные двери'},
  {id: 81, name: 'Флаг гильдии', icon: '🚩', category: 'decoration', rarity: 'rare', priceCoins: 150, priceGems: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 0, description: 'Символ гильдии'},
  {id: 82, name: 'Трон', icon: '🪑', category: 'decoration', rarity: 'legendary', priceCoins: 0, priceGems: 400, attackBonus: 0, defenseBonus: 0, healthBonus: 0, description: 'Место правителя'},
  {id: 83, name: 'Питомец: Собака', icon: '🐕', category: 'pet', rarity: 'common', priceCoins: 200, priceGems: 0, attackBonus: 5, defenseBonus: 0, healthBonus: 0, description: 'Верный друг'},
  {id: 84, name: 'Питомец: Кот', icon: '🐈', category: 'pet', rarity: 'common', priceCoins: 180, priceGems: 0, attackBonus: 0, defenseBonus: 5, healthBonus: 0, description: 'Ловкий спутник'},
  {id: 85, name: 'Питомец: Волк', icon: '🐺', category: 'pet', rarity: 'rare', priceCoins: 350, priceGems: 0, attackBonus: 15, defenseBonus: 0, healthBonus: 0, description: 'Хищный зверь'},
  {id: 86, name: 'Питомец: Орел', icon: '🦅', category: 'pet', rarity: 'rare', priceCoins: 320, priceGems: 0, attackBonus: 12, defenseBonus: 0, healthBonus: 0, description: 'Зоркий охотник'},
  {id: 87, name: 'Питомец: Феникс', icon: '🔥', category: 'pet', rarity: 'legendary', priceCoins: 0, priceGems: 320, attackBonus: 60, defenseBonus: 0, healthBonus: 100, description: 'Возрождается из пепла'},
  {id: 88, name: 'Питомец: Дракон', icon: '🐉', category: 'pet', rarity: 'legendary', priceCoins: 0, priceGems: 500, attackBonus: 100, defenseBonus: 50, healthBonus: 0, description: 'Могущественный'},
  {id: 89, name: 'Скин: Рыцарь', icon: '⚔️', category: 'skin', rarity: 'rare', priceCoins: 250, priceGems: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 0, description: 'Облик рыцаря'},
  {id: 90, name: 'Скин: Маг', icon: '🧙', category: 'skin', rarity: 'rare', priceCoins: 250, priceGems: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 0, description: 'Облик мага'},
  {id: 91, name: 'Скин: Ассасин', icon: '🥷', category: 'skin', rarity: 'epic', priceCoins: 0, priceGems: 70, attackBonus: 0, defenseBonus: 0, healthBonus: 0, description: 'Облик убийцы'},
  {id: 92, name: 'Скин: Король', icon: '🤴', category: 'skin', rarity: 'legendary', priceCoins: 0, priceGems: 250, attackBonus: 0, defenseBonus: 0, healthBonus: 0, description: 'Королевский облик'},
  {id: 93, name: 'Скин: Ангел', icon: '👼', category: 'skin', rarity: 'legendary', priceCoins: 0, priceGems: 280, attackBonus: 0, defenseBonus: 0, healthBonus: 0, description: 'Небесный облик'},
  {id: 94, name: 'Скин: Демон', icon: '😈', category: 'skin', rarity: 'legendary', priceCoins: 0, priceGems: 280, attackBonus: 0, defenseBonus: 0, healthBonus: 0, description: 'Адский облик'},
  {id: 95, name: 'Зелье маны', icon: '🔵', category: 'potion', rarity: 'common', priceCoins: 30, priceGems: 0, attackBonus: 5, defenseBonus: 0, healthBonus: 0, description: '+5 к магии'},
  {id: 96, name: 'Эликсир опыта', icon: '📈', category: 'potion', rarity: 'rare', priceCoins: 150, priceGems: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 0, description: 'Удваивает опыт'},
  {id: 97, name: 'Талисман удачи', icon: '🍀', category: 'amulet', rarity: 'epic', priceCoins: 0, priceGems: 60, attackBonus: 0, defenseBonus: 0, healthBonus: 0, description: 'Больше дропа'},
  {id: 98, name: 'Крылья ангела', icon: '🪽', category: 'cloak', rarity: 'legendary', priceCoins: 0, priceGems: 320, attackBonus: 0, defenseBonus: 60, healthBonus: 0, description: 'Позволяет летать'},
  {id: 99, name: 'Бомба', icon: '💣', category: 'tool', rarity: 'rare', priceCoins: 180, priceGems: 0, attackBonus: 40, defenseBonus: 0, healthBonus: 0, description: 'Массовый урон'},
  {id: 100, name: 'Философский камень', icon: '💎', category: 'magic', rarity: 'legendary', priceCoins: 0, priceGems: 999, attackBonus: 150, defenseBonus: 150, healthBonus: 500, description: 'Легендарная реликвия'},
];

export default function Index() {
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [player, setPlayer] = useState<Player | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    const savedPlayer = localStorage.getItem('player');
    const savedInventory = localStorage.getItem('inventory');
    
    if (savedPlayer) {
      setPlayer(JSON.parse(savedPlayer));
      setShowAuth(false);
    } else {
      setShowAuth(true);
    }
    
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    }
  }, []);

  useEffect(() => {
    if (player) {
      localStorage.setItem('player', JSON.stringify(player));
    }
  }, [player]);

  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  const handleAuth = () => {
    if (!username || !password) {
      toast({
        title: "Ошибка",
        description: "Заполни все поля",
        variant: "destructive"
      });
      return;
    }

    const newPlayer: Player = {
      username,
      coins: 5000,
      gems: 100,
      level: 1,
      experience: 0,
      health: 100,
      maxHealth: 100,
      attack: 10,
      defense: 5,
      avatar: '🧙'
    };

    setPlayer(newPlayer);
    setShowAuth(false);
    toast({
      title: isLogin ? "Вход выполнен!" : "Регистрация успешна!",
      description: `Добро пожаловать, ${username}!`
    });
  };

  const buyItem = (item: ShopItem) => {
    if (!player) return;

    if (item.priceGems > 0 && player.gems < item.priceGems) {
      toast({
        title: "Недостаточно кристаллов!",
        description: `Нужно ${item.priceGems} 💎`,
        variant: "destructive"
      });
      return;
    }

    if (item.priceCoins > 0 && player.coins < item.priceCoins) {
      toast({
        title: "Недостаточно монет!",
        description: `Нужно ${item.priceCoins} 🪙`,
        variant: "destructive"
      });
      return;
    }

    const newPlayer = {
      ...player,
      coins: player.coins - item.priceCoins,
      gems: player.gems - item.priceGems,
      attack: player.attack + item.attackBonus,
      defense: player.defense + item.defenseBonus,
      maxHealth: player.maxHealth + item.healthBonus,
      experience: player.experience + 10
    };

    if (newPlayer.experience >= newPlayer.level * 100) {
      newPlayer.level += 1;
      newPlayer.experience = 0;
      toast({
        title: "🎉 Новый уровень!",
        description: `Ты достиг ${newPlayer.level} уровня!`
      });
    }

    setPlayer(newPlayer);

    const existingItem = inventory.find(inv => inv.id === item.id);
    if (existingItem) {
      setInventory(inventory.map(inv => 
        inv.id === item.id ? { ...inv, quantity: inv.quantity + 1 } : inv
      ));
    } else {
      setInventory([...inventory, { ...item, quantity: 1 }]);
    }

    toast({
      title: "Куплено!",
      description: `${item.name} добавлен в инвентарь`
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400';
      case 'rare': return 'border-blue-400';
      case 'epic': return 'border-purple-400';
      case 'legendary': return 'border-yellow-400';
      default: return 'border-border';
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const categories = ['all', 'weapon', 'armor', 'shield', 'potion', 'magic', 'ring', 'pet', 'skin'];
  const filteredItems = selectedCategory === 'all' 
    ? SHOP_ITEMS 
    : SHOP_ITEMS.filter(item => item.category === selectedCategory);

  if (!player) {
    return (
      <div className="min-h-screen bg-background font-pixel text-foreground flex items-center justify-center p-4">
        <Dialog open={showAuth} onOpenChange={setShowAuth}>
          <DialogContent className="bg-card border-2 border-primary font-pixel max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">
                {isLogin ? '🎮 ВХОД' : '✨ РЕГИСТРАЦИЯ'}
              </DialogTitle>
              <DialogDescription className="text-center text-xs">
                {isLogin ? 'Войди в свой аккаунт' : 'Создай новый аккаунт'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                placeholder="Никнейм"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="font-pixel"
              />
              <Input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-pixel"
              />
              <Button
                onClick={handleAuth}
                className="w-full bg-primary hover:bg-primary/90 font-pixel"
              >
                {isLogin ? 'ВОЙТИ' : 'РЕГИСТРАЦИЯ'}
              </Button>
              <Button
                onClick={() => setIsLogin(!isLogin)}
                variant="outline"
                className="w-full font-pixel text-xs"
              >
                {isLogin ? 'Нет аккаунта? Зарегистрируйся' : 'Есть аккаунт? Войди'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-pixel text-foreground">
      <div className="container mx-auto px-4 py-6">
        <header className="text-center mb-6">
          <h1 className="text-2xl md:text-4xl mb-3 animate-pixel-bounce text-accent flex items-center justify-center gap-2">
            <span className="text-3xl">{player.avatar}</span>
            EPIC LEGENDS ONLINE
          </h1>
          <div className="flex justify-center gap-3 flex-wrap text-xs mb-3">
            <Badge className="bg-accent text-accent-foreground">
              Ур. {player.level}
            </Badge>
            <Badge className="bg-yellow-600">
              <Icon name="Coins" size={12} className="mr-1" />
              {player.coins}
            </Badge>
            <Badge className="bg-blue-600">
              <Icon name="Gem" size={12} className="mr-1" />
              {player.gems}
            </Badge>
            <Badge variant="outline" className="border-red-500 text-red-500">
              <Icon name="Swords" size={12} className="mr-1" />
              {player.attack}
            </Badge>
            <Badge variant="outline" className="border-blue-500 text-blue-500">
              <Icon name="Shield" size={12} className="mr-1" />
              {player.defense}
            </Badge>
            <Badge variant="outline" className="border-green-500 text-green-500">
              <Icon name="Heart" size={12} className="mr-1" />
              {player.maxHealth}
            </Badge>
          </div>
          <div className="max-w-md mx-auto">
            <div className="text-[10px] text-muted-foreground mb-1">
              Опыт: {player.experience} / {player.level * 100}
            </div>
            <div className="w-full bg-secondary h-2 border border-border">
              <div 
                className="bg-accent h-full transition-all duration-300"
                style={{ width: `${(player.experience / (player.level * 100)) * 100}%` }}
              />
            </div>
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground">
            {player.username} • Инвентарь: {inventory.reduce((sum, item) => sum + item.quantity, 0)} предметов
          </div>
        </header>

        <Tabs defaultValue="shop" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="shop" className="text-xs">
              <Icon name="Store" size={14} className="mr-1" />
              Магазин (100 товаров)
            </TabsTrigger>
            <TabsTrigger value="inventory" className="text-xs">
              <Icon name="Package" size={14} className="mr-1" />
              Инвентарь ({inventory.reduce((sum, item) => sum + item.quantity, 0)})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shop">
            <div className="mb-4 flex gap-2 flex-wrap justify-center">
              {categories.map(cat => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className="cursor-pointer text-[10px]"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'all' ? 'Все' : cat}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className={`bg-card border-2 ${getRarityColor(item.rarity)} hover:scale-105 transition-all cursor-pointer`}
                >
                  <div className="p-3">
                    <Badge className={`${getRarityBadge(item.rarity)} text-[8px] mb-2`}>
                      {item.rarity}
                    </Badge>
                    <div className="text-center">
                      <div className="text-3xl mb-2 animate-pixel-pulse">{item.icon}</div>
                      <h3 className="text-[9px] font-bold mb-1 leading-tight">{item.name}</h3>
                      <p className="text-[8px] text-muted-foreground mb-2">{item.description}</p>
                      
                      {(item.attackBonus > 0 || item.defenseBonus > 0 || item.healthBonus > 0) && (
                        <div className="flex justify-center gap-1 mb-2 text-[8px]">
                          {item.attackBonus > 0 && (
                            <Badge variant="outline" className="text-[8px] px-1 py-0 border-red-500 text-red-500">
                              +{item.attackBonus}⚔️
                            </Badge>
                          )}
                          {item.defenseBonus > 0 && (
                            <Badge variant="outline" className="text-[8px] px-1 py-0 border-blue-500 text-blue-500">
                              +{item.defenseBonus}🛡️
                            </Badge>
                          )}
                          {item.healthBonus > 0 && (
                            <Badge variant="outline" className="text-[8px] px-1 py-0 border-green-500 text-green-500">
                              +{item.healthBonus}❤️
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-center gap-1 text-accent font-bold text-xs mb-2">
                        {item.priceCoins > 0 && (
                          <>
                            <Icon name="Coins" size={12} />
                            <span>{item.priceCoins}</span>
                          </>
                        )}
                        {item.priceGems > 0 && (
                          <>
                            <Icon name="Gem" size={12} />
                            <span>{item.priceGems}</span>
                          </>
                        )}
                      </div>
                      <Button
                        onClick={() => buyItem(item)}
                        size="sm"
                        className="w-full bg-primary hover:bg-primary/90 text-[9px] h-6"
                      >
                        КУПИТЬ
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            {inventory.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-sm text-muted-foreground">Инвентарь пуст</p>
                <p className="text-xs text-muted-foreground">Купи предметы в магазине</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {inventory.map((item) => (
                  <Card
                    key={item.id}
                    className={`bg-card border-2 ${getRarityColor(item.rarity)}`}
                  >
                    <div className="p-3">
                      <Badge className={`${getRarityBadge(item.rarity)} text-[8px] mb-2`}>
                        {item.rarity}
                      </Badge>
                      <div className="text-center">
                        <div className="text-3xl mb-2">{item.icon}</div>
                        <h3 className="text-[9px] font-bold mb-1">{item.name}</h3>
                        <Badge variant="outline" className="text-[8px]">
                          x{item.quantity}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
