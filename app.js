const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ---------------------------------- icon shim (emoji, no dependency) ---------------------------------- */

const EMOJI = {
  Wallet: '👛', Plus: '+', X: '✕', Search: '🔍', Download: '⬇️', Moon: '🌙', Sun: '☀️', Target: '🎯',
  Repeat: '🔁', Settings2: '⚙️', Users: '👥', User: '🙂', ShoppingCart: '🛒', Home: '🏠', Car: '🚗',
  Utensils: '🍽️', Gamepad2: '🎮', Heart: '❤️', Zap: '⚡', Gift: '🎁', MoreHorizontal: '•••',
  TrendingUp: '↗️', TrendingDown: '↘️', RefreshCw: '⟳', Trash2: '🗑️', Pencil: '✏️', PiggyBank: '🐷',
  ChevronRight: '›', ChevronLeft: '‹', Banknote: '💵', ArrowRight: '→', Scale: '⚖️', Check: '✓', ListFilter: '📜', Music: '🎵', Euro: '💶',
};
function makeIconComponent(name) {
  return function IconComp({ size = 16, color }) {
    return <span style={{ fontSize: size, color, lineHeight: 1, display: 'inline-block' }}>{EMOJI[name]}</span>;
  };
}
const Wallet = makeIconComponent('Wallet'), Plus = makeIconComponent('Plus'), X = makeIconComponent('X'),
  Search = makeIconComponent('Search'), Download = makeIconComponent('Download'), Moon = makeIconComponent('Moon'),
  Sun = makeIconComponent('Sun'), Target = makeIconComponent('Target'), Repeat = makeIconComponent('Repeat'),
  Settings2 = makeIconComponent('Settings2'), Users = makeIconComponent('Users'), User = makeIconComponent('User'),
  ShoppingCart = makeIconComponent('ShoppingCart'), Home = makeIconComponent('Home'), Car = makeIconComponent('Car'),
  Utensils = makeIconComponent('Utensils'), Gamepad2 = makeIconComponent('Gamepad2'), Heart = makeIconComponent('Heart'),
  Zap = makeIconComponent('Zap'), Gift = makeIconComponent('Gift'), MoreHorizontal = makeIconComponent('MoreHorizontal'),
  TrendingUp = makeIconComponent('TrendingUp'), TrendingDown = makeIconComponent('TrendingDown'),
  RefreshCw = makeIconComponent('RefreshCw'), Trash2 = makeIconComponent('Trash2'), Pencil = makeIconComponent('Pencil'),
  PiggyBank = makeIconComponent('PiggyBank'), ChevronRight = makeIconComponent('ChevronRight'),
  ChevronLeft = makeIconComponent('ChevronLeft'), Banknote = makeIconComponent('Banknote'),
  ArrowRight = makeIconComponent('ArrowRight'), Scale = makeIconComponent('Scale'), Check = makeIconComponent('Check'),
  ListFilter = makeIconComponent('ListFilter'), Music = makeIconComponent('Music'), Euro = makeIconComponent('Euro');

/* ---------------------------------- firebase-backed storage shim ---------------------------------- */

function useFirebaseReady() {
  const [ready, setReady] = useState(!!window.fb);
  useEffect(() => {
    if (window.fb) { setReady(true); return; }
    const h = () => setReady(true);
    window.addEventListener('fb-ready', h);
    return () => window.removeEventListener('fb-ready', h);
  }, []);
  return ready;
}

/* ---------------------------------- constants ---------------------------------- */

const STORAGE_KEY = 'budgetpartage-data';
const PROFILE_KEY = 'budgetpartage-profile';
const THEME_KEY = 'budgetpartage-theme';

const LIGHT = {
  bg: '#F7F5F1', surface: '#FFFFFF', surfaceAlt: '#F0EDE7', text: '#2B2A28', textMuted: '#938D84',
  border: '#E8E3DA', shadow: '0 1px 3px rgba(43,42,40,0.06), 0 8px 24px rgba(43,42,40,0.04)',
  primary: '#5FA083', primarySoft: '#DCEEE4', secondary: '#D97E7E', secondarySoft: '#F8E2E2',
  accent: '#9C7FB5', accentSoft: '#EBE1F2', accent2: '#D69A4E', accent2Soft: '#F8E7CD',
};
const DARK = {
  bg: '#1B1917', surface: '#252220', surfaceAlt: '#2E2A27', text: '#F1EDE6', textMuted: '#9C948A',
  border: '#3A3531', shadow: '0 1px 3px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.25)',
  primary: '#6FB596', primarySoft: '#233830', secondary: '#DE9494', secondarySoft: '#3A2827',
  accent: '#B497CC', accentSoft: '#302939', accent2: '#E0AC64', accent2Soft: '#3A2F1E',
};

const ICONS = EMOJI;

const PRESET_EXPENSE_CATEGORIES = [
  { name: 'Animaux', icon: '🐾' }, { name: 'Enfants', icon: '👶' }, { name: 'Éducation', icon: '📚' },
  { name: 'Voyages', icon: '✈️' }, { name: 'Pharmacie', icon: '💊' }, { name: 'Sport', icon: '🏋️' },
  { name: 'Café', icon: '☕' }, { name: 'Sorties', icon: '🍺' }, { name: 'Auto / Entretien', icon: '🚗' },
  { name: 'Abonnements', icon: '📱' }, { name: 'Ménage', icon: '🧹' }, { name: 'Beauté', icon: '💅' },
];
const PRESET_COLOR_CYCLE = ['primary', 'secondary', 'accent', 'accent2'];

const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'courses', name: 'Courses', icon: 'ShoppingCart', colorKey: 'primary' },
  { id: 'logement', name: 'Logement', icon: 'Home', colorKey: 'secondary' },
  { id: 'transport', name: 'Transport', icon: 'Car', colorKey: 'accent' },
  { id: 'restaurant', name: 'Restaurant', icon: 'Utensils', colorKey: 'accent2' },
  { id: 'loisirs', name: 'Loisirs', icon: 'Gamepad2', colorKey: 'primary' },
  { id: 'sante', name: 'Santé', icon: 'Heart', colorKey: 'secondary' },
  { id: 'factures', name: 'Factures', icon: 'Zap', colorKey: 'accent' },
  { id: 'cadeaux', name: 'Cadeaux', icon: 'Gift', colorKey: 'accent2' },
  { id: 'autre', name: 'Autre', icon: 'MoreHorizontal', colorKey: 'textMuted' },
];
const INCOME_CATEGORIES = [
  { id: 'salaire', name: 'Salaire', icon: 'Banknote', colorKey: 'primary' },
  { id: 'caf', name: 'CAF / Allocations', icon: 'Banknote', colorKey: 'accent2' },
  { id: 'remboursement', name: 'Remboursement', icon: 'Repeat', colorKey: 'accent' },
  { id: 'cadeau-recu', name: 'Cadeau reçu', icon: 'Gift', colorKey: 'accent2' },
  { id: 'autre-revenu', name: 'Autre revenu', icon: 'MoreHorizontal', colorKey: 'textMuted' },
];

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
const MONTH_LABELS_FULL = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const todayISO = () => new Date().toISOString().slice(0, 10);
const monthKey = (iso) => iso.slice(0, 7);
const fmtMoney = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(n || 0);
const fmtDateShort = (iso) => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

/* ---------------------------------- sounds ---------------------------------- */

function playCashRegister(ctx) {
  const now = ctx.currentTime;
  const notes = [1046.5, 1318.5, 1568.0, 2093.0];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const t = now + i * 0.07;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.22, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.2);
  });
  // coin "shimmer" noise burst
  const bufferSize = ctx.sampleRate * 0.25;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass'; bandpass.frequency.value = 4500; bandpass.Q.value = 0.6;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.12, now + 0.05);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
  noise.connect(bandpass); bandpass.connect(noiseGain); noiseGain.connect(ctx.destination);
  noise.start(now + 0.05);
}

function playSad(ctx) {
  const now = ctx.currentTime;
  [ [392, 0], [329.6, 0.22] ].forEach(([freq, delay]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const t = now + delay;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.35);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.18, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.42);
  });
}

function playVictoryFanfare(ctx) {
  const now = ctx.currentTime;
  // Original ascending arpeggio + bright final chord — a little "quest complete" feel, no borrowed melody.
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    const t = now + i * 0.09;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.14, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.24);
  });
  // final sparkly chord
  const chordT = now + notes.length * 0.09 + 0.03;
  [1046.5, 1318.5, 1568.0].forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, chordT);
    gain.gain.exponentialRampToValueAtTime(0.13, chordT + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, chordT + 0.5);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(chordT); osc.stop(chordT + 0.52);
  });
}

const AVOIDED_MESSAGES = [
  "Bravo, ton portefeuille te remercie ! 💪",
  "Belle résistance, ça compte vraiment.",
  "Un pas de plus vers tes objectifs !",
  "Fier(e) de toi, continue comme ça.",
  "C'est ça, la vraie force tranquille.",
];

function makeDefaultData(name1, name2) {
  return {
    profiles: [name1, name2],
    expenseCategories: DEFAULT_EXPENSE_CATEGORIES,
    incomeCategories: INCOME_CATEGORIES,
    transactions: [],
    recurring: [],
    goals: [],
    avoidedPurchases: [],
    monthlyTargets: {},
    updatedAt: Date.now(),
    lastEditedBy: name1,
  };
}

/* ---------------------------------- storage helpers ---------------------------------- */

async function storageGet(key, shared) {
  try {
    const res = await window.storage.get(key, shared);
    return res ? res.value : null;
  } catch (e) {
    return null;
  }
}
async function storageSet(key, value, shared) {
  try {
    await window.storage.set(key, value, shared);
    return true;
  } catch (e) {
    return false;
  }
}

/* ---------------------------------- root ---------------------------------- */

