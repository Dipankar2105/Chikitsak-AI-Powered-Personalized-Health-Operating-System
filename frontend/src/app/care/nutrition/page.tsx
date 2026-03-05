'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronDown, Activity, AlertTriangle, ShieldCheck, Pill, Stethoscope, Utensils, Zap, Heart } from 'lucide-react';
import Link from 'next/link';

const sections = [
    {
        title: 'Dietary Management & Nutrition', icon: Utensils, color: '#10B981',
        items: [
            {
                name: 'Type 2 Diabetes',
                description: 'A chronic condition that affects the way your body metabolizes sugar (glucose). Your body either resists the effects of insulin or doesn\'t produce enough to maintain normal glucose levels.',
                symptoms: ['Increased thirst and frequent urination', 'Increased hunger', 'Unintended weight loss', 'Fatigue', 'Blurred vision', 'Slow-healing sores'],
                riskFactors: ['Weight (being overweight or obese is a main risk)', 'Fat distribution (storing fat mainly in the abdomen)', 'Inactivity', 'Family history', 'Age (over 45)'],
                diagnosis: ['Glycated hemoglobin (A1C) test', 'Random blood sugar test', 'Fasting blood sugar test', 'Oral glucose tolerance test'],
                treatment: ['Healthy eating and portion control', 'Regular physical activity', 'Diabetes medications or insulin therapy', 'Blood sugar monitoring'],
                medications: ['Metformin (first-line treatment)', 'Sulfonylureas (Glipizide)', 'DPP-4 inhibitors (Sitagliptin)', 'GLP-1 receptor agonists (Semaglutide/Ozempic)', 'Insulin (if oral meds are insufficient)'],
                therapies: ['Medical nutrition therapy (MNT) with a registered dietitian', 'Bariatric surgery (in cases of severe obesity)'],
                dietRecommendations: ['Low-glycemic index foods', 'Lean proteins (chicken, fish, tofu)', 'High-fiber vegetables and legumes', 'Strict limitation of refined carbohydrates and sugary beverages', 'Consistent meal timing'],
                prevention: ['Eat healthy foods (high in fiber, low in fat and calories)', 'Get active (aim for 150 minutes of moderate aerobic activity a week)', 'Lose excess pounds'],
                lifestyle: ['Check feet daily for cuts/blisters', 'Manage stress (which can spike blood sugar)', 'Get adequate, quality sleep'],
                whenToConsult: 'If you experience symptoms of diabetes, or if you are over 45 and overweight for a baseline screening.',
                emergencyWarningSigns: ['Diabetic Ketoacidosis (DKA) symptoms: Fruity-smelling breath, nausea, vomiting, confusion', 'Hyperosmolar Hyperglycemic State (HHS): Extreme thirst, confusion, fever, vision loss', 'Severe hypoglycemia: Shaking, sweating, fainting']
            },
            {
                name: 'Celiac Disease',
                description: 'An immune reaction to eating gluten, a protein found in wheat, barley, and rye. Over time, the immune reaction damages the small intestine\'s lining and prevents it from absorbing some nutrients (malabsorption).',
                symptoms: ['Diarrhea', 'Fatigue', 'Weight loss', 'Bloating and gas', 'Abdominal pain', 'Nausea and vomiting', 'Anemia'],
                riskFactors: ['Having a family member with celiac disease or dermatitis herpetiformis', 'Type 1 diabetes', 'Down syndrome or Turner syndrome', 'Autoimmune thyroid disease'],
                diagnosis: ['Serology testing (blood tests looking for elevated antibodies)', 'Genetic testing for human leukocyte antigens (HLA-DQ2 and HLA-DQ8)', 'Endoscopy with small intestine biopsy'],
                treatment: ['A strict, lifelong gluten-free diet is the only effective treatment'],
                medications: ['Vitamin and mineral supplements (Iron, Calcium, Vitamin D, Zinc, Folate, B-12) to treat deficiencies', 'Corticosteroids (Budesonide) for severe intestinal inflammation'],
                therapies: ['Dietary counseling to learn how to identify hidden gluten in foods and non-food items (like medications or toothpaste)'],
                dietRecommendations: ['Strict 100% Gluten-Free Diet', 'Avoid wheat, barley, rye, triticale, malt, and brewer\'s yeast', 'Emphasize naturally gluten-free foods: meats, fish, fruits, vegetables, rice, quinoa, and potatoes'],
                prevention: ['Cannot be prevented (autoimmune genetic condition), but damage is entirely preventable by avoiding gluten.'],
                lifestyle: ['Learn to read food and medication labels carefully', 'Be cautious of cross-contamination in shared kitchens and restaurants'],
                whenToConsult: 'If you have diarrhea or digestive discomfort that lasts for more than two weeks, or developmental delays in children.',
                emergencyWarningSigns: ['Severe internal bleeding or anemia symptoms (extreme fatigue, pale skin, fast heartbeat)', 'Intestinal blockage causing severe, unremitting abdominal pain']
            }
        ],
    }
];

export default function NutritionHealthPage() {
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
            <Link href="/#solutions" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#0EA5A4', fontWeight: 500, fontSize: 14, textDecoration: 'none', marginBottom: 24 }}>
                <ChevronLeft size={16} /> Back to Solutions
            </Link>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: '#0F172A' }}>🥗 Diet & Nutrition</h1>
            <p style={{ color: '#64748B', fontSize: 16, marginBottom: 40, lineHeight: 1.6 }}>
                Evidence-based dietary advice and nutritional condition management. Explore detailed condition profiles including symptoms, <strong>medications</strong>, <strong>therapies</strong>, <strong>diet recommendations</strong>, and emergency protocols.
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
                                                        <strong style={{ fontSize: 13, color: '#8B5CF6', display: 'block', marginBottom: 8 }}>💆‍♂️ Therapies & Treatments</strong>
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
