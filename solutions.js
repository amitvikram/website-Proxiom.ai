// Simulate typing and feedback bar animation
const input = document.getElementById('promptlyInput');
const progress = document.getElementById('feedbackProgress');
const label = document.getElementById('feedbackLabel');
const message = document.getElementById('feedbackMessage');
const submitBtn = document.getElementById('submitBtn');
const smartFeedback = document.querySelector('.smart-feedback ul');

// Helper to interpolate between two colors
function lerpColor(a, b, amount) { 
    const ah = parseInt(a.replace(/#/g, ''), 16),
          ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
          bh = parseInt(b.replace(/#/g, ''), 16),
          br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
          rr = ar + amount * (br - ar),
          rg = ag + amount * (bg - ag),
          rb = ab + amount * (bb - ab);
    return '#' + (1 << 24 | rr << 16 | rg << 8 | rb).toString(16).slice(1);
}

// Deep, realistic demo scenarios (Audit, Legal, IT)
const demoScenarios = [
    // AUDIT
    {
        text: "Internal audit request: Please review Q2 expense reports for the Marketing department. Pay special attention to vendor payments above $10,000. Reports attached. Deadline: 15th of this month.",
        feedback: [
            "Specify department or business unit (e.g., Marketing, Sales)",
            "Attach relevant reports or data (e.g., Excel file, link to system)",
            "Highlight specific areas of concern (e.g., payments > $10k, travel expenses)",
            "Provide a clear deadline for the audit completion",
            "Mention relevant compliance standards (if applicable)",
            "Include contact person for questions or clarification",
            "Summarize key objectives of the audit"
        ]
    },
    // LEGAL
    {
        text: "Requesting legal review of Master Service Agreement with BetaTech. Draft attached. Please focus on indemnity and liability clauses. Deadline: next Wednesday.",
        feedback: [
            "Add counterparty name (e.g., BetaTech, Inc.)",
            "Specify document type (e.g., MSA, NDA, SOW)",
            "Attach the draft document if available",
            "Mention specific clauses or concerns (e.g., Section 5.1, warranty)",
            "Provide a clear deadline for the review"
        ]
    },
    // IT SUPPORT
    {
        text: "Urgent IT support needed: Unable to access VPN from remote location since this morning. Error code: 720. Tried restarting device and reinstalling VPN client. Using Windows 11, Chrome browser. Please escalate if unresolved in 2 hours.",
        feedback: [
            "Describe the issue and its urgency",
            "Include relevant error codes or messages",
            "List troubleshooting steps already tried",
            "Mention device/OS/browser details",
            "Specify desired escalation or resolution timeline"
        ]
    }
];

let scenarioIdx = 0;
let charIdx = 0;
const typingDelay = 80; // Use a constant for the delay value
let currentTypingInterval; // Variable to store the interval ID

function updateDemo(val, feedbackArr) {
    // Confidence is based on length, capped at scenario length
    const scenario = demoScenarios[scenarioIdx];
    let percent = Math.min(100, Math.floor((val.length / scenario.text.length) * 100));

    let color;
    // Define color stops and interpolate based on percentage
    if (percent < 25) {
        // 0-25%: Red to Orange
        color = lerpColor('#f44336', '#ff9800', percent / 25);
    } else if (percent < 50) {
        // 25-50%: Orange to Yellow
        color = lerpColor('#ff9800', '#ffeb3b', (percent - 25) / 25);
    } else if (percent < 75) {
        // 50-75%: Yellow to Light Green
        color = lerpColor('#ffeb3b', '#8bc34a', (percent - 50) / 25);
    } else {
        // 75-100%: Light Green to Green
        color = lerpColor('#8bc34a', '#4CAF50', (percent - 75) / 25);
    }

    progress.style.width = percent + "%";
    // Set the background to the interpolated color
    progress.style.background = color;

    label.textContent = percent > 0 ? `Clarity: ${percent}%` : "";

    // Feedback message
    if (percent === 0) {
        message.innerHTML = "";
    } else if (percent < 40) {
        message.innerHTML = `<i class="fas fa-exclamation-circle"></i> Please add more specifics about your request.`;
        message.style.color = "#ff9800"; // Orange
    } else if (percent < 80) {
        message.innerHTML = `<i class="fas fa-info-circle"></i> Add more details for faster review.`;
        message.style.color = "#0099ff"; // Blue
    } else {
        message.innerHTML = `<i class="fas fa-check-circle"></i> Ready to submit! Your request is clear.`;
        message.style.color = "#43a047"; // Green
    }

    // Smart feedback changes as the text gets more complete
    let feedbackToShow = [];
    if (percent < 30) { // Show fewer hints when clarity is very low
        feedbackToShow = feedbackArr.slice(0, 1);
    } else if (percent < 60) { // Show more hints as clarity increases
        feedbackToShow = feedbackArr.slice(0, Math.ceil(feedbackArr.length / 2));
    } else if (percent < 90) { // Show most hints
         feedbackToShow = feedbackArr.slice(0, feedbackArr.length - (percent > 85 ? 0 : 1)); // Show all or all but one depending on how close to 100%
    }
     else { // When clarity is high
        feedbackToShow = ["All required details provided. Ready to submit!"];
    }

    // Ensure smart feedback content is present even if feedbackToShow is empty
    smartFeedback.innerHTML = feedbackToShow.length > 0 ? feedbackToShow.map(f => `<li>${f}</li>`).join('') : '<li>Awaiting input...</li>';
}

function runTypingDemo() {
    input.value = "";
    charIdx = 0;
    updateDemo("", demoScenarios[scenarioIdx].feedback); // Update initially with empty text and first feedback hints
    // Also reset the progress bar color to the starting red when resetting
    progress.style.background = '#f44336'; // Set initial color explicitly

    if (currentTypingInterval) clearInterval(currentTypingInterval); // Clear previous interval

    const scenario = demoScenarios[scenarioIdx];
    currentTypingInterval = setInterval(() => { // Store the ID in currentTypingInterval
        if (charIdx <= scenario.text.length) {
            input.value = scenario.text.slice(0, charIdx);
            updateDemo(input.value, scenario.feedback);
            charIdx++;
        } else {
            clearInterval(currentTypingInterval); // Clear the current interval
            setTimeout(() => {
                // Move to next scenario
                scenarioIdx = (scenarioIdx + 1) % demoScenarios.length;
                charIdx = 0;
                runTypingDemo();
            }, 2200); // This is the delay *between* scenarios
        }
    }, typingDelay); // Use the constant delay value here
}

// Disable manual input for demo
input.setAttribute('readonly', true);

// Start the animation on page load
window.addEventListener('DOMContentLoaded', runTypingDemo);

submitBtn.addEventListener('click', () => {
    input.value = "";
    progress.style.width = "0%";
    progress.style.background = "#e0e7ef";
    label.textContent = "";
    message.innerHTML = "";
    smartFeedback.innerHTML = "";
}); 