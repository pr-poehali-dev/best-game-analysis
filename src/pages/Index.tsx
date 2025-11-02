import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface Player {
  username: string;
  password: string;
  race: 'warrior' | 'mage' | 'archer' | 'ghost' | 'demon' | 'angel' | 'dragon' | 'vampire';
  coins: number;
  gems: number;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  avatar: string;
  pvpWins: number;
  pvpLosses: number;
  weeklyScore: number;
  isVIP?: boolean;
}

interface ShopItem {
  id: number;
  name: string;
  icon: string;
  description: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  priceCoins: number;
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
}

interface ChatMessage {
  id: number;
  username: string;
  level: number;
  message: string;
  timestamp: string;
  isVIP?: boolean;
}

interface InventoryItem extends ShopItem {
  quantity: number;
  equipped: boolean;
}

interface MarketItem extends InventoryItem {
  sellerId: string;
  sellerName: string;
  price: number;
}

interface TradeRequest {
  from: string;
  to: string;
  timestamp: number;
  fromItems: InventoryItem[];
  toItems: InventoryItem[];
  status: 'pending' | 'accepted' | 'cancelled';
}

const RACES = [
  { id: 'warrior', name: 'Воин', icon: '⚔️', desc: 'Мощная атака', bonuses: '+10 Атака, +5 Защита', price: 0 },
  { id: 'mage', name: 'Маг', icon: '🧙', desc: 'Магия', bonuses: '+15 Магия', price: 0 },
  { id: 'archer', name: 'Лучник', icon: '🏹', desc: 'Точность', bonuses: '+12 Точность', price: 0 },
  { id: 'ghost', name: 'Призрак', icon: '👻', desc: 'Эксклюзив', bonuses: '+20 Магия, +10 Защита', price: 100 },
  { id: 'demon', name: 'Демон', icon: '😈', desc: 'Темная сила', bonuses: '+25 Атака, +15 Защита', price: 200 },
  { id: 'angel', name: 'Ангел', icon: '😇', desc: 'Святая сила', bonuses: '+20 Магия, +20 Защита', price: 250 },
  { id: 'dragon', name: 'Дракон', icon: '🐉', desc: 'Огненная мощь', bonuses: '+30 Атака, +25 Защита, +50 HP', price: 500 },
  { id: 'vampire', name: 'Вампир', icon: '🧛', desc: 'Ночной охотник', bonuses: '+22 Атака, +18 Защита, Вампиризм', price: 300 }
];

