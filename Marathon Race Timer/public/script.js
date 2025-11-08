let startTime = null;
let elapsedTime = 0;
let timerInterval = null;
let isRunning = false;
let lapCounter = 1;
// NEW: Session management variable
let currentSessionId = `SESS-${Date.now()}`; 

// --- Global Elements ---
const menuIcon = document.getElementById("menuIcon");
const sidebar = document.getElementById("sidebar");

// --- Timer Page Elements (Access them *only* if they exist) ---
const timerDisplay = document.querySelector(".timer");
const startFinishBtn = document.getElementById("startFinishBtn");
const lapBtn = document.getElementById("lapBtn");
const clearBtn = document.getElementById("clearBtn");
const submitResultBtn = document.getElementById("submitResultBtn");
const lapTableBody = document.querySelector("#lapTable tbody");

// --- Results Page Elements (Access them *only* if they exist) ---
const resultsTableBody = document.getElementById("resultsTableBody");
const downloadBtn = document.getElementById("downloadResultsBtn");
// NEW: Clear Button on Results Page
const clearAllResultsBtn = document.getElementById("clearAllResultsBtn");


// ------------------------------------------------------------------
// Core Timer Functions
// ------------------------------------------------------------------

// Format time as HH:MM:SS:HH
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    const hundredths = String(Math.floor((ms % 1000) / 10)).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}:${hundredths}`;
}

function updateDisplay() {
    if (!timerDisplay) return; 
    
    const now = Date.now();
    const diff = startTime ? now - startTime + elapsedTime : elapsedTime; 
    timerDisplay.textContent = formatTime(diff);
}

function startTimer() {
    if (isRunning) return;

    // FIX: Generate a new session ID only if starting from zero
    if (elapsedTime === 0) {
        currentSessionId = `SESS-${Date.now()}`;
    }

    startTime = Date.now();
    timerInterval = setInterval(updateDisplay, 10);
    isRunning = true;
}

function stopTimer() {
    if (!isRunning) return;
    clearInterval(timerInterval);
    elapsedTime += Date.now() - startTime;
    isRunning = false;
}

// ------------------------------------------------------------------
// Lap, Result Submission, and Storage Functions
// ------------------------------------------------------------------

function recordLap() {
    if (!isRunning) return;

    const currentElapsedTime = Date.now() - startTime + elapsedTime;
    const currentTimeFormatted = formatTime(currentElapsedTime);
    
    // 1. Add to Lap Table
    if (lapTableBody) {
        const row = lapTableBody.insertRow();
        const cellPos = row.insertCell(0);
        const cellTime = row.insertCell(1);
        cellPos.textContent = lapCounter;
        cellTime.textContent = currentTimeFormatted;
    }

    const result = {
        sessionId: currentSessionId, // NEW: Associate with current session
        runnerId: `lap-${lapCounter}-${Date.now()}`, 
        position: lapCounter,
        time: currentTimeFormatted,
        timestamp: new Date().toISOString()
    };
    
    lapCounter++;
    
    // Laps are submitted as individual results for now, but linked by Session ID
    submitResult(result, false); 
}

function resetTimer() {
    stopTimer(); 
    startTime = null;
    elapsedTime = 0;
    lapCounter = 1;
    currentSessionId = `SESS-${Date.now()}`; // Reset session ID for a fresh race
    if(timerDisplay) timerDisplay.textContent = "00:00:00:00";
    if(lapTableBody) lapTableBody.innerHTML = '';
    if(startFinishBtn) startFinishBtn.textContent = "Start";
}

// ... (saveResultLocally, submitResult, syncLocalResults remain the same, but result object now includes sessionId) ...

function saveResultLocally(result) {
    const stored = JSON.parse(localStorage.getItem('raceResults') || '[]');
    stored.push(result);
    localStorage.setItem('raceResults', JSON.stringify(stored));
}

// Try submitting to server or fallback
function submitResult(result, isFinalSubmit) {
    // ... (unchanged) ...
    // Simplified server submission logic
    if (navigator.onLine) {
        fetch('/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result)
        })
        .then(res => {
            if (!res.ok) throw new Error('Server rejected');
            console.log(`✅ Result sent for ${result.runnerId}`);
            if (isFinalSubmit) {
                alert('Result successfully submitted to server!');
            }
        })
        .catch(err => {
            console.warn('❌ Failed to send, saving offline:', err);
            saveResultLocally(result);
            if (isFinalSubmit) {
                 alert('Server offline. Result saved locally. Will sync when online.');
            }
        });
    } else {
        console.warn('📴 Offline mode — saving result locally');
        saveResultLocally(result);
        if (isFinalSubmit) {
            alert('Offline: result saved locally. Will sync when online.');
        }
    }
}

function syncLocalResults() {
    // ... (unchanged) ...
    const cached = JSON.parse(localStorage.getItem('raceResults') || '[]');
    if (!cached.length) return;

    console.log(`🔁 Syncing ${cached.length} offline results...`);

    const unsyncedResults = [...cached];
    let successfulSyncs = [];

    unsyncedResults.forEach((result, index) => {
        fetch('/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result)
        }).then(res => {
            if (res.ok) {
                console.log(`✅ Synced: ${result.runnerId}`);
                successfulSyncs.push(index);
            }
        }).catch(() => {
            console.warn('❌ Still offline or sync error:', result.runnerId);
        });
    });

    const updatedStorage = unsyncedResults.filter((_, index) => !successfulSyncs.includes(index));
    localStorage.setItem('raceResults', JSON.stringify(updatedStorage));
}


// ------------------------------------------------------------------
// Results Page Functions (Download, Display, and Delete)
// ------------------------------------------------------------------

function loadResults() {
    if (!resultsTableBody) return;
    
    const stored = JSON.parse(localStorage.getItem('raceResults') || '[]');
    resultsTableBody.innerHTML = ''; 

    if (stored.length === 0) {
        resultsTableBody.innerHTML = '<tr><td colspan="4">No results saved locally.</td></tr>'; // Adjusted colspan
        return;
    }

    // Group results by Session ID
    const groupedResults = stored.reduce((acc, result) => {
        const session = result.sessionId || 'Uncategorized';
        if (!acc[session]) {
            acc[session] = [];
        }
        acc[session].push(result);
        return acc;
    }, {});


    // Sort sessions by the timestamp of their first entry
    const sortedSessions = Object.keys(groupedResults).sort((a, b) => {
        const timeA = new Date(groupedResults[a][0].timestamp).getTime();
        const timeB = new Date(groupedResults[b][0].timestamp).getTime();
        return timeB - timeA; // Most recent session first
    });


    // Display results in session groups
    sortedSessions.forEach(sessionId => {
        const sessionResults = groupedResults[sessionId];
        // 1. Add a Session Header Row
        const headerRow = resultsTableBody.insertRow();
        headerRow.style.backgroundColor = '#d3d3d3'; // Light gray background
        headerRow.style.fontWeight = 'bold';
        headerRow.style.color = '#111';
        const headerCell = headerRow.insertCell(0);
        headerCell.colSpan = 4; // Span all columns
        headerCell.textContent = `Race Session ID: ${sessionId} (Entries: ${sessionResults.length})`;

        // 2. Display individual results in the group
        sessionResults.forEach(result => {
            const row = resultsTableBody.insertRow();
            row.insertCell(0).textContent = result.position || 'N/A';
            row.insertCell(1).textContent = result.time;
            row.insertCell(2).textContent = new Date(result.timestamp).toLocaleTimeString();
            // NEW: Display Runner ID (or Lap ID)
            row.insertCell(3).textContent = result.runnerId;
        });
    });
}

function clearAllLocalResults() {
    if (confirm("Are you sure you want to delete ALL locally saved race results? This cannot be undone.")) {
        localStorage.removeItem('raceResults');
        alert("All local race results have been cleared.");
        loadResults(); // Refresh the table
    }
}

function downloadResultsCSV() {
    const stored = JSON.parse(localStorage.getItem('raceResults') || '[]');
    if (stored.length === 0) {
        alert("No results to download.");
        return;
    }

    // Updated Headers
    let csv = 'SessionID,Position,Time,RunnerID,Timestamp\n';
    
    stored.forEach(result => {
        const sessionId = result.sessionId || 'N/A'; // NEW: Include Session ID
        const position = result.position || 'N/A';
        const time = result.time;
        const runnerId = result.runnerId;
        const timestamp = new Date(result.timestamp).toLocaleString();
        
        // Ensure data is correctly quoted for CSV (especially timestamp)
        csv += `${sessionId},${position},${time},${runnerId},"${timestamp}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    
    link.href = URL.createObjectURL(blob);
    link.download = `race_results_${new Date().toISOString().slice(0, 10)}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// ------------------------------------------------------------------
// Sidebar Menu Toggle
// ------------------------------------------------------------------
function toggleSidebar() {
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}


// ------------------------------------------------------------------
// Event Listeners
// ------------------------------------------------------------------

// Global Listeners 
if (menuIcon) menuIcon.addEventListener('click', toggleSidebar);
window.addEventListener('online', syncLocalResults);
window.addEventListener('load', syncLocalResults); 


// Timer Page Logic
if (startFinishBtn && lapBtn && clearBtn && submitResultBtn) { 
    startFinishBtn.addEventListener("click", () => {
        if (!isRunning) {
            startTimer();
            startFinishBtn.textContent = "Stop";
        } else {
            stopTimer();
            startFinishBtn.textContent = "Start";
        }
    });

    clearBtn.addEventListener("click", resetTimer);
    lapBtn.addEventListener("click", recordLap);
    
    submitResultBtn.addEventListener("click", () => {
        const currentTime = timerDisplay ? timerDisplay.textContent : "00:00:00:00";

        const result = {
            sessionId: currentSessionId, // FINAL SUBMIT gets the current Session ID
            runnerId: `manual-final-${Date.now()}`,
            position: 'Manual',
            time: currentTime,
            timestamp: new Date().toISOString()
        };

        // True: Final submission
        submitResult(result, true); 
    });
} 

// Results Page Logic
if (resultsTableBody) { 
    // Load results immediately
    loadResults();
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadResultsCSV);
    }
    // NEW: Clear All Local Results Listener
    if (clearAllResultsBtn) {
        clearAllResultsBtn.addEventListener('click', clearAllLocalResults);
    }
}