function App() {
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState(false);
  const [data, setData] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [tab, setTab] = useState('accueil');
  const [showAdd, setShowAdd] = useState(false);
  const [addPreset, setAddPreset] = useState('expense');
  const [editingTx, setEditingTx] = useState(null);
  const [lastSync, setLastSync] = useState(Date.now());
  const [syncing, setSyncing] = useState(false);
  const [celebration, setCelebration] = useState(null);
  const [addInitialDate, setAddInitialDate] = useState(todayISO());
  const [showAvoided, setShowAvoided] = useState(false);

  const dataRef = useRef(null);
  const audioCtxRef = useRef(null);
  const musicRef = useRef(null);
  const wantMusicRef = useRef(true);
  const [musicOn, setMusicOn] = useState(true);
  useEffect(() => { dataRef.current = data; }, [data]);

  const T = isDark ? DARK : LIGHT;

  const fbReady = useFirebaseReady();

  /* ----- personal prefs (device-local) ----- */
  useEffect(() => {
    (async () => {
      const [rawProfile, rawTheme] = await Promise.all([
        storageGet(PROFILE_KEY, false),
        storageGet(THEME_KEY, false),
      ]);
      if (rawProfile) setMyProfile(rawProfile);
      if (rawTheme) setIsDark(rawTheme === 'dark');
    })();
  }, []);

  /* ----- real-time shared data via Firestore ----- */
  useEffect(() => {
    if (!fbReady) return;
    const unsub = window.fb.subscribeShared((val) => {
      setData(val);
      setLoading(false);
      setLastSync(Date.now());
    });
    return () => unsub && unsub();
  }, [fbReady]);

  const persist = useCallback(async (updater) => {
    setSyncing(true);
    const base = dataRef.current;
    const next = typeof updater === 'function' ? updater(base) : updater;
    next.updatedAt = Date.now();
    next.lastEditedBy = myProfile || base?.lastEditedBy;
    setData(next);
    dataRef.current = next;
    const ok = await storageSet(STORAGE_KEY, JSON.stringify(next), true);
    setSaveError(!ok);
    setSyncing(false);
    setLastSync(Date.now());
  }, [myProfile]);

  const triggerCelebration = (type, amount, name) => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      if (type === 'income') playCashRegister(ctx);
      else if (type === 'saved') playVictoryFanfare(ctx);
      else playSad(ctx);
    } catch (e) {}
    const key = Date.now();
    setCelebration({ type, amount, name, key });
    setTimeout(() => setCelebration((c) => (c && c.key === key ? null : c)), type === 'saved' ? 2200 : 1500);
  };

  const addAvoidedPurchase = (name, price, payer) => {
    persist((base) => ({
      ...base,
      avoidedPurchases: [...(base.avoidedPurchases || []), { id: genId(), name, price, payer, date: todayISO(), createdAt: Date.now() }],
    }));
    setShowAvoided(false);
    triggerCelebration('saved', price, name);
  };
  const deleteAvoidedPurchase = (id) => persist((base) => ({
    ...base, avoidedPurchases: (base.avoidedPurchases || []).filter((a) => a.id !== id),
  }));

  const openAdd = (preset, initialDate) => {
    setAddPreset(preset || 'expense');
    setAddInitialDate(initialDate || todayISO());
    setEditingTx(null);
    setShowAdd(true);
  };

  const chooseProfile = async (name) => {
    setMyProfile(name);
    await storageSet(PROFILE_KEY, name, false);
  };

  const logout = async () => {
    setMyProfile(null);
    try { await window.storage.delete(PROFILE_KEY, false); } catch (e) {}
  };

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await storageSet(THEME_KEY, next ? 'dark' : 'light', false);
  };

  useEffect(() => {
    if (!musicRef.current) {
      musicRef.current = new Audio('bg-music.mp3');
      musicRef.current.loop = true;
      musicRef.current.volume = 0.35;
    }
    const tryPlay = () => musicRef.current.play().catch(() => {});
    tryPlay();
    const retryOnFirstTouch = () => {
      if (wantMusicRef.current) tryPlay();
      window.removeEventListener('pointerdown', retryOnFirstTouch);
      window.removeEventListener('keydown', retryOnFirstTouch);
    };
    window.addEventListener('pointerdown', retryOnFirstTouch, { once: true });
    window.addEventListener('keydown', retryOnFirstTouch, { once: true });
    return () => {
      window.removeEventListener('pointerdown', retryOnFirstTouch);
      window.removeEventListener('keydown', retryOnFirstTouch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMusic = () => {
    const next = !musicOn;
    setMusicOn(next);
    wantMusicRef.current = next;
    try {
      if (!musicRef.current) {
        musicRef.current = new Audio('bg-music.mp3');
        musicRef.current.loop = true;
        musicRef.current.volume = 0.35;
      }
      if (next) {
        musicRef.current.play().catch(() => {});
      } else {
        musicRef.current.pause();
      }
    } catch (e) {}
  };

  const createHousehold = async (name1, name2) => {
    const fresh = makeDefaultData(name1, name2);
    setData(fresh);
    dataRef.current = fresh;
    await storageSet(STORAGE_KEY, JSON.stringify(fresh), true);
    await chooseProfile(name1);
  };

  /* ----- recurring generation (current month) ----- */
  useEffect(() => {
    if (!data || !myProfile) return;
    if (!data.recurring || data.recurring.length === 0) return;
    const mk = monthKey(todayISO());
    const todayDay = new Date().getDate();
    let changed = false;
    const newTx = [];
    data.recurring.forEach((r) => {
      if (r.active === false) return;
      const alreadyExists = data.transactions.some((t) => t.recurringId === r.id && t.recurringMonth === mk);
      if (alreadyExists) return;
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      const day = Math.min(r.dayOfMonth, daysInMonth);
      if (todayDay >= day) {
        changed = true;
        newTx.push({
          id: genId(), type: r.type, amount: r.amount, categoryId: r.categoryId,
          date: `${mk}-${String(day).padStart(2, '0')}`, payer: r.payer, scope: r.scope,
          note: r.label, recurringId: r.id, recurringMonth: mk, nature: r.nature || 'mensuelle', createdAt: Date.now(),
        });
      }
    });
    if (changed) {
      persist((base) => ({ ...base, transactions: [...base.transactions, ...newTx] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.recurring, myProfile]);

  /* ----- derived values ----- */
  const partner = useMemo(() => {
    if (!data || !myProfile) return null;
    return data.profiles.find((p) => p !== myProfile) || null;
  }, [data, myProfile]);

  const balance = useMemo(() => {
    if (!data) return 0;
    return data.transactions.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0);
  }, [data]);

  const currentMonthKey = monthKey(todayISO());
  const monthTx = useMemo(() => {
    if (!data) return [];
    return data.transactions.filter((t) => monthKey(t.date) === currentMonthKey);
  }, [data, currentMonthKey]);

  const monthIncome = useMemo(() => monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0), [monthTx]);
  const monthExpense = useMemo(() => monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [monthTx]);

  const balanceOwed = useMemo(() => {
    if (!data || !partner) return null;
    const communeExpenses = monthTx.filter((t) => t.type === 'expense' && t.scope === 'commune');
    const total = communeExpenses.reduce((s, t) => s + t.amount, 0);
    if (total === 0) return null;
    const jointPayer = data.profiles.join(' & ');
    const paidByMe = communeExpenses.reduce((s, t) => {
      if (t.payer === myProfile) return s + t.amount;
      if (t.payer === jointPayer) return s + t.amount / 2;
      return s;
    }, 0);
    const idealShare = total / 2;
    const diff = paidByMe - idealShare;
    if (Math.abs(diff) < 0.5) return null;
    return diff > 0
      ? { from: partner, to: myProfile, amount: diff }
      : { from: myProfile, to: partner, amount: -diff };
  }, [monthTx, myProfile, partner, data]);

  const categoryOf = useCallback((id, type) => {
    if (!data) return null;
    const list = type === 'income' ? data.incomeCategories : data.expenseCategories;
    return list.find((c) => c.id === id);
  }, [data]);

  const deleteTx = (id) => {
    persist((base) => ({ ...base, transactions: base.transactions.filter((t) => t.id !== id) }));
  };
  const saveTx = (tx) => {
    const isNew = !dataRef.current.transactions.some((t) => t.id === tx.id);
    persist((base) => {
      const exists = base.transactions.some((t) => t.id === tx.id);
      return { ...base, transactions: exists ? base.transactions.map((t) => (t.id === tx.id ? tx : t)) : [...base.transactions, tx] };
    });
    setShowAdd(false);
    setEditingTx(null);
    if (isNew) triggerCelebration(tx.type, tx.amount);
  };
  const saveRecurringFromTx = (tx, dayOfMonth, recurringId) => {
    persist((base) => ({
      ...base,
      recurring: [...base.recurring, {
        id: recurringId || genId(), label: tx.note || 'Récurrence', amount: tx.amount, type: tx.type,
        categoryId: tx.categoryId, payer: tx.payer, scope: tx.scope, nature: 'mensuelle', dayOfMonth, active: true,
      }],
    }));
  };
  const deleteRecurring = (id) => persist((base) => ({ ...base, recurring: base.recurring.filter((r) => r.id !== id) }));
  const toggleRecurringActive = (id) => persist((base) => ({
    ...base, recurring: base.recurring.map((r) => (r.id === id ? { ...r, active: r.active === false } : r)),
  }));

  const setCategoryBudget = (id, budget, type) => {
    persist((base) => {
      const key = type === 'income' ? 'incomeCategories' : 'expenseCategories';
      return { ...base, [key]: base[key].map((c) => (c.id === id ? { ...c, monthlyBudget: budget } : c)) };
    });
  };
  const setMonthlyTarget = (mk, amount) => {
    persist((base) => ({ ...base, monthlyTargets: { ...(base.monthlyTargets || {}), [mk]: amount } }));
  };
  const addCategory = (name, icon, colorKey, type) => {
    persist((base) => {
      const key = type === 'income' ? 'incomeCategories' : 'expenseCategories';
      return { ...base, [key]: [...base[key], { id: genId(), name, icon, colorKey }] };
    });
  };
  const deleteCategory = (id, type) => {
    persist((base) => {
      const key = type === 'income' ? 'incomeCategories' : 'expenseCategories';
      return { ...base, [key]: base[key].filter((c) => c.id !== id) };
    });
  };

  const addGoal = (goal) => persist((base) => ({ ...base, goals: [...base.goals, { id: genId(), current: 0, ...goal }] }));
  const contributeGoal = (id, amount) => persist((base) => ({
    ...base, goals: base.goals.map((g) => (g.id === id ? { ...g, current: Math.max(0, g.current + amount) } : g)),
  }));
  const deleteGoal = (id) => persist((base) => ({ ...base, goals: base.goals.filter((g) => g.id !== id) }));

  const exportCSV = () => {
    if (!data) return;
    const rows = [['Date', 'Type', 'Catégorie', 'Montant', 'Payeur', 'Portée', 'Note']];
    data.transactions
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((t) => {
        const cat = categoryOf(t.categoryId, t.type);
        rows.push([t.date, t.type === 'income' ? 'Revenu' : 'Dépense', cat?.name || '', t.amount, t.payer, t.scope, t.note || '']);
      });
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `budget-partage-${todayISO()}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /* ----- render states ----- */
  const fontStyle = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
      * { box-sizing: border-box; }
      .fnum { font-family: 'Quicksand', sans-serif; }
      .fbody { font-family: 'Inter', sans-serif; }
      ::-webkit-scrollbar { width: 0; height: 0; }
      @keyframes slideUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes popIn { 0% { transform: scale(0.3) translateY(20px); opacity: 0; } 55% { transform: scale(1.15) translateY(-6px); opacity: 1; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
      @keyframes fadeOutDelay { 0%, 70% { opacity: 1; } 100% { opacity: 0; } }
      @keyframes fallCoin { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(70px) rotate(200deg); opacity: 0; } }
      @keyframes fallTear { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(50px); opacity: 0; } }
    `}</style>
  );

  if (loading) {
    return (
      <div className="fbody flex items-center justify-center" style={{ minHeight: 480, background: T.bg, color: T.text }}>
        {fontStyle}
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full p-4" style={{ background: T.primarySoft }}>
            <Wallet size={28} color={T.primary} />
          </div>
          <div style={{ color: T.textMuted, fontSize: 14 }}>Chargement…</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return <Onboarding T={T} fontStyle={fontStyle} onCreate={createHousehold} />;
  }

  if (!myProfile) {
    return <ChooseProfile T={T} fontStyle={fontStyle} profiles={data.profiles} onChoose={chooseProfile} />;
  }

  return (
    <div className="fbody" style={{ background: T.bg, color: T.text, minHeight: 480, maxWidth: 480, margin: '0 auto', position: 'relative', borderRadius: 24, overflow: 'hidden' }}>
      {fontStyle}

      <TopBar T={T} myProfile={myProfile} isDark={isDark} toggleTheme={toggleTheme} syncing={syncing} saveError={saveError} lastSync={lastSync} />

      <div style={{ padding: '4px 16px 96px', minHeight: 420 }}>
        {tab === 'accueil' && (
          <Dashboard
            T={T} data={data} myProfile={myProfile} partner={partner} balance={balance}
            monthIncome={monthIncome} monthExpense={monthExpense} balanceOwed={balanceOwed}
            monthTx={monthTx} categoryOf={categoryOf}
            openAdd={(preset) => openAdd(preset)}
            onSelectTx={(t) => { setEditingTx(t); setShowAdd(true); }}
            goToHistory={() => setTab('historique')}
            openAvoided={() => setShowAvoided(true)}
            deleteAvoidedPurchase={deleteAvoidedPurchase}
          />
        )}
        {tab === 'historique' && (
          <HistoryView
            T={T} data={data} categoryOf={categoryOf}
            onSelectTx={(t) => { setEditingTx(t); setShowAdd(true); }}
            onAddForMonth={(mk) => openAdd('expense', mk === currentMonthKey ? todayISO() : `${mk}-01`)}
          />
        )}
        {tab === 'budgets' && (
          <BudgetsView T={T} data={data} monthTx={monthTx} setCategoryBudget={setCategoryBudget} setMonthlyTarget={setMonthlyTarget} onAddForDate={(d) => openAdd('expense', d)} />
        )}
        {tab === 'objectifs' && (
          <GoalsView T={T} data={data} addGoal={addGoal} contributeGoal={contributeGoal} deleteGoal={deleteGoal} />
        )}
        {tab === 'reglages' && (
          <SettingsView
            T={T} data={data} myProfile={myProfile} isDark={isDark} toggleTheme={toggleTheme}
            exportCSV={exportCSV} deleteRecurring={deleteRecurring} toggleRecurringActive={toggleRecurringActive}
            addCategory={addCategory} deleteCategory={deleteCategory} switchProfile={logout}
            musicOn={musicOn} toggleMusic={toggleMusic}
          />
        )}
      </div>

      <BottomNav T={T} tab={tab} setTab={setTab} onAdd={() => openAdd('expense')} />

      {showAdd && (
        <AddSheet
          T={T} data={data} myProfile={myProfile} partner={partner} preset={addPreset}
          editingTx={editingTx} initialDate={addInitialDate}
          onClose={() => { setShowAdd(false); setEditingTx(null); }}
          onSave={saveTx} onDelete={deleteTx} onSaveRecurring={saveRecurringFromTx}
        />
      )}

      {showAvoided && (
        <AvoidedSheet
          T={T} data={data} myProfile={myProfile}
          onClose={() => setShowAvoided(false)}
          onSave={addAvoidedPurchase}
        />
      )}

      {celebration && <Celebration T={T} celebration={celebration} />}
    </div>
  );
}

/* ---------------------------------- celebration overlay ---------------------------------- */

function Celebration({ T, celebration }) {
  const isIncome = celebration.type === 'income';
  const isSaved = celebration.type === 'saved';

  if (isSaved) {
    const msg = AVOIDED_MESSAGES[Math.floor(Math.random() * AVOIDED_MESSAGES.length)];
    const particles = ['✨', '🎉', '🏆', '✨', '🎉', '⭐'];
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 60 }}>
        <div style={{ position: 'relative', animation: 'popIn 0.5s cubic-bezier(.34,1.56,.64,1), fadeOutDelay 2.2s ease-in forwards', textAlign: 'center', padding: '0 24px' }}>
          <div style={{ fontSize: 60, filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.15))' }}>🏆</div>
          <div className="fnum" style={{ fontSize: 22, fontWeight: 700, color: T.accent, marginTop: 4 }}>
            + {fmtMoney(celebration.amount)} épargnés !
          </div>
          {celebration.name && (
            <div style={{ fontSize: 12.5, color: T.textMuted, marginTop: 2 }}>en résistant à « {celebration.name} »</div>
          )}
          <div style={{ fontSize: 13, color: T.text, marginTop: 8, fontWeight: 500 }}>{msg}</div>
          {particles.map((p, i) => (
            <div key={i} style={{
              position: 'absolute', top: -10, left: `${5 + i * 15}%`, fontSize: 20,
              animation: `fallCoin ${1 + i * 0.1}s ease-in ${i * 0.07}s forwards`,
              opacity: 0,
            }}>{p}</div>
          ))}
        </div>
      </div>
    );
  }

  const particles = isIncome ? ['🪙', '💰', '🪙', '✨', '🪙'] : ['💧', '💧', '💧'];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 60 }}>
      <div style={{ position: 'relative', animation: 'popIn 0.45s cubic-bezier(.34,1.56,.64,1), fadeOutDelay 1.5s ease-in forwards' }}>
        <div style={{ fontSize: 64, textAlign: 'center', filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.15))' }}>
          {isIncome ? '🤩' : '😢'}
        </div>
        <div className="fnum" style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, color: isIncome ? T.primary : T.secondary, marginTop: 4 }}>
          {isIncome ? '+' : '−'}{fmtMoney(celebration.amount).replace('-', '')}
        </div>
        {particles.map((p, i) => (
          <div key={i} style={{
            position: 'absolute', top: isIncome ? -6 : 40, left: `${18 + i * 15}%`, fontSize: isIncome ? 20 : 16,
            animation: `${isIncome ? 'fallCoin' : 'fallTear'} ${0.9 + i * 0.12}s ease-in ${i * 0.08}s forwards`,
            opacity: 0,
          }}>{p}</div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- onboarding ---------------------------------- */

function Onboarding({ T, fontStyle, onCreate }) {
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  return (
    <div className="fbody flex flex-col justify-center" style={{ background: T.bg, color: T.text, minHeight: 480, maxWidth: 480, margin: '0 auto', padding: 28 }}>
      {fontStyle}
      <div className="flex flex-col items-center mb-8">
        <div className="rounded-full p-4 mb-4" style={{ background: T.primarySoft }}>
          <Wallet size={30} color={T.primary} />
        </div>
        <div className="fnum" style={{ fontSize: 24, fontWeight: 700 }}>Bienvenue à deux</div>
        <div style={{ color: T.textMuted, fontSize: 14, marginTop: 4, textAlign: 'center' }}>Créez votre budget partagé en quelques secondes</div>
      </div>
      <label style={{ fontSize: 13, color: T.textMuted, marginBottom: 6 }}>Ton prénom</label>
      <input value={name1} onChange={(e) => setName1(e.target.value)} placeholder="ex. Alex"
        style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '12px 16px', fontSize: 15, color: T.text, marginBottom: 16 }} />
      <label style={{ fontSize: 13, color: T.textMuted, marginBottom: 6 }}>Prénom de ta/ton partenaire</label>
      <input value={name2} onChange={(e) => setName2(e.target.value)} placeholder="ex. Sam"
        style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '12px 16px', fontSize: 15, color: T.text, marginBottom: 24 }} />
      <button
        disabled={!name1.trim() || !name2.trim()}
        onClick={() => onCreate(name1.trim(), name2.trim())}
        className="flex items-center justify-center gap-2"
        style={{ background: (!name1.trim() || !name2.trim()) ? T.border : T.primary, color: '#fff', borderRadius: 16, padding: '14px 0', fontSize: 15, fontWeight: 600, border: 'none' }}>
        Créer notre budget <ArrowRight size={17} />
      </button>
      <div style={{ color: T.textMuted, fontSize: 12, textAlign: 'center', marginTop: 18 }}>
        Ensuite, ouvrez ce même lien sur l'autre téléphone pour choisir l'autre profil.
      </div>
    </div>
  );
}

