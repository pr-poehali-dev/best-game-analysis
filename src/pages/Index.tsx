import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface Player {
  username: string;
  password: string;
  race: 'warrior' | 'mage' | 'archer' | 'ghost';
  coins: number;
  gems: number;
  premiumCurrency: number;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  magicPower: number;
  rangeBonus: number;
  avatar: string;
}

interface ShopItem {
  id: number;
  name: string;
  icon: string;
  description: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'premium';
  priceCoins: number;
  priceGems: number;
  pricePremium: number;
  attackBonus: number;
  defenseBonus: number;
  healthBonus: number;
}

interface Mob {
  id: number;
  name: string;
  icon: string;
  level: number;
  isBoss: boolean;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  coinsReward: number;
  gemsReward: number;
  artifactName: string | null;
}

interface ChatMessage {
  id: number;
  username: string;
  race: string;
  level: number;
  message: string;
  timestamp: string;
}

interface InventoryItem extends ShopItem {
  quantity: number;
  equipped: boolean;
}

const RACES = [
  { id: 'warrior', name: 'Воин', icon: '⚔️', desc: 'Мощная ближняя атака', bonuses: '+10 Атака, +5 Защита', price: 0 },
  { id: 'mage', name: 'Маг', icon: '🧙', desc: 'Дальняя магическая атака', bonuses: '+15 Магия, -5 Защита', price: 0 },
  { id: 'archer', name: 'Лучник', icon: '🏹', desc: 'Дальняя точная атака', bonuses: '+12 Дальность, +3 Атака', price: 0 },
  { id: 'ghost', name: 'Призрак', icon: '👻', desc: 'Эксклюзивная раса', bonuses: '+20 Магия, +10 Уворот', price: 100 }
];

