# Anrabas - Pseudocode, Diagram & Logic Report

---

## 1. Pseudocode

```
START
    SET default_bot_name = "knowledge"
    SET topics = [finance, health, career, relationships, education, home, mental]
    SET templates = {category: {steps, mistakes, timeline, tip}}

    // SESSION INIT
    IF privacy_modal_dismissed THEN
        IF user_exists_in_localStorage THEN
            SHOW logged_in_header
        ELSE
            SHOW login_modal
        END IF
        RENDER welcome_message
    END IF

    // USER INPUT HANDLER
    FUNCTION handleInput(text):
        ADD user_message_to_chat(text)
        SHOW typing_indicator
        WAIT(random_delay)

        intent = DETECT_INTENT(text)
        
        IF intent == "confidential" THEN
            REPLY "I can't share that"
            RETURN
        ELSE IF intent == "identity" THEN
            REPLY static_identity_message
            RETURN
        END IF

        category = GUESS_CATEGORY(text)
        topic = FIND_TOPIC(text)

        IF category == NULL AND topic == NULL THEN
            REPLY "Unsupported category" + list_available_categories
            RETURN
        END IF

        roadmap = BUILD_ROADMAP(topic, category, text)
        ADD roadmap_to_chat
        UPDATE solved_counter
    END FUNCTION

    // CATEGORY DETECTION
    FUNCTION guessCategory(text):
        FOR each category IN categories:
            FOR each keyword IN category.keywords:
                IF text CONTAINS keyword THEN
                    RETURN category.name
                END IF
            END FOR
        END FOR
        RETURN NULL
    END FUNCTION

    // TOPIC MATCHING (Scoring)
    FUNCTION findTopic(text):
        best_score = 0
        best_topic = NULL
        FOR each topic IN TOPICS:
            score = 0
            FOR each keyword IN topic.match_keywords:
                IF text CONTAINS keyword THEN
                    score += LENGTH(keyword)
                END IF
            END FOR
            IF score > best_score THEN
                best_score = score
                best_topic = topic
            END IF
        END FOR
        RETURN best_topic
    END FUNCTION

    // ROADMAP BUILDER
    FUNCTION buildRoadmap(topic, category, rawText):
        template = topic OR category_template OR "other" template
        
        CREATE roadmap_element
        ADD header (icon + summary + topic label)
        ADD ordered_list (step-by-step steps)
        ADD unordered_list (mistakes to avoid)
        ADD timeline_div (expected timeframe)
        ADD tip_div (quick tip)
        
        RETURN roadmap_element
    END FUNCTION

    // STATS TRACKER
    FUNCTION registerVisit():
        INCREMENT local_visits
        HIT global_counter_api (visitors)
        HIT global_counter_api (today)
    END FUNCTION

    FUNCTION registerSolved():
        INCREMENT local_solved
        HIT global_counter_api (solved)
    END FUNCTION

    // USER MANAGEMENT
    FUNCTION login(name):
        SAVE user_to_localStorage(name)
        ASK "Rename bot to your name?"
        IF yes THEN bot_name = name
        ELSE bot_name = "knowledge"
        END IF
        UPDATE UI
    END FUNCTION

    // INTENT DETECTION
    FUNCTION detectIntent(text):
        IF text MATCHES confidential_pattern THEN RETURN "confidential"
        IF text MATCHES identity_pattern THEN RETURN "identity"
        ELSE RETURN "roadmap"
    END FUNCTION

END
```

---

## 2. System Architecture Diagram

```
+------------------------------------------------------------------+
|                        USER INTERFACE                             |
+------------------------------------------------------------------+
|  [Privacy Modal]  -->  [Login Modal]  -->  [Bot Name Modal]      |
|        |                    |                     |                |
|        v                    v                     v                |
+------------------------------------------------------------------+
|                        MAIN CHAT SHELL                            |
+------------------------------------------------------------------+
|  [Chat Header] (bot name, clock, clear button, privacy badge)    |
|  [Quick Chips] (pre-defined problem buttons)                     |
|  [Chat Messages Area] (scrollable message container)             |
|  [Input Form] (text input + send button)                         |
|  [Stats Bar] (visitors, today, solved, local)                    |
+------------------------------------------------------------------+


                         +-----------+
                         |  INPUT    |
                         |  (text)   |
                         +-----+-----+
                               |
                               v
                    +----------+----------+
                    |   INTENT DETECTOR   |
                    +----------+----------+
                               |
            +------------------+------------------+
            |                  |                  |
            v                  v                  v
    +-------+-------+ +-------+-------+ +-------+-------+
    |  CONFIDENTIAL | |   IDENTITY    | |   ROADMAP     |
    |  (blocked)    | |   (static)    | |   (process)   |
    +-------+-------+ +-------+-------+ +-------+-------+
            |                  |                  |
            v                  v                  v
    +-------+-------+ +-------+-------+ +-------+-------+
    | Privacy Reply | | Identity Msg  | |  CATEGORY     |
    | "Can't share" | | "I'm Anrabas" | |  DETECTOR     |
    +---------------+ +---------------+ +-------+-------+
                                                    |
                                      +-------------+-------------+
                                      |             |             |
                                      v             v             v
                              +-------+---+ +-------+---+ +-------+---+
                              | FINANCE   | | HEALTH    | | CAREER    |
                              | (money,   | | (fitness, | | (job,     |
                              |  salary)  | |  diet)    | |  resume)  |
                              +-------+---+ +-------+---+ +-------+---+
                                      |             |             |
                                      v             v             v
                              +-------+---+ +-------+---+ +-------+---+
                              | RELATIONS | | EDUCATION | | MENTAL    |
                              | (family,  | | (study,   | | (stress,  |
                              |  partner) | |  exams)   | |  anxiety) |
                              +-------+---+ +-------+---+ +-------+---+
                                      |             |             |
                                      v             v             v
                              +-------+---+ +-------+---+ +-------+---+
                              |   HOME    | |   OTHER   | | UNSUPPORTED|
                              | (clean,   | | (fallback)| | (no match) |
                              |  organize)| |           | |            |
                              +-----------+ +-----------+ +------------+
                                      |             |             |
                                      v             v             v
                              +-------+---+ +-------+---+ +-------+---+
                              |  TOPIC    | |  TEMPLATE | | SHOW      |
                              |  MATCHER  | |  SELECTOR | | CATEGORIES|
                              | (scoring) | |           | |           |
                              +-----------+ +-----------+ +-----------+
                                      |             |
                                      v             v
                              +-------+---+ +-------+---+
                              |  BUILD    | |  RENDER   |
                              | ROADMAP   | |  TO CHAT  |
                              +-----------+ +-----------+
                                      |             |
                                      v             v
                              +-------+---+ +-------+---+
                              |  UPDATE   | |  REGISTER |
                              |  STATS    | |  SOLVED   |
                              +-----------+ +-----------+


+------------------------------------------------------------------+
|                     DATA STORAGE (localStorage)                   |
+------------------------------------------------------------------+
|  anrabas_user      -> { name, botName }                          |
|  anrabas_bot_name  -> string (bot name)                          |
|  anrabas_local_counts -> { visits, solved, device }              |
+------------------------------------------------------------------+

+------------------------------------------------------------------+
|                  EXTERNAL API (countapi.mileshilliard.com)        |
+------------------------------------------------------------------+
|  GET  /api/v1/get/anrabas_sathu_total_visitors                   |
|  GET  /api/v1/get/anrabas_sathu_today_{date}                     |
|  GET  /api/v1/get/anrabas_sathu_total_solved                     |
|  HIT  /api/v1/hit/anrabas_sathu_total_visitors                   |
|  HIT  /api/v1/hit/anrabas_sathu_today_{date}                     |
|  HIT  /api/v1/hit/anrabas_sathu_total_solved                     |
+------------------------------------------------------------------+
```

