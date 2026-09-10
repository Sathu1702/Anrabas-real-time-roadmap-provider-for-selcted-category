(function () {
    'use strict';

    const LOCAL_KEY = 'anrabas_local_counts';
    const COUNTER_BASE = 'https://countapi.mileshilliard.com/api/v1';
    const COUNTER_VISITORS = 'anrabas_sathu_total_visitors';
    const COUNTER_TODAY_PREFIX = 'anrabas_sathu_today_';
    const COUNTER_SOLVED = 'anrabas_sathu_total_solved';
    const USER_KEY = 'anrabas_user';
    const BOT_KEY = 'anrabas_bot_name';
    const DEFAULT_BOT = 'knowledge';

    const TEMPLATES = {
        finance: {
            label: 'Finance & Budget', icon: '💰',
            summary: 'Detected issues around money, savings, or budgeting',
            steps: [
                'Audit your money flow: list ALL income vs ALL expenses for the last 30 days',
                'Cut the top 3 "leaks" first (subscriptions, eating out, impulse buys)',
                'Apply the 50/30/20 rule to the remaining income',
                'Automate a savings transfer the moment your salary lands',
                'Build a 3-month emergency fund before any investing'
            ],
            mistakes: ['Waiting for "the right time" to start', 'Trying extreme budgets that fail in week 1', 'Ignoring small recurring charges'],
            timeline: 'Visible effect in 2 weeks, transformed in 3 months',
            tip: 'Money mirrors habits. Fix the small daily choices and the big numbers fix themselves.'
        },
        health: {
            label: 'Health & Fitness', icon: '🏥',
            summary: 'Detected fitness, diet, or energy concerns',
            steps: [
                'Pick ONE focus goal: strength, stamina, weight, or energy',
                'Anchor two non-negotiables: 7-8h sleep + 2L water daily',
                'Move daily: 20-30 min brisk walk or simple home workout',
                'Upgrade meals gradually — one healthier swap per week',
                'Track weekly with photos or measurements, not just the scale'
            ],
            mistakes: ['Starting a 5-day gym plan from zero', 'Crash dieting for quick results', 'Comparing progress to others'],
            timeline: 'Energy improves in 1 week, visible change in 4-8 weeks',
            tip: 'Consistency beats intensity. A modest plan you keep beats a brutal one you quit.'
        },
        career: {
            label: 'Career & Work', icon: '💼',
            summary: 'Detected work, job, or career-related challenges',
            steps: [
                'Clarify your target: new role, promotion, or new industry?',
                'Map your transferable skills onto that target',
                'Gap-check and fill one skill with a free course or project',
                'Reach out to 3 people in the field for informational chats',
                'Update your resume and portfolio to match the target role',
                'Apply to 5 roles and iterate on every rejection'
            ],
            mistakes: ['Researching forever, applying never', 'Underselling transferable skills', 'Expecting your first try to be perfect'],
            timeline: 'Clarity in 1 week, interviews in 3-6 weeks',
            tip: 'Your career grows through moves, not waiting for the perfect moment.'
        },
        relationships: {
            label: 'Relationships', icon: '❤️',
            summary: 'Detected relationship or connection concerns',
            steps: [
                'Name the real issue in one sentence — honestly',
                'Plan a calm, specific conversation (no blame, use "I feel")',
                'Listen fully before responding — repeat back what you heard',
                'Set clear boundaries and agree on fair ground rules',
                'Schedule quality time; presence beats perfection',
                'If deep-rooted conflict persists, consider professional counseling'
            ],
            mistakes: ['Letting resentment build silently', 'Fighting in public or via text', 'Assuming they can read your mind'],
            timeline: 'Better communication in days, real repair in 4-8 weeks',
            tip: 'Healthy bonds are built on honest words, not mind-reading.'
        },
        education: {
            label: 'Education & Learning', icon: '📚',
            summary: 'Detected study, exam, or learning goals',
            steps: [
                'Define the exact target: exam date, skill, or certification',
                'Break the syllabus into weekly milestones',
                'Use active recall & spaced repetition (review in 1, 3, 7 days)',
                'Teach the topic aloud or to a friend to lock it in',
                'Rotate subjects to beat boredom and boost retention',
                'Test yourself weekly with real past papers'
            ],
            mistakes: ['Highlighting instead of recalling', 'Cramming the night before', 'Multitasking while studying'],
            timeline: 'Better retention in 1 week, exam-ready in 4-6 weeks',
            tip: 'You learn by retrieving, not re-reading. Test yourself early and often.'
        },
        home: {
            label: 'Home & Organization', icon: '🏠',
            summary: 'Detected organization or home challenges',
            steps: [
                'Tackle ONE zone at a time — drawer, desk, or shelf',
                'Sort every item: keep / donate / trash / relocate',
                'Add cheap storage: labels, bins, and a single inbox spot',
                'Create a 10-minute daily tidy habit',
                'Set one recurring day for bills and paperwork',
                'Make the bed daily — it triggers a productive chain'
            ],
            mistakes: ['Trying to declutter the whole house in one day', 'Organizing before decluttering', 'Buying storage for things you don\'t need'],
            timeline: 'One zone cleared per day, whole home in 1-2 months',
            tip: 'A calm space quietly calms a busy mind.'
        },
        mental: {
            label: 'Mental Health', icon: '🧠',
            summary: 'Detected stress, mood, or wellbeing signals',
            steps: [
                'Do a daily mood check-in: rate your energy and stress 1-10',
                'Protect a daily 20-minute buffer just for yourself',
                'Write down 3 wins or grateful moments each night',
                'Set a scrolling limit for social media and news',
                'Move your body — even 15 minutes shifts mood chemistry',
                'Talk it out with someone trusted; seek professional help if it persists'
            ],
            mistakes: ['Self-isolating when things feel heavy', 'Skipping basics: sleep, food, daylight', 'Waiting for a breakdown to act'],
            timeline: 'Lighter mood in a few days, steady baseline in 3-6 weeks',
            tip: 'You don\'t have to carry everything alone. Asking for help is a strength.'
        },
        other: {
            label: 'Other', icon: '📌',
            summary: 'Analyzing your problem from first principles',
            steps: [
                'Write the problem as one clear sentence',
                'List what you already tried — and what failed and why',
                'Brainstorm 5 possible approaches, even wild ones',
                'Pick the most realistic one and break it into 3 small steps',
                'Take the first step within 24 hours',
                'Review after one week; keep what works, drop what doesn\'t'
            ],
            mistakes: ['Overthinking instead of acting', 'Waiting for perfect conditions', 'Quitting one week before results appear'],
            timeline: 'First progress in days, real momentum in 2-4 weeks',
            tip: 'Every big problem is a stack of small solvable ones. Start anywhere.'
        }
    };

    const TOPICS = [
        // ═══════════════════════ FINANCE ═══════════════════════
        { id: 'saving', match: ['save', 'saving', 'savings', 'cant save', "can't save", 'money left', 'no savings'], category: 'finance', icon: '💰', summary: 'Saving money — let\'s fix your cash flow', steps: [
            'Track every rupee/dollar for 7 days using a notes app — know where money goes',
            'Identify your top 3 unnecessary expenses and cut them this week',
            'Open a separate savings account — keep it out of sight, out of mind',
            'Set a fixed % to transfer the day salary arrives (even 10% counts)',
            'Use the 24-hour rule: wait a day before any non-essential purchase over $20',
            'Review your savings progress every Sunday and adjust'
            ], mistakes: ['Waiting until month-end to save what\'s left', 'Cutting all fun — burnout leads to splurging', 'Not automating the transfer'], timeline: 'Savings visible in 2-3 weeks, habit built in 60 days', tip: 'Pay yourself first. Save before you spend, not after.' },
        { id: 'budget', match: ['budget', 'budgeting', 'plan my money', 'money plan', 'expense track', 'spending track'], category: 'finance', icon: '📋', summary: 'Budgeting — take control of every dollar', steps: [
            'List all sources of monthly income (salary, side work, any other)',
            'Categorize last month\'s expenses: needs / wants / savings',
            'Apply the 50/30/20 rule: 50% needs, 30% wants, 20% savings',
            'Set a daily spending limit based on your weekly budget',
            'Use a free budgeting app or spreadsheet to log every transaction',
            'Do a weekly 10-minute check-in every Sunday to stay on track'
            ], mistakes: ['Making a budget you never check again', 'Forgetting irregular expenses (insurance, festivals)', 'Being too strict — a budget you quit is worse than none'], timeline: 'Clarity in 1 week, control in 1 month', tip: 'A budget isn\'t a cage — it\'s a plan that gives you freedom.' },
        { id: 'debt', match: ['debt', 'loan', 'emi', 'credit card', 'borrow', 'owe', 'repay', 'interest', 'pay off', 'paying off'], category: 'finance', icon: '🔗', summary: 'Debt management — break free from loans', steps: [
            'List every debt: amount, interest rate, minimum payment, lender',
            'Pay minimums on all debts, then throw extra money at the highest-interest one (avalanche method)',
            'If you need quick wins, try snowball: pay off the smallest debt first for momentum',
            'Call your lender and negotiate a lower interest rate — it works more often than you think',
            'Stop adding new debt: hide credit cards or freeze them in ice',
            'Set a debt-free target date and celebrate milestones along the way'
            ], mistakes: ['Only paying minimums forever', 'Taking new loans to pay old ones', 'Ignoring the debt and hoping it goes away'], timeline: 'First debt gone in 1-3 months, full freedom in 12-36 months', tip: 'Every debt paid is a chain broken. Start with the smallest one if you need momentum.' },
        { id: 'salary', match: ['salary', 'income', 'earn', 'not enough money', 'low pay', 'underpaid', 'need more income', 'side income', 'passive income'], category: 'finance', icon: '📈', summary: 'Income growth — earn more than you spend', steps: [
            'Calculate your exact monthly shortfall — know the gap between income and expenses',
            'Cut expenses first: find at least 3 quick wins (subscriptions, eating out, impulse buys)',
            'Research 2-3 side income options matching your skills (freelancing, tutoring, reselling)',
            'Dedicate 1 hour daily to building a side income stream',
            'Negotiate your current salary: gather evidence of your contributions and ask',
            'Invest in a skill that increases your market value (course, certification, portfolio)'
            ], mistakes: ['Ignoring expenses and only focusing on income', 'Starting 5 side hustles at once', 'Not tracking the new income properly'], timeline: 'Expense cuts in 1 week, side income in 1-2 months, salary growth in 3-6 months', tip: 'The gap between income and expenses is where your freedom lives. Widen it from both sides.' },
        { id: 'impulse', match: ['impulse', 'overspend', 'cant stop buying', 'shopping', 'addiction', 'waste money', 'bought useless', 'regret buying', 'retail therapy'], category: 'finance', icon: '🛒', summary: 'Impulse spending — break the buying cycle', steps: [
            'Delete shopping apps and remove saved card details from websites',
            'Apply the 30-day rule: write the item down, wait 30 days, still want it?',
            'Unsubscribe from promotional emails and unfollow sale accounts',
            'Calculate the hourly cost of items: "Is this worth X hours of my work?"',
            'Find a non-spending replacement for your trigger (walk, journal, call a friend)',
            'Set a fun money budget — a small guilt-free amount each month'
            ], mistakes: ['Blaming willpower alone — change your environment instead', 'Rationalizing purchases as "investments"', 'Keeping subscriptions you "might use someday"'], timeline: 'Trigger awareness in 1 week, new habits in 30 days', tip: 'Every purchase is a trade: you\'re trading hours of your life for that thing. Make it count.' },
        // ═══════════════════════ HEALTH ═══════════════════════
        { id: 'weight_loss', match: ['lose weight', 'weight loss', 'fat', 'belly', 'slim', 'obese', 'overweight', 'thin', 'shed weight', 'cut weight'], category: 'health', icon: '⚖️', summary: 'Weight loss — sustainable fat loss plan', steps: [
            'Calculate your maintenance calories and eat 300-500 less per day (no crash diets)',
            'Prioritize protein at every meal — it keeps you full and preserves muscle',
            'Walk 8,000-10,000 steps daily — low-effort, high-impact fat burning',
            'Add 2-3 strength training sessions per week to boost metabolism',
            'Sleep 7-8 hours — poor sleep increases hunger hormones by up to 25%',
            'Weigh yourself once a week, same time, same conditions — trend matters, not daily fluctuations'
            ], mistakes: ['Extreme calorie restriction (leads to binge later)', 'Only doing cardio and skipping strength', 'Expecting more than 0.5-1 kg loss per week'], timeline: 'Noticeable change in 2-3 weeks, transformation in 3 months', tip: 'Weight loss is 80% nutrition. You can\'t outrun a bad diet.' },
        { id: 'muscle_gain', match: ['muscle', 'gain weight', 'bulk', 'build body', 'gain mass', 'weak', 'skinny', 'no muscle', 'tone up', 'strength'], category: 'health', icon: '💪', summary: 'Muscle building — get stronger step by step', steps: [
            'Start with compound exercises: squats, deadlifts, bench press, rows, overhead press',
            'Train each muscle group 2x per week with progressive overload',
            'Eat in a slight calorie surplus (200-300 above maintenance) with 1.6-2g protein per kg bodyweight',
            'Sleep 7-9 hours — muscle grows during rest, not in the gym',
            'Track your lifts: if numbers go up, you\'re building muscle',
            'Be consistent for 12 weeks minimum before judging results'
            ], mistakes: ['Eating too much and gaining mostly fat', 'Program hopping every 2 weeks', 'Skipping legs and only training upper body'], timeline: 'Strength gains in 2-3 weeks, visible muscle in 8-12 weeks', tip: 'Muscle is built with food and rest, not just gym time. Feed your gains.' },
        { id: 'fitness_general', match: ['fitness', 'gym', 'workout', 'exercise', 'get fit', 'shape', 'out of shape', 'unhealthy', 'start working out'], category: 'health', icon: '🏃', summary: 'Getting fit — start your fitness journey', steps: [
            'Start with 20 minutes of walking daily — build the habit before intensity',
            'Try 2 bodyweight workouts per week (push-ups, squats, planks)',
            'Set a specific goal: run 5K, do 20 push-ups, or work out 4x/week',
            'Find a workout buddy or follow a free YouTube program for accountability',
            'Prep workout clothes the night before — remove friction',
            'Track progress with photos and energy levels, not just the scale'
            ], mistakes: ['Going from 0 to 6 days at the gym immediately', 'Waiting for "motivation" instead of building discipline', 'Comparing your week 1 to someone else\'s year 3'], timeline: 'Energy boost in 1 week, visible fitness in 4-8 weeks', tip: 'The best workout is the one you actually do. Start embarrassingly small.' },
        { id: 'eating_healthy', match: ['eat healthy', 'healthy eating', 'junk food', 'food', 'meal', 'nutrition', 'cook', 'snack', 'diet', 'clean eating', 'processed food'], category: 'health', icon: '🥗', summary: 'Healthy eating — transform your diet', steps: [
            'Audit your current diet for 3 days — write down everything you eat',
            'Add one serving of vegetables to lunch and dinner immediately',
            'Meal prep on Sundays: cook 2-3 base meals for the week ahead',
            'Swap sugary drinks for water, herbal tea, or black coffee',
            'Keep healthy snacks visible (fruit, nuts) and hide junk food',
            'Follow the 80/20 rule: eat nutritious food 80% of the time, enjoy treats 20%'
            ], mistakes: ['Going on extreme elimination diets', 'Meal prepping 7 days and burning out', 'Ignoring portion sizes even with healthy food'], timeline: 'Energy shifts in 1 week, taste buds adjust in 2-3 weeks, habits locked in 60 days', tip: 'Healthy eating isn\'t about perfection. It\'s about consistently choosing better.' },
        // ═══════════════════════ CAREER ═══════════════════════
        { id: 'job_switch', match: ['switch job', 'change job', 'new job', 'quit job', 'leave job', 'resign', 'job change', 'another job', 'better job'], category: 'career', icon: '🔄', summary: 'Job switch — plan your next move', steps: [
            'Define WHY you want to switch: bad boss? low pay? no growth? wrong field?',
            'Research 3-5 roles that fit your skills and interests',
            'Identify skill gaps and fill one with a free course or project within 30 days',
            'Update your resume and LinkedIn to target the new role — not the old one',
            'Reach out to 5 people in the target field for casual chats (informational interviews)',
            'Apply to 10+ roles while still employed — negotiate from strength, not desperation'
            ], mistakes: ['Quitting without a plan or savings', 'Applying to random jobs without focus', 'Bad-mouthing your current employer in interviews'], timeline: 'Target defined in 1 week, interviews in 4-8 weeks, new role in 2-4 months', tip: 'Don\'t run from your current job — run toward your next one.' },
        { id: 'promotion', match: ['promotion', 'raise', 'salary increase', 'advance', 'grow in role', 'become manager', 'next level', 'appraisal'], category: 'career', icon: '🎯', summary: 'Promotion — position yourself for the next level', steps: [
            'List the exact requirements for the role above yours (ask your manager or HR)',
            'Do your current job at the next level for 30 days before asking',
            'Track your achievements: document every win, metric, and project you\'ve led',
            'Request a 1-on-1 and present your case with data, not feelings',
            'Ask: "What specific steps do I need to take to earn a promotion?"',
            'If blocked, explore the same level at another company — lateral moves can be promotions'
            ], mistakes: ['Waiting to be noticed instead of making your work visible', 'Complaining instead of presenting solutions', 'Expecting a promotion for tenure alone, not performance'], timeline: 'Visibility in 2-4 weeks, promotion case in 1-3 months, promotion in 3-6 months', tip: 'Promotions go to those who do the next job before they have it.' },
        { id: 'interview_prep', match: ['interview', 'interview prep', 'interview tips', 'job interview', 'crack interview', 'interview nervous', ' interview scared'], category: 'career', icon: '🎤', summary: 'Interview prep — ace your next interview', steps: [
            'Research the company deeply: mission, recent news, competitors, culture',
            'Prepare STAR stories (Situation, Task, Action, Result) for 5 common questions',
            'Practice out loud — record yourself and fix filler words and rambling',
            'Prepare 3 thoughtful questions to ask THEM (shows genuine interest)',
            'Do a mock interview with a friend or use free AI interview tools',
            'Arrive 10 minutes early, dress one level above their dress code'
            ], mistakes: ['Memorizing robotic answers instead of natural conversation', 'Not asking questions at the end', 'Talking negatively about past employers'], timeline: 'Confidence built in 1 week, interview-ready in 2 weeks', tip: 'Interviews are conversations, not interrogations. Show them who you are, not just what you know.' },
        { id: 'resume', match: ['resume', 'cv', 'linkedin', 'portfolio', 'cover letter', 'job application', 'job profile', 'personal brand'], category: 'career', icon: '📄', summary: 'Resume & profile — stand out from the pile', steps: [
            'Use a clean, single-page resume template (no fancy designs for most fields)',
            'Start each bullet with a strong action verb: built, led, increased, reduced, launched',
            'Quantify everything: "Increased sales by 25%" beats "Responsible for sales"',
            'Tailor your resume for each job — mirror their keywords in your summary',
            'Optimize LinkedIn: professional photo, compelling headline, detailed experience',
            'Ask 2 people in your field to review and give honest feedback'
            ], mistakes: ['Using the same resume for every application', 'Listing duties instead of achievements', 'Ignoring LinkedIn — recruiters check it first'], timeline: 'Resume improved in 2-3 days, LinkedIn optimized in 1 week', tip: 'Your resume gets you the interview. Your story gets you the job.' },
        { id: 'unemployed', match: ['unemployed', 'laid off', 'fired', 'no job', 'jobless', 'lost job', 'can\'t find job', 'rejected', 'no response'], category: 'career', icon: '🆘', summary: 'Unemployed — bounce back stronger', steps: [
            'Give yourself 3 days to process, then create a daily job-search routine',
            'Treat job hunting as a job: 3-4 focused hours daily, Mon-Fri',
            'Update resume, LinkedIn, and portfolio today — not tomorrow',
            'Apply to 5-10 roles daily and track every application in a spreadsheet',
            'Reach out to your network: most jobs come through connections, not applications',
            'Upskill during gaps: a free course or project shows you stayed active'
            ], mistakes: ['Applying to 100 jobs with the same resume', 'Isolating and not telling anyone you\'re looking', 'Taking rejection personally — it\'s a numbers game'], timeline: 'Structure in 1 week, interviews in 3-6 weeks, new role in 1-3 months', tip: 'A layoff is a detour, not a dead end. Use this time to aim better, not just faster.' },
        // ═══════════════════════ MENTAL ═══════════════════════
        { id: 'anxiety', match: ['anxiety', 'anxious', 'panic', 'panic attack', 'nervous', 'scared', 'fear', 'tense', 'worry', 'worrying', 'constant worry'], category: 'mental', icon: '🧘', summary: 'Anxiety — calm your mind with proven techniques', steps: [
            'Learn the 4-7-8 breathing technique: inhale 4s, hold 7s, exhale 8s — repeat 4 rounds',
            'Ground with 5-4-3-2-1: name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste',
            'Write your worries down for 5 minutes — seeing them on paper shrinks them',
            'Cut caffeine after noon and reduce screen time 1 hour before bed',
            'Move your body for 15-20 minutes daily — even a walk shifts brain chemistry',
            'If anxiety persists 2+ weeks daily, talk to a therapist — it\'s strength, not weakness'
            ], mistakes: ['Suppressing anxious thoughts (they grow stronger)', 'Avoiding all anxiety triggers (makes the world smaller)', 'Self-medicating with alcohol or substances'], timeline: 'Coping tools ready in 1 week, calmer baseline in 4-6 weeks', tip: 'Anxiety is your brain\'s alarm system firing too often. Learn to check for real threats.' },
        { id: 'burnout', match: ['burnout', 'burned out', 'burnt out', 'exhausted', 'no energy', 'drained', 'empty', 'can\'t go on', 'collapse'], category: 'mental', icon: '🔥', summary: 'Burnout recovery — refill your empty tank', steps: [
            'Take an honest inventory: what\'s draining you vs what\'s energizing you?',
            'Set a hard stop time for work each day — protect your recovery',
            'Take at least 1 full day off per week with zero work communication',
            'Delegate or decline one responsibility this week — you\'re not a machine',
            'Revisit basic needs: sleep 7-8h, eat real food, get sunlight daily',
            'If burnout is deep, consider professional support — burnout recovery isn\'t lazy'
            ], mistakes: ['Pushing through with more caffeine and willpower', 'Taking a vacation but returning to the same overload', 'Blaming yourself instead of the unsustainable system'], timeline: 'Small relief in 1 week, real recovery in 4-8 weeks', tip: 'You can\'t pour from an empty cup. Refill yours first — everything else depends on it.' },
        { id: 'low_motivation', match: ['motivation', 'unmotivated', 'no motivation', 'lazy', 'don\'t care', 'don\'t feel like', 'apathy', 'cant be bothered', 'pointless'], category: 'mental', icon: '🎯', summary: 'Low motivation — reignite your drive', steps: [
            'Set one tiny goal you can accomplish today — motivation follows action',
            'Change your environment: clean your desk, go to a café, rearrange your space',
            'Use the 2-minute rule: if it takes less than 2 minutes, do it now',
            'Connect the task to a bigger WHY — why does this matter to your future self?',
            'Move your body for 10 minutes — physical motion creates mental momentum',
            'Stop waiting to "feel like it." Start before motivation arrives — it comes after'
            ], mistakes: ['Waiting for motivation to strike before starting', 'Setting 10 goals when you can barely do 1', 'Comparing your output to your peak performance'], timeline: 'First spark in 24 hours, consistent momentum in 2-3 weeks', tip: 'Motivation is not a feeling — it\'s a result. Act first, feel motivated second.' },
        { id: 'overthinking', match: ['overthink', 'overthinking', 'overthinker', 'cant stop thinking', 'spiral', 'analysis paralysis', 'indecisive', 'cant decide', 'stuck in head'], category: 'mental', icon: '🌀', summary: 'Overthinking — break free from mental loops', steps: [
            'Set a decision deadline: if the decision is small, decide in 2 minutes and move on',
            'Write the options down and pick the one with the best next step — not the "perfect" one',
            'Practice the 90-second rule: feelings last 90 seconds — let them pass without acting',
            'Talk it out with someone — externalizing thoughts shrinks them',
            'Limit information gathering: set a 15-minute research cap then decide',
            'Ask: "Will this matter in 5 years?" If no, spend no more than 5 minutes on it'
            ], mistakes: ['Confusing overthinking with being thorough', 'Replaying past decisions endlessly', 'Asking too many people for opinions'], timeline: 'Awareness in days, new patterns in 3-4 weeks', tip: 'A good decision now beats a perfect decision never. Act, learn, adjust.' },
        { id: 'loneliness', match: ['lonely', 'loneliness', 'alone', 'no friends', 'isolated', 'no one cares', 'nobody', 'feel alone', 'no connection', 'social isolation'], category: 'mental', icon: '🫂', summary: 'Loneliness — rebuild human connection', steps: [
            'Reach out to one person today — a text, a call, a coffee invite',
            'Join one group activity: sports club, book club, volunteer group, online community',
            'Schedule regular check-ins with existing friends — don\'t wait for them to reach out',
            'Practice small talk: compliment a stranger, chat with a neighbor, talk to a barista',
            'Be the initiator — most people are waiting for someone else to make the first move',
            'If loneliness feels deep and persistent, a therapist can help unpack the root cause'
            ], mistakes: ['Isolating further because reaching out feels hard', 'Confusing being alone with being lonely', 'Only seeking connection digitally — in-person matters more'], timeline: 'First connection in 1 week, social circle building in 1-3 months', tip: 'Loneliness is a signal, not a sentence. Your people are out there — take one step toward them.' },
        { id: 'stress', match: ['stress', 'stressed', 'pressure', 'overload', 'workload', 'deadline stress', 'too much', 'overwhelm', 'overwhelmed'], category: 'mental', icon: '😤', summary: 'Stress management — lower the pressure', steps: [
            'List your top 5 stressors and circle the ones you can actually control',
            'For controllable stressors: take one small action on the biggest one today',
            'For uncontrollable stressors: practice acceptance — "I can\'t control this, but I can control my response"',
            'Protect 1 hour daily for true recovery (no screens, no work — walk, read, nap)',
            'Use a brain dump: write everything on your mind before bed to clear mental RAM',
            'If stress is chronic (weeks), re-examine your commitments and say no to one thing'
            ], mistakes: ['Decompressing with more screen time (social media, Netflix)', 'Trying to fix everything at once', 'Ignoring physical symptoms: headaches, tension, insomnia'], timeline: 'Immediate relief with breathing, sustainable change in 3-4 weeks', tip: 'Stress is your body\'s emergency mode. Don\'t live there permanently.' },
        // ═══════════════════════ RELATIONSHIPS ═══════════════════════
        { id: 'communication', match: ['communication', 'cant talk', 'cant express', 'misunderstand', 'argument', 'fight', 'fighting', 'no listening', 'dont listen'], category: 'relationships', icon: '💬', summary: 'Communication issues — be heard and understood', steps: [
            'Use "I feel..." instead of "You always..." — no blame, just your experience',
            'Listen fully before responding — repeat back what you heard to confirm understanding',
            'Choose calm moments for important talks — not during fights or when tired',
            'Be specific: "I felt hurt when you did X" not "You\'re always like this"',
            'Set a rule: no interrupting during serious conversations',
            'If the same fight keeps repeating, consider couples counseling — it\'s not a last resort'
            ], mistakes: ['Expecting them to read your mind', 'Bringing up 10 issues at once', 'Using sarcasm or name-calling when frustrated'], timeline: 'Better conversations in 1 week, deeper connection in 4-6 weeks', tip: 'Most relationship problems are communication problems in disguise.' },
        { id: 'breakup', match: ['breakup', 'break up', 'broke up', 'ex', 'heartbreak', 'moved on', 'miss ex', 'get over', 'detached'], category: 'relationships', icon: '💔', summary: 'Breakup recovery — heal and move forward', steps: [
            'Allow yourself to grieve — don\'t rush the healing or suppress the pain',
            'Remove or archive all reminders: photos, texts, social media stalking',
            'Rebuild your daily routine without them: new habits fill the empty spaces',
            'Reconnect with friends and activities you neglected during the relationship',
            'Write a letter you never send — express everything you need to say',
            'When ready, reflect: what did you learn about yourself and what you need next time?'
            ], mistakes: ['Stalking their social media daily', 'Rebounding immediately to avoid pain', 'Idealizing the relationship — remember why it ended'], timeline: 'Raw pain in 1-2 weeks, functioning normally in 1-2 months, fully healed in 3-6 months', tip: 'You\'re not losing someone — you\'re making room for someone better. Heal first.' },
        { id: 'family', match: ['family', 'parents', 'mom', 'dad', 'brother', 'sister', 'sibling', 'family conflict', 'family issue', 'relative', 'family problem'], category: 'relationships', icon: '👨‍👩‍👧‍👦', summary: 'Family conflict — navigate blood ties wisely', steps: [
            'Identify the specific issue — general "family problems" are harder to solve',
            'Have a calm, private conversation with the person involved (not a group attack)',
            'Set boundaries clearly: "I love you, but I can\'t do X anymore"',
            'Accept that you can\'t change people — only change how you respond',
            'Limit contact if the relationship is toxic — distance is not disrespect',
            'Consider family counseling if the conflict affects your mental health'
            ], mistakes: ['Trying to fix everyone', 'Taking sides in family drama', 'Ignoring your own needs to keep the peace'], timeline: 'Boundaries set in 1-2 weeks, relationship shift in 1-3 months', tip: 'You didn\'t choose your family, but you can choose how much access they have to your peace.' },
        { id: 'social_skills', match: ['make friends', 'social skills', 'socialize', 'talk to people', 'shy', 'introvert', 'awkward', 'no friends', '社交', 'conversation'], category: 'relationships', icon: '🤝', summary: 'Social skills — build meaningful connections', steps: [
            'Start small: make eye contact, smile, and greet one person daily',
            'Ask open-ended questions — people love talking about themselves',
            'Join one recurring group activity (sports, classes, volunteering) — consistency builds bonds',
            'Be the person who follows up: "That was fun, let\'s do it again" within 48 hours',
            'Share something about yourself — vulnerability builds connection',
            'Accept that not everyone will click — and that\'s perfectly normal'
            ], mistakes: ['Waiting for others to approach first', 'Only connecting online — in-person bonds deeper', 'Being a people-pleaser instead of being genuine'], timeline: 'First new connection in 1-2 weeks, friendships forming in 1-3 months', tip: 'Friendships are built through repeated unplanned interactions. Put yourself where people are.' },
        // ═══════════════════════ EDUCATION ═══════════════════════
        { id: 'exam_prep', match: ['exam', 'exams', 'test', 'finals', 'board exam', 'entrance exam', 'competitive exam', 'pass exam', 'exam preparation'], category: 'education', icon: '📝', summary: 'Exam prep — study smart, not just hard', steps: [
            'Get the full syllabus and weightage — know what to prioritize',
            'Create a reverse study plan: exam date minus 7 days = finish syllabus, last week = revision only',
            'Use active recall: close the book and write/speak what you remember',
            'Solve past papers under timed conditions — this is the closest to real practice',
            'Teach a topic to someone (or pretend to) — if you can teach it, you know it',
            'Sleep 7+ hours before the exam — sleep consolidates memory better than cramming'
            ], mistakes: ['Reading the textbook cover-to-cover passively', 'Cramming all night before the exam', 'Studying easy topics for comfort, ignoring weak areas'], timeline: 'Knowledge gaps found in 1 week, exam-ready in 4-6 weeks', tip: 'The students who ace exams aren\'t smarter — they practice retrieving, not just reading.' },
        { id: 'study_habits', match: ['study', 'studying', 'study habits', 'study more', 'study routine', 'study plan', 'cant study'], category: 'education', icon: '📖', summary: 'Study habits — build a system that works', steps: [
            'Set a fixed study time and place — consistency trains your brain',
            'Use Pomodoro: 25 min focused study + 5 min break, repeat 4x then take 20 min off',
            'Start each session with a 2-minute review of yesterday\'s material',
            'Use spaced repetition: review notes after 1 day, 3 days, 7 days, and 30 days',
            'Handwrite key notes — it activates deeper memory than typing',
            'End each session by writing 3 things you learned in your own words'
            ], mistakes: ['Studying for hours without breaks (diminishing returns)', 'Highlighting passively instead of testing yourself', 'Multitasking with phone nearby'], timeline: 'Better focus in 1 week, improved retention in 2-3 weeks', tip: 'Study less, recall more. Active recall beats passive re-reading every time.' },
        { id: 'focus_study', match: ['focus', 'concentrate', 'concentration', 'distracted', 'attention', 'cant focus', 'losing focus', 'mind wanders', 'distract'], category: 'education', icon: '🎯', summary: 'Focus problems — sharpen your concentration', steps: [
            'Remove all distractions: phone in another room, notifications off, close extra tabs',
            'Start with just 10 minutes of focused work — build up gradually',
            'Use noise-cancelling headphones or brown noise/white noise',
            'Before starting, write the ONE thing you\'ll work on — clarity kills distraction',
            'Practice daily: 5 minutes of focused breathing trains attention like a muscle',
            'If your mind wanders, gently bring it back — don\'t judge, just reset'
            ], mistakes: ['Blaming "bad focus" instead of changing the environment', 'Starting with 2-hour focus sessions from zero', 'Checking your phone "for just a second"'], timeline: '10-min focus in 1 week, 45-60 min sessions in 4-6 weeks', tip: 'Focus isn\'t talent — it\'s a skill trained through eliminating distractions and practicing daily.' },
        { id: 'new_skill', match: ['learn', 'learning', 'new skill', 'course', 'programming', 'language', 'certification', 'online course', 'self learn', 'teach myself'], category: 'education', icon: '🧠', summary: 'Learning a new skill — go from zero to capable', steps: [
            'Define exactly what "good enough" looks like — don\'t aim for mastery on day 1',
            'Find one structured resource: a course, tutorial series, or book — avoid 50 tabs',
            'Spend 30-60 minutes daily on deliberate practice (not just watching)',
            'Build something real as you learn: a project, a meal, a conversation — application beats theory',
            'Join a community (Reddit, Discord, local group) — learning with others accelerates growth',
            'Accept the "suck phase" — every expert was once terrible. Keep going.'
            ], mistakes: ['Course-hopping without finishing any', 'Only consuming tutorials without practicing', 'Comparing your day 1 to someone else\'s year 5'], timeline: 'Basic competence in 2-4 weeks, useful skill in 2-3 months', tip: 'The best way to learn is to do. Stop planning and start creating, even badly.' },
        // ═══════════════════════ HOME ═══════════════════════
        { id: 'declutter', match: ['declutter', 'clutter', 'messy', 'too much stuff', 'junk', 'hoard', 'clean up', 'too many things', 'get rid'], category: 'home', icon: '🧹', summary: 'Decluttering — clear your space, clear your mind', steps: [
            'Start with ONE small area: a drawer, a shelf, or one corner — not the whole house',
            'Use the 4-box method: Keep / Donate / Trash / Relocate',
            'If you haven\'t used it in 12 months, donate or trash it',
            'One in, one out: for every new item, remove one old item',
            'Set a timer for 15 minutes daily — small sessions beat weekend marathons',
            'Don\'t organize clutter — remove it first, then organize what\'s left'
            ], mistakes: ['Trying to declutter the entire house in one day', 'Keeping things "just in case" (you won\'t use them)', 'Buying storage containers before decluttering'], timeline: 'One zone cleared per day, noticeable home transformation in 2-4 weeks', tip: 'Clutter is postponed decisions. Every item you own is a tiny decision waiting to be made.' },
        { id: 'moving', match: ['moving', 'move', 'new house', 'new apartment', 'relocating', 'shift', 'new place', 'settle in', 'unpack'], category: 'home', icon: '📦', summary: 'Moving to a new place — settle in smoothly', steps: [
            'Make an essentials box: toiletries, chargers, 3 days of clothes, important documents',
            'Unpack kitchen and bedroom FIRST — you need to eat and sleep from day 1',
            'Deep clean the new place before moving furniture in — it\'s easier when empty',
            'Set up utilities, internet, and address change within the first 48 hours',
            'Explore the neighborhood: find grocery stores, hospitals, transit, and restaurants',
            'Give yourself 2 weeks to feel at home — don\'t pressure yourself to have it perfect'
            ], mistakes: ['Leaving everything in boxes for months', 'Not measuring furniture before moving day', 'Trying to set up everything perfectly in week 1'], timeline: 'Functional home in 1 week, fully settled in 2-4 weeks', tip: 'A new place doesn\'t feel like home on day one. Create routines, and home follows.' },
        { id: 'daily_routine', match: ['routine', 'daily routine', 'daily habit', 'morning routine', 'night routine', 'schedule', 'no routine', 'structure', 'organized day'], category: 'home', icon: '⏰', summary: 'Daily routine — build a day that works for you', steps: [
            'Anchor your day with 2 non-negotiable habits: one morning, one night',
            'Write down your ideal day hour by hour — then adjust to be realistic',
            'Batch similar tasks: all errands in one block, all admin in another',
            'Protect a morning routine: wake up, hydrate, move, plan — no phone for 30 min',
            'End each night by reviewing what you did and planning tomorrow\'s top 3 priorities',
            'Follow the 80/20 rule: if your routine works 80% of days, it\'s a success'
            ], mistakes: ['Creating a perfect routine you abandon in 3 days', 'Skipping weekends entirely (routines need consistency)', 'Not building in buffer time between tasks'], timeline: 'Structure felt in 3-5 days, solid routine in 3-4 weeks', tip: 'A simple routine done daily beats a complex one done rarely. Start small, stay consistent.' },
        { id: 'cleaning', match: ['clean', 'cleaning', 'dirty', 'hygiene', 'housework', 'chores', 'tidy', 'dirty house', 'sparkle', 'deep clean'], category: 'home', icon: '🧽', summary: 'Cleaning habits — keep your space spotless', steps: [
            'Do a 10-minute nightly tidy: reset every room before bed (dishes, surfaces, floor)',
            'Follow the "clean as you cook" rule — kitchen stays manageable',
            'Assign one deep-cleaning task per day (Monday = bathroom, Tuesday = floors, etc.)',
            'Keep cleaning supplies in each room — reduce the friction to start',
            'Do laundry in batches: wash, dry, fold, put away — don\'t leave piles',
            'Play music or a podcast while cleaning — make it enjoyable, not a chore'
            ], mistakes: ['Waiting until the mess is overwhelming', 'Buying expensive cleaning gadgets instead of building the habit', 'Cleaning for guests instead of for yourself'], timeline: 'Daily tidy in 1 week, whole-home maintenance in 2-3 weeks', tip: 'A clean home isn\'t about perfection — it\'s about small daily resets that prevent chaos.' },
    ];

    const CATEGORY_FALLBACK = {
        finance: 'budget', health: 'fitness', career: 'career',
        relationships: 'relationships', education: 'education', home: 'home',
        mental: 'mental', other: 'other'
    };

    const chatMessages = document.getElementById('chatMessages');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const quickChips = document.getElementById('quickChips');
    const chatClock = document.getElementById('chatClock');
    const clearChatBtn = document.getElementById('clearChatBtn');

    function tickClock() {
        if (chatClock) {
            chatClock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }
    tickClock();
    setInterval(tickClock, 30000);

    function getUser() {
        try {
            const raw = localStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function setUser(user) {
        try {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        } catch (e) {}
    }

    function clearUser() {
        try {
            localStorage.removeItem(USER_KEY);
        } catch (e) {}
    }

    function getBotName() {
        return localStorage.getItem(BOT_KEY) || DEFAULT_BOT;
    }

    function setBotName(name) {
        try {
            localStorage.setItem(BOT_KEY, name || DEFAULT_BOT);
        } catch (e) {}
    }

    function updateBotNameUI() {
        const label = document.getElementById('botNameLabel');
        if (label) {
            label.textContent = getBotName();
            label.classList.add('bot-name');
        }
    }

    function botAvatar() {
        const avatar = document.createElement('div');
        avatar.className = 'avatar bot-avatar';
        const name = getBotName();
        avatar.textContent = name.charAt(0).toUpperCase();
        return avatar;
    }

    function getLocalCounts() {
        try {
            const raw = localStorage.getItem(LOCAL_KEY);
            const parsed = raw ? JSON.parse(raw) : {};
            return {
                visits: parsed.visits || 0,
                solved: parsed.solved || 0,
                device: parsed.device || 'unknown'
            };
        } catch (e) {
            return { visits: 0, solved: 0, device: 'unknown' };
        }
    }

    function setLocalCounts(counts) {
        try {
            localStorage.setItem(LOCAL_KEY, JSON.stringify(counts));
        } catch (e) {}
    }

    function bumpLocalCount(field) {
        const c = getLocalCounts();
        c[field] = (c[field] || 0) + 1;
        c.device = c.device || randomDeviceId();
        setLocalCounts(c);
        return c;
    }

    function randomDeviceId() {
        return 'dev-' + Math.random().toString(36).slice(2, 10);
    }

    function todayKey() {
        return COUNTER_TODAY_PREFIX + new Date().toISOString().slice(0, 10);
    }

    async function counterGet(key) {
        const res = await fetch(COUNTER_BASE + '/get/' + key);
        if (!res.ok) throw new Error('counter get failed');
        const data = await res.json();
        if (!data || typeof data.value === 'undefined') throw new Error('counter get no value');
        return data.value;
    }

    function counterHit(key) {
        return fetch(COUNTER_BASE + '/hit/' + key).then(function (res) {
            if (!res.ok) throw new Error('counter hit failed');
            return res.json();
        });
    }

    function refreshLiveStats() {
        const visitorsEl = document.getElementById('statVisitors');
        const todayEl = document.getElementById('statToday');
        const solvedEl = document.getElementById('statSolved');
        const localEl = document.getElementById('statLocal');
        const noteEl = document.getElementById('statsNote');

        const local = getLocalCounts();
        if (localEl) localEl.textContent = local.solved;

        Promise.all([
            counterGet(COUNTER_VISITORS),
            counterGet(todayKey()).catch(function () { return 0; }),
            counterGet(COUNTER_SOLVED)
        ]).then(function (values) {
            if (visitorsEl) visitorsEl.textContent = values[0].toLocaleString();
            if (todayEl) todayEl.textContent = values[1].toLocaleString();
            if (solvedEl) solvedEl.textContent = values[2].toLocaleString();
            if (noteEl) {
                noteEl.innerHTML = '🌍 <b>Live global counter</b> — updates every 30 seconds';
            }
        }).catch(function () {
            if (visitorsEl) visitorsEl.textContent = local.visits.toLocaleString();
            if (todayEl) todayEl.textContent = '—';
            if (solvedEl) solvedEl.textContent = local.solved.toLocaleString();
            if (noteEl) {
                noteEl.innerHTML = '🔌 Offline mode — showing counts for <b>this device</b> only';
            }
        });
    }

    function registerVisit() {
        bumpLocalCount('visits');
        counterHit(COUNTER_VISITORS).catch(function () {});
        counterHit(todayKey()).catch(function () {});
    }

    function registerSolved() {
        bumpLocalCount('solved');
        counterHit(COUNTER_SOLVED).catch(function () {});
    }

    function guessCategory(text) {
        const low = text.toLowerCase();
        const checks = [
            { cat: 'finance', words: ['money', 'save', 'savings', 'budget', 'debt', 'salary', 'expense', 'bill', 'loan', 'rent', 'income', 'earn', 'spend', 'overspend', 'impulse', 'credit', 'emi', 'repay', 'broke', 'poor'] },
            { cat: 'health', words: ['health', 'fitness', 'weight', 'diet', 'exercise', 'gym', 'eat', 'eating', 'sleep', 'insomnia', 'pain', 'sick', 'fatigue', 'muscle', 'fat', 'belly', 'calories', 'meal', 'nutrition', 'junk food', 'workout'] },
            { cat: 'career', words: ['job', 'work', 'career', 'interview', 'promotion', 'resume', 'boss', 'office', 'business', 'unemployed', 'laid off', 'fired', 'hired', 'quit', 'resign', 'salary raise', 'freelance', 'portfolio', 'linkedin'] },
            { cat: 'relationships', words: ['friend', 'family', 'girlfriend', 'boyfriend', 'wife', 'husband', 'parents', 'relationship', 'partner', 'marriage', 'breakup', 'lonely', 'alone', 'social', 'communication', 'argument', 'fight'] },
            { cat: 'education', words: ['study', 'studying', 'exam', 'school', 'college', 'learn', 'learning', 'student', 'university', 'course', 'test', 'focus', 'concentrate', 'homework', 'assignment', 'certification', 'programming', 'language'] },
            { cat: 'home', words: ['home', 'house', 'room', 'kitchen', 'clean', 'cleaning', 'tidy', 'organise', 'clutter', 'declutter', 'move', 'moving', 'space', 'apartment', 'messy', 'routine', 'daily routine'] },
            { cat: 'mental', words: ['stress', 'stressed', 'anxiety', 'anxious', 'depress', 'sad', 'lonely', 'worry', 'worrying', 'scared', 'panic', 'burnout', 'burned out', 'mood', 'motivation', 'unmotivated', 'overthink', 'overthinking', 'exhausted', 'drained'] }
        ];
        for (const c of checks) {
            for (const w of c.words) {
                if (low.includes(w)) return c.cat;
            }
        }
        return null;
    }

    function findTopic(text) {
        const low = text.toLowerCase();
        let best = null;
        let bestScore = 0;
        for (const topic of TOPICS) {
            let score = 0;
            for (const kw of topic.match) {
                if (low.includes(kw)) score += kw.length;
            }
            if (score > bestScore) {
                bestScore = score;
                best = topic;
            }
        }
        return best;
    }

    function buildRoadmap(topic, category, rawText) {
        const t = topic || TEMPLATES[category] || TEMPLATES.other;

        const div = document.createElement('div');
        div.className = 'roadmap';

        const head = document.createElement('div');
        head.className = 'roadmap-head';
        const emoji = document.createElement('span');
        emoji.className = 'rm-emoji';
        emoji.textContent = t.icon || (topic ? topic.icon : '📌');
        const info = document.createElement('div');
        info.className = 'rm-info';
        const title = document.createElement('p');
        title.className = 'rm-title';
        title.textContent = (t.summary || t.label || 'Your roadmap');
        const sub = document.createElement('p');
        sub.className = 'rm-sub';
        const topicName = (topic ? topic.id : ((TEMPLATES[category] || {}).label || 'solution')).toUpperCase();
        sub.textContent = 'TOPIC: ' + topicName + ' • GENERATED JUST NOW';
        info.appendChild(title);
        info.appendChild(sub);
        head.appendChild(emoji);
        head.appendChild(info);
        div.appendChild(head);

        const stepsLabel = document.createElement('p');
        stepsLabel.className = 'rm-sec-label';
        stepsLabel.textContent = '🗺️ Your step-by-step roadmap';
        div.appendChild(stepsLabel);

        const list = document.createElement('ol');
        list.className = 'rm-steps';
        (t.steps || []).forEach((s, i) => {
            const li = document.createElement('li');
            li.innerHTML = '<b>Step ' + (i + 1) + ':</b> ' + escapeHtml(s);
            list.appendChild(li);
        });
        div.appendChild(list);

        const avoidLabel = document.createElement('p');
        avoidLabel.className = 'rm-sec-label';
        avoidLabel.textContent = '⚠️ Avoid these mistakes';
        div.appendChild(avoidLabel);

        const mis = document.createElement('ul');
        mis.className = 'rm-mistakes';
        (t.mistakes || []).forEach((m) => {
            const li = document.createElement('li');
            li.textContent = m;
            mis.appendChild(li);
        });
        div.appendChild(mis);

        const meta = document.createElement('div');
        meta.className = 'rm-meta';
        const tl = document.createElement('div');
        tl.className = 'rm-timeline';
        tl.innerHTML = '⏱️ <b>Timeline:</b> ' + escapeHtml(t.timeline || 'depending on your consistency');
        const tt = document.createElement('div');
        tt.className = 'rm-tip';
        tt.innerHTML = '💡 <b>Quick tip:</b> ' + escapeHtml(t.tip || 'Start with the first step today.');
        meta.appendChild(tl);
        meta.appendChild(tt);
        div.appendChild(meta);

        return div;
    }

    function escapeHtml(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    function addUserMessage(text) {
        const wrap = document.createElement('div');
        wrap.className = 'message user';
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.textContent = text;
        wrap.appendChild(bubble);
        chatMessages.appendChild(wrap);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addTypingIndicator() {
        const wrap = document.createElement('div');
        wrap.className = 'message assistant typing-wrap';
        const avatar = botAvatar();
        const bubble = document.createElement('div');
        bubble.className = 'bubble typing';
        bubble.innerHTML = '<span></span><span></span><span></span>';
        wrap.appendChild(avatar);
        wrap.appendChild(bubble);
        chatMessages.appendChild(wrap);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return wrap;
    }

    function addAssistantMessage(html, asHtml) {
        const wrap = document.createElement('div');
        wrap.className = 'message assistant';
        const avatar = botAvatar();
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        if (asHtml) {
            bubble.innerHTML = html;
        } else {
            bubble.textContent = html;
        }
        wrap.appendChild(avatar);
        wrap.appendChild(bubble);
        chatMessages.appendChild(wrap);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return wrap;
    }

    function renderWelcome() {
        chatMessages.innerHTML = '';
        const user = getUser();
        const botName = getBotName();
        let html = '<p>👋 ' + (user ? 'Welcome back, <b>' + escapeHtml(user.name) + '</b>!' : 'Hi there! 😊') + '</p>';
        html += '<p>I\'m <b>' + escapeHtml(botName) + '</b>, your real-time roadmap provider. Tell me a daily life problem and I\'ll build a clear, step-by-step plan in seconds.</p>';
        html += '<p class="hint-line">Try: "I can\'t save money", "I want to lose weight", "I feel anxious", "I can\'t focus studying", or type "who are you?" to learn more 🙂</p>';
        addAssistantMessage(html, true);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function solve(text, categoryHint) {
        const topic = findTopic(text);
        const category = categoryHint || guessCategory(text);
        return buildRoadmap(topic, category, text);
    }

    const IDENTITY_RE = /who are you|what are you|tell me about yourself|what can you do|what do you do|are you a (robot|bot|human|real)|are you ai|are you an ai|is there a human|what is your name|your name|who made you|who built you|who created you|about anrabas|what is anrabas|are you chat ?gpt|how do you help|what do you help with|what shall i ask/i;

    const CONFIDENTIAL_RE = /system prompt|your instructions|your (hidden )?code|source code|api key|secret|password|credentials|internal (info|details|systems)|how are you (built|made|developed)|how do you work (internally|technically|really)|reveal|bypass|settings|configuration|server|database|backend|storage|logs/i;

    const CATEGORY_DEFS = [
        { emoji: '💰', name: 'Finance & Money', tags: 'saving, budgeting, debt, salary, loans, impulse spending, income' },
        { emoji: '❤️', name: 'Health & Fitness', tags: 'weight loss, muscle gain, eating healthy, sleep, fitness, energy' },
        { emoji: '💼', name: 'Career & Work', tags: 'job switch, promotion, interview prep, resume, unemployed, freelance' },
        { emoji: '👥', name: 'Relationships', tags: 'communication, breakup, family conflict, making friends, social skills' },
        { emoji: '📚', name: 'Education & Study', tags: 'exam prep, study habits, focus, learning new skills, concentration' },
        { emoji: '🏠', name: 'Home & Routine', tags: 'decluttering, moving, daily routine, cleaning habits, organization' },
        { emoji: '🧠', name: 'Mental Wellbeing', tags: 'anxiety, stress, burnout, motivation, overthinking, loneliness' }
    ];

    function getUnsupportedReply() {
        let html = '<p>Hmm, that topic isn\'t one of my core categories yet &mdash; and I want to give you a real roadmap, not a guess. 🙏</p>';
        html += '<p class="cat-msg-title"><b>I currently build roadmaps for these categories:</b></p><ul class="cat-list">';
        CATEGORY_DEFS.forEach(function (c) {
            html += '<li><span class="cat-item-icon">' + c.emoji + '</span> <b>' + c.name + '</b><br><span class="cat-hint">(' + c.tags + ')</span></li>';
        });
        html += '</ul><p class="cat-msg-foot">Try asking about one of those &mdash; for example: <i>"I want to save money"</i> or <i>"I feel stressed"</i> 🚀</p>';
        return html;
    }

    function getIdentityReply() {
        const botName = getBotName();
        const user = getUser();
        const greet = user ? 'Hi <b>' + escapeHtml(user.name) + '</b>!' : 'Hi there!';
        return {
            tag: '🤖 About me',
            html: greet + ' I\'m <b>' + escapeHtml(botName) + '</b> on the Anrabas platform &mdash; a real-time life problem solver &amp; roadmap provider.<br><br>Here\'s what I do:<ul style="margin-top:0.4rem">'
                + '<li>Turn your daily life problems into clear, step-by-step roadmaps</li>'
                + '<li>Instantly detect your topic &mdash; finance, health, career, relationships, education, home, mental wellbeing and more</li>'
                + '<li>Give you practical tips, timelines, and common mistakes to avoid</li>'
                + '<li>Keep your conversation private on your own device &mdash; it\'s never shared with others</li>'
                + '</ul>That\'s me. What challenge can I build a roadmap for today? 🚀'
        };
    }

    function getPrivacyReply() {
        return {
            tag: '🙅 Can\'t share that',
            text: 'I can\'t share that — those details are private to the Anrabas system and outside what I\'m built for. I\'m a roadmap assistant: tell me a daily life problem (money, health, career, relationships, study, home, or mental health) and I\'ll give you a clear step-by-step plan instead!'
        };
    }

    function detectIntent(text) {
        const low = text.toLowerCase();
        const conf = low.match(CONFIDENTIAL_RE);
        if (conf) return 'confidential';
        const id = low.match(IDENTITY_RE);
        if (id && id[0].length + 12 >= low.length) return 'identity';
        return 'roadmap';
    }

    function showInfoReply(intent) {
        if (intent === 'confidential') {
            const reply = getPrivacyReply();
            const msg = addAssistantMessage('', false);
            const bubble = msg.querySelector('.bubble');
            const tag = document.createElement('div');
            tag.className = 'ai-tag';
            tag.textContent = reply.tag;
            const t = document.createElement('div');
            t.className = 'ai-text';
            t.textContent = reply.text;
            bubble.appendChild(tag);
            bubble.appendChild(t);
        } else {
            const reply = getIdentityReply();
            const msg = addAssistantMessage(reply.html, true);
            const bubble = msg.querySelector('.bubble');
            const tag = document.createElement('div');
            tag.className = 'ai-tag';
            tag.textContent = reply.tag;
            bubble.insertBefore(tag, bubble.firstChild);
        }
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function handleQuestion(text) {
        const clean = text.trim();
        if (!clean) return;

        addUserMessage(clean);
        const typing = addTypingIndicator();

        const analysisTime = 500 + Math.min(900, clean.length * 3);
        setTimeout(function () {
            const intent = detectIntent(clean);
            if (intent !== 'roadmap') {
                typing.remove();
                showInfoReply(intent);
                return;
            }

            typing.remove();
            const category = guessCategory(clean);
            if (category === null && !findTopic(clean)) {
                const msg = addAssistantMessage(getUnsupportedReply(), true);
                const bubble = msg.querySelector('.bubble');
                const tag = document.createElement('div');
                tag.className = 'ai-tag';
                tag.textContent = '🗂️ Available categories';
                bubble.insertBefore(tag, bubble.firstChild);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                return;
            }
            const roadmap = solve(clean, category);
            const msg = addAssistantMessage('', false);
            const bubble = msg.querySelector('.bubble');
            bubble.classList.add('roadmap-bubble');
            bubble.appendChild(roadmap);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            registerSolved();
            const local = getLocalCounts();
            const localEl = document.getElementById('statLocal');
            if (localEl) localEl.textContent = local.solved;
        }, analysisTime);
    }

    chatForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const val = chatInput.value.trim();
        if (!val) return;
        chatInput.value = '';
        handleQuestion(val);
    });

    quickChips.addEventListener('click', function (e) {
        const chip = e.target.closest('.chip');
        if (chip) {
            chatInput.value = chip.dataset.q;
            handleQuestion(chip.dataset.q);
        }
    });

    document.querySelectorAll('.problem-card').forEach(function (card) {
        card.addEventListener('click', function () {
            handleQuestion(this.dataset.problem);
        });
    });

    const loginModal = document.getElementById('loginModal');
    const botModal = document.getElementById('botModal');
    const loginName = document.getElementById('loginName');
    const loginBtn = document.getElementById('loginBtn');
    const skipLoginBtn = document.getElementById('skipLoginBtn');
    const botModalText = document.getElementById('botModalText');
    const botYesBtn = document.getElementById('botYesBtn');
    const botNoBtn = document.getElementById('botNoBtn');
    const botCloseBtn = document.getElementById('botCloseBtn');
    const headerUser = document.getElementById('headerUser');
    const headerUserName = document.getElementById('headerUserName');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginBtnAlt = document.getElementById('loginBtnAlt');
    let pendingUsername = '';

    function showLoginModal() {
        loginModal.classList.remove('hidden');
    }

    function hideLoginModal() {
        loginModal.classList.add('hidden');
    }

    function hideBotModal() {
        botModal.classList.add('hidden');
    }

    function askBotName(username) {
        pendingUsername = username;
        botModalText.innerHTML = 'Do you want the chatbot to be called <b>' + escapeHtml(username) + '</b>?';
        botModal.classList.remove('hidden');
    }

    function completeLogin(username, botChosen) {
        const botName = botChosen ? username : DEFAULT_BOT;
        setBotName(botName);
        setUser({ name: username, botName: botName });
        applyLoggedInUI(username);
        hideLoginModal();
        hideBotModal();
        loginName.value = '';
        updateBotNameUI();
        renderWelcome();
    }

    function applyLoggedInUI(username) {
        headerUserName.textContent = username;
        headerUser.classList.remove('hidden');
        loginBtnAlt.classList.add('hidden');
    }

    function applyLoggedOutUI() {
        headerUser.classList.add('hidden');
        loginBtnAlt.classList.remove('hidden');
    }

    loginBtn.addEventListener('click', function () {
        const name = loginName.value.trim();
        if (!name) {
            loginName.classList.add('shake');
            setTimeout(function () { loginName.classList.remove('shake'); }, 500);
            return;
        }
        hideLoginModal();
        askBotName(name);
    });

    loginName.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') loginBtn.click();
    });

    skipLoginBtn.addEventListener('click', function () {
        setBotName(DEFAULT_BOT);
        clearUser();
        hideLoginModal();
        applyLoggedOutUI();
        updateBotNameUI();
        renderWelcome();
    });

    botYesBtn.addEventListener('click', function () {
        if (pendingUsername) {
            completeLogin(pendingUsername, true);
        }
    });

    botNoBtn.addEventListener('click', function () {
        if (pendingUsername) {
            completeLogin(pendingUsername, false);
        }
    });

    botCloseBtn.addEventListener('click', function () {
        if (pendingUsername) {
            completeLogin(pendingUsername, false);
        }
    });

    logoutBtn.addEventListener('click', function () {
        clearUser();
        setBotName(DEFAULT_BOT);
        applyLoggedOutUI();
        updateBotNameUI();
        renderWelcome();
    });

    loginBtnAlt.addEventListener('click', function () {
        showLoginModal();
    });

    clearChatBtn.addEventListener('click', function () {
        renderWelcome();
    });

    registerVisit();
    refreshLiveStats();
    setInterval(refreshLiveStats, 30000);

    const privacyModal = document.getElementById('privacyModal');
    const privacyOkBtn = document.getElementById('privacyOkBtn');

    function startSession() {
        updateBotNameUI();
        const existingUser = getUser();
        if (existingUser) {
            applyLoggedInUI(existingUser.name);
            renderWelcome();
        } else {
            renderWelcome();
            skipLoginBtn.disabled = false;
            showLoginModal();
        }
    }

    privacyOkBtn.addEventListener('click', function () {
        privacyModal.classList.add('hidden');
        startSession();
    });

    privacyModal.classList.remove('hidden');
})();