const SHOP_ITEMS: ShopItem[] = [
  {id: 1, name: 'Деревянный меч', icon: '🗡️', category: 'weapon', rarity: 'common', priceCoins: 50, priceGems: 0, pricePremium: 0, attackBonus: 5, defenseBonus: 0, healthBonus: 0, description: 'Простое оружие'},
  {id: 2, name: 'Железный меч', icon: '⚔️', category: 'weapon', rarity: 'common', priceCoins: 120, priceGems: 0, pricePremium: 0, attackBonus: 12, defenseBonus: 0, healthBonus: 0, description: 'Надежный клинок'},
  {id: 3, name: 'Стальной меч', icon: '🔪', category: 'weapon', rarity: 'rare', priceCoins: 250, priceGems: 0, pricePremium: 0, attackBonus: 20, defenseBonus: 0, healthBonus: 0, description: 'Острое оружие'},
  {id: 4, name: 'Огненный меч', icon: '🔥', category: 'weapon', rarity: 'epic', priceCoins: 0, priceGems: 50, pricePremium: 0, attackBonus: 35, defenseBonus: 0, healthBonus: 0, description: 'Пылающий клинок'},
  {id: 5, name: 'Меч молний', icon: '⚡', category: 'weapon', rarity: 'epic', priceCoins: 0, priceGems: 60, pricePremium: 0, attackBonus: 42, defenseBonus: 0, healthBonus: 0, description: 'Бьет током'},
  {id: 6, name: 'Экскалибур', icon: '🗡️', category: 'weapon', rarity: 'legendary', priceCoins: 0, priceGems: 200, pricePremium: 0, attackBonus: 80, defenseBonus: 0, healthBonus: 0, description: 'Легендарный меч'},
  {id: 7, name: 'Драконий клинок', icon: '🐉', category: 'weapon', rarity: 'legendary', priceCoins: 0, priceGems: 250, pricePremium: 0, attackBonus: 95, defenseBonus: 0, healthBonus: 0, description: 'Драконья сила'},
  {id: 8, name: 'Философский камень', icon: '💎', category: 'premium', rarity: 'premium', priceCoins: 0, priceGems: 0, pricePremium: 500, attackBonus: 150, defenseBonus: 150, healthBonus: 500, description: '🔥 ДОНАТ'},
  {id: 9, name: 'Кожаная броня', icon: '🛡️', category: 'armor', rarity: 'common', priceCoins: 60, priceGems: 0, pricePremium: 0, attackBonus: 0, defenseBonus: 5, healthBonus: 0, description: 'Базовая защита'},
  {id: 10, name: 'Кольчуга', icon: '⛓️', category: 'armor', rarity: 'common', priceCoins: 150, priceGems: 0, pricePremium: 0, attackBonus: 0, defenseBonus: 12, healthBonus: 0, description: 'Прочная защита'},
  {id: 11, name: 'Рыцарская броня', icon: '🏰', category: 'armor', rarity: 'epic', priceCoins: 0, priceGems: 45, pricePremium: 0, attackBonus: 0, defenseBonus: 35, healthBonus: 0, description: 'Броня рыцаря'},
  {id: 12, name: 'Драконья броня', icon: '🐲', category: 'armor', rarity: 'legendary', priceCoins: 0, priceGems: 180, pricePremium: 0, attackBonus: 0, defenseBonus: 70, healthBonus: 0, description: 'Драконья чешуя'},
  {id: 13, name: 'Броня богов', icon: '👑', category: 'armor', rarity: 'premium', priceCoins: 0, priceGems: 0, pricePremium: 300, attackBonus: 0, defenseBonus: 200, healthBonus: 300, description: '🔥 ДОНАТ'},
  {id: 14, name: 'Малое зелье', icon: '🧪', category: 'potion', rarity: 'common', priceCoins: 20, priceGems: 0, pricePremium: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 20, description: '+20 HP'},
  {id: 15, name: 'Зелье здоровья', icon: '⚗️', category: 'potion', rarity: 'common', priceCoins: 50, priceGems: 0, pricePremium: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 50, description: '+50 HP'},
  {id: 16, name: 'Эликсир жизни', icon: '💊', category: 'potion', rarity: 'epic', priceCoins: 0, priceGems: 30, pricePremium: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 200, description: '+200 HP'},
  {id: 17, name: 'Зелье бессмертия', icon: '🌟', category: 'potion', rarity: 'legendary', priceCoins: 0, priceGems: 100, pricePremium: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 500, description: 'Полное лечение'},
  {id: 18, name: 'Божественный эликсир', icon: '✨', category: 'potion', rarity: 'premium', priceCoins: 0, priceGems: 0, pricePremium: 150, attackBonus: 0, defenseBonus: 0, healthBonus: 1000, description: '🔥 ДОНАТ'},
  {id: 19, name: 'Лук', icon: '🏹', category: 'weapon', rarity: 'common', priceCoins: 80, priceGems: 0, pricePremium: 0, attackBonus: 8, defenseBonus: 0, healthBonus: 0, description: 'Дальнобойное'},
  {id: 20, name: 'Волшебный лук', icon: '✨', category: 'weapon', rarity: 'epic', priceCoins: 0, priceGems: 70, pricePremium: 0, attackBonus: 40, defenseBonus: 0, healthBonus: 0, description: 'Магические стрелы'},
  {id: 21, name: 'Кольцо силы', icon: '💍', category: 'ring', rarity: 'rare', priceCoins: 180, priceGems: 0, pricePremium: 0, attackBonus: 10, defenseBonus: 0, healthBonus: 0, description: '+10 Атака'},
  {id: 22, name: 'Кольцо защиты', icon: '💎', category: 'ring', rarity: 'rare', priceCoins: 180, priceGems: 0, pricePremium: 0, attackBonus: 0, defenseBonus: 10, healthBonus: 0, description: '+10 Защита'},
  {id: 23, name: 'Кольцо жизни', icon: '❤️', category: 'ring', rarity: 'epic', priceCoins: 0, priceGems: 40, pricePremium: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 50, description: '+50 HP'},
  {id: 24, name: 'Всевластия кольцо', icon: '🔮', category: 'ring', rarity: 'premium', priceCoins: 0, priceGems: 0, pricePremium: 250, attackBonus: 50, defenseBonus: 50, healthBonus: 200, description: '🔥 ДОНАТ'},
  {id: 25, name: 'Мьёльнир', icon: '⚒️', category: 'weapon', rarity: 'legendary', priceCoins: 0, priceGems: 220, pricePremium: 0, attackBonus: 90, defenseBonus: 0, healthBonus: 0, description: 'Молот Тора'},
  {id: 26, name: 'Посох мага', icon: '🪄', category: 'magic', rarity: 'rare', priceCoins: 240, priceGems: 0, pricePremium: 0, attackBonus: 16, defenseBonus: 0, healthBonus: 0, description: 'Магическое оружие'},
  {id: 27, name: 'Посох архимага', icon: '✨', category: 'magic', rarity: 'legendary', priceCoins: 0, priceGems: 280, pricePremium: 0, attackBonus: 100, defenseBonus: 0, healthBonus: 0, description: 'Высшая магия'},
  {id: 28, name: 'Посох создателя', icon: '🌟', category: 'magic', rarity: 'premium', priceCoins: 0, priceGems: 0, pricePremium: 400, attackBonus: 200, defenseBonus: 50, healthBonus: 0, description: '🔥 ДОНАТ'},
  {id: 29, name: 'Питомец: Волк', icon: '🐺', category: 'pet', rarity: 'rare', priceCoins: 350, priceGems: 0, pricePremium: 0, attackBonus: 15, defenseBonus: 0, healthBonus: 0, description: 'Хищный зверь'},
  {id: 30, name: 'Питомец: Феникс', icon: '🔥', category: 'pet', rarity: 'legendary', priceCoins: 0, priceGems: 320, pricePremium: 0, attackBonus: 60, defenseBonus: 0, healthBonus: 100, description: 'Возрождается'},
  {id: 31, name: 'Питомец: Дракон', icon: '🐉', category: 'pet', rarity: 'premium', priceCoins: 0, priceGems: 0, pricePremium: 600, attackBonus: 150, defenseBonus: 100, healthBonus: 200, description: '🔥 ДОНАТ'},
  {id: 32, name: 'Крылья ангела', icon: '🪽', category: 'cloak', rarity: 'premium', priceCoins: 0, priceGems: 0, pricePremium: 350, attackBonus: 0, defenseBonus: 100, healthBonus: 150, description: '🔥 ДОНАТ'},
  {id: 33, name: 'Амулет силы', icon: '📿', category: 'amulet', rarity: 'rare', priceCoins: 160, priceGems: 0, pricePremium: 0, attackBonus: 8, defenseBonus: 0, healthBonus: 0, description: 'Усиливает атаку'},
  {id: 34, name: 'Амулет бессмертного', icon: '🌟', category: 'amulet', rarity: 'legendary', priceCoins: 0, priceGems: 190, pricePremium: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 150, description: '+150 HP'},
  {id: 35, name: 'Скин: Король', icon: '🤴', category: 'skin', rarity: 'premium', priceCoins: 0, priceGems: 0, pricePremium: 200, attackBonus: 0, defenseBonus: 0, healthBonus: 0, description: '🔥 ДОНАТ'},
  {id: 36, name: 'Скин: Ангел', icon: '👼', category: 'skin', rarity: 'premium', priceCoins: 0, priceGems: 0, pricePremium: 280, attackBonus: 0, defenseBonus: 0, healthBonus: 0, description: '🔥 ДОНАТ'},
  {id: 37, name: 'Скин: Демон', icon: '😈', category: 'skin', rarity: 'premium', priceCoins: 0, priceGems: 0, pricePremium: 280, attackBonus: 0, defenseBonus: 0, healthBonus: 0, description: '🔥 ДОНАТ'},
  {id: 38, name: '1000 Монет', icon: '🪙', category: 'currency', rarity: 'premium', priceCoins: 0, priceGems: 0, pricePremium: 50, attackBonus: 0, defenseBonus: 0, healthBonus: 0, description: '🔥 ДОНАТ'},
  {id: 39, name: '5000 Монет', icon: '💰', category: 'currency', rarity: 'premium', priceCoins: 0, priceGems: 0, pricePremium: 200, attackBonus: 0, defenseBonus: 0, healthBonus: 0, description: '🔥 ДОНАТ'},
  {id: 40, name: '100 Кристаллов', icon: '💎', category: 'currency', rarity: 'premium', priceCoins: 0, priceGems: 0, pricePremium: 100, attackBonus: 0, defenseBonus: 0, healthBonus: 0, description: '🔥 ДОНАТ'},
  {id: 41, name: 'Копье', icon: '🔱', category: 'weapon', rarity: 'rare', priceCoins: 180, priceGems: 0, pricePremium: 0, attackBonus: 17, defenseBonus: 0, healthBonus: 0, description: 'Длинное оружие'},
  {id: 42, name: 'Катана', icon: '⚔️', category: 'weapon', rarity: 'epic', priceCoins: 0, priceGems: 80, pricePremium: 0, attackBonus: 48, defenseBonus: 0, healthBonus: 0, description: 'Оружие самурая'},
  {id: 43, name: 'Плазменная пушка', icon: '🚀', category: 'weapon', rarity: 'legendary', priceCoins: 0, priceGems: 350, pricePremium: 0, attackBonus: 110, defenseBonus: 0, healthBonus: 0, description: 'Оружие будущего'},
  {id: 44, name: 'Божественный меч', icon: '🌟', category: 'weapon', rarity: 'premium', priceCoins: 0, priceGems: 0, pricePremium: 700, attackBonus: 250, defenseBonus: 0, healthBonus: 0, description: '🔥 ДОНАТ'},
  {id: 45, name: 'Щит героя', icon: '⭐', category: 'shield', rarity: 'legendary', priceCoins: 0, priceGems: 150, pricePremium: 0, attackBonus: 0, defenseBonus: 50, healthBonus: 0, description: 'Непробиваемый'},
  {id: 46, name: 'Магический щит', icon: '🌀', category: 'shield', rarity: 'epic', priceCoins: 0, priceGems: 50, pricePremium: 0, attackBonus: 0, defenseBonus: 25, healthBonus: 0, description: 'Отражает магию'},
  {id: 47, name: 'Плащ невидимости', icon: '🧥', category: 'cloak', rarity: 'legendary', priceCoins: 0, priceGems: 280, pricePremium: 0, attackBonus: 0, defenseBonus: 50, healthBonus: 0, description: 'Невидимость'},
  {id: 48, name: 'Перчатки силы', icon: '✊', category: 'gloves', rarity: 'epic', priceCoins: 0, priceGems: 50, pricePremium: 0, attackBonus: 25, defenseBonus: 0, healthBonus: 0, description: 'Невероятная сила'},
  {id: 49, name: 'Сапоги-скороходы', icon: '👟', category: 'boots', rarity: 'epic', priceCoins: 0, priceGems: 60, pricePremium: 0, attackBonus: 0, defenseBonus: 20, healthBonus: 0, description: 'Скорость'},
  {id: 50, name: 'Корона правителя', icon: '👑', category: 'helmet', rarity: 'legendary', priceCoins: 0, priceGems: 250, pricePremium: 0, attackBonus: 20, defenseBonus: 40, healthBonus: 0, description: 'Королевская'},
  {id: 51, name: 'Руна силы', icon: '🔷', category: 'rune', rarity: 'epic', priceCoins: 0, priceGems: 40, pricePremium: 0, attackBonus: 20, defenseBonus: 0, healthBonus: 0, description: 'Постоянный бонус'},
  {id: 52, name: 'Руна защиты', icon: '🔶', category: 'rune', rarity: 'epic', priceCoins: 0, priceGems: 40, pricePremium: 0, attackBonus: 0, defenseBonus: 20, healthBonus: 0, description: 'Защита'},
  {id: 53, name: 'Руна бессмертия', icon: '♾️', category: 'rune', rarity: 'legendary', priceCoins: 0, priceGems: 300, pricePremium: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 200, description: '+200 HP'},
  {id: 54, name: 'Талисман удачи', icon: '🍀', category: 'amulet', rarity: 'epic', priceCoins: 0, priceGems: 60, pricePremium: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 0, description: 'Больше наград'},
  {id: 55, name: 'Кристалл маны', icon: '💠', category: 'magic', rarity: 'rare', priceCoins: 140, priceGems: 0, pricePremium: 0, attackBonus: 12, defenseBonus: 0, healthBonus: 0, description: 'Источник магии'},
  {id: 56, name: 'Сфера всевидения', icon: '🔮', category: 'magic', rarity: 'legendary', priceCoins: 0, priceGems: 270, pricePremium: 0, attackBonus: 50, defenseBonus: 40, healthBonus: 0, description: 'Видит будущее'},
  {id: 57, name: 'Святая вода', icon: '💧', category: 'potion', rarity: 'rare', priceCoins: 90, priceGems: 0, pricePremium: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 60, description: 'Лечит +60'},
  {id: 58, name: 'Эликсир силы', icon: '⚡', category: 'potion', rarity: 'epic', priceCoins: 0, priceGems: 45, pricePremium: 0, attackBonus: 30, defenseBonus: 0, healthBonus: 0, description: '+30 Атака'},
  {id: 59, name: 'Эликсир защиты', icon: '🛡️', category: 'potion', rarity: 'epic', priceCoins: 0, priceGems: 45, pricePremium: 0, attackBonus: 0, defenseBonus: 30, healthBonus: 0, description: '+30 Защита'},
  {id: 60, name: 'Премиум статус', icon: '⭐', category: 'premium', rarity: 'premium', priceCoins: 0, priceGems: 0, pricePremium: 1000, attackBonus: 100, defenseBonus: 100, healthBonus: 500, description: '🔥 VIP ДОНАТ'},
];

