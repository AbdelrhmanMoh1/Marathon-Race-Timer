Race Timer - by up2162181

<!-- Key Features -->

This web-based race timing app is designed to help the Portsmouth Joggers' Club time and manage races like the "Pub-to-Pub" event. It works offline, is mobile-friendly, and keeps things simple for users with older devices or limited tech experience.

---

<!-- Start/Stop Timer -->

How to use: Hit the “Start” button to begin timing, then “Stop” to pause.
Why: Simple control is critical for usability, especially in outdoor conditions with limited dexterity (e.g., gloves, rain).

---

<!-- Lap Recording -->

How to use: Click “Lap” to record a racer's finishing time. Each lap entry logs the position and finish time.
Why: Keeps it minimal and responsive — optimized for quickly logging runners as they cross the line.

---

<!-- Submit Result -->

How to use: Press “Submit Result” to store the current race time as a result (simulates final submission).
Why: Supports manual result logging for races or late runners.

---

<!-- Offline Storage + Sync -->

How to use: App saves results to `localStorage` when offline and syncs them automatically when the device comes back online.
Why: Critical for field use without reliable network access.

---

<!-- View Results -->

How to use: Navigate to the “Results” page to see all submitted times.
Why: Gives racers instant feedback and allows result review before leaving the event.

---

<!-- AI Use -->

AI was used as a development assistant, not a replacement. It helped brainstorm code structure, debug, grammar checking, and write boilerplate faster. All AI suggestions were reviewed and modified to fit the constraints of the assignment (no frameworks, no libraries except Express + SQLite).

<!-- Prompts to develop the race timer: -->

> How do I make a start/stop timer in JavaScript with millisecond precision?  
> What’s the best way to update the timer live every 10ms?  
> How can I format milliseconds to HH:MM:SS:ms in JavaScript?

Takeaway: Helped speed up the core timer logic and format output cleanly.

---

<!-- Prompts for local storage + syncing -->

> How do I store data offline using `localStorage` in JavaScript?  
> How can I check if the user is online and sync data when back online?  
> How can I submit JSON data to a server in vanilla JS?

Result: Enabled offline mode functionality and clean result syncing on reconnect.

---

<!-- Prompts to improve usability -->

> How do I build mobile-friendly buttons with large touch targets in CSS?  
> What's a simple, accessible sidebar navigation menu in HTML/CSS?

Changes: Used larger buttons, simple layout, and high contrast for accessibility in bad weather.