const SHOP_ITEMS: ShopItem[] = [
  {id: 1, name: 'Деревянный меч', icon: '🗡️', category: 'weapon', rarity: 'common', priceCoins: 50, attackBonus: 5, defenseBonus: 0, healthBonus: 0, description: 'Простое оружие'},
  {id: 2, name: 'Железный меч', icon: '⚔️', category: 'weapon', rarity: 'common', priceCoins: 120, attackBonus: 12, defenseBonus: 0, healthBonus: 0, description: 'Надежный клинок'},
  {id: 3, name: 'Стальной меч', icon: '⚔️', category: 'weapon', rarity: 'rare', priceCoins: 250, attackBonus: 20, defenseBonus: 0, healthBonus: 0, description: 'Прочный клинок'},
  {id: 4, name: 'Серебряный меч', icon: '⚔️', category: 'weapon', rarity: 'rare', priceCoins: 350, attackBonus: 25, defenseBonus: 0, healthBonus: 0, description: 'Против нечисти'},
  {id: 5, name: 'Алмазный меч', icon: '💎', category: 'weapon', rarity: 'epic', priceCoins: 500, attackBonus: 30, defenseBonus: 0, healthBonus: 0, description: 'Мощное оружие'},
  {id: 6, name: 'Огненный меч', icon: '🔥', category: 'weapon', rarity: 'epic', priceCoins: 600, attackBonus: 35, defenseBonus: 0, healthBonus: 0, description: 'Горящий клинок'},
  {id: 7, name: 'Ледяной меч', icon: '❄️', category: 'weapon', rarity: 'epic', priceCoins: 600, attackBonus: 35, defenseBonus: 5, healthBonus: 0, description: 'Замораживает врагов'},
  {id: 8, name: 'Меч Экскалибур', icon: '⚜️', category: 'weapon', rarity: 'legendary', priceCoins: 1500, attackBonus: 50, defenseBonus: 10, healthBonus: 30, description: 'Легендарный меч'},
  {id: 9, name: 'Кинжал', icon: '🔪', category: 'weapon', rarity: 'common', priceCoins: 80, attackBonus: 8, defenseBonus: 0, healthBonus: 0, description: 'Быстрое оружие'},
  {id: 10, name: 'Отравленный кинжал', icon: '🗡️', category: 'weapon', rarity: 'rare', priceCoins: 280, attackBonus: 18, defenseBonus: 0, healthBonus: 0, description: 'Яд врагам'},
  {id: 11, name: 'Боевой топор', icon: '🪓', category: 'weapon', rarity: 'common', priceCoins: 150, attackBonus: 15, defenseBonus: 0, healthBonus: 0, description: 'Тяжелый урон'},
  {id: 12, name: 'Двуручный топор', icon: '🪓', category: 'weapon', rarity: 'rare', priceCoins: 320, attackBonus: 28, defenseBonus: 0, healthBonus: 0, description: 'Огромный урон'},
  {id: 13, name: 'Лук', icon: '🏹', category: 'weapon', rarity: 'common', priceCoins: 100, attackBonus: 10, defenseBonus: 0, healthBonus: 0, description: 'Дальний бой'},
  {id: 14, name: 'Арбалет', icon: '🏹', category: 'weapon', rarity: 'rare', priceCoins: 300, attackBonus: 22, defenseBonus: 0, healthBonus: 0, description: 'Мощный выстрел'},
  {id: 15, name: 'Посох огня', icon: '🔥', category: 'weapon', rarity: 'epic', priceCoins: 550, attackBonus: 32, defenseBonus: 0, healthBonus: 0, description: 'Огненная магия'},
  {id: 16, name: 'Посох льда', icon: '❄️', category: 'weapon', rarity: 'epic', priceCoins: 550, attackBonus: 32, defenseBonus: 0, healthBonus: 0, description: 'Ледяная магия'},
  {id: 17, name: 'Копьё', icon: '🗡️', category: 'weapon', rarity: 'rare', priceCoins: 270, attackBonus: 20, defenseBonus: 3, healthBonus: 0, description: 'Длинное оружие'},
  {id: 18, name: 'Трезубец', icon: '🔱', category: 'weapon', rarity: 'epic', priceCoins: 650, attackBonus: 38, defenseBonus: 5, healthBonus: 0, description: 'Морское оружие'},
  {id: 19, name: 'Булава', icon: '🔨', category: 'weapon', rarity: 'common', priceCoins: 130, attackBonus: 13, defenseBonus: 0, healthBonus: 0, description: 'Дробящее оружие'},
  {id: 20, name: 'Молот Тора', icon: '🔨', category: 'weapon', rarity: 'legendary', priceCoins: 2000, attackBonus: 60, defenseBonus: 15, healthBonus: 50, description: 'Божественная сила'},
  {id: 21, name: 'Кожаная броня', icon: '🛡️', category: 'armor', rarity: 'common', priceCoins: 60, attackBonus: 0, defenseBonus: 5, healthBonus: 0, description: 'Базовая защита'},
  {id: 22, name: 'Кольчуга', icon: '🛡️', category: 'armor', rarity: 'common', priceCoins: 140, attackBonus: 0, defenseBonus: 10, healthBonus: 0, description: 'Кольчужная защита'},
  {id: 23, name: 'Железная броня', icon: '🛡️', category: 'armor', rarity: 'rare', priceCoins: 280, attackBonus: 0, defenseBonus: 18, healthBonus: 10, description: 'Прочная защита'},
  {id: 24, name: 'Стальная броня', icon: '🛡️', category: 'armor', rarity: 'rare', priceCoins: 380, attackBonus: 0, defenseBonus: 22, healthBonus: 15, description: 'Крепкая защита'},
  {id: 25, name: 'Алмазная броня', icon: '💎', category: 'armor', rarity: 'epic', priceCoins: 700, attackBonus: 0, defenseBonus: 30, healthBonus: 25, description: 'Блестящая защита'},
  {id: 26, name: 'Драконья броня', icon: '🐉', category: 'armor', rarity: 'legendary', priceCoins: 1000, attackBonus: 0, defenseBonus: 40, healthBonus: 50, description: 'Легендарная защита'},
  {id: 27, name: 'Демоническая броня', icon: '😈', category: 'armor', rarity: 'legendary', priceCoins: 1200, attackBonus: 5, defenseBonus: 38, healthBonus: 45, description: 'Темная защита'},
  {id: 28, name: 'Ангельская броня', icon: '😇', category: 'armor', rarity: 'legendary', priceCoins: 1300, attackBonus: 0, defenseBonus: 45, healthBonus: 60, description: 'Святая защита'},
  {id: 29, name: 'Щит', icon: '🛡️', category: 'armor', rarity: 'common', priceCoins: 90, attackBonus: 0, defenseBonus: 8, healthBonus: 0, description: 'Деревянный щит'},
  {id: 30, name: 'Железный щит', icon: '🛡️', category: 'armor', rarity: 'rare', priceCoins: 250, attackBonus: 0, defenseBonus: 15, healthBonus: 0, description: 'Прочный щит'},
  {id: 31, name: 'Рыцарский щит', icon: '🛡️', category: 'armor', rarity: 'epic', priceCoins: 500, attackBonus: 0, defenseBonus: 25, healthBonus: 20, description: 'Щит рыцаря'},
  {id: 32, name: 'Шлем', icon: '⛑️', category: 'armor', rarity: 'common', priceCoins: 70, attackBonus: 0, defenseBonus: 6, healthBonus: 0, description: 'Защита головы'},
  {id: 33, name: 'Железный шлем', icon: '⛑️', category: 'armor', rarity: 'rare', priceCoins: 200, attackBonus: 0, defenseBonus: 12, healthBonus: 5, description: 'Крепкий шлем'},
  {id: 34, name: 'Королевская корона', icon: '👑', category: 'armor', rarity: 'legendary', priceCoins: 1500, attackBonus: 5, defenseBonus: 20, healthBonus: 40, description: 'Корона короля'},
  {id: 35, name: 'Перчатки', icon: '🧤', category: 'armor', rarity: 'common', priceCoins: 50, attackBonus: 2, defenseBonus: 3, healthBonus: 0, description: 'Защита рук'},
  {id: 36, name: 'Стальные перчатки', icon: '🧤', category: 'armor', rarity: 'rare', priceCoins: 180, attackBonus: 5, defenseBonus: 8, healthBonus: 0, description: 'Прочные перчатки'},
  {id: 37, name: 'Сапоги', icon: '👢', category: 'armor', rarity: 'common', priceCoins: 60, attackBonus: 0, defenseBonus: 5, healthBonus: 0, description: 'Защита ног'},
  {id: 38, name: 'Железные сапоги', icon: '👢', category: 'armor', rarity: 'rare', priceCoins: 190, attackBonus: 0, defenseBonus: 11, healthBonus: 8, description: 'Крепкие сапоги'},
  {id: 39, name: 'Малое зелье', icon: '🧪', category: 'potion', rarity: 'common', priceCoins: 20, attackBonus: 0, defenseBonus: 0, healthBonus: 20, description: '+20 HP'},
  {id: 40, name: 'Зелье здоровья', icon: '🧪', category: 'potion', rarity: 'common', priceCoins: 40, attackBonus: 0, defenseBonus: 0, healthBonus: 50, description: '+50 HP'},
  {id: 41, name: 'Большое зелье', icon: '🧪', category: 'potion', rarity: 'rare', priceCoins: 80, attackBonus: 0, defenseBonus: 0, healthBonus: 100, description: '+100 HP'},
  {id: 42, name: 'Мега зелье', icon: '🧪', category: 'potion', rarity: 'epic', priceCoins: 150, attackBonus: 0, defenseBonus: 0, healthBonus: 200, description: '+200 HP'},
  {id: 43, name: 'Зелье силы', icon: '💪', category: 'potion', rarity: 'rare', priceCoins: 100, attackBonus: 10, defenseBonus: 0, healthBonus: 0, description: '+10 Атака (1 бой)'},
  {id: 44, name: 'Зелье защиты', icon: '🛡️', category: 'potion', rarity: 'rare', priceCoins: 100, attackBonus: 0, defenseBonus: 10, healthBonus: 0, description: '+10 Защита (1 бой)'},
  {id: 45, name: 'Эликсир жизни', icon: '💚', category: 'potion', rarity: 'legendary', priceCoins: 500, attackBonus: 0, defenseBonus: 0, healthBonus: 500, description: 'Полное HP'},
  {id: 46, name: 'Амулет', icon: '📿', category: 'accessory', rarity: 'rare', priceCoins: 300, attackBonus: 5, defenseBonus: 5, healthBonus: 20, description: 'Магический амулет'},
  {id: 47, name: 'Кольцо силы', icon: '💍', category: 'accessory', rarity: 'rare', priceCoins: 250, attackBonus: 8, defenseBonus: 0, healthBonus: 0, description: 'Кольцо воина'},
  {id: 48, name: 'Кольцо защиты', icon: '💍', category: 'accessory', rarity: 'rare', priceCoins: 250, attackBonus: 0, defenseBonus: 12, healthBonus: 0, description: 'Магическая защита'},
  {id: 49, name: 'Ожерелье', icon: '📿', category: 'accessory', rarity: 'epic', priceCoins: 600, attackBonus: 10, defenseBonus: 10, healthBonus: 30, description: 'Драгоценное'},
  {id: 50, name: 'Руна силы', icon: '⚡', category: 'accessory', rarity: 'epic', priceCoins: 700, attackBonus: 15, defenseBonus: 5, healthBonus: 0, description: 'Древняя руна'},
  {id: 51, name: 'Руна защиты', icon: '🔰', category: 'accessory', rarity: 'epic', priceCoins: 700, attackBonus: 0, defenseBonus: 20, healthBonus: 40, description: 'Магическая руна'},
  {id: 52, name: 'Талисман удачи', icon: '🍀', category: 'accessory', rarity: 'legendary', priceCoins: 1500, attackBonus: 20, defenseBonus: 20, healthBonus: 50, description: 'Легендарный талисман'},
  {id: 53, name: 'Крылья ангела', icon: '🪽', category: 'accessory', rarity: 'legendary', priceCoins: 2000, attackBonus: 15, defenseBonus: 25, healthBonus: 80, description: 'Божественные крылья'},
  {id: 54, name: 'Книга заклинаний', icon: '📖', category: 'accessory', rarity: 'epic', priceCoins: 800, attackBonus: 25, defenseBonus: 0, healthBonus: 0, description: 'Магическая книга'},
  {id: 55, name: 'Кристалл маны', icon: '💎', category: 'accessory', rarity: 'rare', priceCoins: 400, attackBonus: 12, defenseBonus: 0, healthBonus: 20, description: 'Усиливает магию'},
];

