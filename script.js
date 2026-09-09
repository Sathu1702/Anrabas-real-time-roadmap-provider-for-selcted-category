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
        { id: 'budget', match: ['save', 'saving', 'budget', 'expense', 'spend', 'money', 'poor', 'broke', 'salary', 'debt', 'loan', 'payment', 'finance', 'rent'], category: 'finance', icon: '💰', summary: 'Money management & budgeting detected', steps: [
                'Open one sheet and list income vs spending over the last 30 days',
                'Rank expenses and cut the biggest 3 leaks immediately',
                'Adopt the 50/30/20 split (needs / wants / savings)',
                'Set an automatic transfer to savings on payday',
                'Tackle high-interest debt first with the avalanche or snowball method',
                'Review your budget every Sunday for 10 minutes'
            ], mistakes: ['Chasing unattainable frugality', 'Not tracking small recurring charges', 'Skipping the emergency fund'], timeline: 'Cash flow visible in 1 week, breathing room in 1-2 months', tip: 'You can\'t manage what you don\'t measure. Start tracking today.' },
        { id: 'procrastination', match: ['procrastinat', 'delay', 'lazy', "can't start", 'dont start', 'putting off', 'avoid', 'unmotivated', 'distracted', 'focus'], category: 'other', icon: '⏰', summary: 'Motivation & focus barriers detected', steps: [
                'Shrink the task: commit to just 5 minutes — momentum does the rest',
                'Apply the 2-minute rule for tiny tasks: do it instantly',
                'Move your phone out of reach before starting',
                'Work in 25-minute sprints with 5-minute breaks (Pomodoro)',
                'Write a done-list, not just a to-do list, to fuel motivation',
                'Remove decision fatigue: decide tonight what you\'ll do tomorrow'
            ], mistakes: ['Waiting to "feel ready"', 'Multitasking during sprints', 'Planning endlessly, executing never'], timeline: 'Winning streaks in 1 week, new identity in 30 days', tip: 'Start before you feel ready. Action creates motivation — not the other way around.' },
        { id: 'anxiety', match: ['anxiety', 'anxious', 'stress', 'nervous', 'overthink', 'worry', 'panic', 'scared', 'fear', 'tense'], category: 'mental', icon: '🧘', summary: 'Anxiety or worry patterns detected', steps: [
                'Recognize the physical cues: racing heart, shallow breath, tension',
                'Calm your nervous system: 4-7-8 breathing for 4 rounds',
                'Ground yourself with 5-4-3-2-1 (see / touch / hear / smell / taste)',
                'Write worries out; separate facts from "what-if" thoughts',
                'Move your body daily and cut caffeine after noon',
                'If it runs daily for 2+ weeks, talk to a professional'
            ], mistakes: ['Suppressing feelings instead of processing them', 'Doom-scrolling at night', 'Skipping sleep and exercise'], timeline: 'Toolkit ready in 1 week, calmer baseline in 4-6 weeks', tip: 'Anxiety is a loud signal, not a verdict. Breathe, ground, and take the next small step.' },
        { id: 'time', match: ['time', 'busy', 'overwhelmed', 'overwhelm', 'schedule', 'organi', 'priority', 'productive', 'deadline', 'multitask'], category: 'other', icon: '📅', summary: 'Time & productivity challenges detected', steps: [
                'Pick your top 3 tasks each morning — the rest can wait',
                'Time-block your calendar: assign hours, not just lists',
                'Batch similar work: emails, calls, and errands in one block',
                'Protect a 90-minute deep-focus block daily (phone away)',
                'Say no to low-value requests that hijack your day',
                'Plan tomorrow\'s priorities tonight, before you log off'
            ], mistakes: ['Saying yes to everything', 'Skipping breaks entirely', 'Re-planning instead of working'], timeline: 'More control in 2-3 days, an extra 10+ hours/week in a month', tip: 'Effectiveness beats busy-ness. Work on the few tasks that actually matter.' },
        { id: 'fitness', match: ['fitness', 'gym', 'weight', 'fat', 'workout', 'exercise', 'diet', 'shape', 'muscle', 'slim', 'gain', 'obese', 'unhealthy'], category: 'health', icon: '🏃', summary: 'Fitness & body-goal signals detected', steps: [
                'Lock the goal: stamina, strength, weight loss, or energy',
                'Create two daily anchors: 7-8h sleep and 2-3L of water',
                'Move for 20-30 minutes daily — walking counts, consistency rules',
                'Add 2-3 strength sessions weekly (squats, push-ups, lunges)',
                'Swap one unhealthy meal or snack weekly — gradual wins stick',
                'Measure with photos and energy levels, not only the scale'
            ], mistakes: ['All-or-nothing crash programs', 'Neglecting sleep and water', 'Comparing to fitness influencers'], timeline: 'Energy in 1 week, visible change in 4-8 weeks', tip: 'Fitness is a system, not a sprint. Small daily reps build a stronger life.' },
        { id: 'career', match: ['career', 'job', 'work', 'promotion', 'interview', 'resume', 'employ', 'profession', 'quit', 'hire', 'salary raise', 'unemployed', 'laid off'], category: 'career', icon: '💼', summary: 'Career and work transition detected', steps: [
                'Define the target role or industry in one sentence',
                'List your transferable skills and evidence for each',
                'Close one skill gap with a free course or mini-project',
                'Run 3 informational interviews with people in the field',
                'Refresh your resume and LinkedIn to match the target',
                'Send 5 tailored applications and iterate on feedback'
            ], mistakes: ['Waiting for the perfect resume', 'Networking only when you need something', 'Rejecting yourself before applying'], timeline: 'Target defined in 1 week, interviews in 3-8 weeks', tip: 'Your next chapter is built from small, brave moves — not one giant leap.' },
        { id: 'stress', match: ['stress', 'burnout', 'exhausted', 'tired', 'overload', 'pressure', 'deadline stress', 'workload'], category: 'mental', icon: '😤', summary: 'Stress and pressure signals detected', steps: [
                'Audit your stressors for 3 days: what drains vs fuels you',
                'Protect 1 hour of true recovery daily (sleep, walk, hobby)',
                'Set a hard "off" time for work/screen each night',
                'Delegate or decline one low-value responsibility this week',
                'Use a brain-dump list to clear mental noise before bed',
                'If exhaustion persists, check sleep, bloodwork, or counseling'
            ], mistakes: ['Decompressing with more screens', 'Skipping meals and sleep under pressure', 'Trying to do it all alone'], timeline: 'Lighter within days, sustainable rhythm in 3-4 weeks', tip: 'Stress is not a badge. Rest is a strategy, not a reward.' },
        { id: 'sleep', match: ['sleep', 'insomnia', 'awake', 'tired morning', 'cant sleep', 'rest', 'night'], category: 'health', icon: '😴', summary: 'Sleep quality issues detected', steps: [
                'Set a fixed bedtime and wake time — yes, weekends too',
                'Keep screens out of bed; try reading or audio instead',
                'Make the room dark and cool (18-20°C)',
                'Cut caffeine after 2pm and food 3 hours before bed',
                'Do a gentle wind-down routine: stretch, breathe, plan tomorrow',
                'Lying awake 20+ min? Get up, do something boring, return when sleepy'
            ], mistakes: ['Phone scrolling to "relax"', 'Catching up on weekend with 12-hour sleeps', 'Exercising right before bed'], timeline: 'Better nights in 1 week, full repair in 3-4 weeks', tip: 'Your best self is built at night. Guard your sleep like an appointment with a VIP.' },
        { id: 'eating', match: ['eat', 'healthy', 'junk', 'food', 'meal', 'nutrition', 'cook', 'snack', 'lose weight', 'hungry'], category: 'health', icon: '🥗', summary: 'Eating and nutrition habits detected', steps: [
                'Identify your worst 2 eating moments (late-night snacks? skip breakfast?)',
                'Prep one healthy meal or snack in advance each day',
                'Add vegetables and protein to every meal — crowd out junk',
                'Swap sugary drinks for water or unsweetened tea',
                'Eat mindfully: plate food, sit down, slow down',
                'Plan one weekly grocery list instead of impulse buying'
            ], mistakes: ['Extreme detox diets', 'Relying on willpower alone', 'Drinking calories unknowingly'], timeline: 'Energy in 1 week, better habits in a month', tip: 'Eat like you\'re fueling a person you truly care about — because you are.' }
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
            { cat: 'finance', words: ['money', 'save', 'budget', 'debt', 'salary', 'expense', 'bill', 'loan', 'rent'] },
            { cat: 'health', words: ['health', 'fitness', 'weight', 'diet', 'exercise', 'gym', 'eat', 'sleep', 'pain', 'sick', 'fatigue'] },
            { cat: 'career', words: ['job', 'work', 'career', 'interview', 'promotion', 'resume', 'boss', 'office', 'bussiness'] },
            { cat: 'relationships', words: ['friend', 'family', 'girlfriend', 'boyfriend', 'wife', 'husband', 'parents', 'relationship', 'partner', 'marriage'] },
            { cat: 'education', words: ['study', 'exam', 'school', 'college', 'learn', 'student', 'university', 'course', 'test'] },
            { cat: 'home', words: ['home', 'house', 'room', 'kitchen', 'clean', 'tidy', 'organise', 'clutter', 'move', 'space'] },
            { cat: 'mental', words: ['stress', 'anxiety', 'depress', 'sad', 'lonely', 'worry', 'scared', 'burnout', 'mood', 'motivat'] }
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
        html += '<p class="hint-line">Try: "I want to save money", "I keep procrastinating", or type "who are you?" to learn about me 🙂</p>';
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
        { emoji: '💰', name: 'Finance & Money', tags: 'saving, budgeting, debt, salary, bills, rent' },
        { emoji: '❤️', name: 'Health & Fitness', tags: 'fitness, weight, diet, exercise, sleep, pain' },
        { emoji: '💼', name: 'Career & Work', tags: 'job, interviews, promotion, resume, office' },
        { emoji: '👥', name: 'Relationships', tags: 'friends, family, partner, marriage, parents' },
        { emoji: '📚', name: 'Education & Study', tags: 'exams, school, college, learning, courses' },
        { emoji: '🏠', name: 'Home & Routine', tags: 'cleaning, organizing, tidying, moving, space' },
        { emoji: '🧠', name: 'Mental Wellbeing', tags: 'stress, anxiety, motivation, burnout, mood' }
    ];

    function getUnsupportedReply() {
        let html = 'Hmm, that topic isn\'t one of my core categories yet &mdash; and I want to give you a real roadmap, not a guess. 🙏<br><br><b>I currently build roadmaps for these categories:</b><ul style="margin-top:0.4rem">';
        CATEGORY_DEFS.forEach(function (c) {
            html += '<li>' + c.emoji + ' <b>' + c.name + '</b> <span class="cat-hint">(' + c.tags + ')</span></li>';
        });
        html += '</ul>Try asking about one of those &mdash; for example: <i>"I want to save money"</i> or <i>"I feel stressed"</i> 🚀';
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

    function handleQuestion(text) {
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