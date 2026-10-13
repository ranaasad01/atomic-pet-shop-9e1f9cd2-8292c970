"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { Pet } from "@/lib/data";

interface ShopItemDef {
  id: string;
  name: string;
  emoji: string;
  price: number;
  type: "food" | "toy";
  petTarget?: string;
  hungerBoost?: number;
  happinessBoost?: number;
}

const INITIAL_PETS: Pet[] = [
  { id: "dog", name: "Buddy", emoji: "🐶", hunger: 60, happiness: 60, color: "#FF9F43", species: "Dog" },
  { id: "cat", name: "Whiskers", emoji: "🐱", hunger: 60, happiness: 60, color: "#A29BFE", species: "Cat" },
  { id: "bunny", name: "Thumper", emoji: "🐰", hunger: 60, happiness: 60, color: "#FD79A8", species: "Bunny" },
  { id: "hamster", name: "Peanut", emoji: "🐹", hunger: 60, happiness: 60, color: "#FDCB6E", species: "Hamster" },
];

const SHOP_ITEMS: ShopItemDef[] = [
  { id: "bone", name: "Bone", emoji: "🦴", price: 10, type: "food", petTarget: "dog", hungerBoost: 20 },
  { id: "fish", name: "Fish", emoji: "🐟", price: 10, type: "food", petTarget: "cat", hungerBoost: 20 },
  { id: "carrot", name: "Carrot", emoji: "🥕", price: 10, type: "food", petTarget: "bunny", hungerBoost: 20 },
  { id: "seeds", name: "Seeds", emoji: "🌰", price: 10, type: "food", petTarget: "hamster", hungerBoost: 20 },
  { id: "ball", name: "Ball", emoji: "🎾", price: 15, type: "toy", happinessBoost: 25 },
  { id: "teddy", name: "Teddy Bear", emoji: "🧸", price: 20, type: "toy", happinessBoost: 35 },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface PetState {
  id: string;
  hunger: number;    // 0–100, higher = more full
  happiness: number; // 0–100
  isAnimating: boolean;
  animationType: "feed" | "play" | "pet" | null;
}

interface ToastMsg {
  id: number;
  text: string;
  emoji: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STARTING_COINS = 100;
const PLAY_HAPPINESS_BOOST = 15;
const PET_HAPPINESS_BOOST = 10;
const HUNGER_DECAY_INTERVAL = 30000; // 30s
const HAPPINESS_DECAY_INTERVAL = 45000; // 45s

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clamp(val: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, val));
}

