"""
Mock AI responses for goal: "Learn piano"

Skill-building / learning goal — long-term, progressive steps.
First task requires user input (what instrument do you have?).

Includes:
- PIANO_INITIAL: First plan generated
"""

PIANO_INITIAL = {
    "tasks": [
        {
            "ai_id": "task_1",
            "description": "Get access to a piano or keyboard",
            "order": 1,
            "status": "not_started",
            "requires_input": True,
            "guidance": "You need regular access to practice. Let us know what you have available so we can tailor the plan.",
            "subtasks": [
                {
                    "ai_id": "task_1a",
                    "description": "Decide between acoustic piano, digital piano, or keyboard",
                    "order": 1,
                    "status": "not_started",
                    "guidance": "For beginners, a 61+ key digital piano with weighted keys is the best balance of cost and feel. Full-size is 88 keys."
                },
                {
                    "ai_id": "task_1b",
                    "description": "Purchase, rent, or find a place to practise regularly",
                    "order": 2,
                    "status": "not_started",
                    "guidance": "Budget options: second-hand digital piano (€100-300), keyboard rental, or a local community centre with a piano room."
                }
            ]
        },
        {
            "ai_id": "task_2",
            "description": "Learn the basics of piano layout and posture",
            "order": 2,
            "status": "not_started",
            "requires_input": False,
            "guidance": "Before playing any songs, you need to understand the instrument and how to sit at it properly to avoid bad habits.",
            "subtasks": [
                {
                    "ai_id": "task_2a",
                    "description": "Learn the layout of white and black keys (C-D-E-F-G-A-B pattern)",
                    "order": 1,
                    "status": "not_started",
                    "guidance": "Find Middle C first — it's near the centre of the keyboard. The pattern of 2 and 3 black keys repeats across the whole keyboard."
                },
                {
                    "ai_id": "task_2b",
                    "description": "Learn correct sitting posture and hand position",
                    "order": 2,
                    "status": "not_started",
                    "guidance": "Sit with feet flat, elbows at key level, wrists relaxed and level (not drooping). Curved fingers like holding a tennis ball."
                },
                {
                    "ai_id": "task_2c",
                    "description": "Learn finger numbering (1=thumb through 5=pinky)",
                    "order": 3,
                    "status": "not_started",
                    "guidance": "Both hands use the same numbering: thumb=1, index=2, middle=3, ring=4, pinky=5. Sheet music uses these numbers."
                }
            ]
        },
        {
            "ai_id": "task_3",
            "description": "Learn to read basic sheet music",
            "order": 3,
            "status": "not_started",
            "requires_input": False,
            "guidance": "Reading music opens up thousands of songs. Start with the treble clef (right hand) and add bass clef later.",
            "subtasks": [
                {
                    "ai_id": "task_3a",
                    "description": "Learn the treble clef notes (right hand): lines (E-G-B-D-F) and spaces (F-A-C-E)",
                    "order": 1,
                    "status": "not_started",
                    "guidance": "Use mnemonics: 'Every Good Boy Deserves Fun' for lines, 'FACE' for spaces."
                },
                {
                    "ai_id": "task_3b",
                    "description": "Learn the bass clef notes (left hand): lines (G-B-D-F-A) and spaces (A-C-E-G)",
                    "order": 2,
                    "status": "not_started",
                    "guidance": "'Good Boys Do Fine Always' for lines, 'All Cows Eat Grass' for spaces."
                },
                {
                    "ai_id": "task_3c",
                    "description": "Learn basic note values: whole, half, quarter, eighth notes",
                    "order": 3,
                    "status": "not_started",
                    "guidance": "Whole = 4 beats, half = 2, quarter = 1, eighth = 0.5. Clap rhythms before playing them."
                }
            ]
        },
        {
            "ai_id": "task_4",
            "description": "Practice basic scales and finger exercises",
            "order": 4,
            "status": "not_started",
            "requires_input": False,
            "guidance": "Scales build finger strength, independence, and familiarity with keys. Start slow and increase speed gradually.",
            "subtasks": [
                {
                    "ai_id": "task_4a",
                    "description": "Practice C major scale with right hand, then left hand",
                    "order": 1,
                    "status": "not_started",
                    "guidance": "C major uses only white keys: C-D-E-F-G-A-B-C. Practice ascending and descending. Use correct fingering: 1-2-3-1-2-3-4-5."
                },
                {
                    "ai_id": "task_4b",
                    "description": "Practice C major scale with both hands together",
                    "order": 2,
                    "status": "not_started",
                    "guidance": "This is tricky at first! Go very slowly. Both thumbs play C at the same time."
                },
                {
                    "ai_id": "task_4c",
                    "description": "Learn G major and F major scales",
                    "order": 3,
                    "status": "not_started",
                    "guidance": "G major has one sharp (F#), F major has one flat (Bb). These are the next most common keys."
                }
            ]
        },
        {
            "ai_id": "task_5",
            "description": "Learn your first simple song",
            "order": 5,
            "status": "not_started",
            "requires_input": False,
            "guidance": "Nothing beats the motivation of playing a real song! Start with something simple that uses the notes and rhythms you've learned.",
            "subtasks": [
                {
                    "ai_id": "task_5a",
                    "description": "Choose a beginner song (e.g., 'Twinkle Twinkle', 'Ode to Joy', or 'Lean on Me')",
                    "order": 1,
                    "status": "not_started",
                    "guidance": "Pick something you actually like — you'll practise it more. Beginner arrangements of pop songs work great."
                },
                {
                    "ai_id": "task_5b",
                    "description": "Learn the right hand melody first",
                    "order": 2,
                    "status": "not_started",
                    "guidance": "Play it slowly, note by note. Don't worry about speed — accuracy first."
                },
                {
                    "ai_id": "task_5c",
                    "description": "Add the left hand (simple chords or bass notes)",
                    "order": 3,
                    "status": "not_started",
                    "guidance": "Start with just root notes or simple two-note chords in the left hand. Combine hands very slowly."
                },
                {
                    "ai_id": "task_5d",
                    "description": "Play the full song hands together at a comfortable speed",
                    "order": 4,
                    "status": "not_started",
                    "guidance": "Use a metronome app set to a slow tempo. Speed up only when you can play it perfectly at the current speed."
                }
            ]
        },
        {
            "ai_id": "task_6",
            "description": "Establish a regular practice routine",
            "order": 6,
            "status": "not_started",
            "requires_input": False,
            "guidance": "Consistent short sessions beat occasional long ones. Even 15 minutes daily is better than 2 hours once a week.",
            "subtasks": [
                {
                    "ai_id": "task_6a",
                    "description": "Set a daily practice time (aim for 15-30 minutes minimum)",
                    "order": 1,
                    "status": "not_started",
                    "guidance": "Attach it to an existing habit — 'after breakfast I practice piano'. Put it in your calendar."
                },
                {
                    "ai_id": "task_6b",
                    "description": "Structure each session: warm-up scales, new material, review old pieces",
                    "order": 2,
                    "status": "not_started",
                    "guidance": "5 min scales → 15 min new piece → 5 min playing something you already know (for fun and confidence)."
                }
            ]
        }
    ]
}