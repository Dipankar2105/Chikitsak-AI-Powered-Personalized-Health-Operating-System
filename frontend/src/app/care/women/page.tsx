'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronDown, Heart, Activity, AlertTriangle, Baby, ShieldCheck, Pill, Stethoscope, Utensils, Zap } from 'lucide-react';
import Link from 'next/link';

const sections = [
    {
        title: 'Reproductive Health', icon: Heart, color: '#EC4899',
        items: [
            {
                name: 'Polycystic Ovary Syndrome (PCOS)',
                description: 'A hormonal disorder common among women of reproductive age. Women with PCOS may have infrequent or prolonged menstrual periods or excess male hormone (androgen) levels.',
                symptoms: ['Irregular periods', 'Excess facial and body hair', 'Severe acne', 'Male-pattern baldness', 'Weight gain or difficulty losing weight'],
                riskFactors: ['Family history of PCOS', 'Insulin resistance', 'Obesity'],
                diagnosis: ['Pelvic examination', 'Blood tests for hormone levels and glucose tolerance', 'Pelvic ultrasound'],
                treatment: ['Lifestyle modifications', 'Hormonal regulation', 'Insulin management'],
                medications: ['Hormonal birth control pills', 'Metformin (for insulin resistance)', 'Anti-androgen medications (Spironolactone)', 'Letrozole (for ovulation)'],
                therapies: ['Cognitive behavioral therapy (CBT) for associated anxiety/depression', 'Laser hair removal for hirsutism'],
                dietRecommendations: ['Low-glycemic index (GI) diet', 'Anti-inflammatory foods (berries, fatty fish, leafy greens)', 'Limit refined carbohydrates and sugars'],
                prevention: ['Maintain a healthy weight', 'Regular physical activity', 'Routine blood sugar monitoring'],
                lifestyle: ['Manage stress levels through yoga or meditation', 'Prioritize good sleep hygiene (7-9 hours)', 'Regular moderate-intensity exercise'],
                whenToConsult: 'If you experience significant weight gain, absent periods for over three months, or severe acne.',
                emergencyWarningSigns: ['Sudden, severe pelvic pain (could indicate a ruptured cyst)', 'Heavy, uncontrollable vaginal bleeding', 'Fainting or severe dizziness']
            },
            {
                name: 'Endometriosis',
                description: 'A disorder in which tissue similar to the tissue that normally lines the inside of your uterus grows outside your uterus.',
                symptoms: ['Painful periods (dysmenorrhea)', 'Pain with intercourse', 'Pain with bowel movements or urination', 'Excessive bleeding', 'Infertility'],
                riskFactors: ['Never giving birth', 'Starting your period at an early age', 'Going through menopause at an older age', 'Short menstrual cycles'],
                diagnosis: ['Pelvic exam', 'Ultrasound', 'MRI', 'Laparoscopy (for definitive diagnosis)'],
                treatment: ['Pain management', 'Hormone therapy', 'Conservative surgery', 'Hysterectomy (in severe cases)'],
                medications: ['NSAIDs (Ibuprofen, Naproxen) for pain', 'Hormonal contraceptives (pill, patch, ring)', 'Gonadotropin-releasing hormone (GnRH) agonists', 'Progestin therapy'],
                therapies: ['Pelvic floor physical therapy', 'Acupuncture for pain relief', 'Psychological support or counseling'],
                dietRecommendations: ['Anti-inflammatory diet', 'Omega-3 rich foods', 'Limit trans fats, red meat, and gluten (if sensitive)', 'Reduce excessive alcohol and caffeine'],
                prevention: ['Cannot be fully prevented, but lower estrogen levels may reduce risk by exercising regularly.'],
                lifestyle: ['Heat therapy (heating pads) for lower abdominal pain', 'Regular low-impact exercise (swimming, walking)'],
                whenToConsult: 'If severe pelvic pain affects your daily activities or if you are having difficulty getting pregnant.',
                emergencyWarningSigns: ['Sudden, excruciating abdominal pain', 'Inability to stand or walk due to pain', 'Heavy bleeding soaking through more than one pad an hour']
            }
        ],
    },
    {
        title: 'Pregnancy & Maternity', icon: Baby, color: '#0EA5A4',
        items: [
            {
                name: 'Gestational Diabetes',
                description: 'A type of diabetes that develops during pregnancy in women who did not strictly have diabetes before.',
                symptoms: ['Often asymptomatic initially', 'Increased thirst', 'Frequent urination', 'Increased hunger', 'Fatigue'],
                riskFactors: ['Being overweight or obese', 'Lack of physical activity', 'Previous gestational diabetes or prediabetes', 'PCOS', 'Family history of diabetes'],
                diagnosis: ['Initial glucose challenge test (24-28 weeks)', 'Follow-up oral glucose tolerance testing (OGTT)'],
                treatment: ['Blood sugar monitoring', 'Dietary management', 'Physical activity integration'],
                medications: ['Insulin injections (most common if diet/exercise fails)', 'Metformin or Glyburide (in specific cases under strict supervision)'],
                therapies: ['Nutritional counseling with a registered dietitian', 'Fetal monitoring therapies (non-stress tests)'],
                dietRecommendations: ['Controlled carbohydrate portions', 'High fiber intake (vegetables, legumes)', 'Lean proteins and healthy fats', 'Avoid sugary drinks and processed snacks'],
                prevention: ['Eat healthy foods', 'Keep active before and during pregnancy', 'Start pregnancy at a healthy weight'],
                lifestyle: ['Monitor portion sizes strictly', 'Engage in safe, moderate exercise (like prenatal yoga or brisk walking) after meals to lower blood sugar'],
                whenToConsult: 'Regular prenatal screening is essential. Consult if experiencing extreme thirst or frequent urination.',
                emergencyWarningSigns: ['Symptoms of severe hypoglycemia (shaking, sweating, confusion, lightheadedness)', 'Decreased fetal movement', 'Blurred vision']
            }
        ]
    },
    {
        title: 'Hormones & Menopause', icon: Activity, color: '#8B5CF6',
        items: [
            {
                name: 'Menopause & Perimenopause',
                description: 'The natural decline in reproductive hormones when a woman reaches her 40s or 50s.',
                symptoms: ['Irregular periods', 'Vaginal dryness', 'Hot flashes', 'Chills', 'Night sweats', 'Sleep problems', 'Mood changes'],
                riskFactors: ['Age (natural progression)', 'Smoking (can induce earlier menopause)', 'Oophorectomy (ovary removal)'],
                diagnosis: ['Review of symptoms', 'Blood test for Follicle-Stimulating Hormone (FSH) and estrogen levels', 'Bone density scan (DEXA)'],
                treatment: ['Symptom management', 'Bone health preservation', 'Mental health support'],
                medications: ['Hormone Replacement Therapy (HRT) with estrogen/progestin', 'Low-dose vaginal estrogen', 'Low-dose antidepressants (SSRIs) for hot flashes', 'Gabapentin or Clonidine for vasomotor symptoms'],
                therapies: ['Cognitive behavioral therapy (CBT) for insomnia and mood changes', 'Pelvic floor therapy'],
                dietRecommendations: ['Calcium-rich foods (dairy, leafy greens) for bone health', 'Vitamin D supplementation', 'Phytoestrogen-containing foods (soy, flaxseeds)', 'Limit spicy foods, caffeine, and alcohol (hot flash triggers)'],
                prevention: ['Not applicable (natural biological process) but symptoms can be mitigated.'],
                lifestyle: ['Dress in layers for hot flashes', 'Keep bedroom cool', 'Practice relaxation techniques (deep breathing, mindfulness)', 'Weight bearing exercises for bone density'],
                whenToConsult: 'When symptoms severely impact daily life or experiencing postmenopausal vaginal bleeding (red flag).',
                emergencyWarningSigns: ['Heavy vaginal bleeding after menopause has been established', 'Severe chest pain or shortness of breath (increased cardiovascular risk post-menopause)']
            }
        ]
    }
];