function initPetStates(pets: Pet[]): PetState[] {
  return pets.map((p) => ({
    id: p.id,
    hunger: 60,
    happiness: 60,
    isAnimating: false,
    animationType: null,
  }));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Bar({
  value,
  color,
  label,
  emoji,
}: {
  value: number;
  color: string;
  label: string;
  emoji: string;
}) {
  const pct = clamp(value);
  const barColor =
    pct > 60 ? color : pct > 30 ? "#FFB347" : "#FF6B6B";

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
          {emoji} {label}
        </span>
        <span className="text-xs font-bold text-gray-500">{Math.round(pct)}%</span>
      </div>
      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function PetCard({
  pet,
  state,
  onFeed,
  onPlay,
  onPet,
  coins,
  shopItems,
}: {
  pet: Pet;
  state: PetState;
  onFeed: (petId: string) => void;
  onPlay: (petId: string) => void;
  onPet: (petId: string) => void;
  coins: number;
  shopItems: ShopItemDef[];
}) {
  const feedItem = shopItems.find(
    (s: ShopItemDef) => s.type === "food" && (s.petTarget === pet.id || !s.petTarget)
  );
  const feedCost = feedItem?.price ?? 10;
  const canFeed = coins >= feedCost;

  const moodEmoji =
    state.happiness >= 70
      ? "😄"
      : state.happiness >= 40
      ? "😊"
      : state.happiness >= 20
      ? "😕"
      : "😢";

  const hungerEmoji =
    state.hunger >= 70
      ? "😋"
      : state.hunger >= 40
      ? "🙂"
      : state.hunger >= 20
      ? "😐"
      : "😩";

  return (
    <motion.div
      layout
      className="relative bg-white rounded-3xl p-5 flex flex-col items-center gap-3 border-4 select-none"
      style={{ borderColor: pet.color }}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Mood badge */}
      <div
        className="absolute -top-3 -right-3 w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-md border-2 border-white"
        style={{ backgroundColor: pet.color }}
      >
        {moodEmoji}
      </div>

      {/* Pet image / emoji */}
      <AnimatePresence mode="wait">
        {state.isAnimating ? (
          <motion.div
            key="anim"
            initial={{ scale: 0.7, rotate: -10 }}
            animate={{ scale: [1.2, 0.9, 1.15, 1], rotate: [10, -8, 6, 0] }}
            exit={{ scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-6xl leading-none"
          >
            {state.animationType === "feed"
              ? feedItem?.emoji ?? "🍖"
              : state.animationType === "play"
              ? "🎾"
              : "💖"}
          </motion.div>
        ) : (
          <motion.div
            key="pet"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-6xl leading-none"
          >
            {pet.emoji}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name */}
      <div className="text-center">
        <p className="text-xl font-black text-gray-800">{pet.name}</p>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          {pet.species}
        </p>
      </div>

      {/* Bars */}
      <div className="w-full">
        <Bar value={state.hunger} color={pet.color} label="Tummy" emoji={hungerEmoji} />
        <Bar value={state.happiness} color={pet.color} label="Happy" emoji="⭐" />
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-3 gap-2 w-full">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => onFeed(pet.id)}
          disabled={!canFeed}
          className="flex flex-col items-center gap-1 py-2 px-1 rounded-2xl font-bold text-white text-xs transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          style={{ backgroundColor: canFeed ? pet.color : "#ccc" }}
          title={`Feed (${feedCost} coins)`}
        >
          <span className="text-xl">{feedItem?.emoji ?? "🍖"}</span>
          <span>Feed</span>
          <span className="text-[10px] opacity-80">{feedCost}🪙</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => onPlay(pet.id)}
          className="flex flex-col items-center gap-1 py-2 px-1 rounded-2xl font-bold text-white text-xs transition-all duration-200 shadow-md"
          style={{ backgroundColor: pet.color }}
        >
          <span className="text-xl">🎾</span>
          <span>Play</span>
          <span className="text-[10px] opacity-80">Free!</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => onPet(pet.id)}
          className="flex flex-col items-center gap-1 py-2 px-1 rounded-2xl font-bold text-white text-xs transition-all duration-200 shadow-md"
          style={{ backgroundColor: pet.color }}
        >
          <span className="text-xl">🤗</span>
          <span>Pet</span>
          <span className="text-[10px] opacity-80">Free!</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

function ShopCard({
  item,
  coins,
  onBuy,
}: {
  item: ShopItemDef;
  coins: number;
  onBuy: (item: ShopItemDef) => void;
}) {
  const canBuy = coins >= item.price;
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.96 }}
      className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 border-2 border-purple-100 shadow-sm cursor-pointer"
      onClick={() => canBuy && onBuy(item)}
    >
      <span className="text-4xl">{item.emoji}</span>
      <p className="font-black text-gray-800 text-sm text-center leading-tight">{item.name}</p>
      <p className="text-xs text-gray-500 text-center">
        {item.type === "food" ? `+${item.hungerBoost} tummy` : `+${item.happinessBoost} happy`}
        {item.petTarget ? ` (for ${INITIAL_PETS.find((p: Pet) => p.id === item.petTarget)?.name ?? item.petTarget})` : " (any pet)"}
      </p>
      <motion.button
        whileTap={{ scale: 0.88 }}
        disabled={!canBuy}
        className="mt-1 px-4 py-1.5 rounded-full font-bold text-sm text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ backgroundColor: canBuy ? "#a855f7" : "#ccc" }}
      >
        {item.price}🪙
      </motion.button>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [pets] = useState<Pet[]>(INITIAL_PETS);
  const [petStates, setPetStates] = useState<PetState[]>(() =>
    initPetStates(INITIAL_PETS)
  );
  const [coins, setCoins] = useState(STARTING_COINS);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [shopItems] = useState<ShopItemDef[]>(SHOP_ITEMS);
  const [activeTab, setActiveTab] = useState<"pets" | "shop">("pets");

  const addToast = useCallback((text: string, emoji: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, emoji }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const updatePetState = useCallback(
    (petId: string, updates: Partial<PetState>) => {
      setPetStates((prev) =>
        prev.map((s: PetState) =>
          s.id === petId ? { ...s, ...updates } : s
        )
      );
    },
    []
  );

  const triggerAnimation = useCallback(
    (petId: string, type: PetState["animationType"]) => {
      updatePetState(petId, { isAnimating: true, animationType: type });
      setTimeout(() => updatePetState(petId, { isAnimating: false, animationType: null }), 700);
    },
    [updatePetState]
  );

  const handleFeed = useCallback(
    (petId: string) => {
      const item = shopItems.find(
        (p: ShopItemDef) => p.type === "food" && (p.petTarget === petId || !p.petTarget)
      );
      const cost = item?.price ?? 10;
      const boost = item?.hungerBoost ?? 20;
      if (coins < cost) return;
      setCoins((c) => c - cost);
      updatePetState(petId, {
        hunger: clamp(
          (petStates.find((p: PetState) => p.id === petId)?.hunger ?? 60) + boost
        ),
      });
      triggerAnimation(petId, "feed");
      addToast(`${pets.find((p: Pet) => p.id === petId)?.name ?? petId} loved the food!`, item?.emoji ?? "🍖");
    },
    [coins, shopItems, petStates, pets, updatePetState, triggerAnimation, addToast]
  );

  const handlePlay = useCallback(
    (petId: string) => {
      updatePetState(petId, {
        happiness: clamp(
          (petStates.find((p: PetState) => p.id === petId)?.happiness ?? 60) + PLAY_HAPPINESS_BOOST
        ),
      });
      triggerAnimation(petId, "play");
      addToast(`${pets.find((p: Pet) => p.id === petId)?.name ?? petId} had a blast!`, "🎾");
    },
    [petStates, pets, updatePetState, triggerAnimation, addToast]
  );

  const handlePet = useCallback(
    (petId: string) => {
      updatePetState(petId, {
        happiness: clamp(
          (petStates.find((p: PetState) => p.id === petId)?.happiness ?? 60) + PET_HAPPINESS_BOOST
        ),
      });
      triggerAnimation(petId, "pet");
      addToast(`${pets.find((p: Pet) => p.id === petId)?.name ?? petId} feels loved!`, "💖");
    },
    [petStates, pets, updatePetState, triggerAnimation, addToast]
  );

  const handleBuy = useCallback(
    (item: ShopItemDef) => {
      if (coins < item.price) return;
      setCoins((c) => c - item.price);
      if (item.type === "food" && item.petTarget) {
        updatePetState(item.petTarget, {
          hunger: clamp(
            (petStates.find((p: PetState) => p.id === item.petTarget)?.hunger ?? 60) +
              (item.hungerBoost ?? 20)
          ),
        });
        triggerAnimation(item.petTarget, "feed");
      } else if (item.type === "toy") {
        setPetStates((prev) =>
          prev.map((p: PetState) => ({
            ...p,
            happiness: clamp(p.happiness + (item.happinessBoost ?? 25)),
          }))
        );
      }
      addToast(`Bought ${item.name}!`, item.emoji);
    },
    [coins, petStates, updatePetState, triggerAnimation, addToast]
  );

  // Decay over time
  useEffect(() => {
    const interval = setInterval(() => {
      setPetStates((prev) =>
        prev.map((p: PetState) => ({
          ...p,
          hunger: clamp(p.hunger - 5),
        }))
      );
    }, HUNGER_DECAY_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPetStates((prev) =>
        prev.map((p: PetState) => ({
          ...p,
          happiness: clamp(p.happiness - 3),
        }))
      );
    }, HAPPINESS_DECAY_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 60, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.8 }}
              className="bg-white rounded-2xl px-4 py-3 shadow-lg border border-purple-100 flex items-center gap-2 text-sm font-bold text-gray-700"
            >
              <span className="text-xl">{toast.emoji}</span>
              {toast.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <Reveal>
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-purple-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="font-black text-xl text-purple-700">Pet Pals</span>
          </div>
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-1.5">
            <span className="text-lg">🪙</span>
            <span className="font-black text-yellow-700 text-lg">{coins}</span>
          </div>
        </header>
      </Reveal>

      {/* Tab nav */}
      <div className="flex gap-2 px-4 pt-4 pb-0">
        {(["pets", "shop"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${
              activeTab === tab
                ? "bg-purple-600 text-white shadow-md"
                : "bg-white text-purple-600 border border-purple-200"
            }`}
          >
            {tab === "pets" ? "🐾 My Pets" : "🛒 Shop"}
          </button>
        ))}
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === "pets" ? (
            <motion.div
              key="pets"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pets.map((pet: Pet, i: number) => {
                  const state = petStates.find((s) => s.id === pet.id);
                  if (!state) return null;
                  return (
                    <Reveal key={pet.id} delay={i * 0.08}>
                      <PetCard
                        pet={pet}
                        state={state}
                        onFeed={handleFeed}
                        onPlay={handlePlay}
                        onPet={handlePet}
                        coins={coins}
                        shopItems={shopItems}
                      />
                    </Reveal>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="shop"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {shopItems.map((item: ShopItemDef, i: number) => (
                  <Reveal key={item.id} delay={i * 0.06}>
                    <ShopCard item={item} coins={coins} onBuy={handleBuy} />
                  </Reveal>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
