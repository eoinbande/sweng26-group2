"""
Mock AI responses for goal: "Help me plan my friend's wedding"

Info-gathering goal — first 4 tasks require user input (date, budget, guests, location)
before AI can plan the rest. Converted from AI team's mock (Loher) into new schema format.

Includes:
- WEDDING_INITIAL: First plan generated (tasks 1-4 are info-gathering, 5-9 are action)
- WEDDING_AFTER_FEEDBACK: After user says "task 2 is too vague, break it down"
"""

WEDDING_INITIAL = {
    "description": "Complete planning guide for organising a wedding",
    "goal_due_date": "2026-06-15",
    "tasks": [
        {
            "ai_id": "task_1",
            "description": "Decide on the perfect wedding date",
            "order": 1,
            "status": "not_started",
            "due_date": "2026-03-01",
            "requires_input": True,
            "guidance": "Start by discussing with your friend and key family members about the season, month, or specific dates that are meaningful and work for everyone.",
            "subtasks": [
                {
                    "ai_id": "task_1a",
                    "description": "Check availability of key guests",
                    "order": 1,
                    "status": "not_started",
                    "due_date": "2026-02-22",
                    "guidance": "Reach out early — December can clash with holiday plans."
                },
                {
                    "ai_id": "task_1b",
                    "description": "Confirm the final date choice",
                    "order": 2,
                    "status": "not_started",
                    "due_date": "2026-03-01",
                    "guidance": "Having a few backup dates helps when negotiating with venues."
                }
            ]
        },
        {
            "ai_id": "task_2",
            "description": "Set a realistic wedding budget",
            "order": 2,
            "status": "not_started",
            "due_date": "2026-03-05",
            "requires_input": True,
            "guidance": "Research typical wedding costs in the chosen area and talk honestly with all parties contributing financially. Make a rough estimate of what everyone is comfortable spending.",
            "subtasks": []
        },
        {
            "ai_id": "task_3",
            "description": "Estimate the total guest count",
            "order": 3,
            "due_date": "2026-03-10",
            "status": "not_started",
            "requires_input": True,
            "guidance": "Make a preliminary list with your friend of everyone they might invite. This helps with budgeting and venue selection. Be realistic — guest count is the biggest cost driver.",
            "subtasks": [
                {
                    "ai_id": "task_3a",
                    "description": "Draft A & B guest lists",
                    "order": 1,
                    "status": "not_started",
                    "due_date": "2026-03-10",
                    "guidance": "The A-list should fit within your budget. The B-list fills spots from declined invitations."
                }
            ]
        },
        {
            "ai_id": "task_4",
            "description": "Choose the location and style",
            "order": 4,
            "due_date": "2026-03-15",
            "status": "not_started",
            "requires_input": True,
            "guidance": "Think about what kind of setting the couple wants (outdoor, ballroom, church, hotel, barn, etc.) and narrow down locations that fit the budget and guest count.",
            "subtasks": []
        },
        {
            "ai_id": "task_5",
            "description": "Book the ceremony and reception venues",
            "order": 5,
            "due_date": "2026-03-25",
            "status": "not_started",
            "requires_input": False,
            "guidance": "Start researching venues early as popular places book up quickly. Consider capacity, availability, and what is included in venue packages. Schedule venue tours and compare offerings against the budget.",
            "subtasks": [
                {
                    "ai_id": "task_5a",
                    "description": "Shortlist potential venues",
                    "order": 1,
                    "status": "not_started",
                    "due_date": "2026-03-18",
                    "guidance": "Use wedding websites, Google reviews, and recommendations. Filter by capacity and price range."
                },
                {
                    "ai_id": "task_5b",
                    "description": "Tour the top 3 venues",
                    "order": 2,
                    "status": "not_started",
                    "due_date": "2026-03-22",
                    "guidance": "Bring a checklist: ask about availability, what's included, corkage fees, minimum spend, wet-weather backup, parking."
                },
                {
                    "ai_id": "task_5c",
                    "description": "Book the chosen venue",
                    "order": 3,
                    "status": "not_started",
                    "due_date": "2026-03-25",
                    "guidance": "Read the contract carefully before signing. Check cancellation policy and payment schedule."
                }
            ]
        },
        {
            "ai_id": "task_6",
            "description": "Book all necessary vendors",
            "order": 6,
            "due_date": "2026-04-01",
            "status": "not_started",
            "requires_input": False,
            "guidance": "Make a list of must-have vendors and research local options. Get quotes and reviews, and prioritise bookings based on availability.",
            "subtasks": [
                {
                    "ai_id": "task_6a",
                    "description": "Book the photographer",
                    "order": 1,
                    "status": "not_started",
                    "due_date": "2026-03-28",
                    "guidance": "Good photographers book 12-18 months out. Look at full wedding galleries, not just highlight reels."
                },
                {
                    "ai_id": "task_6b",
                    "description": "Book the catering service",
                    "order": 2,
                    "status": "not_started",
                    "due_date": "2026-03-30",
                    "guidance": "Request tastings. Consider dietary requirements of your guests."
                },
                {
                    "ai_id": "task_6c",
                    "description": "Book the entertainment",
                    "order": 3,
                    "status": "not_started",
                    "due_date": "2026-03-31",
                    "guidance": "Ask to see them perform live or watch videos. Check if they need specific power or space requirements."
                },
                {
                    "ai_id": "task_6d",
                    "description": "Book the florist and decor",
                    "order": 4,
                    "status": "not_started",
                    "due_date": "2026-04-01",
                    "guidance": "Bring photos of styles you like. Seasonal flowers are cheaper and look better."
                }
            ]
        },
        {
            "ai_id": "task_7",
            "description": "Plan the timeline & logistics",
            "order": 7,
            "due_date": "2026-04-15",
            "status": "not_started",
            "requires_input": False,
            "guidance": "Draft a schedule for the wedding day including ceremony times, reception, and key moments. Consider how guests will arrive, where they will stay, and transportation needs.",
            "subtasks": [
                {
                    "ai_id": "task_7a",
                    "description": "Draft the event timeline",
                    "order": 1,
                    "status": "not_started",
                    "due_date": "2026-04-10",
                    "guidance": "Work backwards from the ceremony time. Include getting ready, photos, ceremony, drinks reception, dinner, speeches, first dance, party."
                },
                {
                    "ai_id": "task_7b",
                     "description": "Arrange transportation",
                     "order": 2,
                     "status": "not_started",
                     "due_date": "2026-04-12",
                     "guidance": "Book cars for the couple and shuttles for guests if venues are far apart."
                }
            ]
        }
    ]
}