export default function WomenHealthPage() {
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
            <Link href="/#solutions" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#0EA5A4', fontWeight: 500, fontSize: 14, textDecoration: 'none', marginBottom: 24 }}>
                <ChevronLeft size={16} /> Back to Solutions
            </Link>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: '#0F172A' }}>👩 Women&apos;s Health</h1>
            <p style={{ color: '#64748B', fontSize: 16, marginBottom: 40, lineHeight: 1.6 }}>
                Comprehensive, evidence-based health guidance tailored for women. Explore detailed condition profiles including symptoms, <strong>medications</strong>, <strong>therapies</strong>, <strong>diet recommendations</strong>, and emergency protocols.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                {sections.map((sec) => {
                    const Icon = sec.icon;
                    return (
                        <div key={sec.title}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${sec.color}15` }}>
                                    <Icon size={24} color={sec.color} />
                                </div>
                                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A' }}>{sec.title}</h2>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {sec.items.map((item) => (
                                    <div key={item.name} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <button
                                            onClick={() => setExpanded(expanded === item.name ? null : item.name)}
                                            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: expanded === item.name ? '#F8FAFC' : 'white', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                                        >
                                            <span style={{ fontSize: 18, fontWeight: 600, color: '#1E293B' }}>{item.name}</span>
                                            <ChevronDown size={20} color="#64748B" style={{ transform: expanded === item.name ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                                        </button>

                                        {expanded === item.name && (
                                            <div style={{ padding: '0 24px 24px 24px', borderTop: '1px solid #E2E8F0' }}>
                                                <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, marginTop: 20, marginBottom: 32 }}>
                                                    {item.description}
                                                </p>

                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, marginBottom: 32 }}>
                                                    {/* Diagnostics & Risks */}
                                                    <div>
                                                        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={16} color="#64748B" /> Diagnosis & Risks</h4>
                                                        <div style={{ marginBottom: 16 }}>
                                                            <strong style={{ fontSize: 13, color: '#64748B', display: 'block', marginBottom: 4 }}>Diagnosis Methods</strong>
                                                            <ul style={{ paddingLeft: 20, margin: 0, color: '#334155', fontSize: 14, lineHeight: 1.5 }}>{item.diagnosis.map(d => <li key={d}>{d}</li>)}</ul>
                                                        </div>
                                                        <div>
                                                            <strong style={{ fontSize: 13, color: '#64748B', display: 'block', marginBottom: 4 }}>Risk Factors</strong>
                                                            <ul style={{ paddingLeft: 20, margin: 0, color: '#334155', fontSize: 14, lineHeight: 1.5 }}>{item.riskFactors.map(r => <li key={r}>{r}</li>)}</ul>
                                                        </div>
                                                    </div>

                                                    {/* Symptoms & Prevention */}
                                                    <div>
                                                        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={16} color="#64748B" /> Clinical Profile</h4>
                                                        <div style={{ marginBottom: 16 }}>
                                                            <strong style={{ fontSize: 13, color: '#64748B', display: 'block', marginBottom: 4 }}>Common Symptoms</strong>
                                                            <ul style={{ paddingLeft: 20, margin: 0, color: '#334155', fontSize: 14, lineHeight: 1.5 }}>{item.symptoms.map(s => <li key={s}>{s}</li>)}</ul>
                                                        </div>
                                                        <div>
                                                            <strong style={{ fontSize: 13, color: '#64748B', display: 'block', marginBottom: 4 }}>Prevention Strategies</strong>
                                                            <ul style={{ paddingLeft: 20, margin: 0, color: '#334155', fontSize: 14, lineHeight: 1.5 }}>{item.prevention.map(p => <li key={p}>{p}</li>)}</ul>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ height: 1, background: '#E2E8F0', margin: '32px 0' }} />

                                                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <Stethoscope size={20} color="#0EA5A4" /> Comprehensive Care Plan
                                                </h4>

                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 32 }}>
                                                    <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 12, border: '1px solid #F1F5F9' }}>
                                                        <strong style={{ fontSize: 13, color: '#3B82F6', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><Pill size={14} /> Medications</strong>
                                                        <ul style={{ paddingLeft: 16, margin: 0, color: '#475569', fontSize: 13, lineHeight: 1.5 }}>{item.medications.map(m => <li key={m}>{m}</li>)}</ul>
                                                    </div>
                                                    <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 12, border: '1px solid #F1F5F9' }}>
                                                        <strong style={{ fontSize: 13, color: '#8B5CF6', display: 'block', marginBottom: 8 }}>💆‍♀️ Therapies & Treatments</strong>
                                                        <ul style={{ paddingLeft: 16, margin: 0, color: '#475569', fontSize: 13, lineHeight: 1.5 }}>{item.treatment.map(t => <li key={t}>{t}</li>)}
                                                            {item.therapies.map(t => <li key={t}>{t}</li>)}</ul>
                                                    </div>
                                                    <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 12, border: '1px solid #F1F5F9' }}>
                                                        <strong style={{ fontSize: 13, color: '#10B981', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><Utensils size={14} /> Diet & Lifestyle</strong>
                                                        <ul style={{ paddingLeft: 16, margin: 0, color: '#475569', fontSize: 13, lineHeight: 1.5 }}>{item.dietRecommendations.map(d => <li key={d}>{d}</li>)}
                                                            {item.lifestyle.map(l => <li key={l}>{l}</li>)}</ul>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                                    <div style={{ padding: 16, background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: 12 }}>
                                                        <strong style={{ color: '#C2410C', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, marginBottom: 8 }}><Activity size={16} /> When to Consult a Doctor</strong>
                                                        <span style={{ color: '#9A3412', fontSize: 14, lineHeight: 1.5 }}>{item.whenToConsult}</span>
                                                    </div>

                                                    <div style={{ padding: 16, background: '#FEF2F2', borderRadius: 12, border: '1px solid #FECACA' }}>
                                                        <strong style={{ color: '#B91C1C', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, marginBottom: 8 }}><AlertTriangle size={16} /> EMERGENCY WARNING SIGNS</strong>
                                                        <ul style={{ paddingLeft: 16, margin: 0, color: '#991B1B', fontSize: 14, lineHeight: 1.5 }}>
                                                            {item.emergencyWarningSigns.map(e => <li key={e}>{e}</li>)}
                                                        </ul>
                                                    </div>
                                                </div>

                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