const PROMOCODES: Record<string, { coins?: number; vip?: boolean }> = {
  'HDHDEH': { coins: 100 },
  'HSGSCESJDNFKLFLW': { vip: true }
};

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
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [tradeRequest, setTradeRequest] = useState<TradeRequest | null>(null);
  const [tradeItems, setTradeItems] = useState<{ my: number[]; their: number[] }>({ my: [], their: [] });
  const [sellItemId, setSellItemId] = useState<number | null>(null);
  const [sellPrice, setSellPrice] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const savedPlayer = localStorage.getItem('lyriumPlayer');
    const savedChat = localStorage.getItem('lyriumChat');
    const savedMarket = localStorage.getItem('lyriumMarket');
    
    if (savedPlayer) {
      const parsed = JSON.parse(savedPlayer);
      if (!parsed.pvpWins) parsed.pvpWins = 0;
      if (!parsed.pvpLosses) parsed.pvpLosses = 0;
      if (!parsed.weeklyScore) parsed.weeklyScore = 0;
      if (!parsed.isVIP) parsed.isVIP = false;
      const savedInv = localStorage.getItem(`lyriumInventory_${parsed.username}`);
      if (savedInv) setInventory(JSON.parse(savedInv));
      setPlayer(parsed);
      setShowAuth(false);
    }
    
    if (savedChat) setChatMessages(JSON.parse(savedChat));
    if (savedMarket) setMarketItems(JSON.parse(savedMarket));
  }, []);

  useEffect(() => {
    if (player) {
      localStorage.setItem('lyriumPlayer', JSON.stringify(player));
      const allPlayers = JSON.parse(localStorage.getItem('lyriumAllPlayers') || '[]');
      const exists = allPlayers.findIndex((p: Player) => p.username === player.username);
      if (exists !== -1) {
        allPlayers[exists] = player;
      } else {
        allPlayers.push(player);
      }
      localStorage.setItem('lyriumAllPlayers', JSON.stringify(allPlayers));
    }
  }, [player]);

  useEffect(() => {
    if (player) {
      localStorage.setItem(`lyriumInventory_${player.username}`, JSON.stringify(inventory));
    }
  }, [inventory, player]);

  useEffect(() => {
    localStorage.setItem('lyriumChat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('lyriumMarket', JSON.stringify(marketItems));
  }, [marketItems]);

  const handleAuth = () => {
    if (!username || !password) {
      toast({ title: "Ошибка", description: "Заполни все поля", variant: "destructive" });
      return;
    }

    if (isLogin) {
      const savedPlayers = JSON.parse(localStorage.getItem('lyriumAllPlayers') || '[]');
      const existingPlayer = savedPlayers.find((p: Player) => p.username === username && p.password === password);
      
      if (!existingPlayer) {
        toast({ title: "Ошибка", description: "Неверный логин или пароль", variant: "destructive" });
        return;
      }

      if (!existingPlayer.pvpWins) existingPlayer.pvpWins = 0;
      if (!existingPlayer.pvpLosses) existingPlayer.pvpLosses = 0;
      if (!existingPlayer.weeklyScore) existingPlayer.weeklyScore = 0;
      if (!existingPlayer.isVIP) existingPlayer.isVIP = false;

      const savedInv = localStorage.getItem(`lyriumInventory_${username}`);
      if (savedInv) setInventory(JSON.parse(savedInv));

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
    
    if (race.price > 0 && (!player || player.gems < race.price)) {
      toast({ title: "Недостаточно кристаллов!", description: `Нужно ${race.price} кристаллов`, variant: "destructive" });
      return;
    }

    const raceConfig: Record<string, { avatar: string; attack: number; defense: number; health: number }> = {
      warrior: { avatar: '⚔️', attack: 20, defense: 10, health: 150 },
      mage: { avatar: '🧙', attack: 10, defense: 5, health: 100 },
      archer: { avatar: '🏹', attack: 15, defense: 7, health: 120 },
      ghost: { avatar: '👻', attack: 15, defense: 8, health: 110 },
      demon: { avatar: '😈', attack: 25, defense: 15, health: 180 },
      angel: { avatar: '😇', attack: 20, defense: 20, health: 200 },
      dragon: { avatar: '🐉', attack: 30, defense: 25, health: 250 },
      vampire: { avatar: '🧛', attack: 22, defense: 18, health: 160 }
    };
    
    const config = raceConfig[raceId] || { avatar: '⚔️', attack: 20, defense: 10, health: 150 };

    const newPlayer: Player = {
      username,
      password,
      race: raceId as any,
      coins: 100,
      gems: 10,
      level: 1,
      experience: 0,
      health: config.health,
      maxHealth: config.health,
      attack: config.attack,
      defense: config.defense,
      avatar: config.avatar,
      pvpWins: 0,
      pvpLosses: 0,
      weeklyScore: 0,
      isVIP: false
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
    
    const mobImages = [
      'https://cdn.poehali.dev/projects/574d4cea-11bf-4f4d-8b39-5e82004c350a/files/ca860011-e823-4c15-9e5a-4977af634296.jpg',
      'https://cdn.poehali.dev/projects/574d4cea-11bf-4f4d-8b39-5e82004c350a/files/c3584dc4-955b-4004-b7c7-5a3ecf276e0c.jpg',
      'https://cdn.poehali.dev/projects/574d4cea-11bf-4f4d-8b39-5e82004c350a/files/1f3782d9-1034-4783-80bb-e0dd8d6460b5.jpg',
      'https://cdn.poehali.dev/projects/574d4cea-11bf-4f4d-8b39-5e82004c350a/files/66d3aecb-2128-41f1-a12f-fe8ca61bfd83.jpg'
    ];
    const bossImage = 'https://cdn.poehali.dev/projects/574d4cea-11bf-4f4d-8b39-5e82004c350a/files/c7fb6a02-0c35-4d75-9cc3-41365b0cff3e.jpg';
    
    const mobData = {
      id: Date.now(),
      name: isBoss ? `БОСС Ур.${mobLevel}` : `Моб Ур.${mobLevel}`,
      icon: isBoss ? bossImage : mobImages[Math.floor(Math.random() * mobImages.length)],
      level: mobLevel,
      isBoss,
      health: isBoss ? mobLevel * 200 : mobLevel * 30,
      maxHealth: isBoss ? mobLevel * 200 : mobLevel * 30,
      attack: mobLevel * 6,
      defense: mobLevel * 3,
      coinsReward: Math.max(2, mobLevel * 1.5)
    };

    setCurrentMob(mobData);
    setInBattle(true);
    setBattleLog([`⚔️ Противник появился: ${mobData.name}!`]);
  };

  const getTotalStats = () => {
    if (!player) return { attack: 0, defense: 0, maxHealth: 100 };
    
    const equipped = inventory.filter(i => i.equipped);
    const attackBonus = equipped.reduce((sum, i) => sum + i.attackBonus, 0);
    const defenseBonus = equipped.reduce((sum, i) => sum + i.defenseBonus, 0);
    const healthBonus = equipped.reduce((sum, i) => sum + i.healthBonus, 0);

    return {
      attack: player.attack + attackBonus,
      defense: player.defense + defenseBonus,
      maxHealth: player.maxHealth + healthBonus
    };
  };

  const attackMob = () => {
    if (!player || !currentMob) return;

    const stats = getTotalStats();
    const playerDamage = Math.max(1, stats.attack - currentMob.defense);
    const mobDamage = currentMob.isBoss ? 0 : Math.max(1, currentMob.attack - stats.defense);

    const newMobHealth = currentMob.health - playerDamage;
    const newPlayerHealth = player.health - mobDamage;

    setBattleLog(prev => [...prev, `⚔️ Ты нанес ${playerDamage} урона!`]);
    if (!currentMob.isBoss && mobDamage > 0) {
      setBattleLog(prev => [...prev, `💥 Получено ${mobDamage} урона!`]);
    }

    if (newMobHealth <= 0) {
      const exp = currentMob.level * (currentMob.isBoss ? 50 : 10);
      const coins = currentMob.isBoss ? currentMob.level * 30 : currentMob.coinsReward;
      const gems = currentMob.isBoss ? currentMob.level * 3 : 0;
      
      const newExp = player.experience + exp;
      const levelUp = newExp >= player.level * 100;
      const updatedPlayer = {
        ...player,
        experience: levelUp ? newExp - player.level * 100 : newExp,
        level: levelUp ? player.level + 1 : player.level,
        coins: player.coins + coins,
        gems: player.gems + gems,
        weeklyScore: player.weeklyScore + (currentMob.isBoss ? 100 : 10)
      };
      
      setPlayer(updatedPlayer);

      if (currentMob.isBoss && Math.random() < 0.1) {
        const artifact: InventoryItem = {
          id: Date.now(),
          name: `Артефакт Ур.${currentMob.level}`,
          icon: '✨',
          category: 'artifact',
          rarity: 'legendary',
          priceCoins: 0,
          attackBonus: currentMob.level * 5,
          defenseBonus: currentMob.level * 3,
          healthBonus: currentMob.level * 10,
          description: 'Артефакт босса',
          quantity: 1,
          equipped: false
        };
        setInventory([...inventory, artifact]);
        setBattleLog(prev => [...prev, `✨ ВЫПАЛ АРТЕФАКТ!`]);
      }

      setBattleLog(prev => [...prev, `🎉 ПОБЕДА! +${exp} опыта, +${coins} монет${gems > 0 ? `, +${gems} кристаллов` : ''}`]);
      setInBattle(false);
      setCurrentMob(null);
      
      if (levelUp) {
        toast({ title: "🎊 НОВЫЙ УРОВЕНЬ!", description: `Теперь ты ${updatedPlayer.level} уровня!` });
      }
    } else if (newPlayerHealth <= 0) {
      setPlayer({ ...player, health: stats.maxHealth, coins: Math.max(0, player.coins - 50) });
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

    const parts = chatInput.trim().split(' ');
    
    if (parts[0].toLowerCase() === '/дб' && parts.length === 3) {
      const targetUser = parts[1];
      const amount = parseInt(parts[2]);
      
      if (isNaN(amount) || amount <= 0) {
        toast({ title: "Ошибка", description: "Неверная сумма", variant: "destructive" });
        setChatInput('');
        return;
      }

      if (player.coins < amount) {
        toast({ title: "Ошибка", description: "Недостаточно монет", variant: "destructive" });
        setChatInput('');
        return;
      }

      const allPlayers = JSON.parse(localStorage.getItem('lyriumAllPlayers') || '[]');
      const targetPlayer = allPlayers.find((p: Player) => p.username === targetUser);

      if (!targetPlayer) {
        toast({ title: "Ошибка", description: "Игрок не найден", variant: "destructive" });
        setChatInput('');
        return;
      }

      const updatedPlayers = allPlayers.map((p: Player) => {
        if (p.username === player.username) return { ...p, coins: p.coins - amount };
        if (p.username === targetUser) return { ...p, coins: p.coins + amount };
        return p;
      });

      localStorage.setItem('lyriumAllPlayers', JSON.stringify(updatedPlayers));
      setPlayer({ ...player, coins: player.coins - amount });

      const sysMsg: ChatMessage = {
        id: Date.now(),
        username: 'СИСТЕМА',
        level: 0,
        message: `💸 ${player.username} отправил ${amount} монет игроку ${targetUser}`,
        timestamp: new Date().toLocaleTimeString('ru-RU'),
        isVIP: false
      };

      setChatMessages([...chatMessages, sysMsg]);
      toast({ title: "Успех", description: `Отправлено ${amount} монет` });
      setChatInput('');
      return;
    }

    if (parts[0].toLowerCase() === '/promo' && parts.length === 2) {
      const code = parts[1];
      
      const usedPromos = JSON.parse(localStorage.getItem(`lyriumUsedPromos_${player.username}`) || '[]');
      if (usedPromos.includes(code)) {
        toast({ title: "Ошибка", description: "Промокод уже использован", variant: "destructive" });
        setChatInput('');
        return;
      }

      const promo = PROMOCODES[code];
      if (!promo) {
        toast({ title: "Ошибка", description: "Неверный промокод", variant: "destructive" });
        setChatInput('');
        return;
      }

      const updated = { ...player };
      if (promo.coins) updated.coins += promo.coins;
      if (promo.vip) updated.isVIP = true;

      setPlayer(updated);
      usedPromos.push(code);
      localStorage.setItem(`lyriumUsedPromos_${player.username}`, JSON.stringify(usedPromos));

      const sysMsg: ChatMessage = {
        id: Date.now(),
        username: 'СИСТЕМА',
        level: 0,
        message: `🎁 ${player.username} активировал промокод!${promo.coins ? ` +${promo.coins} монет` : ''}${promo.vip ? ' +VIP' : ''}`,
        timestamp: new Date().toLocaleTimeString('ru-RU'),
        isVIP: false
      };

      setChatMessages([...chatMessages, sysMsg]);
      toast({ title: "Промокод активирован!", description: promo.vip ? "VIP статус!" : `+${promo.coins} монет` });
      setChatInput('');
      return;
    }

    if (parts[0].toLowerCase() === '/duel' && parts.length === 3) {
      const targetUser = parts[1];
      const bet = parseInt(parts[2]);

      if (isNaN(bet) || bet <= 0) {
        toast({ title: "Ошибка", description: "Неверная ставка", variant: "destructive" });
        setChatInput('');
        return;
      }

      if (player.coins < bet) {
        toast({ title: "Ошибка", description: "Недостаточно монет", variant: "destructive" });
        setChatInput('');
        return;
      }

      const allPlayers = JSON.parse(localStorage.getItem('lyriumAllPlayers') || '[]');
      const opponent = allPlayers.find((p: Player) => p.username === targetUser);

      if (!opponent) {
        toast({ title: "Ошибка", description: "Игрок не найден", variant: "destructive" });
        setChatInput('');
        return;
      }

      if (opponent.coins < bet) {
        toast({ title: "Ошибка", description: "У противника недостаточно монет", variant: "destructive" });
        setChatInput('');
        return;
      }

      const playerStats = getTotalStats();
      const opponentInv = JSON.parse(localStorage.getItem(`lyriumInventory_${opponent.username}`) || '[]');
      const opponentEquipped = opponentInv.filter((i: InventoryItem) => i.equipped);
      const opponentAttack = opponent.attack + opponentEquipped.reduce((sum: number, i: InventoryItem) => sum + i.attackBonus, 0);
      const opponentDefense = opponent.defense + opponentEquipped.reduce((sum: number, i: InventoryItem) => sum + i.defenseBonus, 0);

      const playerPower = playerStats.attack + playerStats.defense;
      const opponentPower = opponentAttack + opponentDefense;
      const totalPower = playerPower + opponentPower;
      const winChance = playerPower / totalPower;

      const won = Math.random() < winChance;

      const updatedPlayers = allPlayers.map((p: Player) => {
        if (p.username === player.username) {
          return {
            ...p,
            coins: won ? p.coins + bet : p.coins - bet,
            pvpWins: won ? p.pvpWins + 1 : p.pvpWins,
            pvpLosses: won ? p.pvpLosses : p.pvpLosses + 1,
            weeklyScore: won ? p.weeklyScore + 50 : p.weeklyScore,
            experience: p.experience + 30
          };
        }
        if (p.username === targetUser) {
          return {
            ...p,
            coins: won ? p.coins - bet : p.coins + bet,
            pvpWins: won ? p.pvpWins : p.pvpWins + 1,
            pvpLosses: won ? p.pvpLosses + 1 : p.pvpLosses
          };
        }
        return p;
      });

      localStorage.setItem('lyriumAllPlayers', JSON.stringify(updatedPlayers));
      setPlayer(updatedPlayers.find((p: Player) => p.username === player.username));

      const sysMsg: ChatMessage = {
        id: Date.now(),
        username: 'АРЕНА',
        level: 0,
        message: `⚔️ Дуэль: ${player.username} VS ${targetUser} (ставка ${bet} монет) - ${won ? `Победил ${player.username}!` : `Победил ${targetUser}!`}`,
        timestamp: new Date().toLocaleTimeString('ru-RU'),
        isVIP: false
      };

      setChatMessages([...chatMessages, sysMsg]);
      toast({ 
        title: won ? "🏆 ПОБЕДА!" : "💀 ПОРАЖЕНИЕ", 
        description: won ? `+${bet} монет` : `-${bet} монет` 
      });
      setChatInput('');
      return;
    }

    if (parts[0].toLowerCase() === '/trade' && parts.length === 2) {
      const targetUser = parts[1];
      
      const allPlayers = JSON.parse(localStorage.getItem('lyriumAllPlayers') || '[]');
      const targetPlayer = allPlayers.find((p: Player) => p.username === targetUser);

      if (!targetPlayer) {
        toast({ title: "Ошибка", description: "Игрок не найден", variant: "destructive" });
        setChatInput('');
        return;
      }

      const newTrade: TradeRequest = {
        from: player.username,
        to: targetUser,
        timestamp: Date.now(),
        fromItems: [],
        toItems: [],
        status: 'pending'
      };

      setTradeRequest(newTrade);
      setTradeItems({ my: [], their: [] });

      const sysMsg: ChatMessage = {
        id: Date.now(),
        username: 'СИСТЕМА',
        level: 0,
        message: `🤝 ${player.username} отправил запрос на трейд игроку ${targetUser}`,
        timestamp: new Date().toLocaleTimeString('ru-RU'),
        isVIP: false
      };

      setChatMessages([...chatMessages, sysMsg]);
      toast({ title: "Запрос отправлен", description: "Ждем ответа игрока" });
      setChatInput('');
      return;
    }

    const newMessage: ChatMessage = {
      id: Date.now(),
      username: player.username,
      level: player.level,
      message: chatInput,
      timestamp: new Date().toLocaleTimeString('ru-RU'),
      isVIP: player.isVIP
    };

    setChatMessages([...chatMessages, newMessage]);
    setChatInput('');
  };

  const buyItem = (item: ShopItem) => {
    if (!player) return;

    if (player.coins < item.priceCoins) {
      toast({ title: "Недостаточно монет!", variant: "destructive" });
      return;
    }
    setPlayer({ ...player, coins: player.coins - item.priceCoins });

    const invItem: InventoryItem = { ...item, quantity: 1, equipped: false };
    const existing = inventory.find(i => i.id === item.id);
    if (existing) {
      setInventory(inventory.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setInventory([...inventory, invItem]);
    }

    toast({ title: "Куплено!", description: item.name });
  };

  const toggleEquip = (itemId: number) => {
    setInventory(inventory.map(i => 
      i.id === itemId ? { ...i, equipped: !i.equipped } : i
    ));
  };

  const usePotion = (item: InventoryItem) => {
    if (!player || item.category !== 'potion') return;
    
    const stats = getTotalStats();
    const newHealth = Math.min(stats.maxHealth, player.health + item.healthBonus);
    setPlayer({ ...player, health: newHealth });
    
    if (item.quantity > 1) {
      setInventory(inventory.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i));
    } else {
      setInventory(inventory.filter(i => i.id !== item.id));
    }
    
    toast({ title: "Использовано!", description: `+${item.healthBonus} HP` });
  };

  const sellToMarket = (itemId: number, price: number) => {
    if (!player) return;

    const item = inventory.find(i => i.id === itemId);
    if (!item || item.quantity < 1) return;

    const marketItem: MarketItem = {
      ...item,
      sellerId: player.username,
      sellerName: player.username,
      price,
      quantity: 1
    };

    setMarketItems([...marketItems, marketItem]);

    if (item.quantity > 1) {
      setInventory(inventory.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i));
    } else {
      setInventory(inventory.filter(i => i.id !== itemId));
    }

    toast({ title: "Выставлено на продажу!", description: `${item.name} за ${price} монет` });
    setSellItemId(null);
    setSellPrice('');
  };

  const buyFromMarket = (marketItem: MarketItem, index: number) => {
    if (!player) return;

    if (player.coins < marketItem.price) {
      toast({ title: "Недостаточно монет!", variant: "destructive" });
      return;
    }

    if (marketItem.sellerId === player.username) {
      toast({ title: "Это твой товар!", variant: "destructive" });
      return;
    }

    setPlayer({ ...player, coins: player.coins - marketItem.price });

    const allPlayers = JSON.parse(localStorage.getItem('lyriumAllPlayers') || '[]');
    const updatedPlayers = allPlayers.map((p: Player) => 
      p.username === marketItem.sellerName ? { ...p, coins: p.coins + marketItem.price } : p
    );
    localStorage.setItem('lyriumAllPlayers', JSON.stringify(updatedPlayers));

    const invItem: InventoryItem = { ...marketItem, quantity: 1, equipped: false };
    const existing = inventory.find(i => i.id === marketItem.id && i.name === marketItem.name);
    if (existing) {
      setInventory(inventory.map(i => 
        (i.id === marketItem.id && i.name === marketItem.name) ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setInventory([...inventory, invItem]);
    }

    setMarketItems(marketItems.filter((_, i) => i !== index));
    toast({ title: "Куплено!", description: marketItem.name });
  };

  const removeFromMarket = (index: number) => {
    if (!player) return;
    
    const item = marketItems[index];
    if (item.sellerId !== player.username) {
      toast({ title: "Это не твой товар!", variant: "destructive" });
      return;
    }

    const invItem: InventoryItem = { ...item, quantity: 1, equipped: false };
    const existing = inventory.find(i => i.id === item.id && i.name === item.name);
    if (existing) {
      setInventory(inventory.map(i => 
        (i.id === item.id && i.name === item.name) ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setInventory([...inventory, invItem]);
    }

    setMarketItems(marketItems.filter((_, i) => i !== index));
    toast({ title: "Снято с продажи!", description: item.name });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500';
      case 'rare': return 'border-blue-500';
      case 'epic': return 'border-purple-500';
      case 'legendary': return 'border-yellow-500';
      default: return 'border-border';
    }
  };

  const getRaceColor = (race: string) => {
    switch (race) {
      case 'warrior': return 'text-red-500';
      case 'mage': return 'text-blue-500';
      case 'archer': return 'text-green-500';
      case 'ghost': return 'text-purple-500';
      case 'demon': return 'text-red-600';
      case 'angel': return 'text-yellow-400';
      case 'dragon': return 'text-orange-500';
      case 'vampire': return 'text-red-700';
      default: return 'text-foreground';
    }
  };

  const getLeaderboard = () => {
    const allPlayers = JSON.parse(localStorage.getItem('lyriumAllPlayers') || '[]');
    return allPlayers
      .sort((a: Player, b: Player) => {
        if (b.level !== a.level) return b.level - a.level;
        return b.experience - a.experience;
      })
      .slice(0, 10);
  };

  const handleLogout = () => {
    setPlayer(null);
    setInventory([]);
    setShowAuth(true);
    setUsername('');
    setPassword('');
    toast({ title: "Выход", description: "До скорой встречи!" });
  };

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Dialog open={showAuth}>
          <DialogContent className="bg-slate-800 border-2 border-purple-500 font-pixel max-w-sm sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl sm:text-2xl md:text-3xl text-purple-400">
                {isLogin ? '🎮 ВХОД' : '✨ РЕГИСТРАЦИЯ'}
              </DialogTitle>
              <DialogDescription className="text-center text-sm sm:text-base text-purple-300">
                LYRIUM MMORPG
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 sm:space-y-4">
              <Input
                placeholder="Никнейм"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                className="font-pixel bg-slate-900 border-purple-500 text-purple-100 h-11 sm:h-12 text-sm sm:text-base touch-manipulation"
              />
              <Input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                className="font-pixel bg-slate-900 border-purple-500 text-purple-100 h-11 sm:h-12 text-sm sm:text-base touch-manipulation"
              />

              <Button 
                onClick={handleAuth} 
                className="w-full bg-purple-600 hover:bg-purple-700 font-pixel h-11 sm:h-12 text-sm sm:text-base touch-manipulation"
              >
                {isLogin ? 'ВОЙТИ' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
              </Button>

              <Button 
                variant="ghost" 
                onClick={() => setIsLogin(!isLogin)}
                className="w-full text-purple-300 hover:text-purple-100 font-pixel h-10 sm:h-12 text-xs sm:text-sm touch-manipulation"
              >
                {isLogin ? 'Нет аккаунта? Зарегистрируйся' : 'Есть аккаунт? Войди'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showRaceSelect} onOpenChange={setShowRaceSelect}>
          <DialogContent className="bg-slate-800 border-2 border-purple-500 font-pixel max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center text-lg sm:text-xl md:text-2xl text-purple-400">Выбери расу</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {RACES.map(race => (
                <Card 
                  key={race.id}
                  className={`bg-slate-900 border-2 ${race.price === 0 ? 'border-purple-500' : 'border-yellow-600'} p-2 sm:p-4 cursor-pointer hover:border-purple-300 transition-all touch-manipulation`}
                  onClick={() => selectRace(race.id)}
                >
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl md:text-5xl mb-1 sm:mb-2">{race.icon}</div>
                    <h3 className="text-sm sm:text-base md:text-xl text-purple-300 mb-1 sm:mb-2">{race.name}</h3>
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-purple-400 mb-1 sm:mb-2">{race.desc}</p>
                    <p className="text-[8px] sm:text-[9px] md:text-xs text-purple-500 mb-1">{race.bonuses}</p>
                    {race.price > 0 && (
                      <Badge className="bg-yellow-700 text-[8px] sm:text-[9px]">💎 {race.price}</Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (!player) return null;

  const stats = getTotalStats();
  const categories = ['all', 'weapon', 'armor', 'potion'];
  const filteredItems = selectedCategory === 'all' 
    ? SHOP_ITEMS 
    : SHOP_ITEMS.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-purple-100 font-pixel p-2 md:p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-3 md:mb-6">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="w-8"></div>
            <h1 className="text-3xl md:text-5xl text-purple-400">⚔️ LYRIUM ⚔️</h1>
            <Button 
              onClick={handleLogout}
              variant="ghost"
              className="text-purple-400 hover:text-purple-100 h-8 w-8 p-0 touch-manipulation"
              title="Выйти"
            >
              <Icon name="LogOut" size={20} />
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1 md:gap-2 text-xs md:text-sm mb-2">
            <Badge className={`${getRaceColor(player.race)} bg-opacity-20 text-base md:text-lg`}>
              {player.avatar} {player.username}
            </Badge>
            <Badge className="bg-purple-700 text-xs md:text-sm">
              Ур.{player.level}
            </Badge>
            <Badge className="bg-yellow-700 text-xs md:text-sm"><Icon name="Coins" size={12} /> {player.coins}</Badge>
            <Badge variant="outline" className="border-red-500 text-red-400 text-xs md:text-sm">⚔️ {stats.attack}</Badge>
            <Badge variant="outline" className="border-blue-500 text-blue-400 text-xs md:text-sm">🛡️ {stats.defense}</Badge>
            <Badge variant="outline" className="border-green-500 text-green-400 text-xs md:text-sm">
              ❤️ {player.health}/{stats.maxHealth}
            </Badge>
            {player.isVIP && <Badge className="bg-gradient-to-r from-yellow-600 to-purple-600">👑 VIP</Badge>}
          </div>
          <div className="max-w-md mx-auto px-2">
            <Progress value={(player.experience / (player.level * 100)) * 100} className="h-2" />
            <div className="text-[9px] md:text-[10px] text-purple-400 mt-1">
              Опыт: {player.experience}/{player.level * 100}
            </div>
          </div>
        </header>

        <Tabs defaultValue="battle" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-3 md:mb-6 bg-slate-800 text-[10px] md:text-xs h-auto">
            <TabsTrigger value="battle" className="py-3 md:py-3 touch-manipulation">⚔️<span className="hidden sm:inline"> PvE</span></TabsTrigger>
            <TabsTrigger value="shop" className="py-3 md:py-3 touch-manipulation">🏪<span className="hidden sm:inline"> Магазин</span></TabsTrigger>
            <TabsTrigger value="inventory" className="py-3 md:py-3 touch-manipulation">🎒<span className="hidden sm:inline"> Инвентарь</span></TabsTrigger>
            <TabsTrigger value="market" className="py-3 md:py-3 touch-manipulation">🛒<span className="hidden sm:inline"> Рынок</span></TabsTrigger>
            <TabsTrigger value="chat" className="py-3 md:py-3 touch-manipulation">💬<span className="hidden sm:inline"> Чат</span></TabsTrigger>
            <TabsTrigger value="leaderboard" className="py-3 md:py-3 touch-manipulation">🏆<span className="hidden sm:inline"> Топ</span></TabsTrigger>
          </TabsList>

          <TabsContent value="battle">
            <Card className="bg-slate-800 border-2 border-purple-500 p-3 md:p-6">
              {!inBattle ? (
                <div className="text-center">
                  <div className="text-4xl md:text-6xl mb-3 md:mb-4">⚔️</div>
                  <h2 className="text-lg md:text-2xl mb-3 md:mb-4 text-purple-300">Найти противника</h2>
                  <Button 
                    onClick={generateMob} 
                    className="bg-purple-600 hover:bg-purple-700 text-base md:text-lg px-8 py-6 md:px-8 md:py-6 touch-manipulation"
                  >
                    ИСКАТЬ БОЙ
                  </Button>
                </div>
              ) : currentMob && (
                <div>
                  <div className="text-center mb-3 md:mb-4">
                    {currentMob.icon.startsWith('http') ? (
                      <img src={currentMob.icon} alt={currentMob.name} className="w-20 h-20 md:w-32 md:h-32 mx-auto mb-2 pixelated" style={{imageRendering: 'pixelated'}} />
                    ) : (
                      <div className="text-4xl md:text-6xl mb-2">{currentMob.icon}</div>
                    )}
                    <h3 className="text-base md:text-xl text-purple-300 mb-2">{currentMob.name}</h3>
                    {currentMob.isBoss && <Badge className="bg-red-600 mb-2 text-xs">👑 БОСС</Badge>}
                    <Progress value={(currentMob.health / currentMob.maxHealth) * 100} className="h-3 md:h-4 mb-2" />
                    <div className="text-xs md:text-sm text-purple-400">
                      ❤️ {currentMob.health}/{currentMob.maxHealth}
                    </div>
                  </div>

                  <ScrollArea className="h-24 md:h-32 bg-slate-900 p-2 md:p-3 mb-3 md:mb-4 border border-purple-500">
                    {battleLog.map((log, i) => (
                      <div key={i} className="text-[10px] md:text-xs text-purple-300 mb-1">{log}</div>
                    ))}
                  </ScrollArea>

                  <Button 
                    onClick={attackMob} 
                    className="w-full bg-red-600 hover:bg-red-700 text-base md:text-lg py-6 md:py-6 touch-manipulation"
                  >
                    ⚔️ АТАКОВАТЬ
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="shop">
            <div className="mb-2 md:mb-4 flex gap-1 md:gap-2 flex-wrap justify-center">
              {categories.map(cat => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className="cursor-pointer text-[10px] md:text-xs py-2 md:py-2 px-3 md:px-3 touch-manipulation"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat.toUpperCase()}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
              {filteredItems.map(item => (
                <Card key={item.id} className={`bg-slate-800 border-2 ${getRarityColor(item.rarity)} p-2 md:p-3`}>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl mb-1 md:mb-2">{item.icon}</div>
                    <h3 className="text-[9px] md:text-[10px] font-bold mb-1 text-purple-300">{item.name}</h3>
                    <p className="text-[8px] md:text-[9px] text-purple-400 mb-1">{item.description}</p>
                    
                    {(item.attackBonus > 0 || item.defenseBonus > 0 || item.healthBonus > 0) && (
                      <div className="flex justify-center gap-1 mb-1 text-[8px] md:text-[9px]">
                        {item.attackBonus > 0 && <Badge className="text-[8px] md:text-[9px] bg-red-700">+{item.attackBonus}⚔️</Badge>}
                        {item.defenseBonus > 0 && <Badge className="text-[8px] md:text-[9px] bg-blue-700">+{item.defenseBonus}🛡️</Badge>}
                        {item.healthBonus > 0 && <Badge className="text-[8px] md:text-[9px] bg-green-700">+{item.healthBonus}❤️</Badge>}
                      </div>
                    )}

                    <div className="text-[10px] md:text-xs mb-1 md:mb-2 text-purple-300">
                      🪙 {item.priceCoins}
                    </div>

                    <Button 
                      onClick={() => buyItem(item)} 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-[9px] md:text-[10px] py-4 md:py-4 touch-manipulation"
                    >
                      КУПИТЬ
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            {inventory.length === 0 ? (
              <div className="text-center py-6 md:py-12">
                <div className="text-4xl md:text-6xl mb-3 md:mb-4">🎒</div>
                <p className="text-purple-400 text-sm md:text-base">Инвентарь пуст</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                {inventory.map(item => (
                  <Card key={item.id} className={`bg-slate-800 border-2 ${item.equipped ? 'border-green-500' : getRarityColor(item.rarity)} p-2 md:p-3`}>
                    <div className="text-center">
                      <div className="text-2xl md:text-3xl mb-1 md:mb-2">{item.icon}</div>
                      <h3 className="text-[9px] md:text-[10px] font-bold text-purple-300 mb-1">{item.name}</h3>
                      <Badge className="text-[8px] md:text-[9px] bg-slate-700 mb-1">x{item.quantity}</Badge>
                      
                      {(item.attackBonus > 0 || item.defenseBonus > 0 || item.healthBonus > 0) && (
                        <div className="flex justify-center gap-1 mb-1 text-[8px] md:text-[9px]">
                          {item.attackBonus > 0 && <Badge className="text-[8px] md:text-[9px] bg-red-700">+{item.attackBonus}⚔️</Badge>}
                          {item.defenseBonus > 0 && <Badge className="text-[8px] md:text-[9px] bg-blue-700">+{item.defenseBonus}🛡️</Badge>}
                          {item.healthBonus > 0 && <Badge className="text-[8px] md:text-[9px] bg-green-700">+{item.healthBonus}❤️</Badge>}
                        </div>
                      )}

                      <div className="flex flex-col gap-1">
                        {item.category === 'potion' ? (
                          <Button 
                            onClick={() => usePotion(item)} 
                            className="w-full bg-green-600 hover:bg-green-700 text-[9px] md:text-[10px] py-4 touch-manipulation"
                          >
                            ИСПОЛЬЗОВАТЬ
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => toggleEquip(item.id)} 
                            className={`w-full text-[9px] md:text-[10px] py-4 touch-manipulation ${item.equipped ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                          >
                            {item.equipped ? 'СНЯТЬ' : 'НАДЕТЬ'}
                          </Button>
                        )}
                        
                        {sellItemId === item.id ? (
                          <div className="flex gap-1">
                            <Input
                              type="number"
                              placeholder="Цена"
                              value={sellPrice}
                              onChange={(e) => setSellPrice(e.target.value)}
                              className="h-8 text-xs"
                            />
                            <Button 
                              onClick={() => {
                                const price = parseInt(sellPrice);
                                if (price > 0) sellToMarket(item.id, price);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-[9px] py-4 px-2 touch-manipulation"
                            >
                              ОК
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => setSellItemId(item.id)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-[9px] md:text-[10px] py-4 touch-manipulation"
                          >
                            ПРОДАТЬ
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="market">
            <Card className="bg-slate-800 border-2 border-purple-500 p-3 md:p-6">
              <h2 className="text-xl md:text-2xl mb-4 text-purple-300 text-center">🛒 Торговая площадка</h2>
              
              {marketItems.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-purple-400">Нет товаров на продажу</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                  {marketItems.map((item, index) => (
                    <Card key={index} className={`bg-slate-900 border-2 ${getRarityColor(item.rarity)} p-2 md:p-3`}>
                      <div className="text-center">
                        <div className="text-2xl md:text-3xl mb-1">{item.icon}</div>
                        <h3 className="text-[9px] md:text-[10px] font-bold text-purple-300 mb-1">{item.name}</h3>
                        <p className="text-[8px] text-purple-500 mb-1">Продавец: {item.sellerName}</p>
                        
                        {(item.attackBonus > 0 || item.defenseBonus > 0 || item.healthBonus > 0) && (
                          <div className="flex justify-center gap-1 mb-1">
                            {item.attackBonus > 0 && <Badge className="text-[8px] bg-red-700">+{item.attackBonus}⚔️</Badge>}
                            {item.defenseBonus > 0 && <Badge className="text-[8px] bg-blue-700">+{item.defenseBonus}🛡️</Badge>}
                            {item.healthBonus > 0 && <Badge className="text-[8px] bg-green-700">+{item.healthBonus}❤️</Badge>}
                          </div>
                        )}

                        <div className="text-[10px] md:text-xs mb-2 text-yellow-400">
                          💰 {item.price} монет
                        </div>

                        {item.sellerId === player?.username ? (
                          <Button 
                            onClick={() => removeFromMarket(index)}
                            className="w-full bg-red-600 hover:bg-red-700 text-[9px] md:text-[10px] py-4 touch-manipulation"
                          >
                            СНЯТЬ
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => buyFromMarket(item, index)}
                            className="w-full bg-green-600 hover:bg-green-700 text-[9px] md:text-[10px] py-4 touch-manipulation"
                          >
                            КУПИТЬ
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <Card className="bg-slate-800 border-2 border-purple-500 p-3 md:p-6">
              <ScrollArea className="h-64 md:h-96 mb-3 md:mb-4 p-2 md:p-3 bg-slate-900 border border-purple-500">
                {chatMessages.map(msg => (
                  <div key={msg.id} className="mb-2 md:mb-3">
                    <div className="flex items-center gap-1 md:gap-2 mb-1">
                      <Badge variant="outline" className="text-[8px] md:text-[9px]">
                        Ур.{msg.level}
                      </Badge>
                      <span className={`text-[9px] md:text-[10px] font-bold ${msg.isVIP ? 'text-yellow-400' : 'text-purple-300'}`}>
                        {msg.isVIP && '👑 '}{msg.username}
                      </span>
                      <span className="text-[7px] md:text-[8px] text-purple-500">{msg.timestamp}</span>
                    </div>
                    <p className="text-[9px] md:text-xs text-purple-100 ml-1 md:ml-2">{msg.message}</p>
                  </div>
                ))}
              </ScrollArea>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Введи сообщение..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="font-pixel bg-slate-900 border-purple-500 text-purple-100 h-12 touch-manipulation"
                  />
                  <Button 
                    onClick={sendMessage} 
                    className="bg-purple-600 hover:bg-purple-700 h-12 px-6 touch-manipulation"
                  >
                    ➤
                  </Button>
                </div>
                
                <div className="text-[8px] md:text-[9px] text-purple-400 space-y-1">
                  <p>• /дб [ник] [сумма] - передать монеты</p>
                  <p>• /promo [код] - активировать промокод</p>
                  <p>• /duel [ник] [ставка] - дуэль на монеты</p>
                  <p>• /trade [ник] - предложить обмен предметами</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card className="bg-slate-800 border-2 border-purple-500 p-3 md:p-6">
              <h2 className="text-xl md:text-2xl mb-4 text-purple-300 text-center">🏆 Топ-10 игроков</h2>
              
              <div className="space-y-2">
                {getLeaderboard().map((p, index) => (
                  <Card key={p.username} className="bg-slate-900 border border-purple-700 p-2 md:p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="text-xl md:text-2xl">
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                          {index > 2 && `#${index + 1}`}
                        </div>
                        <div>
                          <div className="flex items-center gap-1 md:gap-2">
                            <span className={`${getRaceColor(p.race)} font-bold text-sm md:text-base`}>
                              {p.avatar} {p.username}
                            </span>
                            {p.isVIP && <Badge className="bg-gradient-to-r from-yellow-600 to-purple-600 text-[7px] md:text-[8px]">VIP</Badge>}
                          </div>
                          <div className="flex gap-2 md:gap-3 text-[8px] md:text-[9px] text-purple-400">
                            <span>Ур.{p.level}</span>
                            <span>⚔️ W/L: {p.pvpWins}/{p.pvpLosses}</span>
                            <span>🏆 {p.weeklyScore}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-purple-700 text-[9px] md:text-[10px]">
                        {p.experience} XP
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-slate-900 border border-purple-500 rounded">
                <h3 className="text-sm md:text-base text-purple-300 mb-2">📅 Еженедельные награды:</h3>
                <div className="text-[9px] md:text-xs text-purple-400 space-y-1">
                  <p>🥇 1 место: +1000 монет</p>
                  <p>🥈 2 место: +500 монет</p>
                  <p>🥉 3 место: +250 монет</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}