'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, Save, RotateCcw } from 'lucide-react';

interface CalcResult { label: string; value: string; color: string; }

export default function CalculatorsPage() {
    const { t } = useTranslation();
    const [activeCalc, setActiveCalc] = useState('bmi');
    const [result, setResult] = useState<CalcResult | null>(null);

    // BMI
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    // Calorie
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('male');
    const [activityLevel, setActivityLevel] = useState('moderate');
    // Heart Risk
    const [systolic, setSystolic] = useState('');
    const [cholesterol, setCholesterol] = useState('');
    const [smoker, setSmoker] = useState(false);
    // Water
    const [waterWeight, setWaterWeight] = useState('');
    const [exercise, setExercise] = useState('30');

    const calcs = [
        { key: 'bmi', label: t('calculators.bmi'), emoji: '📊' },
        { key: 'calorie', label: t('calculators.calorie'), emoji: '🔥' },
        { key: 'heartRisk', label: t('calculators.heartRisk'), emoji: '❤️' },
        { key: 'waterIntake', label: t('calculators.waterIntake'), emoji: '💧' },
    ];

    const calculateBMI = () => {
        const h = parseFloat(height) / 100;
        const w = parseFloat(weight);
        if (!h || !w) return;
        const bmi = w / (h * h);
        const category = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
        const color = bmi < 18.5 ? '#F59E0B' : bmi < 25 ? '#22C55E' : bmi < 30 ? '#F59E0B' : '#EF4444';
        setResult({ label: category, value: bmi.toFixed(1), color });
    };

    const calculateCalories = () => {
        const a = parseInt(age);
        const w = parseFloat(weight);
        if (!a || !w) return;
        let bmr = gender === 'male' ? 88.362 + (13.397 * w) + (4.799 * 170) - (5.677 * a) : 447.593 + (9.247 * w) + (3.098 * 170) - (4.330 * a);
        const multipliers: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryActive: 1.9 };
        const total = Math.round(bmr * (multipliers[activityLevel] || 1.55));
        setResult({ label: 'Daily Calorie Need', value: `${total} kcal`, color: '#0EA5A4' });
    };

    const calculateHeartRisk = () => {
        const s = parseInt(systolic);
        const c = parseInt(cholesterol);
        if (!s || !c) return;
        let risk = 0;
        if (s > 140) risk += 30;
        else if (s > 120) risk += 15;
        if (c > 240) risk += 25;
        else if (c > 200) risk += 10;
        if (smoker) risk += 25;
        const level = risk > 50 ? 'High' : risk > 25 ? 'Moderate' : 'Low';
        const color = risk > 50 ? '#EF4444' : risk > 25 ? '#F59E0B' : '#22C55E';
        setResult({ label: `${level} Risk`, value: `${risk}%`, color });
    };

    const calculateWater = () => {
        const w = parseFloat(waterWeight);
        const e = parseInt(exercise);
        if (!w) return;
        const base = w * 0.033;
        const extra = (e / 30) * 0.35;
        const total = (base + extra).toFixed(1);
        setResult({ label: 'Daily Water Intake', value: `${total} L`, color: '#3B82F6' });
    };

    const handleCalculate = () => {
        if (activeCalc === 'bmi') calculateBMI();
        else if (activeCalc === 'calorie') calculateCalories();
        else if (activeCalc === 'heartRisk') calculateHeartRisk();
        else calculateWater();
    };

    const inputStyle = {
        border: '1px solid #E2E8F0', borderRadius: 12, padding: '12px 16px',
        fontSize: 14, outline: 'none', width: '100%', background: '#F8FAFC',
    };

    return (
        <div style={{ padding: 32, maxWidth: 800, overflowY: 'auto' }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Calculator size={28} color="#0EA5A4" /> {t('calculators.title')}
            </h1>

            <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
                {calcs.map(c => (
                    <button key={c.key} onClick={() => { setActiveCalc(c.key); setResult(null); }} style={{
                        padding: '10px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
                        background: activeCalc === c.key ? '#0EA5A4' : '#F1F5F9',
                        color: activeCalc === c.key ? 'white' : '#64748B',
                        fontWeight: 500, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                        {c.emoji} {c.label}
                    </button>
                ))}
            </div>

            <div className="card" style={{ padding: 32 }}>
                {activeCalc === 'bmi' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6, display: 'block' }}>Height (cm)</label>
                            <input value={height} onChange={e => setHeight(e.target.value)} type="number" placeholder="170" style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6, display: 'block' }}>Weight (kg)</label>
                            <input value={weight} onChange={e => setWeight(e.target.value)} type="number" placeholder="70" style={inputStyle} />
                        </div>
                    </div>
                )}
                {activeCalc === 'calorie' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6, display: 'block' }}>Age</label>
                                <input value={age} onChange={e => setAge(e.target.value)} type="number" placeholder="30" style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6, display: 'block' }}>Weight (kg)</label>
                                <input value={weight} onChange={e => setWeight(e.target.value)} type="number" placeholder="70" style={inputStyle} />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6, display: 'block' }}>Gender</label>
                            <select value={gender} onChange={e => setGender(e.target.value)} style={inputStyle}>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6, display: 'block' }}>Activity Level</label>
                            <select value={activityLevel} onChange={e => setActivityLevel(e.target.value)} style={inputStyle}>
                                <option value="sedentary">Sedentary</option>
                                <option value="light">Lightly Active</option>
                                <option value="moderate">Moderately Active</option>
                                <option value="active">Active</option>
                                <option value="veryActive">Very Active</option>
                            </select>
                        </div>
                    </div>
                )}
                {activeCalc === 'heartRisk' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6, display: 'block' }}>Systolic BP (mmHg)</label>
                            <input value={systolic} onChange={e => setSystolic(e.target.value)} type="number" placeholder="120" style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6, display: 'block' }}>Total Cholesterol (mg/dL)</label>
                            <input value={cholesterol} onChange={e => setCholesterol(e.target.value)} type="number" placeholder="200" style={inputStyle} />
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                            <input type="checkbox" checked={smoker} onChange={e => setSmoker(e.target.checked)} />
                            Current smoker
                        </label>
                    </div>
                )}
                {activeCalc === 'waterIntake' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6, display: 'block' }}>Weight (kg)</label>
                            <input value={waterWeight} onChange={e => setWaterWeight(e.target.value)} type="number" placeholder="70" style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6, display: 'block' }}>Daily Exercise (minutes)</label>
                            <input value={exercise} onChange={e => setExercise(e.target.value)} type="number" placeholder="30" style={inputStyle} />
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                    <button onClick={handleCalculate} className="btn-gradient" style={{ flex: 1, justifyContent: 'center' }}>
                        <Calculator size={16} /> Calculate
                    </button>
                    <button onClick={() => setResult(null)} style={{
                        padding: '10px 20px', borderRadius: 12, border: '1px solid #E2E8F0',
                        background: 'white', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                        <RotateCcw size={16} /> Reset
                    </button>
                </div>

                {result && (
                    <div style={{
                        marginTop: 24, padding: 24, borderRadius: 16, textAlign: 'center',
                        background: `${result.color}11`, border: `2px solid ${result.color}33`,
                    }}>
                        <div style={{ fontSize: 40, fontWeight: 800, color: result.color, marginBottom: 4 }}>{result.value}</div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: result.color }}>{result.label}</div>
                        <button style={{
                            marginTop: 16, padding: '8px 16px', borderRadius: 10,
                            background: result.color, color: 'white', border: 'none',
                            cursor: 'pointer', fontSize: 13, fontWeight: 500,
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                        }}>
                            <Save size={14} /> Save to Profile
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