function ChooseProfile({ T, fontStyle, profiles, onChoose }) {
  return (
    <div className="fbody flex flex-col justify-center" style={{ background: T.bg, color: T.text, minHeight: 480, maxWidth: 480, margin: '0 auto', padding: 28 }}>
      {fontStyle}
      <div className="flex flex-col items-center mb-8">
        <div className="rounded-full p-4 mb-4" style={{ background: T.accentSoft }}>
          <Users size={28} color={T.accent} />
        </div>
        <div className="fnum" style={{ fontSize: 22, fontWeight: 700 }}>Qui es-tu ?</div>
        <div style={{ color: T.textMuted, fontSize: 14, marginTop: 4 }}>Sur cet appareil</div>
      </div>
      <div className="flex flex-col gap-3">
        {profiles.map((p) => (
          <button key={p} onClick={() => onChoose(p)}
            className="flex items-center gap-3"
            style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: '16px 18px', fontSize: 16, fontWeight: 600, color: T.text }}>
            <div className="rounded-full flex items-center justify-center" style={{ width: 38, height: 38, background: T.primarySoft, color: T.primary, fontWeight: 700 }}>
              {p.charAt(0).toUpperCase()}
            </div>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- top bar & nav ---------------------------------- */

function TopBar({ T, myProfile, isDark, toggleTheme, syncing, saveError, lastSync }) {
  const [, forceTick] = useState(0);
  useEffect(() => { const i = setInterval(() => forceTick((x) => x + 1), 5000); return () => clearInterval(i); }, []);
  const secs = Math.max(0, Math.round((Date.now() - lastSync) / 1000));
  return (
    <div className="flex items-center justify-between" style={{ padding: '18px 16px 8px' }}>
      <div>
        <div className="fnum" style={{ fontSize: 20, fontWeight: 700 }}>Ad&Lie Budget</div>
        <div style={{ fontSize: 12, color: T.textMuted, display: 'flex', alignItems: 'center', gap: 5 }}>
          <RefreshCw size={11} style={{ animation: syncing ? 'fadeIn 0.6s infinite alternate' : 'none' }} />
          {saveError ? 'Hors ligne' : secs < 6 ? 'À jour' : `Sync. il y a ${secs}s`}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="rounded-full flex items-center justify-center" style={{ width: 34, height: 34, background: T.primarySoft, color: T.primary, fontSize: 13, fontWeight: 700 }}>
          {myProfile.charAt(0).toUpperCase()}
        </div>
        <button onClick={toggleTheme} className="rounded-full flex items-center justify-center" style={{ width: 34, height: 34, background: T.surfaceAlt, border: 'none' }}>
          {isDark ? <Sun size={16} color={T.text} /> : <Moon size={16} color={T.text} />}
        </button>
      </div>
    </div>
  );
}

function BottomNav({ T, tab, setTab, onAdd }) {
  const items = [
    { id: 'accueil', label: 'Accueil', icon: Wallet },
    { id: 'historique', label: 'Historique', icon: ListFilter },
    { id: 'budgets', label: 'Budgets', icon: Euro },
    { id: 'objectifs', label: 'Objectifs', icon: Target },
    { id: 'reglages', label: 'Réglages', icon: Settings2 },
  ];
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, maxWidth: 480, margin: '0 auto' }}>
      <button onClick={onAdd} className="rounded-full flex items-center justify-center" style={{
        position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 64,
        width: 50, height: 50, background: T.primary, border: `4px solid ${T.bg}`, boxShadow: T.shadow, zIndex: 2,
      }}>
        <Plus size={22} color="#fff" />
      </button>
      <div className="flex items-center justify-around" style={{ background: T.surface, borderTop: `1px solid ${T.border}`, padding: '10px 4px 14px' }}>
        {items.map((it) => {
          const Icon = it.icon;
          const active = tab === it.id;
          return (
            <button key={it.id} onClick={() => setTab(it.id)} className="flex flex-col items-center gap-1" style={{ background: 'none', border: 'none', padding: 4 }}>
              <Icon size={19} color={active ? T.primary : T.textMuted} />
              <span style={{ fontSize: 9.5, color: active ? T.primary : T.textMuted, fontWeight: active ? 600 : 400 }}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------- dashboard ---------------------------------- */

function CategoryIcon({ name, size = 18, color }) {
  return <span style={{ fontSize: size, color, lineHeight: 1, display: 'inline-block' }}>{ICONS[name] || name || '•••'}</span>;
}

function TrendBars({ T, data }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.Revenus, d.Dépenses]));
  return (
    <div>
      <div className="flex items-end" style={{ height: 110, gap: 8, padding: '0 4px' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 3, height: '100%' }}>
            <div title={`Revenus: ${fmtMoney(d.Revenus)}`} style={{ width: 10, height: Math.max(2, (d.Revenus / max) * 100), background: T.primary, borderRadius: '4px 4px 0 0' }} />
            <div title={`Dépenses: ${fmtMoney(d.Dépenses)}`} style={{ width: 10, height: Math.max(2, (d.Dépenses / max) * 100), background: T.secondary, borderRadius: '4px 4px 0 0' }} />
          </div>
        ))}
      </div>
      <div className="flex" style={{ gap: 8, padding: '0 4px' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: T.textMuted }}>{d.label}</div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ T, data }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let acc = 0;
  const stops = data.map((d) => {
    const start = (acc / total) * 360;
    acc += d.value;
    const end = (acc / total) * 360;
    return `${T[d.colorKey] || T.textMuted} ${start}deg ${end}deg`;
  }).join(', ');
  return (
    <div style={{ position: 'relative', width: 130, height: 130 }}>
      <div style={{ width: 130, height: 130, borderRadius: '50%', background: `conic-gradient(${stops})` }} />
      <div style={{ position: 'absolute', inset: 22, borderRadius: '50%', background: T.surface }} />
    </div>
  );
}

