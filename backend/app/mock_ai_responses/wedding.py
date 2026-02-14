"""
Mock AI responses for goal: "Help me plan my friend's wedding"

Info-gathering goal — first 4 tasks require user input (date, budget, guests, location)
before AI can plan the rest. Converted from AI team's mock (Loher) into new schema format.

Includes:
- WEDDING_INITIAL: First plan generated (tasks 1-4 are info-gathering, 5-9 are action)
"""

WEDDING_INITIAL = {
    "description": "Complete planning guide for organising a wedding",
    "goal_due_date": "2026-06-15",
    "tasks": [
        {
            "ai_id": "task_1",
            "description": "Decide the wedding date or a general time frame",
            "order": 1,
            "status": "not_started",
            "due_date": "2026-03-01",
            "requires_input": True,
            "guidance": "Start by discussing with your friend and key family members about the season, month, or specific dates that are meaningful and work for everyone.",
            "subtasks": [
                {
                    "ai_id": "task_1a",
                    "description": "Check availability of key family members and wedding party",
                    "order": 1,
                    "status": "not_started",
                    "guidance": "Reach out early — December can clash with holiday plans."
                },
                {
                    "ai_id": "task_1b",
                    "description": "Confirm the final date or narrow it to 2-3 options",
                    "order": 2,
                    "status": "not_started",
                    "guidance": "Having a few backup dates helps when negotiating with venues."
                }
            ]
        },
        {
            "ai_id": "task_2",
            "description": "Set the overall wedding budget",
            "order": 2,
            "status": "not_started",
            "due_date": "2026-03-05",
            "requires_input": True,
            "guidance": "Research typical wedding costs in the chosen area and talk honestly with all parties contributing financially. Make a rough estimate of what everyone is comfortable spending.",
            "subtasks": [
                {
                    "ai_id": "task_2a",
                    "description": "List all potential contributors and their amounts",
                    "order": 1,
                    "status": "not_started",
                    "guidance": "Parents, the couple, and other family — get firm numbers, not vague promises."
                },
                {
                    "ai_id": "task_2b",
                    "description": "Research average costs for weddings in the chosen location",
                    "order": 2,
                    "status": "not_started",
                    "guidance": "Look at real wedding cost breakdowns online for your area. This avoids sticker shock later."
                },
                {
                    "ai_id": "task_2c",
                    "description": "Set a firm total budget and allocate to categories",
                    "order": 3,
                    "status": "not_started",
                    "guidance": "Typical split: 40-50% venue/catering, 10% photography, 10% attire, 10% flowers/decor, rest divided among entertainment, transport, stationery, etc."
                }
            ]
        },
        {
            "ai_id": "task_3",
            "description": "Estimate the guest count",
            "order": 3,
            "due_date": "2026-03-10",
            "status": "not_started",
            "requires_input": True,
            "guidance": "Make a preliminary list with your friend of everyone they might invite. This helps with budgeting and venue selection. Be realistic — guest count is the biggest cost driver.",
            "subtasks": [
                {
                    "ai_id": "task_3a",
                    "description": "Draft an A-list (definite invites) and B-list (if space allows)",
                    "order": 1,
                    "status": "not_started",
                    "guidance": "The A-list should fit within your budget. The B-list fills spots from declined invitations."
                }
            ]
        },
        {
            "ai_id": "task_4",
            "description": "Choose a preferred location or style for the ceremony and reception",
            "order": 4,
            "due_date": "2026-03-15",
            "status": "not_started",
            "requires_input": True,
            "guidance": "Think about what kind of setting the couple wants (outdoor, ballroom, church, hotel, barn, etc.) and narrow down locations that fit the budget and guest count.",
            "subtasks": []
        },
        {
            "ai_id": "task_5",
            "description": "Research and book ceremony and reception venues",
            "order": 5,
            "due_date": "2026-03-25",
            "status": "not_started",
            "requires_input": False,
            "guidance": "Start researching venues early as popular places book up quickly. Consider capacity, availability, and what is included in venue packages. Schedule venue tours and compare offerings against the budget.",
            "subtasks": [
                {
                    "ai_id": "task_5a",
                    "description": "Shortlist 5-8 venues that fit the budget, style, and guest count",
                    "order": 1,
                    "status": "not_started",
                    "guidance": "Use wedding websites, Google reviews, and recommendations. Filter by capacity and price range."
                },
                {
                    "ai_id": "task_5b",
                    "description": "Schedule tours and visit the top 3 venues",
                    "order": 2,
                    "status": "not_started",
                    "guidance": "Bring a checklist: ask about availability, what's included, corkage fees, minimum spend, wet-weather backup, parking."
                },
                {
                    "ai_id": "task_5c",
                    "description": "Book the chosen venue and pay the deposit",
                    "order": 3,
                    "status": "not_started",
                    "guidance": "Read the contract carefully before signing. Check cancellation policy and payment schedule."
                }
            ]
        },
        {
            "ai_id": "task_6",
            "description": "Create a prioritised list of wedding vendors and start booking",
            "order": 6,
            "due_date": "2026-03-01",
            "status": "not_started",
            "requires_input": False,
            "guidance": "Make a list of must-have vendors and research local options. Get quotes and reviews, and prioritise bookings based on availability.",
            "subtasks": [
                {
                    "ai_id": "task_6a",
                    "description": "Book a photographer/videographer",
                    "order": 1,
                    "status": "not_started",
                    "guidance": "Good photographers book 12-18 months out. Look at full wedding galleries, not just highlight reels."
                },
                {
                    "ai_id": "task_6b",
                    "description": "Book catering (if not included with venue)",
                    "order": 2,
                    "status": "not_started",
                    "guidance": "Request tastings. Consider dietary requirements of your guests."
                },
                {
                    "ai_id": "task_6c",
                    "description": "Book entertainment (band, DJ, or both)",
                    "order": 3,
                    "status": "not_started",
                    "guidance": "Ask to see them perform live or watch videos. Check if they need specific power or space requirements."
                },
                {
                    "ai_id": "task_6d",
                    "description": "Book florist and decorator",
                    "order": 4,
                    "status": "not_started",
                    "guidance": "Bring photos of styles you like. Seasonal flowers are cheaper and look better."
                }
            ]
        },
        {
            "ai_id": "task_7",
            "description": "Develop a wedding day timeline and guest logistics plan",
            "order": 7,
            "due_date": "2026-03-01",
            "status": "not_started",
            "requires_input": False,
            "guidance": "Draft a schedule for the wedding day including ceremony times, reception, and key moments. Consider how guests will arrive, where they will stay, and transportation needs.",
            "subtasks": [
                {
                    "ai_id": "task_7a",
                    "description": "Draft the ceremony and reception timeline",
                    "order": 1,
                    "status": "not_started",
                    "guidance": "Work backwards from the ceremony time. Include getting ready, photos, ceremony, drinks reception, dinner, speeches, first dance, party."
                },
                {
                    "ai_id": "task_7b",
                    "description": "Arrange accommodation options for travelling guests",
                    "order": 2,
                    "status": "not_started",
                    "guidance": "Negotiate group rates at nearby hotels. Include info on the save-the-dates."
                }
            ]
        },
        {
            "ai_id": "task_8",
            "description": "Send save-the-dates and later formal invitations",
            "order": 8,
            "due_date": "2026-03-01",
            "status": "not_started",
            "requires_input": False,
            "guidance": "Send save-the-dates 6-8 months out, formal invitations 6-8 weeks before. Request RSVPs with a firm deadline.",
            "subtasks": [
                {
                    "ai_id": "task_8a",
                    "description": "Gather accurate contact details for all guests",
                    "order": 1,
                    "status": "not_started",
                    "guidance": "Spreadsheet time! Include names, addresses, email, dietary requirements, and plus-one status."
                },
                {
                    "ai_id": "task_8b",
                    "description": "Design and send save-the-dates",
                    "order": 2,
                    "status": "not_started",
                    "guidance": "Can be physical cards or digital. Include date, location, and a wedding website link if you have one."
                },
                {
                    "ai_id": "task_8c",
                    "description": "Design and send formal invitations with RSVP deadline",
                    "order": 3,
                    "status": "not_started",
                    "guidance": "Include ceremony and reception details, dress code, RSVP method, and dietary question."
                }
            ]
        },
        {
            "ai_id": "task_9",
            "description": "Set up a wedding planning tracker and budget spreadsheet",
            "order": 9,
            "due_date": "2026-03-01",
            "status": "not_started",
            "requires_input": False,
            "guidance": "Use a spreadsheet or a digital planning tool to stay on top of tasks, payments, deposits, and deadlines. This will help manage the budget effectively.",
            "subtasks": []
        }
    ]
}