export default function Index() {
  const [showAuth, setShowAuth] = useState(true);
  const [showRaceSelect, setShowRaceSelect] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [player, setPlayer] = useState<Player | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [currentMob, setCurrentMob] = useState<Mob | null>(null);
  const [inBattle, setInBattle] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDonatInfo, setShowDonatInfo] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedPlayer = localStorage.getItem('lyriumPlayer');
    const savedInventory = localStorage.getItem('lyriumInventory');
    const savedChat = localStorage.getItem('lyriumChat');
    
    if (savedPlayer) {
      setPlayer(JSON.parse(savedPlayer));
      setShowAuth(false);
    }
    
    if (savedInventory) setInventory(JSON.parse(savedInventory));
    if (savedChat) setChatMessages(JSON.parse(savedChat));
  }, []);

  useEffect(() => {
    if (player) localStorage.setItem('lyriumPlayer', JSON.stringify(player));
  }, [player]);

  useEffect(() => {
    localStorage.setItem('lyriumInventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('lyriumChat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  const handleAuth = () => {
    if (!username || !password) {
      toast({ title: "Ошибка", description: "Заполни все поля", variant: "destructive" });
      return;
    }

    if (isLogin) {
      const savedPlayers = JSON.parse(localStorage.getItem('lyriumAllPlayers') || '[]');
      const existingPlayer = savedPlayers.find((p: Player) => p.username === username);
      
      if (!existingPlayer || existingPlayer.password !== password) {
        toast({ title: "Ошибка", description: "Неверный логин или пароль", variant: "destructive" });
        return;
      }

      setPlayer(existingPlayer);
      setShowAuth(false);
      toast({ title: "Добро пожаловать!", description: `С возвращением, ${username}!` });
    } else {
      const savedPlayers = JSON.parse(localStorage.getItem('lyriumAllPlayers') || '[]');
      if (savedPlayers.find((p: Player) => p.username === username)) {
        toast({ title: "Ошибка", description: "Этот никнейм уже занят", variant: "destructive" });
        return;
      }

      setShowRaceSelect(true);
    }
  };

  const selectRace = (raceId: string) => {
    const race = RACES.find(r => r.id === raceId);
    if (!race) return;

    if (race.price > 0) {
      setShowDonatInfo(true);
      return;
    }

    completeRegistration(raceId);
  };

  const completeRegistration = (raceId: string) => {
    const raceConfig = {
      warrior: { avatar: '⚔️', attack: 20, defense: 10, magic: 0, range: 0, health: 150 },
      mage: { avatar: '🧙', attack: 10, defense: 5, magic: 25, range: 15, health: 100 },
      archer: { avatar: '🏹', attack: 15, defense: 7, magic: 0, range: 20, health: 120 },
      ghost: { avatar: '👻', attack: 15, defense: 8, magic: 30, range: 12, health: 110 }
    }[raceId] || { avatar: '⚔️', attack: 20, defense: 10, magic: 0, range: 0, health: 150 };

    const newPlayer: Player = {
      username,
      password,
      race: raceId as any,
      coins: 5000,
      gems: 100,
      premiumCurrency: 0,
      level: 1,
      experience: 0,
      health: raceConfig.health,
      maxHealth: raceConfig.health,
      attack: raceConfig.attack,
      defense: raceConfig.defense,
      magicPower: raceConfig.magic,
      rangeBonus: raceConfig.range,
      avatar: raceConfig.avatar
    };

    const savedPlayers = JSON.parse(localStorage.getItem('lyriumAllPlayers') || '[]');
    savedPlayers.push(newPlayer);
    localStorage.setItem('lyriumAllPlayers', JSON.stringify(savedPlayers));

    setPlayer(newPlayer);
    setShowAuth(false);
    setShowRaceSelect(false);
    toast({ title: "Регистрация успешна!", description: `Добро пожаловать в LYRIUM, ${username}!` });
  };

  const generateMob = () => {
    if (!player) return;
    
    const mobLevel = Math.max(1, player.level + Math.floor(Math.random() * 3) - 1);
    const isBoss = mobLevel % 10 === 0;
    
    const mobData = {
      id: Date.now(),
      name: isBoss ? `БОСС Ур.${mobLevel}` : `Моб Ур.${mobLevel}`,
      icon: isBoss ? '👑' : ['🟢', '👹', '💀', '👺', '🧌', '🐺', '🧟', '🧛'][Math.floor(Math.random() * 8)],
      level: mobLevel,
      isBoss,
      health: isBoss ? mobLevel * 50 : mobLevel * 10,
      maxHealth: isBoss ? mobLevel * 50 : mobLevel * 10,
      attack: isBoss ? mobLevel * 5 : mobLevel * 2,
      defense: isBoss ? mobLevel * 3 : mobLevel,
      coinsReward: isBoss ? mobLevel * 20 : mobLevel * 5,
      gemsReward: isBoss ? mobLevel * 2 : 0,
      artifactName: isBoss ? `Артефакт Ур.${mobLevel}` : null
    };

    setCurrentMob(mobData);
    setInBattle(true);
    setBattleLog([`⚔️ Началась битва с ${mobData.name}!`]);
  };

  const attackMob = () => {
    if (!currentMob || !player) return;

    const isRanged = player.race === 'mage' || player.race === 'archer';
    const playerDamage = Math.max(1, player.attack + (isRanged ? player.magicPower + player.rangeBonus : 0) - currentMob.defense);
    const mobDamage = isRanged ? Math.max(0, Math.floor(currentMob.attack * 0.7) - player.defense) : Math.max(1, currentMob.attack - player.defense);

    const newMobHealth = currentMob.health - playerDamage;
    const newPlayerHealth = player.health - mobDamage;

    setBattleLog(prev => [...prev, 
      `💥 Ты нанес ${playerDamage} урона!`,
      mobDamage > 0 ? `🩸 Получено ${mobDamage} урона!` : '🛡️ Атака заблокирована!'
    ]);

    if (newMobHealth <= 0) {
      const exp = currentMob.level * 20;
      const newExp = player.experience + exp;
      const levelUp = newExp >= player.level * 100;

      setPlayer({
        ...player,
        coins: player.coins + currentMob.coinsReward,
        gems: player.gems + currentMob.gemsReward,
        experience: levelUp ? newExp - player.level * 100 : newExp,
        level: levelUp ? player.level + 1 : player.level,
        health: Math.min(player.maxHealth, player.health + (levelUp ? 50 : 0))
      });

      if (currentMob.artifactName) {
        const artifact: InventoryItem = {
          id: Date.now(),
          name: currentMob.artifactName,
          icon: '✨',
          category: 'artifact',
          rarity: 'legendary',
          priceCoins: 0,
          priceGems: 0,
          pricePremium: 0,
          attackBonus: currentMob.level * 5,
          defenseBonus: currentMob.level * 3,
          healthBonus: currentMob.level * 10,
          description: 'Артефакт босса',
          quantity: 1,
          equipped: false
        };
        setInventory([...inventory, artifact]);
      }

      setBattleLog(prev => [...prev, `🎉 ПОБЕДА! +${exp} опыта, +${currentMob.coinsReward} монет${currentMob.artifactName ? `, получен ${currentMob.artifactName}!` : '!'}`]);
      setInBattle(false);
      setCurrentMob(null);
      
      if (levelUp) {
        toast({ title: "🎊 НОВЫЙ УРОВЕНЬ!", description: `Поздравляем! Теперь ты ${player.level + 1} уровня!` });
      }
    } else if (newPlayerHealth <= 0) {
      setPlayer({ ...player, health: player.maxHealth, coins: Math.max(0, player.coins - 50) });
      setBattleLog(prev => [...prev, '💀 ПОРАЖЕНИЕ! -50 монет']);
      setInBattle(false);
      setCurrentMob(null);
    } else {
      setCurrentMob({ ...currentMob, health: newMobHealth });
      setPlayer({ ...player, health: newPlayerHealth });
    }
  };

  const sendMessage = () => {
    if (!chatInput.trim() || !player) return;

    const newMessage: ChatMessage = {
      id: Date.now(),
      username: player.username,
      race: player.race,
      level: player.level,
      message: chatInput,
      timestamp: new Date().toLocaleTimeString('ru-RU')
    };

    setChatMessages([...chatMessages, newMessage]);
    setChatInput('');
  };

  const buyItem = (item: ShopItem) => {
    if (!player) return;

    if (item.pricePremium > 0) {
      if (player.premiumCurrency < item.pricePremium) {
        setShowDonatInfo(true);
        return;
      }
      setPlayer({ ...player, premiumCurrency: player.premiumCurrency - item.pricePremium });
    } else if (item.priceGems > 0) {
      if (player.gems < item.priceGems) {
        toast({ title: "Недостаточно кристаллов!", variant: "destructive" });
        return;
      }
      setPlayer({ ...player, gems: player.gems - item.priceGems });
    } else {
      if (player.coins < item.priceCoins) {
        toast({ title: "Недостаточно монет!", variant: "destructive" });
        return;
      }
      setPlayer({ ...player, coins: player.coins - item.priceCoins });
    }

    if (item.category === 'currency') {
      if (item.name.includes('Монет')) {
        const amount = parseInt(item.name);
        setPlayer({ ...player, coins: player.coins + amount });
      } else if (item.name.includes('Кристаллов')) {
        const amount = parseInt(item.name);
        setPlayer({ ...player, gems: player.gems + amount });
      }
    } else {
      const invItem: InventoryItem = { ...item, quantity: 1, equipped: false };
      const existing = inventory.find(i => i.id === item.id);
      if (existing) {
        setInventory(inventory.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      } else {
        setInventory([...inventory, invItem]);
      }
    }

    toast({ title: "Куплено!", description: item.name });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500';
      case 'rare': return 'border-blue-500';
      case 'epic': return 'border-purple-500';
      case 'legendary': return 'border-yellow-500';
      case 'premium': return 'border-pink-500';
      default: return 'border-border';
    }
  };

  const getRaceColor = (race: string) => {
    switch (race) {
      case 'warrior': return 'text-red-500';
      case 'mage': return 'text-blue-500';
      case 'archer': return 'text-green-500';
      case 'ghost': return 'text-purple-500';
      default: return 'text-foreground';
    }
  };

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Dialog open={showAuth}>
          <DialogContent className="bg-slate-800 border-2 border-purple-500 font-pixel max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-center text-3xl text-purple-400">
                {isLogin ? '🎮 ВХОД' : '✨ РЕГИСТРАЦИЯ'}
              </DialogTitle>
              <DialogDescription className="text-center text-purple-300">
                LYRIUM MMORPG
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                placeholder="Никнейм"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="font-pixel bg-slate-900 border-purple-500 text-purple-100"
              />
              <Input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-pixel bg-slate-900 border-purple-500 text-purple-100"
              />
              <Button onClick={handleAuth} className="w-full bg-purple-600 hover:bg-purple-700 font-pixel">
                {isLogin ? 'ВОЙТИ' : 'ДАЛЕЕ'}
              </Button>
              <Button
                onClick={() => setIsLogin(!isLogin)}
                variant="outline"
                className="w-full font-pixel border-purple-500 text-purple-300"
              >
                {isLogin ? 'Создать аккаунт' : 'Уже есть аккаунт'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showRaceSelect} onOpenChange={setShowRaceSelect}>
          <DialogContent className="bg-slate-800 border-2 border-purple-500 font-pixel max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl text-purple-400">ВЫБЕРИ РАСУ</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
              {RACES.map(race => (
                <Card
                  key={race.id}
                  onClick={() => selectRace(race.id)}
                  className="bg-slate-900 border-2 border-purple-500 hover:border-purple-300 cursor-pointer p-4 transition-all hover:scale-105"
                >
                  <div className="text-center">
                    <div className="text-5xl mb-2">{race.icon}</div>
                    <h3 className="text-lg font-bold text-purple-300 mb-1">{race.name}</h3>
                    {race.price > 0 && <Badge className="bg-pink-600 mb-2">🔥 {race.price}₽</Badge>}
                    <p className="text-xs text-purple-400 mb-2">{race.desc}</p>
                    <p className="text-[10px] text-purple-500">{race.bonuses}</p>
                  </div>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showDonatInfo} onOpenChange={setShowDonatInfo}>
          <DialogContent className="bg-slate-800 border-2 border-pink-500 font-pixel">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl text-pink-400">💳 ДОНАТ</DialogTitle>
              <DialogDescription className="text-center text-pink-300">
                Для покупки напиши в Telegram
              </DialogDescription>
            </DialogHeader>
            <div className="text-center space-y-4">
              <div className="text-xl text-pink-300">@LyriumMine</div>
              <Button
                onClick={() => window.open('https://t.me/LyriumMine', '_blank')}
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                ОТКРЫТЬ ЧАТ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (!player) return null;

  const categories = ['all', 'weapon', 'armor', 'potion', 'magic', 'pet', 'premium'];
  const filteredItems = selectedCategory === 'all' ? SHOP_ITEMS : SHOP_ITEMS.filter(i => i.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 font-pixel text-purple-100">
      <div className="container mx-auto px-4 py-6">
        <header className="text-center mb-6">
          <h1 className="text-4xl mb-3 text-purple-400 flex items-center justify-center gap-2">
            <span className="text-4xl">{player.avatar}</span>
            LYRIUM
          </h1>
          <div className="flex justify-center gap-2 flex-wrap text-xs mb-3">
            <Badge className={`${getRaceColor(player.race)} bg-slate-800 border-2`}>
              {player.race.toUpperCase()} Ур.{player.level}
            </Badge>
            <Badge className="bg-yellow-700"><Icon name="Coins" size={12} /> {player.coins}</Badge>
            <Badge className="bg-blue-700"><Icon name="Gem" size={12} /> {player.gems}</Badge>
            {player.premiumCurrency > 0 && <Badge className="bg-pink-700">💎 {player.premiumCurrency}</Badge>}
            <Badge variant="outline" className="border-red-500 text-red-400">
              ⚔️ {player.attack + (player.magicPower || 0) + (player.rangeBonus || 0)}
            </Badge>
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              🛡️ {player.defense}
            </Badge>
            <Badge variant="outline" className="border-green-500 text-green-400">
              ❤️ {player.health}/{player.maxHealth}
            </Badge>
          </div>
          <div className="max-w-md mx-auto">
            <Progress value={(player.experience / (player.level * 100)) * 100} className="h-2" />
            <div className="text-[10px] text-purple-400 mt-1">
              Опыт: {player.experience}/{player.level * 100}
            </div>
          </div>
        </header>

        <Tabs defaultValue="battle" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-slate-800">
            <TabsTrigger value="battle" className="text-xs">⚔️ Битва</TabsTrigger>
            <TabsTrigger value="shop" className="text-xs">🏪 Магазин</TabsTrigger>
            <TabsTrigger value="inventory" className="text-xs">🎒 Инвентарь</TabsTrigger>
            <TabsTrigger value="chat" className="text-xs">💬 Чат</TabsTrigger>
          </TabsList>

          <TabsContent value="battle">
            <Card className="bg-slate-800 border-2 border-purple-500 p-6">
              {!inBattle ? (
                <div className="text-center">
                  <div className="text-6xl mb-4">⚔️</div>
                  <h2 className="text-2xl mb-4 text-purple-300">Найти противника</h2>
                  <Button onClick={generateMob} className="bg-purple-600 hover:bg-purple-700 text-lg px-8">
                    ИСКАТЬ БОЙ
                  </Button>
                </div>
              ) : currentMob && (
                <div>
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-2">{currentMob.icon}</div>
                    <h3 className="text-xl text-purple-300 mb-2">{currentMob.name}</h3>
                    {currentMob.isBoss && <Badge className="bg-red-600 mb-2">👑 БОСС</Badge>}
                    <Progress value={(currentMob.health / currentMob.maxHealth) * 100} className="h-4 mb-2" />
                    <div className="text-sm text-purple-400">
                      ❤️ {currentMob.health}/{currentMob.maxHealth} | ⚔️ {currentMob.attack} | 🛡️ {currentMob.defense}
                    </div>
                  </div>

                  <ScrollArea className="h-32 bg-slate-900 p-3 mb-4 border border-purple-500">
                    {battleLog.map((log, i) => (
                      <div key={i} className="text-xs text-purple-300 mb-1">{log}</div>
                    ))}
                  </ScrollArea>

                  <Button onClick={attackMob} className="w-full bg-red-600 hover:bg-red-700 text-lg">
                    {player.race === 'mage' || player.race === 'archer' ? '🏹 ДАЛЬНЯЯ АТАКА' : '⚔️ БЛИЖНЯЯ АТАКА'}
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="shop">
            <div className="mb-4 flex gap-2 flex-wrap justify-center">
              {categories.map(cat => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'premium' ? '🔥 ДОНАТ' : cat.toUpperCase()}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredItems.map(item => (
                <Card key={item.id} className={`bg-slate-800 border-2 ${getRarityColor(item.rarity)} p-3`}>
                  <div className="text-center">
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <h3 className="text-[9px] font-bold mb-1 text-purple-300">{item.name}</h3>
                    <p className="text-[8px] text-purple-400 mb-2">{item.description}</p>
                    
                    {(item.attackBonus > 0 || item.defenseBonus > 0 || item.healthBonus > 0) && (
                      <div className="flex justify-center gap-1 mb-2 text-[8px]">
                        {item.attackBonus > 0 && <Badge className="text-[8px] bg-red-700">+{item.attackBonus}⚔️</Badge>}
                        {item.defenseBonus > 0 && <Badge className="text-[8px] bg-blue-700">+{item.defenseBonus}🛡️</Badge>}
                        {item.healthBonus > 0 && <Badge className="text-[8px] bg-green-700">+{item.healthBonus}❤️</Badge>}
                      </div>
                    )}

                    <div className="text-xs mb-2 text-purple-300">
                      {item.pricePremium > 0 ? `💎 ${item.pricePremium}₽` : item.priceGems > 0 ? `💎 ${item.priceGems}` : `🪙 ${item.priceCoins}`}
                    </div>

                    <Button onClick={() => buyItem(item)} size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-[9px] h-6">
                      КУПИТЬ
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            {inventory.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎒</div>
                <p className="text-purple-400">Инвентарь пуст</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {inventory.map(item => (
                  <Card key={item.id} className={`bg-slate-800 border-2 ${getRarityColor(item.rarity)} p-3`}>
                    <div className="text-center">
                      <div className="text-3xl mb-2">{item.icon}</div>
                      <h3 className="text-[9px] font-bold text-purple-300">{item.name}</h3>
                      <Badge className="text-[8px] bg-slate-700">x{item.quantity}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat">
            <Card className="bg-slate-800 border-2 border-purple-500 p-4">
              <h2 className="text-xl text-purple-300 mb-4 text-center">💬 Глобальный чат</h2>
              
              <ScrollArea className="h-96 bg-slate-900 p-4 mb-4 border border-purple-500">
                {chatMessages.map(msg => (
                  <div key={msg.id} className="mb-3 p-2 bg-slate-800 border border-purple-600 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`${getRaceColor(msg.race)} bg-slate-700 text-xs`}>
                        Ур.{msg.level}
                      </Badge>
                      <span className="text-xs font-bold text-purple-300">{msg.username}</span>
                      <span className="text-[10px] text-purple-500 ml-auto">{msg.timestamp}</span>
                    </div>
                    <p className="text-sm text-purple-200">{msg.message}</p>
                  </div>
                ))}
                {chatMessages.length === 0 && (
                  <div className="text-center text-purple-400 py-8">
                    Сообщений пока нет. Будь первым!
                  </div>
                )}
              </ScrollArea>

              <div className="flex gap-2">
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Напиши сообщение..."
                  className="flex-1 bg-slate-900 border-purple-500 text-purple-100"
                  rows={2}
                />
                <Button onClick={sendMessage} className="bg-purple-600 hover:bg-purple-700">
                  ОТПРАВИТЬ
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showDonatInfo} onOpenChange={setShowDonatInfo}>
        <DialogContent className="bg-slate-800 border-2 border-pink-500 font-pixel">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl text-pink-400">💳 ДОНАТ</DialogTitle>
            <DialogDescription className="text-center text-pink-300">
              Для покупки напиши в Telegram
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="text-xl text-pink-300">@LyriumMine</div>
            <Button
              onClick={() => window.open('https://t.me/LyriumMine', '_blank')}
              className="w-full bg-pink-600 hover:bg-pink-700"
            >
              ОТКРЫТЬ ЧАТ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