---

## 3. Logic Flow Diagram (Simplified)

```
START
   |
   v
[Privacy Modal Shown]
   |
   v
[User Clicks "I Understand"]
   |
   v
[User Exists?] --YES--> [Show Logged-In UI]
   |                          |
   NO                         |
   |                          |
   v                          v
[Login Modal] ---------> [Bot Name Modal]
   |                          |
   v                          v
[Welcome Message Rendered] <--+
   |
   v
[User Types/Sends Message]
   |
   v
[Detect Intent]
   |
   +---> Confidential? --> [Show Privacy Reply] --> END
   |
   +---> Identity? --> [Show Identity Reply] --> END
   |
   +---> Roadmap?
          |
          v
      [Guess Category]
          |
          v
      [Find Topic (scoring)]
          |
          v
      [Category + Topic Found?]
          |
    YES --+-- NO
          |     |
          v     v
   [Build Roadmap]  [Show Unsupported Message]
          |                |
          v                v
   [Render in Chat]  [END]
          |
          v
   [Update Solved Counter]
          |
          v
         END
```

---

## 4. Key Logic Explained

| Component | Logic |
|-----------|-------|
| **Intent Detection** | Regex matching against 2 patterns: identity keywords and confidential keywords. If neither matches, defaults to "roadmap" intent |
| **Category Detection** | Iterates through 7 category objects, each with an array of keywords. First keyword match wins (no scoring) |
| **Topic Matching** | Score-based system. Each keyword matched adds `length(keyword)` to score. Highest scoring topic wins |
| **Roadmap Generation** | Pure template-based. Picks a hardcoded object (steps, mistakes, timeline, tip) and renders as HTML |
| **Stats Tracking** | Dual system: localStorage for offline + external API (`countapi.mileshilliard.com`) for global counters. Fallback to local if API fails |
| **User Session** | localStorage only. No server-side auth. User data persists until browser cache cleared |
| **Bot Renaming** | User can name the bot after themselves. Stored in localStorage. UI updates dynamically |
| **Delay Simulation** | Random delay (500ms + length*3ms, max 1400ms) before showing response to simulate "thinking" |

---

## 5. Data Flow

```
User Input (text)
       |
       v
  [String Processing]
       |
       v
  [lowercase + trim]
       |
       v
  [Regex/Keyword Matching]
       |
       +---> Intent: confidential/identity/roadmap
       |
       +---> Category: finance/health/career/...
       |
       +---> Topic: budget/procrastination/anxiety/...
       |
       v
  [Template Selection]
       |
       v
  [HTML Generation]
       |
       v
  [DOM Injection] --> [Chat Messages Area]
       |
       v
  [Counter Update] --> [localStorage + External API]
```

---

## 6. Supported Keywords per Category

| Category | Keywords |
|----------|----------|
| **Finance** | save, saving, budget, expense, spend, money, poor, broke, salary, debt, loan, payment, finance, rent |
| **Health** | health, fitness, weight, diet, exercise, gym, eat, sleep, pain, sick, fatigue |
| **Career** | job, work, career, interview, promotion, resume, boss, office, business |
| **Relationships** | friend, family, girlfriend, boyfriend, wife, husband, parents, relationship, partner, marriage |
| **Education** | study, exam, school, college, learn, student, university, course, test |
| **Home** | home, house, room, kitchen, clean, tidy, organise, clutter, move, space |
| **Mental** | stress, anxiety, depress, sad, lonely, worry, scared, burnout, mood, motivat |

---

*Generated by analyzing Anrabas chatbot codebase*
