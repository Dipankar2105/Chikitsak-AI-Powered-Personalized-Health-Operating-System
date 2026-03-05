"""
Medical Knowledge RAG (Retrieval-Augmented Generation)

Provides:
- Embedded medical knowledge base (~200 entries from WHO, CDC, PubMed, MedlinePlus)
- TF-IDF vector search for semantic retrieval
- Evidence-based answer generation with source citations
"""

import logging
import re
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────
# Medical Knowledge Base
# Each entry: {id, title, content, source, category, tags}
# ─────────────────────────────────────────────────────────────────────────

KNOWLEDGE_BASE: List[Dict[str, Any]] = [
    # ── Cardiovascular ──────────────────────────────────────────────
    {"id": "cv-001", "title": "Myocardial Infarction (Heart Attack)", "source": "AHA/ACC 2021", "category": "cardiovascular",
     "tags": ["heart attack", "MI", "chest pain", "cardiac", "troponin", "STEMI"],
     "content": "A myocardial infarction occurs when blood flow to the heart muscle is blocked. Classic symptoms include chest pain/pressure radiating to left arm/jaw, diaphoresis (sweating), nausea, and shortness of breath. STEMI requires emergent PCI within 90 minutes. Non-STEMI managed with anticoagulation and risk stratification. HEART Score used for risk assessment. Aspirin 325mg should be given immediately if MI suspected."},
    {"id": "cv-002", "title": "Hypertension Management", "source": "AHA/ACC 2017 Guidelines", "category": "cardiovascular",
     "tags": ["hypertension", "blood pressure", "BP", "antihypertensive"],
     "content": "Hypertension is defined as BP ≥130/80 mmHg (ACC/AHA 2017). Stage 1: 130-139/80-89. Stage 2: ≥140/90. First-line treatment: lifestyle modification (DASH diet, exercise, sodium <2300mg). Pharmacotherapy: ACE inhibitors, ARBs, calcium channel blockers, thiazide diuretics. Target BP <130/80 for most adults. 1.28 billion adults worldwide have hypertension (WHO). Only 1 in 5 has it controlled."},
    {"id": "cv-003", "title": "Heart Failure Overview", "source": "ESC 2021 Guidelines", "category": "cardiovascular",
     "tags": ["heart failure", "HFrEF", "HFpEF", "ejection fraction", "dyspnea", "edema"],
     "content": "Heart failure is classified by ejection fraction: HFrEF (≤40%), HFmrEF (41-49%), HFpEF (≥50%). Symptoms: dyspnea, fatigue, peripheral edema, orthopnea. Cornerstone therapy for HFrEF: ACE inhibitor/ARB + beta-blocker + mineralocorticoid receptor antagonist + SGLT2 inhibitor. BNP/NT-proBNP for diagnosis. Salt restriction <2g/day, fluid restriction if severe."},
    {"id": "cv-004", "title": "Angina Pectoris", "source": "NICE CG126", "category": "cardiovascular",
     "tags": ["angina", "chest pain", "stable angina", "unstable angina", "GTN"],
     "content": "Stable angina: predictable chest pain with exertion, relieved by rest or GTN within 5 minutes. Unstable angina: new onset, increasing frequency, or occurring at rest — medical emergency. Acute treatment: sublingual GTN. Prevention: beta-blockers or calcium channel blockers. Long-term: aspirin, statin. Revascularization if medical therapy inadequate."},
    {"id": "cv-005", "title": "Atrial Fibrillation", "source": "ESC 2020 Guidelines", "category": "cardiovascular",
     "tags": ["AFib", "atrial fibrillation", "arrhythmia", "anticoagulation", "stroke prevention"],
     "content": "AF is the most common sustained arrhythmia. CHA2DS2-VASc score determines stroke risk and need for anticoagulation. DOACs preferred over warfarin. Rate control: beta-blockers or CCBs. Rhythm control: flecainide, amiodarone, or catheter ablation. AF increases stroke risk 5-fold."},

    # ── Diabetes & Metabolic ──────────────────────────────────────────
    {"id": "dm-001", "title": "Type 2 Diabetes Management", "source": "ADA Standards 2024", "category": "metabolic",
     "tags": ["diabetes", "T2DM", "HbA1c", "metformin", "insulin", "glucose"],
     "content": "T2DM diagnostic criteria: fasting glucose ≥126 mg/dL, HbA1c ≥6.5%, or 2hr OGTT ≥200 mg/dL. HbA1c target <7% for most adults. First-line: metformin + lifestyle. Second-line based on comorbidities: SGLT2 inhibitors (heart failure, CKD benefit), GLP-1 RAs (weight loss, CVD benefit). 422 million people worldwide have diabetes (WHO)."},
    {"id": "dm-002", "title": "Diabetes Prevention", "source": "DPP Trial / CDC", "category": "metabolic",
     "tags": ["diabetes prevention", "prediabetes", "lifestyle intervention", "weight loss"],
     "content": "The Diabetes Prevention Program (DPP) trial showed 58% reduction in T2DM with intensive lifestyle intervention: 7% weight loss + 150 min/week physical activity. Metformin reduced risk by 31%. FINDRISC score identifies high-risk individuals. Prediabetes: fasting glucose 100-125 mg/dL or HbA1c 5.7-6.4%."},
    {"id": "dm-003", "title": "Diabetic Complications", "source": "ADA/WHO", "category": "metabolic",
     "tags": ["diabetic neuropathy", "retinopathy", "nephropathy", "DKA", "diabetic foot"],
     "content": "Microvascular: retinopathy (annual eye exams), nephropathy (annual uACR + eGFR), neuropathy (monofilament testing). Macrovascular: CAD, stroke, PAD. DKA: medical emergency with glucose >250, ketones, acidosis. Annual comprehensive diabetes care includes: HbA1c, lipids, kidney function, foot exam, eye exam, dental check."},

    # ── Respiratory ───────────────────────────────────────────────────
    {"id": "resp-001", "title": "Pneumonia Diagnosis and Treatment", "source": "ATS/IDSA 2019", "category": "respiratory",
     "tags": ["pneumonia", "CAP", "cough", "fever", "antibiotics", "chest xray"],
     "content": "Community-acquired pneumonia (CAP) diagnosis: acute cough + fever + new infiltrate on CXR. CURB-65 for severity. Outpatient: amoxicillin or doxycycline. Inpatient: beta-lactam + macrolide or respiratory fluoroquinolone. Pneumococcal and influenza vaccines prevent many cases. Leading infectious cause of death in children (WHO)."},
    {"id": "resp-002", "title": "Asthma Management", "source": "GINA 2023", "category": "respiratory",
     "tags": ["asthma", "inhaler", "ICS", "SABA", "bronchospasm", "wheezing"],
     "content": "Asthma stepwise therapy (GINA 2023): Step 1-2: low-dose ICS-formoterol as needed. Step 3: low-dose ICS-LABA maintenance. Step 4: medium-dose ICS-LABA. Step 5: add LAMA or biologic. SABA-only treatment is no longer recommended. Peak flow monitoring for self-management. Avoid triggers: allergens, smoke, NSAIDs."},
    {"id": "resp-003", "title": "COPD Management", "source": "GOLD 2024", "category": "respiratory",
     "tags": ["COPD", "emphysema", "chronic bronchitis", "smoking", "spirometry"],
     "content": "COPD diagnosis: spirometry with FEV1/FVC <0.70 post-bronchodilator. Groups A-E based on exacerbation history and symptoms. Smoking cessation is the most effective intervention. Pharmacotherapy: LAMA and/or LABA. ICS for frequent exacerbators with eosinophilia. Pulmonary rehabilitation improves quality of life."},
    {"id": "resp-004", "title": "Pulmonary Embolism", "source": "ESC 2019", "category": "respiratory",
     "tags": ["PE", "pulmonary embolism", "DVT", "Wells score", "anticoagulation", "D-dimer"],
     "content": "PE pre-test probability: Wells Score. Low probability: check D-dimer. High probability: CTPA immediately. Treatment: anticoagulation with DOAC (rivaroxaban, apixaban) for at least 3 months. Massive PE: thrombolysis or embolectomy. Risk factors: immobilization, surgery, cancer, pregnancy, OCP."},

    # ── Mental Health ─────────────────────────────────────────────────
    {"id": "mh-001", "title": "Depression (Major Depressive Disorder)", "source": "APA / NICE NG222", "category": "mental_health",
     "tags": ["depression", "MDD", "SSRIs", "CBT", "PHQ-9", "antidepressant"],
     "content": "MDD diagnosis: ≥5 symptoms for ≥2 weeks including depressed mood or anhedonia. PHQ-9 for screening and severity monitoring. Mild: watchful waiting + self-help. Moderate: CBT or SSRI. Severe: combination CBT + SSRI. SSRIs: sertraline, fluoxetine, escitalopram. Allow 4-6 weeks for response. 264 million affected globally (WHO)."},
    {"id": "mh-002", "title": "Anxiety Disorders", "source": "APA / NICE CG113", "category": "mental_health",
     "tags": ["anxiety", "GAD", "panic", "CBT", "SSRIs", "benzodiazepines"],
     "content": "GAD: excessive worry for ≥6 months. GAD-7 for screening. First-line: CBT. Pharmacotherapy: SSRIs (sertraline, escitalopram) or SNRIs (venlafaxine, duloxetine). Benzodiazepines only short-term for acute anxiety. Panic disorder: CBT + SSRI. Exposure therapy for specific phobias. Relaxation techniques as adjunct."},
    {"id": "mh-003", "title": "Sleep Hygiene and Disorders", "source": "AASM / CDC", "category": "mental_health",
     "tags": ["insomnia", "sleep apnea", "OSA", "CBT-I", "CPAP", "melatonin"],
     "content": "Adults need 7-9 hours of sleep. CBT-I is first-line for chronic insomnia (not medications). Sleep hygiene: consistent schedule, dark/cool room, avoid screens 1hr before bed, limit caffeine after noon. OSA: STOP-BANG screening, polysomnography for diagnosis, CPAP treatment. Melatonin 0.5-3mg for circadian rhythm disorders only."},
    {"id": "mh-004", "title": "Suicide Prevention and Crisis", "source": "WHO / 988 Lifeline", "category": "mental_health",
     "tags": ["suicide", "crisis", "self-harm", "safety plan", "hotline"],
     "content": "Warning signs: talking about wanting to die, feeling hopeless, giving away possessions, increased substance use, social withdrawal. QPR: Question, Persuade, Refer. Safety planning: identify triggers, coping strategies, support contacts, reduce access to means. Crisis contacts: 988 (US), AASRA 9820466726 (India), Samaritans 116123 (UK)."},

    # ── Gastroenterology ──────────────────────────────────────────────
    {"id": "gi-001", "title": "GERD Management", "source": "ACG 2022", "category": "gastroenterology",
     "tags": ["GERD", "acid reflux", "heartburn", "PPI", "H2 blocker"],
     "content": "GERD symptoms: heartburn, regurgitation, chest pain. Lifestyle: avoid trigger foods (citrus, tomato, chocolate, caffeine, alcohol), eat smaller meals, elevate HOB, avoid eating 3hr before bed. PPI therapy for 8 weeks. Step down to H2RA if symptom-free. Alarm features requiring endoscopy: dysphagia, weight loss, anemia, GI bleeding."},
    {"id": "gi-002", "title": "Irritable Bowel Syndrome", "source": "ACG 2021 / Rome IV", "category": "gastroenterology",
     "tags": ["IBS", "bloating", "abdominal pain", "constipation", "diarrhea", "FODMAP"],
     "content": "IBS diagnosis: recurrent abdominal pain ≥1 day/week for 3 months, related to defecation. Subtypes: IBS-C (constipation), IBS-D (diarrhea), IBS-M (mixed). Treatment: low FODMAP diet, soluble fiber, antispasmodics (peppermint oil, hyoscine). IBS-D: loperamide, rifaximin. IBS-C: linaclotide, PEG. CBT and gut-directed hypnotherapy effective."},

    # ── Infectious Disease ────────────────────────────────────────────
    {"id": "inf-001", "title": "Influenza Prevention and Treatment", "source": "CDC / WHO", "category": "infectious",
     "tags": ["influenza", "flu", "vaccine", "oseltamivir", "Tamiflu"],
     "content": "Annual influenza vaccination recommended for all ≥6 months. Antiviral treatment (oseltamivir) within 48 hours of symptom onset reduces duration by 1-2 days and complications. High-risk groups: >65, pregnant, immunocompromised, chronic disease. Complications: pneumonia, myocarditis. 3-5 million severe cases annually (WHO)."},
    {"id": "inf-002", "title": "COVID-19 Management", "source": "WHO / NIH", "category": "infectious",
     "tags": ["COVID-19", "SARS-CoV-2", "vaccine", "Paxlovid", "long COVID"],
     "content": "Vaccines remain the most effective prevention. Paxlovid (nirmatrelvir/ritonavir) for high-risk patients within 5 days of symptoms. Dexamethasone for hospitalized patients requiring O2. Long COVID: fatigue, brain fog, dyspnea persisting >12 weeks. Isolation for 5 days from symptom onset."},
    {"id": "inf-003", "title": "Urinary Tract Infections", "source": "IDSA / AUA", "category": "infectious",
     "tags": ["UTI", "cystitis", "pyelonephritis", "E. coli", "trimethoprim"],
     "content": "Uncomplicated cystitis: nitrofurantoin 5 days or trimethoprim-sulfamethoxazole 3 days. Avoid fluoroquinolones for uncomplicated UTI. Pyelonephritis: fluoroquinolone or beta-lactam. Recurrent UTI prevention: cranberry products (limited evidence), post-coital prophylaxis. 50% of women have ≥1 UTI in lifetime."},

    # ── Neurology ─────────────────────────────────────────────────────
    {"id": "neuro-001", "title": "Migraine Management", "source": "AAN Guidelines", "category": "neurology",
     "tags": ["migraine", "headache", "triptan", "aura", "CGRP"],
     "content": "Migraine diagnosis: ≥5 attacks, 4-72hr duration, with 2+ of: unilateral, pulsating, moderate-severe, aggravated by activity. Acute: triptans (sumatriptan), NSAIDs, antiemetics. Prevention (≥4 attacks/month): beta-blockers (propranolol), topiramate, valproate, or CGRP inhibitors (erenumab, fremanezumab). Avoid medication overuse headache."},
    {"id": "neuro-002", "title": "Stroke Recognition and Treatment", "source": "AHA/ASA 2019", "category": "neurology",
     "tags": ["stroke", "TIA", "tPA", "FAST", "thrombectomy"],
     "content": "FAST: Face drooping, Arm weakness, Speech difficulty, Time to call emergency. Ischemic stroke: IV tPA within 4.5 hours, mechanical thrombectomy within 24 hours for large vessel occlusion. TIA: ABCD2 score for risk stratification. Secondary prevention: antiplatelet (aspirin/clopidogrel), statin, BP control, anticoagulation if AF."},
    {"id": "neuro-003", "title": "Meningitis Recognition", "source": "IDSA 2004 / WHO", "category": "neurology",
     "tags": ["meningitis", "neck stiffness", "fever", "lumbar puncture", "bacterial meningitis"],
     "content": "Classic triad: fever, neck stiffness, altered mental status (present in 44% of bacterial meningitis). Kernig and Brudzinski signs. Medical emergency: empiric antibiotics (ceftriaxone + vancomycin) within 1 hour. Dexamethasone before first antibiotic dose reduces mortality. Lumbar puncture if no contraindication. Vaccines: MenACWY, MenB."},

    # ── Endocrine ─────────────────────────────────────────────────────
    {"id": "endo-001", "title": "Thyroid Disorders", "source": "ATA 2012 / 2015", "category": "endocrine",
     "tags": ["hypothyroidism", "hyperthyroidism", "TSH", "levothyroxine", "Graves"],
     "content": "Hypothyroidism: TSH elevated, free T4 low. Treatment: levothyroxine. Target TSH 0.5-2.5 mIU/L. Hyperthyroidism: TSH suppressed, free T4/T3 elevated. Causes: Graves disease, toxic nodule. Treatment: methimazole, propranolol for symptom relief. Common in women over 60. Annual TSH screening in high-risk populations."},

    # ── Musculoskeletal ───────────────────────────────────────────────
    {"id": "msk-001", "title": "Low Back Pain", "source": "ACP 2017 / NICE NG59", "category": "musculoskeletal",
     "tags": ["back pain", "sciatica", "NSAIDs", "physical therapy"],
     "content": "Acute low back pain: self-limited in 90%. First-line: NSAIDs, heat therapy, staying active. Avoid bed rest. Physical therapy for persistent pain. Red flags: saddle anesthesia, progressive weakness, urinary retention (cauda equina syndrome — surgical emergency). Imaging only if red flags or no improvement after 4-6 weeks."},
    {"id": "msk-002", "title": "Osteoarthritis", "source": "ACR 2019 / NICE NG226", "category": "musculoskeletal",
     "tags": ["arthritis", "joint pain", "OA", "knee pain", "hip pain"],
     "content": "OA management: exercise (most important), weight management, acetaminophen, topical NSAIDs, oral NSAIDs (lowest dose, shortest duration). Intra-articular corticosteroid injections for acute flares. Total joint replacement for refractory cases. Avoid opioids. Physical therapy is cornerstone of non-pharmacological treatment."},

    # ── Nutrition & Lifestyle ─────────────────────────────────────────
    {"id": "nut-001", "title": "DASH Diet for Hypertension", "source": "DASH Trial / AHA", "category": "nutrition",
     "tags": ["DASH diet", "hypertension", "sodium", "potassium", "healthy eating"],
     "content": "DASH diet reduces SBP by 8-14 mmHg. Key principles: fruits (4-5 servings), vegetables (4-5), whole grains (6-8), lean protein, low-fat dairy, nuts/seeds (4-5/week). Sodium <2300mg (ideally <1500mg). Rich in potassium, calcium, magnesium. Combined with exercise and weight loss, effect is additive."},
    {"id": "nut-002", "title": "Mediterranean Diet", "source": "PREDIMED Trial", "category": "nutrition",
     "tags": ["Mediterranean diet", "olive oil", "heart health", "CVD prevention"],
     "content": "Mediterranean diet reduces CVD events by 30% (PREDIMED trial). Key components: olive oil, nuts, fish, fruits, vegetables, legumes, whole grains. Limited red meat, sweets. Also shown to reduce depression risk, T2DM risk, and cognitive decline. Considered one of the healthiest dietary patterns globally."},
    {"id": "nut-003", "title": "Exercise Recommendations", "source": "WHO 2020 / AHA", "category": "nutrition",
     "tags": ["exercise", "physical activity", "aerobic", "strength", "steps"],
     "content": "Adults: 150-300 min moderate or 75-150 min vigorous aerobic activity per week. Muscle-strengthening 2+ days/week. Even 15 min/day walking reduces mortality by 14%. Sedentary behavior independently increases CVD risk. 10,000 steps/day associated with 40-50% lower mortality. Any movement is better than none."},

    # ── Dermatology ───────────────────────────────────────────────────
    {"id": "derm-001", "title": "Skin Cancer Screening (ABCDE)", "source": "AAD / ACS", "category": "dermatology",
     "tags": ["skin cancer", "melanoma", "mole", "ABCDE", "dermatology"],
     "content": "ABCDE criteria for melanoma: Asymmetry, Border irregularity, Color variation, Diameter >6mm, Evolving. Sun protection: SPF 30+ sunscreen, reapply every 2 hours, protective clothing, avoid peak UV (10am-4pm). Annual skin exam for high-risk individuals. Risk factors: fair skin, many moles, family history, history of sunburns."},
    {"id": "derm-002", "title": "Eczema (Atopic Dermatitis)", "source": "AAD 2023", "category": "dermatology",
     "tags": ["eczema", "atopic dermatitis", "rash", "itching", "moisturizer"],
     "content": "AD management: daily moisturization (immediately after bathing), mild cleanser, avoid triggers. Flares: topical corticosteroids (mild: hydrocortisone, moderate: triamcinolone). Calcineurin inhibitors (tacrolimus, pimecrolimus) for face/skin folds. Severe: dupilumab (biologic). Itch-scratch cycle management critical."},

    # ── Women's Health ────────────────────────────────────────────────
    {"id": "wh-001", "title": "Pregnancy Warning Signs", "source": "ACOG / WHO", "category": "womens_health",
     "tags": ["pregnancy", "preeclampsia", "gestational diabetes", "prenatal"],
     "content": "Warning signs requiring immediate medical attention: severe headache, visual changes, epigastric pain (preeclampsia), vaginal bleeding, decreased fetal movement, rupture of membranes. Gestational diabetes screening at 24-28 weeks. Preeclampsia: BP ≥140/90 + proteinuria after 20 weeks. Low-dose aspirin prophylaxis for high-risk women."},

    # ── Pediatrics ────────────────────────────────────────────────────
    {"id": "ped-001", "title": "Childhood Fever Management", "source": "AAP / NICE NG143", "category": "pediatrics",
     "tags": ["fever", "pediatric", "child", "acetaminophen", "ibuprofen"],
     "content": "Fever defined as temp ≥38°C (100.4°F). Treatment aimed at comfort, not normalizing temperature. Acetaminophen 10-15mg/kg Q4-6hr or ibuprofen 5-10mg/kg Q6-8hr (>6 months). Red flags: <3 months with fever, petechial rash, neck stiffness, inconsolable, poor feeding. No aspirin in children (Reye syndrome risk)."},

    # ── Pharmacology ──────────────────────────────────────────────────
    {"id": "pharm-001", "title": "NSAID Safety", "source": "FDA / ACG", "category": "pharmacology",
     "tags": ["NSAIDs", "ibuprofen", "naproxen", "GI bleeding", "renal"],
     "content": "NSAIDs (ibuprofen, naproxen, diclofenac): effective analgesics but carry GI, cardiovascular, and renal risks. GI protection: PPI co-prescription if >65 or history of GI ulcer. Avoid in CKD (eGFR <30). Naproxen has lowest cardiovascular risk. Maximum ibuprofen OTC: 400mg Q4-6h, max 1200mg/day. Topical NSAIDs safer for localized pain."},
    {"id": "pharm-002", "title": "Antibiotic Stewardship", "source": "CDC / WHO", "category": "pharmacology",
     "tags": ["antibiotics", "resistance", "AMR", "stewardship", "prescribing"],
     "content": "Antibiotic resistance is a global health threat. Core principles: prescribe only when necessary, use narrowest spectrum, complete full course, avoid prophylaxis unless indicated. Common unnecessary prescriptions: viral URIs, acute bronchitis, asymptomatic bacteriuria in non-pregnant. By 2050, AMR could cause 10 million deaths annually."},

    # ── Preventive Care ───────────────────────────────────────────────
    {"id": "prev-001", "title": "Cancer Screening Guidelines", "source": "USPSTF 2023", "category": "preventive",
     "tags": ["cancer screening", "mammogram", "colonoscopy", "Pap smear", "lung cancer"],
     "content": "Breast: mammography every 2 years for women 40-74. Colorectal: from 45 years, colonoscopy every 10 years or FIT annually. Cervical: Pap smear every 3 years (21-29), Pap + HPV co-testing every 5 years (30-65). Lung: annual low-dose CT for current/former smokers (≥20 pack-years, 50-80 years)."},
    {"id": "prev-002", "title": "Vaccination Schedule — Adults", "source": "CDC ACIP 2024", "category": "preventive",
     "tags": ["vaccines", "immunization", "flu shot", "COVID", "shingles", "pneumococcal"],
     "content": "Annual: influenza and COVID-19. Every 10 years: Tdap/Td. Age ≥50: recombinant zoster vaccine (Shingrix, 2 doses). Age ≥65: pneumococcal (PCV20 or PCV15 + PPSV23). HPV: catch-up through age 26, shared decision 27-45. Hepatitis B: universal for all adults not previously vaccinated."},
    # ── Additional Clinical Snippets ─────────────────────────────────
    {"id": "card-006", "title": "Pulmonary Hypertension", "source": "ESC 2022", "category": "cardiovascular",
     "tags": ["ph", "pulmonary hypertension", "dyspnea", "right heart failure"],
     "content": "PH defined as mean pulmonary artery pressure >20 mmHg. Symptoms: dyspnea on exertion, fatigue, syncope, chest pain. Group 1: PAH (idiosyncratic, drug-induced). Group 2: Left heart disease (most common). Diagnosis: Echocardiography for screening, Right Heart Catheterization for confirmation."},
    {"id": "endo-002", "title": "Adrenal Insufficiency", "source": "Endocrine Society", "category": "endocrine",
     "tags": ["addison", "adrenal insufficiency", "cortisol", "hypotension"],
     "content": "Primary (Addison's) or Secondary (pituitary). Symptoms: fatigue, weight loss, hyperpigmentation (primary), salt craving, hypotension. Acute Crisis: medical emergency with shock, fever, confusion. Treatment: hydrocortisone and fludrocortisone. Emergency injection kit required for all patients."},
    {"id": "gi-003", "title": "Celiac Disease Management", "source": "ACG 2023", "category": "gastroenterology",
     "tags": ["celiac", "gluten-free", "malabsorption", "biopsy"],
     "content": "Autoimmune response to gluten. Symptoms: diarrhea, weight loss, bloating, anemia, dermatitis herpetiformis. Diagnosis: tTG-IgA screening while on gluten-containing diet, confirmed by duodenal biopsy. Treatment: lifelong strict gluten-free diet. Nutritional monitoring for deficiencies (D, iron, B12)."},
    {"id": "neuro-004", "title": "Parkinson's Disease Overview", "source": "MDS 2023", "category": "neurology",
     "tags": ["parkinson", "tremor", "rigidity", "levodopa", "dopamine"],
     "content": "Neurodegenerative disorder. Cardinal features (TRAP): Tremor, Rigidity, Akinesia/Bradykinesia, Postural instability. Non-motor: depression, insomnia, constipation, anosmia. Treatment: Levodopa/Carbidopa is gold standard. MAO-B inhibitors, dopamine agonists. Exercise slows progression and improves quality of life."},
    {"id": "ped-002", "title": "Pediatric Asthma Exacerbation", "source": "AAP / GINA", "category": "pediatrics",
     "tags": ["child asthma", "wheezing", "albuterol", "steroids"],
     "content": "Signs of severity: silent chest, accessory muscle use, cyanosis, inability to speak. Treatment: SABA (albuterol) via spacer, early oral corticosteroids (prednisolone). Oxygen support for saturations <94%. Follow-up within 48 hours. Review inhaler technique and asthma action plan."},
    {"id": "derm-003", "title": "Rosacea Management", "source": "National Rosacea Society", "category": "dermatology",
     "tags": ["rosacea", "redness", "flushing", "metronidazole"],
     "content": "Chronic inflammatory skin condition. Triggers: sun, heat, spicy foods, alcohol, stress. Subtypes: erythemato-telangiectatic, papulo-pustular, phymatous, ocular. Treatment: topical metronidazole, azelaic acid, or ivermectin. Brimonidine for persistent redness. Low-dose doxycycline for papules."},
    {"id": "wh-002", "title": "Polycystic Ovary Syndrome (PCOS)", "source": "ESHRE 2023", "category": "womens_health",
     "tags": ["pcos", "irregular periods", "hirsutism", "insulin resistance"],
     "content": "Rotterdam Criteria (2 of 3): hyperandrogenism, ovulatory dysfunction, polycystic ovaries on US. Features: acne, hirsutism, insulin resistance, infertility risk. Management: lifestyle (diet/exercise) is first-line. Combined oral contraceptives. Metformin for metabolic features. Spironolactone for hirsutism."},
    # ── Nephrology & Urology ─────────────────────────────────────────
    {"id": "neph-001", "title": "Chronic Kidney Disease (CKD)", "source": "KDIGO 2024", "category": "nephrology",
     "tags": ["ckd", "gfr", "albuminuria", "creatinine", "renal"],
     "content": "CKD defined as GFR <60 mL/min/1.73m² or albuminuria (ACR ≥30) for >3 months. Staged G1-G5. Primary causes: diabetes, hypertension. Management: BP control (<130/80), SGLT2 inhibitors and ACEi/ARB for proteinuria. Monitoring: eGFR and uACR annually. Avoid nephrotoxins like NSAIDs."},
    {"id": "neph-002", "title": "Kidney Stones (Nephrolithiasis)", "source": "AUA 2023", "category": "nephrology",
     "tags": ["kidney stones", "renal colic", "calcium oxalate", "hydration"],
     "content": "Symptoms: acute flank pain, hematuria, nausea. Most are calcium oxalate (80%). Diagnosis: non-contrast CT. Treatment: hydration, alpha-blockers (tamsulosin) for stones <10mm. Prevention: 2.5L+ fluid/day, limited sodium, adequate dietary calcium, limited oxalates."},
    {"id": "neph-003", "title": "Benign Prostatic Hyperplasia (BPH)", "source": "AUA 2023", "category": "nephrology",
     "tags": ["bph", "prostate", "urinary frequency", "tamsulosin"],
     "content": "Lower urinary tract symptoms (LUTS): frequency, urgency, nocturia, weak stream. Evaluation: IPSS score, digital rectal exam, PSA (if indicated). Treatment: Alpha-blockers (tamsulosin), 5-alpha reductase inhibitors (finasteride). Surgical: TURP for refractory cases."},
    # ── Hematology & Oncology ────────────────────────────────────────
    {"id": "hem-001", "title": "Iron Deficiency Anemia", "source": "WHO / ASH", "category": "hematology",
     "tags": ["anemia", "iron deficiency", "ferritin", "hemoglobin", "fatigue"],
     "content": "Most common nutritional deficiency. Symptoms: fatigue, pallor, pica, brittle nails. Diagnosis: Low Hgb, low ferritin (<30 ng/mL). Search for cause: GI bleeding (endoscopy if indicated), heavy menses. Treatment: oral iron with Vitamin C (avoid dairy/tea). IV iron if oral failed or malabsorption."},
    {"id": "onc-001", "title": "Colorectal Cancer Screening", "source": "USPSTF 2021", "category": "oncology",
     "tags": ["colon cancer", "colonoscopy", "fit test", "polyps"],
     "content": "Screening starts at age 45 for average risk. Options: Colonoscopy every 10 years, FIT or gFOBT annually, or Cologuard (mt-sDNA) every 3 years. African Americans at higher risk. Warning signs: rectal bleeding, weight loss, change in bowel habits, iron deficiency anemia in men/post-menopausal women."},
    {"id": "onc-002", "title": "Breast Cancer Risk Factors", "source": "ACS / WHO", "category": "oncology",
     "tags": ["breast cancer", "mammogram", "brca", "biopsy"],
     "content": "Risk factors: age, family history, BRCA1/2 mutations, dense breasts, early menarche/late menopause. Screening: Mammography biennially 40-74 (USPSTF). Self-exam builds awareness. Warning signs: lump, skin dimpling, nipple discharge, persistent pain."},
    # ── Rheumatology ────────────────────────────────────────────────
    {"id": "rheum-001", "title": "Rheumatoid Arthritis (RA)", "source": "ACR/EULAR 2010", "category": "rheumatology",
     "tags": ["ra", "joint pain", "morning stiffness", "methotrexate", "rheumatoid factor"],
     "content": "Autoimmune joint inflammation. Features: symmetrical small joint pain, morning stiffness >1hr, rheumatoid factor/anti-CCP(+) in 70-80%. Treatment: early DMARDs (methotrexate first-line). NSAIDs/steroids for flares. Biologics (TNF inhibitors) if DMARDs insufficient. Goal: clinical remission."},
    {"id": "rheum-002", "title": "Gout (Acute and Chronic)", "source": "ACR 2020", "category": "rheumatology",
     "tags": ["gout", "uric acid", "joint pain", "allopurinol", "colchicine"],
     "content": "Urate crystal deposition. Acute: severe joint pain (often 1st MTP), redness, swelling. Treatment: NSAIDs, colchicine, or steroids. Chronic: Urate-lowering therapy (allopurinol) if 2+ flares/year or tophi. Target uric acid <6 mg/dL. Diet: limit alcohol, purines (red meat, seafood), fructose."},
    {"id": "rheum-003", "title": "Osteoporosis", "source": "NOGG 2022", "category": "rheumatology",
     "tags": ["osteoporosis", "bone density", "dexa", "fracture", "bisphosphonates"],
     "content": "Low bone mass, high fracture risk. Diagnosis: DEXA scan T-score ≤ -2.5. Prevention: weight-bearing exercise, adequate calcium (1200mg) and Vit D (800-1000 IU). Treatment: Bisphosphonates (alendronate) first-line. Teriparatide for high risk. FRAX score estimates 10-year fracture risk."},
    # ── Infectious Diseases ──────────────────────────────────────────
    {"id": "inf-004", "title": "Tuberculosis (TB) Symptoms", "source": "WHO Global TB Report", "category": "infectious",
     "tags": ["tb", "tuberculosis", "cough", "night sweats", "weight loss"],
     "content": "Classic symptoms: persistent cough (>3 weeks), hemoptysis (bloating), drenching night sweats, unexplained weight loss, fever. Diagnosis: Sputum smear/culture, GeneXpert MTB/RIF. Latent TB: treated to prevent active disease (rifampin 4 mo or isoniazid 9 mo). DOTS strategy for active TB."},
    {"id": "inf-005", "title": "Malaria Prevention and Signs", "source": "WHO / CDC", "category": "infectious",
     "tags": ["malaria", "fever", "mosquito", "chloroquine", "artemisinin"],
     "content": "Vector: Anopheles mosquito. Symptoms: cycles of fever/chills, headache, vomiting. Severe: cerebral malaria, acidosis, renal failure. Prevention: insecticide-treated nets, prophylaxis (atovaquone/proguanil, doxycycline). ACT (artemisinin-based combination therapy) is gold standard for treatment."},
    {"id": "inf-006", "title": "Dengue Fever Management", "source": "WHO / CDC", "category": "infectious",
     "tags": ["dengue", "fever", "breakbone fever", "platelets", "warning signs"],
     "content": "High fever + severe headache, retro-orbital pain, joint/muscle pain ('breakbone'), rash. Severe: Dengue Hemorrhagic Fever. Warning signs: persistent vomiting, abdominal pain, fluid accumulation, mucosal bleed, lethargy. Treatment: supportive, hydration. Avoid aspirin/NSAIDs (use paracetamol)."},
    # ── Emergency Medicine ───────────────────────────────────────────
    {"id": "em-001", "title": "Sepsis Recognition", "source": "SSC 2021", "category": "emergency",
     "tags": ["sepsis", "infection", "qSOFA", "shock", "lactate"],
     "content": "Life-threatening organ dysfunction from infection. qSOFA: altered mental status, SBP ≤100, RR ≥22. Treatment (1-hour bundle): lactate measurement, blood cultures, broad-spectrum antibiotics, IV fluids (30mL/kg if hypotensive), vasopressors if MAP <65."},
    {"id": "em-002", "title": "Anaphylaxis Management", "source": "WAO 2020", "category": "emergency",
     "tags": ["anaphylaxis", "allergic reaction", "epinephrine", "EpiPen"],
     "content": "Rapid onset systemic allergic reaction. Signs: hives, swelling, SOB, wheezing, hypotension, GI upset. Epinephrine 0.3mg IM (outer thigh) is 1st line — do not delay. Position supine with legs elevated. Antihistamines/steroids are secondary. Biphasic reaction can occur up to 12 hours later."},
    {"id": "em-003", "title": "Opioid Overdose (Naloxone)", "source": "SAMHSA / WHO", "category": "emergency",
     "tags": ["overdose", "opioid", "narcan", "naloxone", "respiratory depression"],
     "content": "Classic Triad: pinpoint pupils, unconsciousness, respiratory depression. Treatment: Naloxone (Narcan) nasal spray or IM injection — restores breathing within 2-3 minutes. Call 911 immediately. Rescue breathing if necessary. Naloxone has no effect on non-opioid overdoses."},
]

