import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface DonatItem {
  id: number;
  name: string;
  price: number;
  icon: string;
  description: string;
  category: 'premium' | 'currency' | 'cosmetic';
}

const donatItems: DonatItem[] = [
  { id: 1, name: 'Premium Pack', price: 299, icon: '👑', description: 'VIP статус на месяц', category: 'premium' },
  { id: 2, name: 'Mega Coins', price: 499, icon: '💰', description: '10000 игровых монет', category: 'currency' },
  { id: 3, name: 'Epic Skin', price: 199, icon: '🎨', description: 'Эксклюзивный скин', category: 'cosmetic' },
  { id: 4, name: 'Super Pack', price: 799, icon: '⭐', description: 'Все преимущества', category: 'premium' },
  { id: 5, name: 'Gold Rush', price: 999, icon: '🏆', description: '25000 монет + бонусы', category: 'currency' },
  { id: 6, name: 'Legendary Skin', price: 399, icon: '🔥', description: 'Легендарный скин', category: 'cosmetic' },
  { id: 7, name: 'Starter Pack', price: 99, icon: '🎮', description: 'Стартовый набор', category: 'premium' },
  { id: 8, name: 'Coin Boost', price: 149, icon: '💎', description: '5000 монет', category: 'currency' },
  { id: 9, name: 'Rare Skin', price: 249, icon: '✨', description: 'Редкий скин', category: 'cosmetic' },
  { id: 10, name: 'Ultimate Pack', price: 1499, icon: '🚀', description: 'Максимум возможностей', category: 'premium' },
];

export default function Index() {
  const [selectedItem, setSelectedItem] = useState<DonatItem | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const { toast } = useToast();

  const handleBuyClick = (item: DonatItem) => {
    setSelectedItem(item);
    setShowInstructions(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано!",
      description: "Номер заказа скопирован",
    });
  };

  return (
    <div className="min-h-screen bg-background font-pixel text-foreground">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl mb-4 animate-pixel-bounce text-accent">
            💎 ДОНАТ МАГАЗИН 💎
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Поддержи игру и получи крутые бонусы!
          </p>
        </header>

        <div className="mb-8 flex gap-2 flex-wrap justify-center">
          <Badge variant="outline" className="text-xs border-accent text-accent">
            <Icon name="Crown" size={12} className="mr-1" />
            Premium
          </Badge>
          <Badge variant="outline" className="text-xs border-secondary text-foreground">
            <Icon name="Coins" size={12} className="mr-1" />
            Валюта
          </Badge>
          <Badge variant="outline" className="text-xs border-primary text-foreground">
            <Icon name="Palette" size={12} className="mr-1" />
            Косметика
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {donatItems.map((item) => (
            <Card
              key={item.id}
              className="bg-card border-2 border-border hover:border-primary transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <div className="p-6">
                <div className="text-center mb-4">
                  <div className="text-6xl mb-3 animate-pixel-pulse">{item.icon}</div>
                  <h3 className="text-sm font-bold mb-2">{item.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{item.description}</p>
                  <div className="flex items-center justify-center gap-1 text-accent font-bold text-xl mb-4">
                    <span>{item.price}</span>
                    <Icon name="Ruble" size={20} />
                  </div>
                </div>
                <Button
                  onClick={() => handleBuyClick(item)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs"
                >
                  КУПИТЬ
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
          <DialogContent className="bg-card border-2 border-primary font-pixel max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-lg flex items-center justify-center gap-2">
                <span className="text-3xl">{selectedItem?.icon}</span>
                <span>{selectedItem?.name}</span>
              </DialogTitle>
              <DialogDescription className="text-center text-xs text-muted-foreground">
                {selectedItem?.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="bg-background p-4 border-2 border-border">
                <div className="text-center mb-3">
                  <div className="text-accent text-2xl font-bold mb-2">
                    {selectedItem?.price} ₽
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-accent">1.</span>
                    <p>Перейди в Telegram чат по кнопке ниже</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-accent">2.</span>
                    <p>Напиши номер заказа:</p>
                  </div>
                  <div 
                    className="bg-secondary p-3 text-center cursor-pointer hover:bg-secondary/80 transition-colors"
                    onClick={() => copyToClipboard(`#${selectedItem?.id}-${Date.now()}`)}
                  >
                    <code className="text-accent text-[10px]">
                      #{selectedItem?.id}-{Date.now()}
                    </code>
                    <p className="text-[8px] text-muted-foreground mt-1">Нажми чтобы скопировать</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-accent">3.</span>
                    <p>Следуй инструкциям администратора для оплаты</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-accent">4.</span>
                    <p>После оплаты товар придет автоматически!</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => window.open('https://t.me/LyriumMine', '_blank')}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-xs flex items-center justify-center gap-2"
              >
                <Icon name="Send" size={16} />
                ПЕРЕЙТИ В TELEGRAM
              </Button>

              <Button
                onClick={() => setShowInstructions(false)}
                variant="outline"
                className="w-full text-xs"
              >
                ЗАКРЫТЬ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
