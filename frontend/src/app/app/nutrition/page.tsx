'use client';

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Apple, AlertTriangle, Droplets, Flame, Beef, Plus, Upload, X, Camera } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const macroData = [
    { name: 'Carbs', value: 50, color: '#0EA5A4' },
    { name: 'Protein', value: 25, color: '#6366F1' },
    { name: 'Fat', value: 25, color: '#F59E0B' },
];

export default function NutritionPage() {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [meals, setMeals] = useState([
        { time: '8:00 AM', name: 'Oatmeal with fruits', calories: 350, type: 'Breakfast' },
        { time: '10:30 AM', name: 'Greek yogurt', calories: 150, type: 'Snack' },
        { time: '1:00 PM', name: 'Grilled chicken salad', calories: 450, type: 'Lunch' },
        { time: '4:00 PM', name: 'Mixed nuts', calories: 200, type: 'Snack' },
        { time: '7:30 PM', name: 'Dal with rice & veggies', calories: 550, type: 'Dinner' },
    ]);

    const [showAddForm, setShowAddForm] = useState(false);
    const [newFood, setNewFood] = useState('');
    const [newCalories, setNewCalories] = useState('');
    const [newType, setNewType] = useState('Snack');
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);

    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
    const goalCalories = 2000;

    const dailyData = [
        { time: '8 AM', calories: 350 },
        { time: '10 AM', calories: 150 },
        { time: '1 PM', calories: 450 },
        { time: '4 PM', calories: 200 },
        { time: '7 PM', calories: 550 },
    ];

    const macros = [
        { label: 'Carbohydrates', current: 210, goal: 250, unit: 'g', color: '#0EA5A4' },
        { label: 'Protein', current: 65, goal: 80, unit: 'g', color: '#6366F1' },
        { label: 'Fat', current: 55, goal: 65, unit: 'g', color: '#F59E0B' },
        { label: 'Fiber', current: 18, goal: 30, unit: 'g', color: '#22C55E' },
    ];

    const handleAddFood = () => {
        if (!newFood.trim() || !newCalories.trim()) return;
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        setMeals(prev => [...prev, { time, name: newFood, calories: parseInt(newCalories), type: newType }]);
        setNewFood('');
        setNewCalories('');
        setShowAddForm(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setUploadedImage(ev.target?.result as string);
            setAnalyzing(true);
            setTimeout(() => {
                setAnalyzing(false);
                setMeals(prev => [...prev, {
                    time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
                    name: '📸 Detected: Mixed bowl (rice, dal, veggies)',
                    calories: 480,
                    type: 'Lunch',
                }]);
                setUploadedImage(null);
            }, 2000);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    return (
        <div style={{ padding: '24px 32px', overflowY: 'auto', maxHeight: '100vh' }}>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Apple size={28} color="#22C55E" /> {t('nutritionModule.title')}
                </h1>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => fileInputRef.current?.click()} style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
                        borderRadius: 12, border: '1px solid #E2E8F0', background: 'white',
                        cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#475569',
                    }}>
                        <Camera size={16} /> Scan Food
                    </button>
                    <button onClick={() => setShowAddForm(!showAddForm)} className="btn-gradient" style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 12, fontSize: 13,
                    }}>
                        <Plus size={16} /> Add Food
                    </button>
                </div>
            </div>

            {/* Image Processing */}
            {uploadedImage && (
                <div style={{
                    marginBottom: 20, padding: 16, borderRadius: 16, background: '#F0FDFA',
                    border: '1px solid #CCFBF1', display: 'flex', alignItems: 'center', gap: 16,
                }}>
                    <img src={uploadedImage} alt="Food" style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover' }} />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#0F766E' }}>
                            {analyzing ? '🔍 Analyzing food image...' : '✅ Food detected!'}
                        </div>
                        {analyzing && <div style={{ fontSize: 12, color: '#0D9488' }}>Identifying ingredients and estimating calories</div>}
                    </div>
                </div>
            )}

            {/* Manual Add Form */}
            {showAddForm && (
                <div style={{
                    marginBottom: 24, padding: 20, borderRadius: 16, background: 'white',
                    border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div style={{ flex: 2 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 4, display: 'block' }}>Food Item</label>
                            <input value={newFood} onChange={e => setNewFood(e.target.value)}
                                placeholder="e.g., Roti with sabzi"
                                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 14, outline: 'none' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 4, display: 'block' }}>Calories</label>
                            <input value={newCalories} onChange={e => setNewCalories(e.target.value)} type="number"
                                placeholder="250"
                                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 14, outline: 'none' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 4, display: 'block' }}>Meal Type</label>
                            <select value={newType} onChange={e => setNewType(e.target.value)}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 14, outline: 'none', background: 'white' }}>
                                <option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option>
                            </select>
                        </div>
                        <button onClick={handleAddFood} className="btn-gradient" style={{ padding: '10px 20px', borderRadius: 10, fontSize: 13, whiteSpace: 'nowrap' }}>
                            Add Entry
                        </button>
                    </div>
                </div>
            )}

            {/* Top Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                    { label: t('nutritionModule.dailyCalories'), value: `${totalCalories} / ${goalCalories}`, icon: Flame, color: '#EF4444', pct: (totalCalories / goalCalories) * 100 },
                    { label: 'Protein', value: '65g / 80g', icon: Beef, color: '#6366F1', pct: 81 },
                    { label: 'Water', value: '6 / 8 glasses', icon: Droplets, color: '#3B82F6', pct: 75 },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="card" style={{ padding: 20, borderRadius: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <Icon size={18} color={stat.color} /> <span style={{ fontSize: 13, fontWeight: 500, color: '#64748B' }}>{stat.label}</span>
                            </div>
                            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{stat.value}</div>
                            <div style={{ height: 6, background: '#F1F5F9', borderRadius: 99 }}>
                                <div style={{ height: '100%', width: `${Math.min(stat.pct, 100)}%`, borderRadius: 99, background: `linear-gradient(90deg, ${stat.color}, ${stat.color}88)`, transition: 'width 0.5s' }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Macro Tracking Bars */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>Macro Tracking</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {macros.map((m, i) => (
                        <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{m.label}</span>
                                <span style={{ fontSize: 13, color: '#64748B' }}>{m.current}{m.unit} / {m.goal}{m.unit}</span>
                            </div>
                            <div style={{ height: 10, background: '#F1F5F9', borderRadius: 99 }}>
                                <div style={{ height: '100%', width: `${(m.current / m.goal) * 100}%`, background: m.color, borderRadius: 99, transition: 'width 0.5s' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                {/* Daily Calorie Chart */}
                <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Daily Calorie Intake</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={dailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="time" fontSize={11} stroke="#94A3B8" />
                            <YAxis fontSize={11} stroke="#94A3B8" />
                            <Tooltip />
                            <Bar dataKey="calories" fill="url(#calGradient)" radius={[6, 6, 0, 0]} />
                            <defs>
                                <linearGradient id="calGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#0EA5A4" />
                                    <stop offset="100%" stopColor="#6366F1" />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Macro Chart */}
                <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>{t('nutritionModule.macros')}</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={macroData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                                {macroData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Warnings */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: '#FEF3C7', border: '1px solid #FCD34D' }}>
                    <AlertTriangle size={16} color="#F59E0B" />
                    <span style={{ fontSize: 13, color: '#92400E' }}>High sodium intake detected (2,800mg)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: '#FEE2E2', border: '1px solid #FECACA' }}>
                    <AlertTriangle size={16} color="#EF4444" />
                    <span style={{ fontSize: 13, color: '#991B1B' }}>Low protein — 15g below daily target</span>
                </div>
            </div>

            {/* Meal Log */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>{t('nutritionModule.mealLog')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {meals.map((meal, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '12px 16px', borderRadius: 12, background: '#F8FAFC', transition: 'background 0.2s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = '#F0FDFA'}
                            onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <span style={{ fontSize: 12, color: '#94A3B8', width: 60 }}>{meal.time}</span>
                                <div>
                                    <div style={{ fontWeight: 500, fontSize: 14, color: '#0F172A' }}>{meal.name}</div>
                                    <div style={{ fontSize: 12, color: '#94A3B8' }}>{meal.type}</div>
                                </div>
                            </div>
                            <span style={{ fontWeight: 600, color: '#0EA5A4', fontSize: 14 }}>{meal.calories} kcal</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