function Dashboard({ T, data, myProfile, partner, balance, monthIncome, monthExpense, balanceOwed, monthTx, categoryOf, openAdd, onSelectTx, goToHistory, openAvoided, deleteAvoidedPurchase }) {
  const pieData = useMemo(() => {
    const byCat = {};
    monthTx.filter((t) => t.type === 'expense').forEach((t) => {
      byCat[t.categoryId] = (byCat[t.categoryId] || 0) + t.amount;
    });
    return Object.entries(byCat).map(([id, value]) => {
      const cat = categoryOf(id, 'expense');
      return { name: cat?.name || 'Autre', value, colorKey: cat?.colorKey || 'textMuted' };
    }).sort((a, b) => b.value - a.value);
  }, [monthTx, categoryOf]);

  const recent = useMemo(() => data.transactions.slice().sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt).slice(0, 5), [data.transactions]);

  const monthAvoided = useMemo(() => (data.avoidedPurchases || []).filter((a) => monthKey(a.date) === monthKey(todayISO())), [data.avoidedPurchases]);
  const monthAvoidedTotal = useMemo(() => monthAvoided.reduce((s, a) => s + a.price, 0), [monthAvoided]);

  return (
    <div className="flex flex-col gap-4" style={{ animation: 'fadeIn 0.3s' }}>
      <div style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, borderRadius: 22, padding: 22, color: '#fff', boxShadow: T.shadow }}>
        <div style={{ fontSize: 13, opacity: 0.85 }}>Solde commun</div>
        <div className="fnum" style={{ fontSize: 34, fontWeight: 700, margin: '4px 0 14px' }}>{fmtMoney(balance)}</div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 10, padding: '5px 10px', fontSize: 12 }}>
            <TrendingUp size={13} /> {fmtMoney(monthIncome)}
          </div>
          <div className="flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 10, padding: '5px 10px', fontSize: 12 }}>
            <TrendingDown size={13} /> {fmtMoney(monthExpense)}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => openAdd('expense')} className="flex-1 flex items-center justify-center gap-2" style={{ background: T.secondarySoft, color: T.secondary, borderRadius: 16, padding: '13px 0', fontWeight: 600, fontSize: 14, border: 'none' }}>
          <Plus size={16} /> Dépense
        </button>
        <button onClick={() => openAdd('income')} className="flex-1 flex items-center justify-center gap-2" style={{ background: T.primarySoft, color: T.primary, borderRadius: 16, padding: '13px 0', fontWeight: 600, fontSize: 14, border: 'none' }}>
          <Plus size={16} /> Revenu
        </button>
      </div>

      <button onClick={openAvoided} className="flex items-center justify-center gap-2" style={{ background: T.accentSoft, color: T.accent, borderRadius: 16, padding: '13px 0', fontWeight: 600, fontSize: 14, border: 'none' }}>
        🏆 J'ai résisté à un achat !
      </button>

      {monthAvoided.length > 0 && (
        <div style={{ background: T.surface, borderRadius: 18, padding: '14px 16px', border: `1px solid ${T.border}` }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Tentations évitées ce mois</div>
            <div className="fnum" style={{ fontSize: 15, fontWeight: 700, color: T.accent }}>{fmtMoney(monthAvoidedTotal)}</div>
          </div>
          <div className="flex flex-col gap-1.5">
            {monthAvoided.slice(0, 4).map((a) => (
              <div key={a.id} className="flex items-center gap-2" style={{ fontSize: 12 }}>
                <span>🏆</span>
                <span style={{ flex: 1, color: T.textMuted }}>{a.name}</span>
                <span className="fnum" style={{ fontWeight: 600 }}>{fmtMoney(a.price)}</span>
                <button onClick={() => deleteAvoidedPurchase(a.id)} style={{ background: 'none', border: 'none', color: T.textMuted }}><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {balanceOwed && (
        <div className="flex items-center gap-3" style={{ background: T.accentSoft, borderRadius: 16, padding: '14px 16px' }}>
          <Scale size={20} color={T.accent} />
          <div style={{ fontSize: 13 }}>
            <span style={{ fontWeight: 600 }}>{balanceOwed.from}</span> doit <span style={{ fontWeight: 700 }}>{fmtMoney(balanceOwed.amount)}</span> à <span style={{ fontWeight: 600 }}>{balanceOwed.to}</span>
            <div style={{ color: T.textMuted, fontSize: 11 }}>pour équilibrer les dépenses communes du mois</div>
          </div>
        </div>
      )}

      {pieData.length > 0 && (
        <div style={{ background: T.surface, borderRadius: 18, padding: '16px 16px 6px', border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Dépenses par catégorie — {MONTH_LABELS_FULL[new Date().getMonth()]}</div>
          <div style={{ height: 170, display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '45%', display: 'flex', justifyContent: 'center' }}>
              <DonutChart T={T} data={pieData} />
            </div>
            <div className="flex flex-col gap-1" style={{ fontSize: 11, flex: 1, maxHeight: 150, overflowY: 'auto' }}>
              {pieData.slice(0, 6).map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: T[d.colorKey] || T.textMuted, flexShrink: 0 }} />
                  <span style={{ color: T.textMuted }}>{d.name}</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{fmtMoney(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Transactions récentes</div>
          <button onClick={goToHistory} className="flex items-center gap-0.5" style={{ background: 'none', border: 'none', color: T.textMuted, fontSize: 12 }}>
            Tout voir <ChevronRight size={13} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {recent.length === 0 && <div style={{ color: T.textMuted, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Aucune transaction pour l'instant.</div>}
          {recent.map((t) => <TxRow key={t.id} T={T} t={t} cat={categoryOf(t.categoryId, t.type)} onClick={() => onSelectTx(t)} />)}
        </div>
      </div>
    </div>
  );
}

function TxRow({ T, t, cat, onClick }) {
  const isIncome = t.type === 'income';
  return (
    <button onClick={onClick} className="flex items-center gap-3" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: '11px 14px', textAlign: 'left' }}>
      <div className="rounded-full flex items-center justify-center" style={{ width: 38, height: 38, background: T[cat?.colorKey + 'Soft'] || T.surfaceAlt, flexShrink: 0 }}>
        <CategoryIcon name={cat?.icon} color={T[cat?.colorKey] || T.textMuted} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.note || cat?.name || 'Transaction'}</div>
        <div style={{ fontSize: 11, color: T.textMuted }}>{cat?.name} · {t.payer} · {fmtDateShort(t.date)}</div>
      </div>
      <div className="fnum" style={{ fontWeight: 700, fontSize: 14, color: isIncome ? T.primary : T.text, flexShrink: 0 }}>
        {isIncome ? '+' : '−'}{fmtMoney(t.amount).replace('-', '')}
      </div>
    </button>
  );
}

/* ---------------------------------- history ---------------------------------- */

function HistoryView({ T, data, categoryOf, onSelectTx, onAddForMonth }) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterPayer, setFilterPayer] = useState('all');
  const nowMk = monthKey(todayISO());
  const [viewDate, setViewDate] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const viewMk = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`;

  const changeMonth = (delta) => setViewDate((d) => { const n = new Date(d); n.setMonth(n.getMonth() + delta); return n; });

  const monthTransactions = useMemo(() => data.transactions.filter((t) => monthKey(t.date) === viewMk), [data.transactions, viewMk]);
  const monthTotals = useMemo(() => {
    const inc = monthTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const exp = monthTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { inc, exp, net: inc - exp };
  }, [monthTransactions]);

  const filtered = useMemo(() => {
    return monthTransactions
      .filter((t) => (filterCat === 'all' || t.categoryId === filterCat))
      .filter((t) => (filterPayer === 'all' || t.payer === filterPayer))
      .filter((t) => !search.trim() || (t.note || '').toLowerCase().includes(search.toLowerCase()) || (categoryOf(t.categoryId, t.type)?.name || '').toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  }, [monthTransactions, search, filterCat, filterPayer, categoryOf]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach((t) => { (g[t.date] = g[t.date] || []).push(t); });
    return Object.entries(g);
  }, [filtered]);

  const allCats = [...data.expenseCategories, ...data.incomeCategories];

  return (
    <div className="flex flex-col gap-3" style={{ animation: 'fadeIn 0.3s' }}>
      <div className="fnum" style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>Historique</div>

      <div className="flex items-center justify-between" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: '8px 8px' }}>
        <button onClick={() => changeMonth(-1)} style={{ background: T.surfaceAlt, border: 'none', borderRadius: 10, padding: 8 }}><ChevronLeft size={15} color={T.text} /></button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{MONTH_LABELS_FULL[viewDate.getMonth()]} {viewDate.getFullYear()}</div>
          {viewMk !== nowMk && <button onClick={() => setViewDate(() => { const d = new Date(); d.setDate(1); return d; })} style={{ background: 'none', border: 'none', color: T.accent, fontSize: 10 }}>Revenir à aujourd'hui</button>}
        </div>
        <button onClick={() => changeMonth(1)} style={{ background: T.surfaceAlt, border: 'none', borderRadius: 10, padding: 8 }}><ChevronRight size={15} color={T.text} /></button>
      </div>

      <div className="flex gap-2">
        <div style={{ flex: 1, background: T.primarySoft, borderRadius: 12, padding: '8px 10px', fontSize: 11, color: T.primary, fontWeight: 600 }}>
          Revenus<div className="fnum" style={{ fontSize: 14 }}>{fmtMoney(monthTotals.inc)}</div>
        </div>
        <div style={{ flex: 1, background: T.secondarySoft, borderRadius: 12, padding: '8px 10px', fontSize: 11, color: T.secondary, fontWeight: 600 }}>
          Dépenses<div className="fnum" style={{ fontSize: 14 }}>{fmtMoney(monthTotals.exp)}</div>
        </div>
        <button onClick={() => onAddForMonth(viewMk)} className="flex flex-col items-center justify-center gap-0.5" style={{ background: T.accentSoft, color: T.accent, border: 'none', borderRadius: 12, padding: '0 14px', fontSize: 10, fontWeight: 600 }}>
          <Plus size={15} /> Ajouter
        </button>
      </div>

      <div className="flex items-center gap-2" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '9px 12px' }}>
        <Search size={15} color={T.textMuted} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher…" style={{ border: 'none', outline: 'none', background: 'none', fontSize: 13, color: T.text, flex: 1 }} />
      </div>
      <div className="flex gap-2" style={{ overflowX: 'auto', paddingBottom: 2 }}>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '7px 10px', fontSize: 12, color: T.text }}>
          <option value="all">Toutes catégories</option>
          {allCats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterPayer} onChange={(e) => setFilterPayer(e.target.value)} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '7px 10px', fontSize: 12, color: T.text }}>
          <option value="all">Tous les payeurs</option>
          {data.profiles.map((p) => <option key={p} value={p}>{p}</option>)}
          <option value={data.profiles.join(' & ')}>{data.profiles.join(' & ')}</option>
        </select>
      </div>
      {grouped.length === 0 && <div style={{ color: T.textMuted, fontSize: 13, textAlign: 'center', padding: '30px 0' }}>Aucune transaction pour ce mois.</div>}
      {grouped.map(([date, txs]) => (
        <div key={date}>
          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, margin: '6px 2px' }}>{fmtDateShort(date)}</div>
          <div className="flex flex-col gap-2">
            {txs.map((t) => <TxRow key={t.id} T={T} t={t} cat={categoryOf(t.categoryId, t.type)} onClick={() => onSelectTx(t)} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------- budgets ---------------------------------- */

function BudgetsView({ T, data, monthTx, setCategoryBudget, setMonthlyTarget, onAddForDate }) {
  const [view, setView] = useState('calendar');
  const [editing, setEditing] = useState(null);
  const [value, setValue] = useState('');

  const spendByCat = useMemo(() => {
    const m = {};
    monthTx.filter((t) => t.type === 'expense').forEach((t) => { m[t.categoryId] = (m[t.categoryId] || 0) + t.amount; });
    return m;
  }, [monthTx]);

  const trendData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
      const mk = d.toISOString().slice(0, 7);
      const label = MONTH_LABELS[d.getMonth()];
      const inc = data.transactions.filter((t) => t.type === 'income' && monthKey(t.date) === mk).reduce((s, t) => s + t.amount, 0);
      const exp = data.transactions.filter((t) => t.type === 'expense' && monthKey(t.date) === mk).reduce((s, t) => s + t.amount, 0);
      months.push({ label, Revenus: Math.round(inc), Dépenses: Math.round(exp) });
    }
    return months;
  }, [data.transactions]);

  return (
    <div className="flex flex-col gap-4" style={{ animation: 'fadeIn 0.3s' }}>
      <div className="fnum" style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>Budgets</div>

      <div className="flex gap-2">
        {[{ id: 'calendar', label: 'Calendrier' }, { id: 'categories', label: 'Par catégorie' }].map((v) => (
          <button key={v.id} onClick={() => setView(v.id)}
            style={{ flex: 1, padding: '9px 0', borderRadius: 12, border: 'none', fontSize: 12.5, fontWeight: 600,
              background: view === v.id ? T.primarySoft : T.surfaceAlt, color: view === v.id ? T.primary : T.textMuted }}>
            {v.label}
          </button>
        ))}
      </div>

      {view === 'calendar' && <MonthCalendar T={T} data={data} setMonthlyTarget={setMonthlyTarget} onAddForDate={onAddForDate} />}

      {view === 'categories' && (
      <>
      <div style={{ background: T.surface, borderRadius: 18, padding: '14px 10px 4px', border: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, paddingLeft: 6 }}>Tendance sur 6 mois</div>
        <TrendBars T={T} data={trendData} />
      </div>

      <div className="flex flex-col gap-2">
        {data.expenseCategories.map((c) => {
          const spent = spendByCat[c.id] || 0;
          const budget = c.monthlyBudget || 0;
          const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
          const over = budget > 0 && spent > budget;
          return (
            <div key={c.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: '13px 14px' }}>
              <div className="flex items-center gap-3" style={{ marginBottom: budget > 0 ? 8 : 0 }}>
                <div className="rounded-full flex items-center justify-center" style={{ width: 32, height: 32, background: T[c.colorKey + 'Soft'] || T.surfaceAlt, flexShrink: 0 }}>
                  <CategoryIcon name={c.icon} size={16} color={T[c.colorKey] || T.textMuted} />
                </div>
                <div style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{c.name}</div>
                {editing === c.id ? (
                  <div className="flex items-center gap-1">
                    <input autoFocus type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="€/mois"
                      style={{ width: 64, border: `1px solid ${T.border}`, borderRadius: 8, padding: '4px 6px', fontSize: 12, background: T.bg, color: T.text }} />
                    <button onClick={() => { setCategoryBudget(c.id, parseFloat(value) || 0, 'expense'); setEditing(null); }} style={{ background: T.primary, border: 'none', borderRadius: 8, padding: 5 }}>
                      <Check size={13} color="#fff" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setEditing(c.id); setValue(String(c.monthlyBudget || '')); }} style={{ background: 'none', border: 'none', color: T.textMuted, fontSize: 11 }}>
                    {budget > 0 ? <Pencil size={13} /> : 'Définir'}
                  </button>
                )}
              </div>
              {budget > 0 && (
                <>
                  <div style={{ height: 7, background: T.surfaceAlt, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: over ? T.secondary : T.primary, borderRadius: 4, transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ fontSize: 11, color: over ? T.secondary : T.textMuted, marginTop: 4 }}>
                    {fmtMoney(spent)} / {fmtMoney(budget)} {over && '— dépassé'}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      </>
      )}
    </div>
  );
}

/* ---------------------------------- month calendar ---------------------------------- */

function MonthCalendar({ T, data, setMonthlyTarget, onAddForDate }) {
  const [viewDate, setViewDate] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [budgetInput, setBudgetInput] = useState('');
  const [editingBudget, setEditingBudget] = useState(false);

  const year = viewDate.getFullYear(), month = viewDate.getMonth();
  const mk = `${year}-${String(month + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Lundi = 0
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDay = today.getDate();

  // Épargne prévisionnelle du mois = somme des transactions "mensuelles" (anticipées) de ce mois.
  const { monthlyNet, hasMensuelle, ponctuelNetByDay, allNetByDay } = useMemo(() => {
    let net = 0, count = 0;
    const ponctuel = {}, all = {};
    data.transactions.forEach((t) => {
      if (monthKey(t.date) !== mk) return;
      const d = parseInt(t.date.slice(8, 10), 10);
      const signed = t.type === 'income' ? t.amount : -t.amount;
      all[d] = (all[d] || 0) + signed;
      if (t.nature === 'mensuelle') {
        net += signed;
        count += 1;
      } else {
        ponctuel[d] = (ponctuel[d] || 0) + signed;
      }
    });
    return { monthlyNet: net, hasMensuelle: count > 0, ponctuelNetByDay: ponctuel, allNetByDay: all };
  }, [data.transactions, mk]);

  const manualBudget = data.monthlyTargets?.[mk] || 0;
  const hasTarget = hasMensuelle || manualBudget > 0;
  const effectiveBudget = hasMensuelle ? monthlyNet : manualBudget;
  const effectiveDailyTarget = hasTarget ? effectiveBudget / daysInMonth : null;

  const lastKnownDay = isCurrentMonth ? todayDay : daysInMonth;
  const cumulSoFar = useMemo(() => {
    if (effectiveDailyTarget !== null) {
      let ponctSum = 0;
      for (let d = 1; d <= lastKnownDay; d++) ponctSum += ponctuelNetByDay[d] || 0;
      return lastKnownDay * effectiveDailyTarget + ponctSum;
    }
    let s = 0;
    for (let d = 1; d <= lastKnownDay; d++) s += allNetByDay[d] || 0;
    return s;
  }, [effectiveDailyTarget, ponctuelNetByDay, allNetByDay, lastKnownDay]);

  const remainingDays = isCurrentMonth ? Math.max(0, daysInMonth - todayDay) : 0;
  const remainingTarget = hasTarget ? effectiveBudget - cumulSoFar : null;
  const perDayNeeded = remainingTarget !== null && remainingDays > 0 ? remainingTarget / remainingDays : remainingTarget;

  const weeks = [];
  let cells = Array(firstWeekday).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  while (cells.length % 7 !== 0) cells.push(null);
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const openBudgetEdit = () => { setBudgetInput(manualBudget > 0 ? String(manualBudget) : ''); setEditingBudget(true); };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: '8px 8px' }}>
        <button onClick={() => setViewDate((d) => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; })} style={{ background: T.surfaceAlt, border: 'none', borderRadius: 10, padding: 8 }}><ChevronLeft size={15} color={T.text} /></button>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{MONTH_LABELS_FULL[month]} {year}</div>
        <button onClick={() => setViewDate((d) => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; })} style={{ background: T.surfaceAlt, border: 'none', borderRadius: 10, padding: 8 }}><ChevronRight size={15} color={T.text} /></button>
      </div>

      <div style={{ background: T.accentSoft, borderRadius: 16, padding: '12px 14px' }}>
        <div style={{ fontSize: 11.5, color: T.accent, fontWeight: 600, marginBottom: 6 }}>Épargne prévisionnelle — {MONTH_LABELS_FULL[month]}</div>
        {hasMensuelle ? (
          <div className="fnum" style={{ fontSize: 15, fontWeight: 700, color: T.accent }}>{fmtMoney(monthlyNet)}</div>
        ) : editingBudget ? (
          <div className="flex gap-2">
            <input autoFocus type="number" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} placeholder="Montant en €"
              style={{ flex: 1, border: `1px solid ${T.border}`, borderRadius: 10, padding: '8px 10px', fontSize: 13, background: T.surface, color: T.text }} />
            <button onClick={() => { setMonthlyTarget(mk, parseFloat(budgetInput) || 0); setEditingBudget(false); }}
              style={{ background: T.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '0 14px', fontSize: 12, fontWeight: 600 }}>OK</button>
          </div>
        ) : (
          <button onClick={openBudgetEdit} className="flex items-center gap-2" style={{ background: 'none', border: 'none', color: T.accent, fontSize: 15, fontWeight: 700 }}>
            {manualBudget > 0 ? fmtMoney(manualBudget) : 'Définir un montant manuellement'} <Pencil size={13} />
          </button>
        )}
        {effectiveDailyTarget !== null && (
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>Soit un objectif de {fmtMoney(effectiveDailyTarget)} / jour sur {daysInMonth} jours.</div>
        )}
        <div style={{ fontSize: 10, color: T.textMuted, marginTop: 6 }}>
          {hasMensuelle
            ? 'Calculé automatiquement à partir de vos transactions "Mensuelles" (salaires, loyer, factures…).'
            : 'Ajoutez des transactions "Mensuelles" pour un calcul automatique, ou définissez un montant manuellement.'}
        </div>
      </div>

      <div>
        <div className="flex" style={{ marginBottom: 4 }}>
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: T.textMuted, fontWeight: 600 }}>{d}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex" style={{ gap: 3, marginBottom: 3 }}>
            {week.map((d, di) => {
              if (d === null) return <div key={di} style={{ flex: 1 }} />;
              const ponctuelNet = ponctuelNetByDay[d] || 0;
              let value, hasData;
              if (effectiveDailyTarget !== null) {
                value = effectiveDailyTarget + ponctuelNet;
                hasData = true;
              } else {
                value = allNetByDay[d];
                hasData = value !== undefined;
              }
              const isFuture = isCurrentMonth && d > todayDay;
              const isToday = isCurrentMonth && d === todayDay;
              let bg = T.surfaceAlt, fg = T.textMuted;
              if (hasData && !isFuture) {
                const ok = effectiveDailyTarget !== null ? ponctuelNet >= 0 : value >= 0;
                bg = ok ? T.primarySoft : T.secondarySoft;
                fg = ok ? T.primary : T.secondary;
              }
              return (
                <button key={di} onClick={() => onAddForDate(`${mk}-${String(d).padStart(2, '0')}`)}
                  style={{ flex: 1, minHeight: 44, borderRadius: 10, border: isToday ? `1.5px solid ${T.accent}` : 'none',
                    background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4px 0', opacity: isFuture ? 0.5 : 1 }}>
                  <span style={{ fontSize: 10.5, color: isToday ? T.accent : T.textMuted, fontWeight: isToday ? 700 : 500 }}>{d}</span>
                  {hasData && (
                    <span className="fnum" style={{ fontSize: 9.5, fontWeight: 700, color: fg }}>{value >= 0 ? '+' : ''}{Math.round(value)}€</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: '14px 16px' }}>
        <div className="flex items-center justify-between" style={{ fontSize: 12.5, marginBottom: 6 }}>
          <span style={{ color: T.textMuted }}>Épargne réelle depuis le début du mois</span>
          <span className="fnum" style={{ fontWeight: 700, color: cumulSoFar >= 0 ? T.primary : T.secondary }}>{fmtMoney(cumulSoFar)}</span>
        </div>
        {hasTarget && isCurrentMonth && (
          <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>
            {remainingTarget > 0
              ? <>Il te reste <b style={{ color: T.text }}>{remainingDays}</b> jours pour économiser encore <b style={{ color: T.text }}>{fmtMoney(remainingTarget)}</b>, soit <b style={{ color: T.text }}>{fmtMoney(perDayNeeded)}</b> / jour.</>
              : <>Objectif du mois déjà atteint, bravo ! 🎉</>}
          </div>
        )}
        {hasTarget && !isCurrentMonth && (
          <div style={{ fontSize: 12, color: T.textMuted }}>
            Objectif du mois : {fmtMoney(effectiveBudget)} — {cumulSoFar >= effectiveBudget ? 'atteint ✅' : `manqué de ${fmtMoney(effectiveBudget - cumulSoFar)}`}
          </div>
        )}
        <div style={{ fontSize: 10.5, color: T.textMuted, marginTop: 8 }}>Astuce : touche un jour pour y ajouter une transaction rétroactivement.</div>
      </div>
    </div>
  );
}

/* ---------------------------------- goals ---------------------------------- */

function GoalsView({ T, data, addGoal, contributeGoal, deleteGoal }) {
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [contribId, setContribId] = useState(null);
  const [contribVal, setContribVal] = useState('');

  return (
    <div className="flex flex-col gap-3" style={{ animation: 'fadeIn 0.3s' }}>
      <div className="flex items-center justify-between" style={{ marginTop: 6 }}>
        <div className="fnum" style={{ fontSize: 20, fontWeight: 700 }}>Objectifs</div>
        <button onClick={() => setShowNew(!showNew)} className="flex items-center gap-1" style={{ background: T.primarySoft, color: T.primary, border: 'none', borderRadius: 12, padding: '7px 12px', fontSize: 12, fontWeight: 600 }}>
          <Plus size={13} /> Nouveau
        </button>
      </div>

      {showNew && (
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 14 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de l'objectif (ex. Vacances)"
            style={{ width: '100%', border: `1px solid ${T.border}`, borderRadius: 10, padding: '9px 12px', fontSize: 13, background: T.bg, color: T.text, marginBottom: 8 }} />
          <input value={target} onChange={(e) => setTarget(e.target.value)} type="number" placeholder="Montant cible (€)"
            style={{ width: '100%', border: `1px solid ${T.border}`, borderRadius: 10, padding: '9px 12px', fontSize: 13, background: T.bg, color: T.text, marginBottom: 10 }} />
          <button onClick={() => { if (name.trim() && parseFloat(target) > 0) { addGoal({ name: name.trim(), target: parseFloat(target) }); setName(''); setTarget(''); setShowNew(false); } }}
            style={{ width: '100%', background: T.primary, color: '#fff', border: 'none', borderRadius: 10, padding: '9px 0', fontSize: 13, fontWeight: 600 }}>
            Créer
          </button>
        </div>
      )}

      {data.goals.length === 0 && !showNew && (
        <div className="flex flex-col items-center gap-2" style={{ padding: '30px 0', color: T.textMuted }}>
          <PiggyBank size={30} />
          <div style={{ fontSize: 13 }}>Aucun objectif pour l'instant.</div>
        </div>
      )}

      {data.goals.map((g) => {
        const pct = Math.min(100, (g.current / g.target) * 100);
        return (
          <div key={g.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 14 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{g.name}</div>
              <button onClick={() => deleteGoal(g.id)} style={{ background: 'none', border: 'none', color: T.textMuted }}><Trash2 size={14} /></button>
            </div>
            <div style={{ height: 9, background: T.surfaceAlt, borderRadius: 5, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: T.accent, borderRadius: 5, transition: 'width 0.3s' }} />
            </div>
            <div className="flex items-center justify-between" style={{ fontSize: 12, color: T.textMuted, marginBottom: 8 }}>
              <span>{fmtMoney(g.current)} / {fmtMoney(g.target)}</span>
              <span>{Math.round(pct)}%</span>
            </div>
            {contribId === g.id ? (
              <div className="flex gap-2">
                <input autoFocus type="number" value={contribVal} onChange={(e) => setContribVal(e.target.value)} placeholder="Montant"
                  style={{ flex: 1, border: `1px solid ${T.border}`, borderRadius: 10, padding: '7px 10px', fontSize: 12, background: T.bg, color: T.text }} />
                <button onClick={() => { contributeGoal(g.id, parseFloat(contribVal) || 0); setContribId(null); setContribVal(''); }}
                  style={{ background: T.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '0 14px', fontSize: 12, fontWeight: 600 }}>OK</button>
              </div>
            ) : (
              <button onClick={() => setContribId(g.id)} className="flex items-center justify-center gap-1" style={{ width: '100%', background: T.accentSoft, color: T.accent, border: 'none', borderRadius: 10, padding: '8px 0', fontSize: 12, fontWeight: 600 }}>
                <Plus size={13} /> Ajouter une contribution
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------------- settings ---------------------------------- */

function SettingsView({ T, data, myProfile, isDark, toggleTheme, exportCSV, deleteRecurring, toggleRecurringActive, addCategory, deleteCategory, switchProfile, musicOn, toggleMusic }) {
  const [showNewCat, setShowNewCat] = useState(false);
  const [catName, setCatName] = useState('');

  return (
    <div className="flex flex-col gap-4" style={{ animation: 'fadeIn 0.3s' }}>
      <div className="fnum" style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>Réglages</div>

      <Section T={T} title="Apparence">
        <RowButton T={T} icon={isDark ? Sun : Moon} label={isDark ? 'Mode clair' : 'Mode sombre'} onClick={toggleTheme} />
        <div style={{ height: 8 }} />
        <RowButton T={T} icon={Music} label={musicOn ? 'Musique de fond : activée' : 'Musique de fond : désactivée'} onClick={toggleMusic} />
      </Section>

      <Section T={T} title="Profil">
        <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 8 }}>Connecté en tant que <b style={{ color: T.text }}>{myProfile}</b></div>
        <RowButton T={T} icon={User} label="Se déconnecter" onClick={switchProfile} />
      </Section>

      <Section T={T} title="Catégories de dépenses">
        <div className="flex flex-col gap-2">
          {data.expenseCategories.map((c) => (
            <div key={c.id} className="flex items-center gap-2" style={{ fontSize: 13 }}>
              <CategoryIcon name={c.icon} size={15} color={T[c.colorKey] || T.textMuted} />
              <span style={{ flex: 1 }}>{c.name}</span>
              <button onClick={() => deleteCategory(c.id, 'expense')} style={{ background: 'none', border: 'none', color: T.textMuted }}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, margin: '12px 0 6px' }}>Ajouter rapidement (émoticônes)</div>
        <div className="flex flex-wrap gap-2" style={{ marginBottom: 10 }}>
          {PRESET_EXPENSE_CATEGORIES.filter((p) => !data.expenseCategories.some((c) => c.name === p.name)).map((p, i) => (
            <button key={p.name} onClick={() => addCategory(p.name, p.icon, PRESET_COLOR_CYCLE[i % PRESET_COLOR_CYCLE.length], 'expense')}
              className="flex items-center gap-1" style={{ background: T.surfaceAlt, border: 'none', borderRadius: 10, padding: '6px 10px', fontSize: 12, color: T.text }}>
              <span style={{ fontSize: 15 }}>{p.icon}</span> {p.name}
            </button>
          ))}
        </div>

        {showNewCat ? (
          <div className="flex gap-2" style={{ marginTop: 10 }}>
            <input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Nom de la catégorie" style={{ flex: 1, border: `1px solid ${T.border}`, borderRadius: 10, padding: '7px 10px', fontSize: 12, background: T.bg, color: T.text }} />
            <button onClick={() => { if (catName.trim()) { addCategory(catName.trim(), 'MoreHorizontal', 'accent', 'expense'); setCatName(''); setShowNewCat(false); } }}
              style={{ background: T.primary, color: '#fff', border: 'none', borderRadius: 10, padding: '0 12px', fontSize: 12, fontWeight: 600 }}>Ajouter</button>
          </div>
        ) : (
          <RowButton T={T} icon={Plus} label="Ajouter une catégorie personnalisée" onClick={() => setShowNewCat(true)} small />
        )}
      </Section>

      {data.recurring.length > 0 && (
        <Section T={T} title="Transactions récurrentes">
          <div className="flex flex-col gap-2">
            {data.recurring.map((r) => (
              <div key={r.id} className="flex items-center gap-2" style={{ fontSize: 13, opacity: r.active === false ? 0.5 : 1 }}>
                <Repeat size={14} color={T.textMuted} />
                <span style={{ flex: 1 }}>{r.label} · {fmtMoney(r.amount)} · le {r.dayOfMonth}</span>
                <button onClick={() => toggleRecurringActive(r.id)} style={{ background: 'none', border: 'none', color: T.textMuted, fontSize: 11 }}>{r.active === false ? 'Reprendre' : 'Pause'}</button>
                <button onClick={() => deleteRecurring(r.id)} style={{ background: 'none', border: 'none', color: T.textMuted }}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section T={T} title="Données">
        <RowButton T={T} icon={Download} label="Exporter en CSV" onClick={exportCSV} />
      </Section>

      <div style={{ textAlign: 'center', color: T.textMuted, fontSize: 11, marginTop: 8 }}>Ad&Lie Budget · votre budget partagé</div>
    </div>
  );
}

function Section({ T, title, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: T.textMuted, fontWeight: 600, marginBottom: 8, paddingLeft: 2 }}>{title}</div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 14 }}>{children}</div>
    </div>
  );
}
function RowButton({ T, icon: Icon, label, onClick, small }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2" style={{ width: '100%', background: 'none', border: 'none', padding: small ? '4px 0' : '2px 0', fontSize: small ? 12 : 13.5, color: small ? T.primary : T.text, fontWeight: small ? 600 : 500 }}>
      <Icon size={small ? 13 : 16} color={small ? T.primary : T.textMuted} /> {label}
    </button>
  );
}

/* ---------------------------------- add / edit sheet ---------------------------------- */

function AvoidedSheet({ T, data, myProfile, onClose, onSave }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [payer, setPayer] = useState(myProfile);

  const canSave = name.trim() && parseFloat(price) > 0;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', zIndex: 50, maxWidth: 480, margin: '0 auto' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: T.bg, width: '100%', borderRadius: '24px 24px 0 0', padding: '18px 18px 26px', animation: 'slideUp 0.25s ease-out' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
          <div className="fnum" style={{ fontSize: 17, fontWeight: 700 }}>🏆 J'ai résisté !</div>
          <button onClick={onClose} style={{ background: T.surfaceAlt, border: 'none', borderRadius: 10, padding: 7 }}><X size={16} color={T.text} /></button>
        </div>
        <div style={{ fontSize: 12.5, color: T.textMuted, marginBottom: 18 }}>
          J'ai eu envie de l'acheter, vraiment. Mais finalement, je ne l'ai pas fait.
        </div>

        <label style={{ fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 600, display: 'block' }}>Qu'est-ce que tu voulais acheter ?</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ex. Nouvelles baskets"
          style={{ width: '100%', border: `1px solid ${T.border}`, borderRadius: 12, padding: '10px 14px', fontSize: 14, background: T.surface, color: T.text, marginBottom: 14 }} />

        <label style={{ fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 600, display: 'block' }}>Son prix</label>
        <input autoFocus type="number" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0"
          style={{ width: '100%', border: `1px solid ${T.border}`, borderRadius: 12, padding: '10px 14px', fontSize: 14, background: T.surface, color: T.text, marginBottom: 14 }} />

        <label style={{ fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 600, display: 'block' }}>Qui a résisté ?</label>
        <select value={payer} onChange={(e) => setPayer(e.target.value)} style={{ width: '100%', border: `1px solid ${T.border}`, borderRadius: 12, padding: '9px 10px', fontSize: 13, background: T.surface, color: T.text, marginBottom: 20 }}>
          {data.profiles.map((p) => <option key={p} value={p}>{p}</option>)}
          <option value={data.profiles.join(' & ')}>{data.profiles.join(' & ')}</option>
        </select>

        <button disabled={!canSave} onClick={() => onSave(name.trim(), parseFloat(price), payer)}
          style={{ width: '100%', background: canSave ? T.accent : T.border, color: '#fff', border: 'none', borderRadius: 14, padding: '13px 0', fontSize: 14, fontWeight: 600 }}>
          Valider mon épargne 🏆
        </button>
      </div>
    </div>
  );
}

function AddSheet({ T, data, myProfile, partner, preset, editingTx, initialDate, onClose, onSave, onDelete, onSaveRecurring }) {
  const [type, setType] = useState(editingTx?.type || preset || 'expense');
  const [amount, setAmount] = useState(editingTx ? String(editingTx.amount) : '');
  const [categoryId, setCategoryId] = useState(editingTx?.categoryId || '');
  const [date, setDate] = useState(editingTx?.date || initialDate || todayISO());
  const [payer, setPayer] = useState(editingTx?.payer || myProfile);
  const [scope, setScope] = useState(editingTx?.scope || 'commune');
  const [nature, setNature] = useState(editingTx?.nature || 'ponctuelle');
  const [note, setNote] = useState(editingTx?.note || '');

  const categories = type === 'income' ? data.incomeCategories : data.expenseCategories;
  useEffect(() => { if (!categoryId && categories.length) setCategoryId(categories[0].id); }, [type]); // eslint-disable-line

  const canSave = parseFloat(amount) > 0 && categoryId;

  const handleSave = () => {
    if (!canSave) return;
    const isNewMensuelle = nature === 'mensuelle' && !editingTx;
    const newRecurringId = isNewMensuelle ? genId() : null;
    const tx = {
      id: editingTx?.id || genId(), type, amount: parseFloat(amount), categoryId, date, payer, scope, nature,
      note: note.trim(),
      recurringId: isNewMensuelle ? newRecurringId : (editingTx?.recurringId || null),
      recurringMonth: isNewMensuelle ? monthKey(date) : (editingTx?.recurringMonth || null),
      createdAt: editingTx?.createdAt || Date.now(),
    };
    onSave(tx);
    if (isNewMensuelle) onSaveRecurring(tx, new Date(date + 'T00:00:00').getDate(), newRecurringId);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', zIndex: 50, maxWidth: 480, margin: '0 auto' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: T.bg, width: '100%', borderRadius: '24px 24px 0 0', padding: '18px 18px 26px', maxHeight: '88vh', overflowY: 'auto', animation: 'slideUp 0.25s ease-out' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
          <div className="fnum" style={{ fontSize: 17, fontWeight: 700 }}>{editingTx ? 'Modifier' : 'Nouvelle transaction'}</div>
          <button onClick={onClose} style={{ background: T.surfaceAlt, border: 'none', borderRadius: 10, padding: 7 }}><X size={16} color={T.text} /></button>
        </div>

        <div className="flex gap-2" style={{ marginBottom: 16 }}>
          {['expense', 'income'].map((t) => (
            <button key={t} onClick={() => { setType(t); setCategoryId(''); }}
              style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 600,
                background: type === t ? (t === 'expense' ? T.secondarySoft : T.primarySoft) : T.surfaceAlt,
                color: type === t ? (t === 'expense' ? T.secondary : T.primary) : T.textMuted }}>
              {t === 'expense' ? 'Dépense' : 'Revenu'}
            </button>
          ))}
        </div>

        <div className="fnum" style={{ textAlign: 'center', marginBottom: 16 }}>
          <input autoFocus type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0"
            style={{ border: 'none', outline: 'none', background: 'none', fontSize: 40, fontWeight: 700, textAlign: 'center', width: '100%', color: T.text }} />
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: -6 }}>EUR</div>
        </div>

        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 8, fontWeight: 600 }}>Catégorie</div>
        <div className="flex flex-wrap gap-2" style={{ marginBottom: 16 }}>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setCategoryId(c.id)}
              className="flex items-center gap-1.5"
              style={{ padding: '8px 12px', borderRadius: 12, border: `1px solid ${categoryId === c.id ? T[c.colorKey] : T.border}`,
                background: categoryId === c.id ? T[c.colorKey + 'Soft'] : T.surface, fontSize: 12.5, color: categoryId === c.id ? T[c.colorKey] : T.text, fontWeight: 500 }}>
              <CategoryIcon name={c.icon} size={14} color={categoryId === c.id ? T[c.colorKey] : T.textMuted} /> {c.name}
            </button>
          ))}
        </div>

        <div className="flex gap-3" style={{ marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 600 }}>Date</div>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', border: `1px solid ${T.border}`, borderRadius: 12, padding: '9px 10px', fontSize: 13, background: T.surface, color: T.text }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 600 }}>Payeur</div>
            <select value={payer} onChange={(e) => setPayer(e.target.value)} style={{ width: '100%', border: `1px solid ${T.border}`, borderRadius: 12, padding: '9px 10px', fontSize: 13, background: T.surface, color: T.text }}>
              {data.profiles.map((p) => <option key={p} value={p}>{p}</option>)}
              <option value={data.profiles.join(' & ')}>{data.profiles.join(' & ')}</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 8, fontWeight: 600 }}>Portée</div>
        <div className="flex gap-2" style={{ marginBottom: 14 }}>
          {[{ id: 'commune', label: 'Commune' }, { id: 'perso', label: 'Personnelle' }].map((s) => (
            <button key={s.id} onClick={() => setScope(s.id)}
              style={{ flex: 1, padding: '9px 0', borderRadius: 12, border: 'none', fontSize: 12.5, fontWeight: 600,
                background: scope === s.id ? T.accentSoft : T.surfaceAlt, color: scope === s.id ? T.accent : T.textMuted }}>
              {s.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 8, fontWeight: 600 }}>Nature</div>
        <div className="flex gap-2" style={{ marginBottom: 4 }}>
          {[{ id: 'mensuelle', label: 'Mensuelle (anticipée)' }, { id: 'ponctuelle', label: 'Ponctuelle (quotidien)' }].map((s) => (
            <button key={s.id} onClick={() => setNature(s.id)}
              style={{ flex: 1, padding: '9px 4px', borderRadius: 12, border: 'none', fontSize: 12, fontWeight: 600,
                background: nature === s.id ? T.primarySoft : T.surfaceAlt, color: nature === s.id ? T.primary : T.textMuted }}>
              {s.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 10.5, color: T.textMuted, marginBottom: 14 }}>
          {nature === 'mensuelle'
            ? 'Salaire, CAF, loyer, EDF… se répète automatiquement chaque mois et sert de base à votre épargne prévisionnelle.'
            : 'Dépense ou rentrée ponctuelle du quotidien, comptée jour par jour dans le calendrier.'}
        </div>

        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optionnel)"
          style={{ width: '100%', border: `1px solid ${T.border}`, borderRadius: 12, padding: '10px 14px', fontSize: 13, background: T.surface, color: T.text, marginBottom: 14 }} />

        <button disabled={!canSave} onClick={handleSave}
          style={{ width: '100%', background: canSave ? T.primary : T.border, color: '#fff', border: 'none', borderRadius: 14, padding: '13px 0', fontSize: 14, fontWeight: 600, marginBottom: editingTx ? 8 : 0 }}>
          {editingTx ? 'Enregistrer' : 'Ajouter'}
        </button>
        {editingTx && (
          <button onClick={() => { onDelete(editingTx.id); onClose(); }}
            style={{ width: '100%', background: T.secondarySoft, color: T.secondary, border: 'none', borderRadius: 14, padding: '11px 0', fontSize: 13, fontWeight: 600 }}>
            Supprimer cette transaction
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- mount ---------------------------------- */
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
