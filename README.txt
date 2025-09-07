DuoScience — Class 10 (Starter)
=================================

What this is
------------
A lightweight, Duolingo-style *offline web app* for Class 10 Science practice.
It uses only HTML/CSS/JS and stores progress in your browser (localStorage).

How to run
----------
1) Download this folder and open `index.html` in any modern browser.
2) Optional: "Install" it as a PWA for an app-like experience (Add to Home Screen).

Features
--------
- Daily goal, streaks, XP, crowns
- Chapter -> Unit -> Lesson structure
- Question types: MCQ, True/False, Fill-in, Match pairs
- Randomized sessions (~7 questions)
- Simple XP history chart
- Offline support via service worker

Extend the syllabus
-------------------
Edit `data.js` and add chapters/units/items. Example item formats:

MCQ:
-----
{ type: "mcq", q: "?", options: ["A","B","C","D"], answer: 2, explain: "why" }

True/False:
-----------
{ type: "tf", q: "Statement...", answer: true, explain: "why" }

Fill in the blank:
------------------
{ type: "fill", q: "Acid turns blue litmus ____.", answer: "red", explain: "why" }

Match (pairs):
--------------
{ type: "match", q: "Match:", pairs: [["Term","Definition"],["X","Y"]], explain: "why" }

Suggested Class 10 Science map
------------------------------
Add chapters to cover the full course (typical CBSE breakdown):
- Chemical Reactions & Equations
- Acids, Bases and Salts
- Metals and Non-metals
- Carbon and its Compounds
- Periodic Classification of Elements
- Life Processes
- Control and Coordination
- How do Organisms Reproduce?
- Heredity and Evolution
- Light – Reflection and Refraction
- The Human Eye and the Colourful World
- Electricity
- Magnetic Effects of Electric Current
- Sources of Energy
- Our Environment
- Sustainable Management of Natural Resources

Roadmap ideas
-------------
- Diagram labelling (with images)
- Numericals with step-by-step hints
- Spaced repetition scheduling per item
- Leaderboard (optional, privacy-safe)
- Import/export of progress and content (JSON)
- Multi-language support (English/Hindi)
- Admin tool to author questions via CSV/Google Sheet

License
-------
Do whatever you want—personal/educational use encouraged.
