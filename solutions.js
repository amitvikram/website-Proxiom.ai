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
            "Specify department or business unit",
            "Attach relevant reports or data",
            "Highlight areas of concern (e.g., high-value payments)",
            "Provide deadline for audit"
        ]
    },
    // LEGAL
    {
        text: "Requesting legal review of Master Service Agreement with BetaTech. Draft attached. Please focus on indemnity and liability clauses. Deadline: next Wednesday.",
        feedback: [
            "Add counterparty name",
            "Specify document type",
            "Attach draft if available",
            "Mention specific clauses or concerns",
            "Provide deadline for review"
        ]
    },
    // IT SUPPORT
    {
        text: "Urgent IT support needed: Unable to access VPN from remote location since this morning. Error code: 720. Tried restarting device and reinstalling VPN client. Using Windows 11, Chrome browser. Please escalate if unresolved in 2 hours.",
        feedback: [
            "Describe the issue and urgency",
            "Include error codes/messages",
            "List troubleshooting steps already tried",
            "Mention device/OS/browser details",
            "Specify escalation or resolution timeline"
        ]
    }
];

let scenarioIdx = 0;
let charIdx = 0;
let typingInterval = null;

function updateDemo(val, feedbackArr) {
    // Confidence is based on length, capped at scenario length
    const scenario = demoScenarios[scenarioIdx];
    let percent = Math.min(100, Math.floor((val.length / scenario.text.length) * 100));
    let color = lerpColor('#ff9800', '#43a047', percent / 100);

    progress.style.width = percent + "%";
    progress.style.background = color;
    label.textContent = percent > 0 ? `Clarity: ${percent}%` : "";

    // Feedback message
    if (percent === 0) {
        message.innerHTML = "";
    } else if (percent < 40) {
        message.innerHTML = `<i class="fas fa-exclamation-circle"></i> Please add more specifics about your request.`;
        message.style.color = "#ff9800";
    } else if (percent < 80) {
        message.innerHTML = `<i class="fas fa-info-circle"></i> Add more details for faster review.`;
        message.style.color = "#0099ff";
    } else {
        message.innerHTML = `<i class="fas fa-check-circle"></i> Ready to submit! Your request is clear.`;
        message.style.color = "#43a047";
    }

    // Smart feedback changes as the text gets more complete
    let feedbackToShow = [];
    if (percent < 40) {
        feedbackToShow = feedbackArr.slice(0, 2);
    } else if (percent < 80) {
        feedbackToShow = feedbackArr.slice(0, feedbackArr.length - 1);
    } else {
        feedbackToShow = ["All required details provided. Ready to submit!"];
    }
    smartFeedback.innerHTML = feedbackToShow.map(f => `<li>${f}</li>`).join('');
}

function runTypingDemo() {
    input.value = "";
    charIdx = 0;
    updateDemo("", demoScenarios[scenarioIdx].feedback);
    if (typingInterval) clearInterval(typingInterval);

    const scenario = demoScenarios[scenarioIdx];
    typingInterval = setInterval(() => {
        if (charIdx <= scenario.text.length) {
            input.value = scenario.text.slice(0, charIdx);
            updateDemo(input.value, scenario.feedback);
            charIdx++;
        } else {
            clearInterval(typingInterval);
            setTimeout(() => {
                // Move to next scenario
                scenarioIdx = (scenarioIdx + 1) % demoScenarios.length;
                charIdx = 0;
                runTypingDemo();
            }, 2200);
        }
    }, 140); // Slightly faster typing
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