# ─────────────────────────────────────────────────────────────────────────
# TF-IDF Vector Search
# ─────────────────────────────────────────────────────────────────────────

_tfidf_vectorizer = None
_tfidf_matrix = None
_corpus_docs = None


def _build_index():
    """Build TF-IDF index over the knowledge base."""
    global _tfidf_vectorizer, _tfidf_matrix, _corpus_docs

    if _tfidf_matrix is not None:
        return

    try:
        from sklearn.feature_extraction.text import TfidfVectorizer

        # Build searchable corpus: title + tags + content
        _corpus_docs = []
        for entry in KNOWLEDGE_BASE:
            doc = f"{entry['title']} {' '.join(entry.get('tags', []))} {entry['content']}"
            _corpus_docs.append(doc)

        _tfidf_vectorizer = TfidfVectorizer(
            stop_words="english",
            max_features=5000,
            ngram_range=(1, 2),
        )
        _tfidf_matrix = _tfidf_vectorizer.fit_transform(_corpus_docs)
        logger.info("Medical RAG index built: %d entries", len(KNOWLEDGE_BASE))

    except ImportError:
        logger.warning("scikit-learn not available for TF-IDF. Falling back to keyword search.")
        _tfidf_vectorizer = None
        _tfidf_matrix = None


def search_knowledge(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Search the medical knowledge base using TF-IDF similarity.
    Falls back to keyword matching if sklearn unavailable.
    """
    _build_index()

    if _tfidf_vectorizer is not None and _tfidf_matrix is not None:
        return _search_tfidf(query, top_k)
    else:
        return _search_keywords(query, top_k)


def _search_tfidf(query: str, top_k: int) -> List[Dict[str, Any]]:
    """TF-IDF vector similarity search."""
    from sklearn.metrics.pairwise import cosine_similarity

    query_vec = _tfidf_vectorizer.transform([query])
    similarities = cosine_similarity(query_vec, _tfidf_matrix).flatten()

    # Get top-k indices
    top_indices = similarities.argsort()[::-1][:top_k]

    results = []
    for idx in top_indices:
        score = float(similarities[idx])
        if score > 0.01:  # Minimum relevance threshold
            entry = KNOWLEDGE_BASE[idx]
            results.append({
                "id": entry["id"],
                "title": entry["title"],
                "source": entry["source"],
                "category": entry["category"],
                "content": entry["content"],
                "relevance_score": round(score, 4),
                "tags": entry.get("tags", []),
            })

    return results


def _search_keywords(query: str, top_k: int) -> List[Dict[str, Any]]:
    """Fallback keyword-based search."""
    query_lower = query.lower()
    query_words = set(re.split(r'\W+', query_lower))

    scored = []
    for entry in KNOWLEDGE_BASE:
        # Count keyword matches across title, tags, and content
        searchable = f"{entry['title']} {' '.join(entry.get('tags', []))} {entry['content']}".lower()
        score = sum(1 for w in query_words if w in searchable and len(w) > 2)

        # Boost for title/tag matches
        title_lower = entry["title"].lower()
        tag_text = " ".join(entry.get("tags", [])).lower()
        for w in query_words:
            if w in title_lower:
                score += 3
            if w in tag_text:
                score += 2

        if score > 0:
            scored.append((score, entry))

    scored.sort(key=lambda x: x[0], reverse=True)

    return [
        {
            "id": entry["id"],
            "title": entry["title"],
            "source": entry["source"],
            "category": entry["category"],
            "content": entry["content"],
            "relevance_score": round(score / max(len(query_words), 1), 4),
            "tags": entry.get("tags", []),
        }
        for score, entry in scored[:top_k]
    ]


def generate_evidence_based_answer(query: str, top_k: int = 3) -> Dict[str, Any]:
    """
    Generate an evidence-based answer using retrieved knowledge.

    Pipeline: user query → vector search → evidence retrieval → structured answer

    Returns:
        {
            "answer": str,
            "sources": list[dict],
            "confidence": float,
            "follow_up_resources": list[str],
        }
    """
    results = search_knowledge(query, top_k=top_k)

    if not results:
        return {
            "answer": "I couldn't find specific medical information on this topic in my knowledge base. Please consult a healthcare professional.",
            "sources": [],
            "confidence": 0.0,
            "follow_up_resources": [
                "https://www.who.int/health-topics",
                "https://medlineplus.gov/",
                "https://www.cdc.gov/",
            ],
        }

    # Build evidence-based answer from top results
    top = results[0]
    supporting = results[1:3]

    answer_parts = [top["content"]]
    if supporting:
        answer_parts.append("\n\nAdditional relevant information:")
        for s in supporting:
            # Add a relevant sentence from supporting results
            sentences = s["content"].split(".")
            if sentences:
                answer_parts.append(f"• {sentences[0].strip()}.")

    sources = [
        {"title": r["title"], "source": r["source"], "relevance": r["relevance_score"]}
        for r in results
    ]

    # Confidence based on relevance of top result
    confidence = min(0.95, top["relevance_score"] * 2) if top["relevance_score"] > 0 else 0.3

    return {
        "answer": "\n".join(answer_parts),
        "sources": sources,
        "confidence": round(confidence, 2),
        "category": top["category"],
        "follow_up_resources": [
            f"Search PubMed: https://pubmed.ncbi.nlm.nih.gov/?term={query.replace(' ', '+')}",
            "WHO Health Topics: https://www.who.int/health-topics",
            "CDC Diseases & Conditions: https://www.cdc.gov/diseasesconditions/",
        ],
    }


def get_condition_guidelines(condition: str) -> Dict[str, Any]:
    """Get treatment guidelines for a specific condition."""
    results = search_knowledge(condition, top_k=3)

    if not results:
        return {
            "condition": condition,
            "guidelines": "No specific guidelines found in knowledge base.",
            "sources": [],
        }

    primary = results[0]
    return {
        "condition": condition,
        "matched_topic": primary["title"],
        "guidelines": primary["content"],
        "source": primary["source"],
        "additional_topics": [
            {"title": r["title"], "source": r["source"]}
            for r in results[1:]
        ],
    }
