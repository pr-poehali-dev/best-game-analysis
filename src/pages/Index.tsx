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
  race: 'warrior' | 'mage' | 'archer' | 'ghost';
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

const RACES = [
  { id: 'warrior', name: 'Воин', icon: '⚔️', desc: 'Мощная атака', bonuses: '+10 Атака, +5 Защита', price: 0 },
  { id: 'mage', name: 'Маг', icon: '🧙', desc: 'Магия', bonuses: '+15 Магия', price: 0 },
  { id: 'archer', name: 'Лучник', icon: '🏹', desc: 'Точность', bonuses: '+12 Точность', price: 0 },
  { id: 'ghost', name: 'Призрак', icon: '👻', desc: 'Эксклюзив', bonuses: '+20 Магия', price: 100 }
];

const SHOP_ITEMS: ShopItem[] = [
  {id: 1, name: 'Деревянный меч', icon: '🗡️', category: 'weapon', rarity: 'common', priceCoins: 50, attackBonus: 5, defenseBonus: 0, healthBonus: 0, description: 'Простое оружие'},
  {id: 2, name: 'Железный меч', icon: '⚔️', category: 'weapon', rarity: 'common', priceCoins: 120, attackBonus: 12, defenseBonus: 0, healthBonus: 0, description: 'Надежный клинок'},
  {id: 3, name: 'Кожаная броня', icon: '🛡️', category: 'armor', rarity: 'common', priceCoins: 60, attackBonus: 0, defenseBonus: 5, healthBonus: 0, description: 'Базовая защита'},
  {id: 4, name: 'Малое зелье', icon: '🧪', category: 'potion', rarity: 'common', priceCoins: 20, attackBonus: 0, defenseBonus: 0, healthBonus: 20, description: '+20 HP'},
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
  const { toast } = useToast();

  useEffect(() => {
    const savedPlayer = localStorage.getItem('lyriumPlayer');
    const savedChat = localStorage.getItem('lyriumChat');
    
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
    if (!race || race.price > 0) return;

    const raceConfig = {
      warrior: { avatar: '⚔️', attack: 20, defense: 10, health: 150 },
      mage: { avatar: '🧙', attack: 10, defense: 5, health: 100 },
      archer: { avatar: '🏹', attack: 15, defense: 7, health: 120 },
      ghost: { avatar: '👻', attack: 15, defense: 8, health: 110 }
    }[raceId] || { avatar: '⚔️', attack: 20, defense: 10, health: 150 };

    const newPlayer: Player = {
      username,
      password,
      race: raceId as any,
      coins: 100,
      gems: 10,
      level: 1,
      experience: 0,
      health: raceConfig.health,
      maxHealth: raceConfig.health,
      attack: raceConfig.attack,
      defense: raceConfig.defense,
      avatar: raceConfig.avatar,
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
    
    const mobData = {
      id: Date.now(),
      name: isBoss ? `БОСС Ур.${mobLevel}` : `Моб Ур.${mobLevel}`,
      icon: isBoss ? '👑' : ['🟢', '👹', '💀'][Math.floor(Math.random() * 3)],
      level: mobLevel,
      isBoss,
      health: isBoss ? mobLevel * 200 : mobLevel * 20,
      maxHealth: isBoss ? mobLevel * 200 : mobLevel * 20,
      attack: isBoss ? 0 : mobLevel * 3,
      defense: isBoss ? mobLevel * 5 : mobLevel * 2,
      coinsReward: isBoss ? mobLevel * 30 : Math.max(2, Math.floor(mobLevel * 1.5))
    };

    setCurrentMob(mobData);
    setInBattle(true);
    setBattleLog([`⚔️ Началась битва с ${mobData.name}!`]);
  };

  const getTotalStats = () => {
    if (!player) return { attack: 0, defense: 0, maxHealth: 0 };
    const bonuses = {
      attack: inventory.filter(i => i.equipped).reduce((sum, i) => sum + i.attackBonus, 0),
      defense: inventory.filter(i => i.equipped).reduce((sum, i) => sum + i.defenseBonus, 0),
      health: inventory.filter(i => i.equipped).reduce((sum, i) => sum + i.healthBonus, 0)
    };
    return {
      attack: player.attack + bonuses.attack,
      defense: player.defense + bonuses.defense,
      maxHealth: player.maxHealth + bonuses.health
    };
  };

  const attackMob = () => {
    if (!currentMob || !player) return;

    const stats = getTotalStats();
    const playerDamage = Math.max(1, stats.attack - currentMob.defense);
    const mobDamage = currentMob.isBoss ? 0 : Math.max(0, currentMob.attack - stats.defense);

    const newMobHealth = currentMob.health - playerDamage;
    const newPlayerHealth = player.health - mobDamage;

    setBattleLog(prev => [...prev, 
      `💥 Ты нанес ${playerDamage} урона!`,
      currentMob.isBoss ? '🛡️ Босс не атакует!' : (mobDamage > 0 ? `🩸 Получено ${mobDamage} урона!` : '🛡️ Блок!')
    ]);

    if (newMobHealth <= 0) {
      const exp = currentMob.level * (currentMob.isBoss ? 100 : 20);
      const newExp = player.experience + exp;
      const levelUp = newExp >= player.level * 100;

      const updatedPlayer = {
        ...player,
        coins: player.coins + currentMob.coinsReward,
        experience: levelUp ? newExp - player.level * 100 : newExp,
        level: levelUp ? player.level + 1 : player.level,
        weeklyScore: player.weeklyScore + exp
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

      setBattleLog(prev => [...prev, `🎉 ПОБЕДА! +${exp} опыта, +${currentMob.coinsReward} монет`]);
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
    
    if (parts[0].toLowerCase() === '/send' && parts.length === 3) {
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

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Dialog open={showAuth}>
          <DialogContent className="bg-slate-800 border-2 border-purple-500 font-pixel max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl md:text-3xl text-purple-400">
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
                className="font-pixel bg-slate-900 border-purple-500 text-purple-100 h-10 md:h-12 text-sm md:text-base"
              />
              <Input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-pixel bg-slate-900 border-purple-500 text-purple-100 h-10 md:h-12 text-sm md:text-base"
              />
              <Button onClick={handleAuth} className="w-full bg-purple-600 hover:bg-purple-700 font-pixel h-10 md:h-12 text-sm md:text-base">
                {isLogin ? 'ВОЙТИ' : 'ДАЛЕЕ'}
              </Button>
              <Button
                onClick={() => setIsLogin(!isLogin)}
                variant="outline"
                className="w-full font-pixel border-purple-500 text-purple-300 h-10 md:h-12 text-sm md:text-base"
              >
                {isLogin ? 'Создать аккаунт' : 'Уже есть аккаунт'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showRaceSelect} onOpenChange={setShowRaceSelect}>
          <DialogContent className="bg-slate-800 border-2 border-purple-500 font-pixel max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-center text-xl md:text-2xl text-purple-400">ВЫБЕРИ РАСУ</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {RACES.map(race => (
                <Card
                  key={race.id}
                  onClick={() => selectRace(race.id)}
                  className="bg-slate-900 border-2 border-purple-500 hover:border-purple-300 cursor-pointer p-3 md:p-4 transition-all hover:scale-105"
                >
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl mb-2">{race.icon}</div>
                    <h3 className="text-sm md:text-lg font-bold text-purple-300 mb-1">{race.name}</h3>
                    {race.price > 0 && <Badge className="bg-pink-600 mb-2 text-xs">🔥 {race.price}₽</Badge>}
                    <p className="text-[10px] md:text-xs text-purple-400 mb-2">{race.desc}</p>
                    <p className="text-[9px] md:text-[10px] text-purple-500">{race.bonuses}</p>
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

  const categories = ['all', 'weapon', 'armor', 'potion'];
  const filteredItems = selectedCategory === 'all' ? SHOP_ITEMS : SHOP_ITEMS.filter(i => i.category === selectedCategory);
  const stats = getTotalStats();
  const leaderboard = getLeaderboard();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 font-pixel text-purple-100">
      <div className="container mx-auto px-2 md:px-4 py-3 md:py-6">
        <header className="text-center mb-3 md:mb-6">
          <h1 className="text-2xl md:text-4xl mb-2 md:mb-3 text-purple-400 flex items-center justify-center gap-2">
            <span className="text-2xl md:text-4xl">{player.avatar}</span>
            LYRIUM
            {player.isVIP && <Badge className="bg-pink-600 text-[9px] md:text-xs">⭐ VIP</Badge>}
          </h1>
          <div className="flex justify-center gap-1 md:gap-2 flex-wrap text-[9px] md:text-xs mb-2">
            <Badge className={`${getRaceColor(player.race)} bg-slate-800 border`}>
              Ур.{player.level}
            </Badge>
            <Badge className="bg-yellow-700"><Icon name="Coins" size={12} /> {player.coins}</Badge>
            <Badge variant="outline" className="border-red-500 text-red-400">⚔️ {stats.attack}</Badge>
            <Badge variant="outline" className="border-blue-500 text-blue-400">🛡️ {stats.defense}</Badge>
            <Badge variant="outline" className="border-green-500 text-green-400">
              ❤️ {player.health}/{stats.maxHealth}
            </Badge>
          </div>
          <div className="max-w-md mx-auto px-2">
            <Progress value={(player.experience / (player.level * 100)) * 100} className="h-2" />
            <div className="text-[9px] md:text-[10px] text-purple-400 mt-1">
              Опыт: {player.experience}/{player.level * 100}
            </div>
          </div>
        </header>

        <Tabs defaultValue="battle" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-3 md:mb-6 bg-slate-800 text-[8px] md:text-[10px] h-auto">
            <TabsTrigger value="battle" className="py-2 md:py-3">⚔️<span className="hidden md:inline"> PvE</span></TabsTrigger>
            <TabsTrigger value="pvp" className="py-2 md:py-3">🔥<span className="hidden md:inline"> PvP</span></TabsTrigger>
            <TabsTrigger value="shop" className="py-2 md:py-3">🏪<span className="hidden md:inline"> Магазин</span></TabsTrigger>
            <TabsTrigger value="inventory" className="py-2 md:py-3">🎒<span className="hidden md:inline"> Снаряжение</span></TabsTrigger>
            <TabsTrigger value="chat" className="py-2 md:py-3">💬<span className="hidden md:inline"> Чат</span></TabsTrigger>
            <TabsTrigger value="leaderboard" className="py-2 md:py-3">🏆<span className="hidden md:inline"> Топ</span></TabsTrigger>
          </TabsList>

          <TabsContent value="battle">
            <Card className="bg-slate-800 border-2 border-purple-500 p-3 md:p-6">
              {!inBattle ? (
                <div className="text-center">
                  <div className="text-4xl md:text-6xl mb-3 md:mb-4">⚔️</div>
                  <h2 className="text-lg md:text-2xl mb-3 md:mb-4 text-purple-300">Найти противника</h2>
                  <Button onClick={generateMob} className="bg-purple-600 hover:bg-purple-700 text-sm md:text-lg px-6 md:px-8 h-10 md:h-12">
                    ИСКАТЬ БОЙ
                  </Button>
                </div>
              ) : currentMob && (
                <div>
                  <div className="text-center mb-3 md:mb-4">
                    <div className="text-4xl md:text-6xl mb-2">{currentMob.icon}</div>
                    <h3 className="text-base md:text-xl text-purple-300 mb-2">{currentMob.name}</h3>
                    {currentMob.isBoss && <Badge className="bg-red-600 mb-2 text-xs">👑 БОСС</Badge>}
                    <Progress value={(currentMob.health / currentMob.maxHealth) * 100} className="h-3 md:h-4 mb-2" />
                    <div className="text-xs md:text-sm text-purple-400">
                      ❤️ {currentMob.health}/{currentMob.maxHealth}
                    </div>
                  </div>

                  <ScrollArea className="h-20 md:h-32 bg-slate-900 p-2 md:p-3 mb-3 md:mb-4 border border-purple-500">
                    {battleLog.map((log, i) => (
                      <div key={i} className="text-[9px] md:text-xs text-purple-300 mb-1">{log}</div>
                    ))}
                  </ScrollArea>

                  <Button onClick={attackMob} className="w-full bg-red-600 hover:bg-red-700 text-sm md:text-lg h-10 md:h-12">
                    ⚔️ АТАКОВАТЬ
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="pvp">
            <Card className="bg-slate-800 border-2 border-purple-500 p-3 md:p-6">
              <div className="text-center">
                <div className="text-4xl md:text-6xl mb-3 md:mb-4">🔥</div>
                <h2 className="text-lg md:text-2xl mb-3 md:mb-4 text-purple-300">PvP Арена</h2>
                <p className="text-xs md:text-sm text-purple-400 mb-4">
                  Используй команду /duel [ник] [ставка] в чате
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="shop">
            <div className="mb-2 md:mb-4 flex gap-1 md:gap-2 flex-wrap justify-center">
              {categories.map(cat => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className="cursor-pointer text-[9px] md:text-xs py-1 md:py-2 px-2 md:px-3"
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
                    <h3 className="text-[8px] md:text-[9px] font-bold mb-1 text-purple-300">{item.name}</h3>
                    <p className="text-[7px] md:text-[8px] text-purple-400 mb-1">{item.description}</p>
                    
                    {(item.attackBonus > 0 || item.defenseBonus > 0 || item.healthBonus > 0) && (
                      <div className="flex justify-center gap-1 mb-1 text-[7px] md:text-[8px]">
                        {item.attackBonus > 0 && <Badge className="text-[7px] md:text-[8px] bg-red-700">+{item.attackBonus}⚔️</Badge>}
                        {item.defenseBonus > 0 && <Badge className="text-[7px] md:text-[8px] bg-blue-700">+{item.defenseBonus}🛡️</Badge>}
                        {item.healthBonus > 0 && <Badge className="text-[7px] md:text-[8px] bg-green-700">+{item.healthBonus}❤️</Badge>}
                      </div>
                    )}

                    <div className="text-[9px] md:text-xs mb-1 md:mb-2 text-purple-300">
                      🪙 {item.priceCoins}
                    </div>

                    <Button onClick={() => buyItem(item)} size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-[8px] md:text-[9px] h-7 md:h-8">
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
                      <h3 className="text-[8px] md:text-[9px] font-bold text-purple-300 mb-1">{item.name}</h3>
                      <Badge className="text-[7px] md:text-[8px] bg-slate-700 mb-1">x{item.quantity}</Badge>
                      
                      {(item.attackBonus > 0 || item.defenseBonus > 0 || item.healthBonus > 0) && (
                        <div className="flex justify-center gap-1 mb-1 text-[7px] md:text-[8px]">
                          {item.attackBonus > 0 && <Badge className="text-[7px] md:text-[8px] bg-red-700">+{item.attackBonus}⚔️</Badge>}
                          {item.defenseBonus > 0 && <Badge className="text-[7px] md:text-[8px] bg-blue-700">+{item.defenseBonus}🛡️</Badge>}
                          {item.healthBonus > 0 && <Badge className="text-[7px] md:text-[8px] bg-green-700">+{item.healthBonus}❤️</Badge>}
                        </div>
                      )}

                      {item.category === 'potion' ? (
                        <Button onClick={() => usePotion(item)} size="sm" className="w-full bg-green-600 hover:bg-green-700 text-[8px] md:text-[9px] h-7 md:h-8">
                          ИСПОЛЬЗОВАТЬ
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => toggleEquip(item.id)} 
                          size="sm" 
                          className={`w-full text-[8px] md:text-[9px] h-7 md:h-8 ${item.equipped ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                          {item.equipped ? 'СНЯТЬ' : 'НАДЕТЬ'}
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat">
            <Card className="bg-slate-800 border-2 border-purple-500 p-3 md:p-6">
              <h2 className="text-base md:text-2xl mb-2 md:mb-4 text-purple-300 text-center">💬 Глобальный чат</h2>
              
              <div className="mb-2 md:mb-4 p-2 md:p-3 bg-slate-900 border border-purple-600 rounded text-[8px] md:text-xs text-purple-300">
                <div className="font-bold mb-1">Команды:</div>
                <div>/send [ник] [сумма] - передать монеты</div>
                <div>/promo [код] - активировать промокод</div>
                <div>/duel [ник] [ставка] - вызвать на дуэль</div>
                <div>/trade [ник] - открыть обмен</div>
                <div>/sell [id] [цена] [ник] - продать предмет</div>
              </div>

              <ScrollArea className="h-48 md:h-80 bg-slate-900 p-2 md:p-3 mb-2 md:mb-4 border border-purple-500">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="mb-2 pb-2 border-b border-purple-800">
                    <div className="flex items-center gap-1 md:gap-2 mb-1">
                      <span className="font-bold text-[9px] md:text-xs text-purple-400">
                        {msg.username}
                      </span>
                      {msg.isVIP && <Badge className="bg-pink-600 text-[7px] md:text-[8px]">VIP</Badge>}
                      <Badge className="text-[7px] md:text-[8px]">Ур.{msg.level}</Badge>
                      <span className="text-[7px] md:text-[9px] text-purple-500">{msg.timestamp}</span>
                    </div>
                    <div className="text-[8px] md:text-xs text-purple-200">{msg.message}</div>
                  </div>
                ))}
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  placeholder="Сообщение или команда..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="font-pixel bg-slate-900 border-purple-500 text-purple-100 text-xs md:text-sm h-9 md:h-12"
                />
                <Button onClick={sendMessage} className="bg-purple-600 hover:bg-purple-700 h-9 md:h-12 px-3 md:px-6">
                  <Icon name="Send" size={14} />
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card className="bg-slate-800 border-2 border-purple-500 p-3 md:p-6">
              <h2 className="text-lg md:text-2xl mb-3 md:mb-4 text-purple-300 text-center">🏆 ТОП-10 ИГРОКОВ</h2>

              <div className="space-y-2">
                {leaderboard.map((p, index) => (
                  <div 
                    key={p.username} 
                    className={`p-2 md:p-3 rounded border-2 ${
                      index === 0 ? 'bg-yellow-900 border-yellow-500' : 
                      index === 1 ? 'bg-gray-700 border-gray-400' : 
                      index === 2 ? 'bg-orange-900 border-orange-600' : 
                      'bg-slate-900 border-purple-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="text-lg md:text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                        </div>
                        <div className="text-2xl md:text-3xl">{p.avatar}</div>
                        <div>
                          <div className="font-bold text-xs md:text-base text-purple-200">{p.username}</div>
                          <div className="text-[9px] md:text-xs text-purple-400">
                            {p.race?.toUpperCase() || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-purple-700 mb-1 text-[9px] md:text-xs">Ур.{p.level}</Badge>
                        <div className="text-[8px] md:text-[10px] text-purple-400">Опыт: {p.experience}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
