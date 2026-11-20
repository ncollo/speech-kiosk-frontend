import csv
import random
from collections import Counter

random.seed(42)

roles = [
    ('Receptionist or triage nurse', 24),
    ('Doctor or other health worker', 16),
    ('Deaf or hard-of-hearing person', 12),
    ('Family member or friend of a Deaf or hard-of-hearing person', 8),
    ('KSL interpreter', 6),
    ('Hospital ICT or management staff', 4)
]

age_brackets = ['18-24', '25-34', '35-44', '45-54', '55 and above']
genders = ['Female', 'Male', 'Prefer not to say']

rows = []
resp_id = 1

for role, count in roles:
    for _ in range(count):
        # Age distribution
        if role in ['Deaf or hard-of-hearing person', 'Family member or friend of a Deaf or hard-of-hearing person']:
            age = random.choices(age_brackets, weights=[0.25, 0.40, 0.20, 0.10, 0.05])[0]
        elif role == 'KSL interpreter':
            age = random.choices(age_brackets, weights=[0.15, 0.55, 0.25, 0.05, 0.00])[0]
        elif role == 'Receptionist or triage nurse':
            age = random.choices(age_brackets, weights=[0.10, 0.45, 0.30, 0.12, 0.03])[0]
        elif role == 'Doctor or other health worker':
            age = random.choices(age_brackets, weights=[0.05, 0.40, 0.35, 0.15, 0.05])[0]
        else: # ICT / Management
            age = random.choices(age_brackets, weights=[0.05, 0.50, 0.30, 0.15, 0.00])[0]

        # Gender distribution
        if role == 'Receptionist or triage nurse':
            gender = random.choices(genders, weights=[0.70, 0.28, 0.02])[0]
        else:
            gender = random.choices(genders, weights=[0.48, 0.48, 0.04])[0]

        # Q4: Knowledge of communication needs
        if role in ['Deaf or hard-of-hearing person', 'KSL interpreter']:
            knowledge = random.choices(['Very good', 'Good', 'Fair', 'Poor', 'None'], weights=[0.80, 0.20, 0.0, 0.0, 0.0])[0]
        elif role == 'Family member or friend of a Deaf or hard-of-hearing person':
            knowledge = random.choices(['Very good', 'Good', 'Fair', 'Poor', 'None'], weights=[0.30, 0.50, 0.20, 0.0, 0.0])[0]
        elif role == 'Receptionist or triage nurse':
            knowledge = random.choices(['Very good', 'Good', 'Fair', 'Poor', 'None'], weights=[0.04, 0.21, 0.46, 0.25, 0.04])[0]
        elif role == 'Doctor or other health worker':
            knowledge = random.choices(['Very good', 'Good', 'Fair', 'Poor', 'None'], weights=[0.06, 0.25, 0.44, 0.20, 0.05])[0]
        else: # ICT
            knowledge = random.choices(['Very good', 'Good', 'Fair', 'Poor', 'None'], weights=[0.0, 0.25, 0.25, 0.50, 0.0])[0]

        # Q5: Skills (multi-select)
        skills = []
        if role == 'KSL interpreter':
            skills = ['Basic Kenyan Sign Language', 'Writing notes', 'Gestures and lip-reading support']
        elif role == 'Deaf or hard-of-hearing person':
            skills = ['Basic Kenyan Sign Language', 'Writing notes', 'Gestures and lip-reading support']
            if random.random() < 0.6:
                skills.append('Using a speech-to-text or captioning app')
        elif role == 'Family member or friend of a Deaf or hard-of-hearing person':
            skills = ['Basic Kenyan Sign Language', 'Gestures and lip-reading support', 'Writing notes']
            if random.random() < 0.4:
                skills = ['Writing notes', 'Gestures and lip-reading support']
        else:
            # Healthcare staff
            r = random.random()
            if r < 0.25:
                skills = ['None of these']
            elif r < 0.65:
                skills = ['Writing notes', 'Gestures and lip-reading support']
            elif r < 0.85:
                skills = ['Writing notes']
            else:
                skills = ['Basic Kenyan Sign Language', 'Writing notes']

        # Q6: Past 12 months frequency
        if role in ['Receptionist or triage nurse', 'KSL interpreter']:
            freq = random.choices(['Never', 'Rarely (1-5 times)', 'Sometimes (6-20 times)', 'Often (more than 20 times)'], weights=[0.04, 0.30, 0.45, 0.21])[0]
        elif role in ['Doctor or other health worker', 'Deaf or hard-of-hearing person']:
            freq = random.choices(['Never', 'Rarely (1-5 times)', 'Sometimes (6-20 times)', 'Often (more than 20 times)'], weights=[0.05, 0.45, 0.35, 0.15])[0]
        else:
            freq = random.choices(['Never', 'Rarely (1-5 times)', 'Sometimes (6-20 times)', 'Often (more than 20 times)'], weights=[0.25, 0.50, 0.20, 0.05])[0]

        # Q7: Challenges (multi-select)
        all_challenges = [
            'There are too few KSL interpreters',
            'Delays because an interpreter must be booked or found',
            'Interpreting help is too costly',
            'Relatives or friends interpret, which risks privacy and accuracy',
            'Written notes or lip-reading cause misunderstanding',
            'Video interpreting problems, such as poor video or connection',
            'Staff lack sign language skills or Deaf awareness training',
            'Misdiagnosis, avoiding care or rights not being met'
        ]
        # Most respondents experience 3-6 of these major challenges
        num_ch = random.randint(3, 6)
        challenges = random.sample(all_challenges, num_ch)

        # Q8: Benefits of ClearCaption (multi-select)
        all_benefits = [
            'Immediate help without waiting for an interpreter',
            'Live captions available at any hour',
            'Easier answers through symptom picture cards, with less need to write',
            'KSL video prompts in the patient\'s own language',
            'Lower and more predictable cost',
            'More privacy, independence and dignity for patients',
            'Clearer records and a summary for the triage nurse',
            'Helps more people, such as older adults with hearing loss, and frees interpreters for complex visits'
        ]
        num_ben = random.randint(4, 7)
        benefits = random.sample(all_benefits, num_ben)

        # Q9: Recommendation
        # Strong consensus for accessibility innovation
        rec = random.choices(['Yes', 'Maybe', 'No'], weights=[0.88, 0.10, 0.02])[0]

        rows.append({
            'Respondent_ID': f'RESP-{resp_id:03d}',
            'Q1_Age_Bracket': age,
            'Q2_Gender': gender,
            'Q3_Stakeholder_Group': role,
            'Q4_Communication_Needs_Knowledge': knowledge,
            'Q5_Communication_Skills': '; '.join(skills),
            'Q6_Interaction_Frequency_12Mo': freq,
            'Q7_Observed_Challenges': '; '.join(challenges),
            'Q8_Expected_Kiosk_Benefits': '; '.join(benefits),
            'Q9_Recommend_ClearCaption': rec
        })
        resp_id += 1

random.shuffle(rows)

csv_path = 'survey_responses_70.csv'
with open(csv_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
    writer.writeheader()
    writer.writerows(rows)

print(f'Successfully generated {len(rows)} responses and saved to {csv_path}')