# =============================================================================
# After feedback: "Task 2 is too vague, break it down for me"
# task_2 now has subtasks breaking down the budgeting process
# =============================================================================

WEDDING_AFTER_FEEDBACK = {
    "tasks": [
        {
            "ai_id": "task_1",
            "description": "Decide on the perfect wedding date",
            "order": 1,
            "status": "not_started",
            "due_date": "2026-03-01",
            "requires_input": True,
            "guidance": "Start by discussing with your friend and key family members about the season, month, or specific dates that are meaningful and work for everyone.",
            "subtasks": [
                {
                    "ai_id": "task_1a",
                    "description": "Check availability of key guests",
                    "order": 1,
                    "status": "not_started",
                    "due_date": "2026-02-22",
                    "guidance": "Reach out early — December can clash with holiday plans."
                },
                {
                    "ai_id": "task_1b",
                    "description": "Confirm the final date choice",
                    "order": 2,
                    "status": "not_started",
                    "due_date": "2026-03-01",
                    "guidance": "Having a few backup dates helps when negotiating with venues."
                }
            ]
        },
        {
            "ai_id": "task_2",
            "description": "Set a realistic wedding budget",
            "order": 2,
            "status": "not_started",
            "due_date": "2026-03-05",
            "requires_input": True,
            "guidance": "Breaking this down into clear steps so nothing gets missed. Start by figuring out who's contributing, then research costs in your area, and finally divide the money across categories.",
            "subtasks": [
                {
                    "ai_id": "task_2a",
                    "description": "List all financial contributors and their amounts",
                    "order": 1,
                    "status": "not_started",
                    "due_date": "2026-03-02",
                    "guidance": "Parents, the couple, and other family — get firm numbers, not vague promises."
                },
                {
                    "ai_id": "task_2b",
                    "description": "Research average wedding costs in the chosen area",
                    "order": 2,
                    "status": "not_started",
                    "due_date": "2026-03-03",
                    "guidance": "Look at real wedding cost breakdowns online for your area. This avoids sticker shock later."
                },
                {
                    "ai_id": "task_2c",
                    "description": "Set a firm total budget and allocate to categories",
                    "order": 3,
                    "status": "not_started",
                    "due_date": "2026-03-04",
                    "guidance": "Typical split: 40-50% venue/catering, 10% photography, 10% attire, 10% flowers/decor, rest divided among entertainment, transport, stationery, etc."
                },
                {
                    "ai_id": "task_2d",
                    "description": "Create a shared budget spreadsheet to track spending",
                    "order": 4,
                    "status": "not_started",
                    "due_date": "2026-03-05",
                    "guidance": "Use Google Sheets or a wedding budget app. Include columns for estimated cost, actual cost, deposit paid, and balance due."
                }
            ]
        },
        {
            "ai_id": "task_3",
            "description": "Estimate the total guest count",
            "order": 3,
            "due_date": "2026-03-10",
            "status": "not_started",
            "requires_input": True,
            "guidance": "Make a preliminary list with your friend of everyone they might invite. This helps with budgeting and venue selection. Be realistic — guest count is the biggest cost driver.",
            "subtasks": [
                {
                    "ai_id": "task_3a",
                    "description": "Draft A & B guest lists",
                    "order": 1,
                    "status": "not_started",
                    "due_date": "2026-03-10",
                    "guidance": "The A-list should fit within your budget. The B-list fills spots from declined invitations."
                }
            ]
        },
        {
            "ai_id": "task_4",
            "description": "Choose the location and style",
            "order": 4,
            "due_date": "2026-03-15",
            "status": "not_started",
            "requires_input": True,
            "guidance": "Think about what kind of setting the couple wants (outdoor, ballroom, church, hotel, barn, etc.) and narrow down locations that fit the budget and guest count.",
            "subtasks": []
        },
        {
            "ai_id": "task_5",
            "description": "Book the ceremony and reception venues",
            "order": 5,
            "due_date": "2026-03-25",
            "status": "not_started",
            "requires_input": False,
            "guidance": "Start researching venues early as popular places book up quickly. Consider capacity, availability, and what is included in venue packages. Schedule venue tours and compare offerings against the budget.",
            "subtasks": [
                {
                    "ai_id": "task_5a",
                    "description": "Shortlist potential venues",
                    "order": 1,
                    "status": "not_started",
                    "due_date": "2026-03-18",
                    "guidance": "Use wedding websites, Google reviews, and recommendations. Filter by capacity and price range."
                },
                {
                    "ai_id": "task_5b",
                    "description": "Tour the top 3 venues",
                    "order": 2,
                    "status": "not_started",
                    "due_date": "2026-03-22",
                    "guidance": "Bring a checklist: ask about availability, what's included, corkage fees, minimum spend, wet-weather backup, parking."
                },
                {
                    "ai_id": "task_5c",
                    "description": "Book the chosen venue",
                    "order": 3,
                    "status": "not_started",
                    "due_date": "2026-03-25",
                    "guidance": "Read the contract carefully before signing. Check cancellation policy and payment schedule."
                }
            ]
        },
        {
            "ai_id": "task_6",
            "description": "Book all necessary vendors",
            "order": 6,
            "due_date": "2026-04-01",
            "status": "not_started",
            "requires_input": False,
            "guidance": "Make a list of must-have vendors and research local options. Get quotes and reviews, and prioritise bookings based on availability.",
            "subtasks": [
                {
                    "ai_id": "task_6a",
                    "description": "Book the photographer",
                    "order": 1,
                    "status": "not_started",
                    "due_date": "2026-03-28",
                    "guidance": "Good photographers book 12-18 months out. Look at full wedding galleries, not just highlight reels."
                },
                {
                    "ai_id": "task_6b",
                    "description": "Book the catering service",
                    "order": 2,
                    "status": "not_started",
                    "due_date": "2026-03-30",
                    "guidance": "Request tastings. Consider dietary requirements of your guests."
                },
                {
                    "ai_id": "task_6c",
                    "description": "Book the entertainment",
                    "order": 3,
                    "status": "not_started",
                    "due_date": "2026-03-31",
                    "guidance": "Ask to see them perform live or watch videos. Check if they need specific power or space requirements."
                },
                {
                    "ai_id": "task_6d",
                    "description": "Book the florist and decor",
                    "order": 4,
                    "status": "not_started",
                    "due_date": "2026-04-01",
                    "guidance": "Bring photos of styles you like. Seasonal flowers are cheaper and look better."
                }
            ]
        },
        {
            "ai_id": "task_7",
            "description": "Plan the timeline & logistics",
            "order": 7,
            "due_date": "2026-04-15",
            "status": "not_started",
            "requires_input": False,
            "guidance": "Draft a schedule for the wedding day including ceremony times, reception, and key moments. Consider how guests will arrive, where they will stay, and transportation needs.",
            "subtasks": [
                {
                    "ai_id": "task_7a",
                    "description": "Draft the event timeline",
                    "order": 1,
                    "status": "not_started",
                    "due_date": "2026-04-10",
                    "guidance": "Work backwards from the ceremony time. Include getting ready, photos, ceremony, drinks reception, dinner, speeches, first dance, party."
                },
                {
                    "ai_id": "task_7b",
                     "description": "Arrange transportation",
                     "order": 2,
                     "status": "not_started",
                     "due_date": "2026-04-12",
                     "guidance": "Book cars for the couple and shuttles for guests if venues are far apart."
                }
            ]
        }
    ]
}

# =============================================================================
# After tasks 1, 2, 3 completed, user says:
# "The couple are expecting a baby — wedding needs to happen in 6 weeks."
# Timeline compressed, remaining tasks simplified for urgency
# Task 2 keeps its subtasks from the earlier feedback expansion
# =============================================================================

WEDDING_FEEDBACK_BABY = {
    "tasks": [
        {
            "ai_id": "task_1",
            "description": "Decide on the perfect wedding date",
            "order": 1,
            "status": "completed",
            "due_date": "2026-03-01",
            "requires_input": True,
            "guidance": "Start by discussing with your friend and key family members about the season, month, or specific dates that are meaningful and work for everyone.",
            "subtasks": [
                {
                    "ai_id": "task_1a",
                    "description": "Check availability of key guests",
                    "order": 1,
                    "status": "completed",
                    "due_date": "2026-02-22",
                    "guidance": "Reach out early — December can clash with holiday plans."
                },
                {
                    "ai_id": "task_1b",
                    "description": "Confirm the final date choice",
                    "order": 2,
                    "status": "completed",
                    "due_date": "2026-03-01",
                    "guidance": "Having a few backup dates helps when negotiating with venues."
                }
            ]
        },
        {
            "ai_id": "task_2",
            "description": "Set a realistic wedding budget",
            "order": 2,
            "status": "completed",
            "due_date": "2026-03-05",
            "requires_input": True,
            "guidance": "Breaking this down into clear steps so nothing gets missed. Start by figuring out who's contributing, then research costs in your area, and finally divide the money across categories.",
            "subtasks": [
                {
                    "ai_id": "task_2a",
                    "description": "List all financial contributors and their amounts",
                    "order": 1,
                    "status": "completed",
                    "due_date": "2026-03-02",
                    "guidance": "Parents, the couple, and other family — get firm numbers, not vague promises."
                },
                {
                    "ai_id": "task_2b",
                    "description": "Research average wedding costs in the chosen area",
                    "order": 2,
                    "status": "completed",
                    "due_date": "2026-03-03",
                    "guidance": "Look at real wedding cost breakdowns online for your area. This avoids sticker shock later."
                },
                {
                    "ai_id": "task_2c",
                    "description": "Set a firm total budget and allocate to categories",
                    "order": 3,
                    "status": "completed",
                    "due_date": "2026-03-04",
                    "guidance": "Typical split: 40-50% venue/catering, 10% photography, 10% attire, 10% flowers/decor, rest divided among entertainment, transport, stationery, etc."
                },
                {
                    "ai_id": "task_2d",
                    "description": "Create a shared budget spreadsheet to track spending",
                    "order": 4,
                    "status": "completed",
                    "due_date": "2026-03-05",
                    "guidance": "Use Google Sheets or a wedding budget app. Include columns for estimated cost, actual cost, deposit paid, and balance due."
                }
            ]
        },
        {
            "ai_id": "task_3",
            "description": "Estimate the total guest count",
            "order": 3,
            "status": "completed",
            "due_date": "2026-03-10",
            "requires_input": True,
            "guidance": "Make a preliminary list with your friend of everyone they might invite.",
            "subtasks": [
                {
                    "ai_id": "task_3a",
                    "description": "Draft A & B guest lists",
                    "order": 1,
                    "status": "completed",
                    "due_date": "2026-03-10",
                    "guidance": "The A-list should fit within your budget. The B-list fills spots from declined invitations."
                }
            ]
        },
        {
            "ai_id": "task_4",
            "description": "Find a venue available within 6 weeks",
            "order": 4,
            "due_date": "2026-03-14",
            "status": "not_started",
            "requires_input": False,
            "guidance": "With the shortened timeline, skip the leisurely search. Call venues directly, ask about cancellation slots, and be ready to book immediately.",
            "subtasks": [
                {
                    "ai_id": "task_4a",
                    "description": "Call all local venues and ask about availability in the next 6 weeks",
                    "order": 1,
                    "status": "not_started",
                    "due_date": "2026-03-12",
                    "guidance": "Restaurants, hotels, and community halls are more likely to have short-notice availability than dedicated wedding venues."
                },
                {
                    "ai_id": "task_4b",
                    "description": "Visit the top 2 available venues and book one immediately",
                    "order": 2,
                    "status": "not_started",
                    "due_date": "2026-03-14",
                    "guidance": "Don't wait — at this timeline, the first good option is the best option. Check if they offer an all-inclusive package to save time."
                }
            ]
        },
        {
            "ai_id": "task_5",
            "description": "Book essential vendors only — keep it simple",
            "order": 5,
            "due_date": "2026-03-18",
            "status": "not_started",
            "requires_input": False,
            "guidance": "With 6 weeks, you can't be picky. Focus on the absolute essentials: food, photographer, and someone to officiate. Skip the extras.",
            "subtasks": [
                {
                    "ai_id": "task_5a",
                    "description": "Book a photographer — check for short-notice availability",
                    "order": 1,
                    "status": "not_started",
                    "due_date": "2026-03-16",
                    "guidance": "Try newer photographers who are building their portfolio — they're more likely to be available and offer good rates."
                },
                {
                    "ai_id": "task_5b",
                    "description": "Confirm catering with the venue or book a caterer",
                    "order": 2,
                    "status": "not_started",
                    "due_date": "2026-03-17",
                    "guidance": "If the venue includes catering, use it. One less thing to coordinate. Otherwise, a buffet or food truck is easier to arrange last minute."
                },
                {
                    "ai_id": "task_5c",
                    "description": "Book an officiant",
                    "order": 3,
                    "status": "not_started",
                    "due_date": "2026-03-18",
                    "guidance": "Check local registry offices for availability, or ask a friend to get ordained online — it's quick and legal in many places."
                }
            ]
        },
        {
            "ai_id": "task_6",
            "description": "Send out invitations immediately — digital only",
            "order": 6,
            "due_date": "2026-03-20",
            "status": "not_started",
            "requires_input": False,
            "guidance": "No time for printed invitations. Use a free wedding website or group message. Keep it warm but urgent.",
            "subtasks": [
                {
                    "ai_id": "task_6a",
                    "description": "Create a simple wedding website or digital invite",
                    "order": 1,
                    "status": "not_started",
                    "due_date": "2026-03-19",
                    "guidance": "Sites like Zola or WithJoy are free and take 30 minutes to set up. Include date, venue, and RSVP link."
                },
                {
                    "ai_id": "task_6b",
                    "description": "Send to all guests with a 1-week RSVP deadline",
                    "order": 2,
                    "status": "not_started",
                    "due_date": "2026-03-20",
                    "guidance": "Send via email and WhatsApp/text. Follow up personally with must-have guests."
                }
            ]
        },
        {
            "ai_id": "task_7",
            "description": "Handle final details in the last 2 weeks",
            "order": 7,
            "due_date": "2026-04-10",
            "status": "not_started",
            "requires_input": False,
            "guidance": "Keep it simple. The couple is also preparing for a baby — don't overload them. Focus on what will make the day feel special without adding stress.",
            "subtasks": [
                {
                    "ai_id": "task_7a",
                    "description": "Confirm final headcount and share with venue/caterer",
                    "order": 1,
                    "status": "not_started",
                    "due_date": "2026-04-01",
                    "guidance": "Chase up anyone who hasn't RSVPd. Assume no-shows for anyone who doesn't respond."
                },
                {
                    "ai_id": "task_7b",
                    "description": "Plan a simple day-of timeline",
                    "order": 2,
                    "status": "not_started",
                    "due_date": "2026-04-05",
                    "guidance": "Keep it short and sweet: ceremony, photos, dinner, cake, dancing. No need for elaborate scheduling."
                },
                {
                    "ai_id": "task_7c",
                    "description": "Delegate day-of coordination to a trusted friend or family member",
                    "order": 3,
                    "status": "not_started",
                    "due_date": "2026-04-08",
                    "guidance": "The couple shouldn't be managing logistics on their wedding day. Pick someone organised and give them a simple checklist."
                }
            ]
        }
    ]
}