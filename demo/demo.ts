// Import and register the web component
import "../src/web/index.ts";

// Set up the relative time demos with dynamic timestamps
function initRelativeDemo() {
  // Future event: 5 hours from now
  const relativeFuture = document.getElementById("relative-future");
  if (relativeFuture) {
    const futureDate = new Date(Date.now() + 5 * 60 * 60 * 1000);
    relativeFuture.setAttribute("from", futureDate.toISOString());
  }

  // Past event: 3 days ago
  const relativePast = document.getElementById("relative-past");
  if (relativePast) {
    const pastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    relativePast.setAttribute("from", pastDate.toISOString());
  }
}

// Initialize playground
function initPlayground() {
  const datetimeInput = document.getElementById("input-datetime") as HTMLInputElement;
  const tzSelect = document.getElementById("input-tz") as HTMLSelectElement;
  const output = document.getElementById("playground-output") as HTMLElement;

  function updatePlayground() {
    const datetime = datetimeInput.value;
    const tz = tzSelect.value;

    if (!datetime) return;

    // Create ISO string with IANA timezone (DST-aware)
    const isoString = `${datetime}:00[${tz}]`;

    // Create a new localized-time element
    output.innerHTML = "";
    const element = document.createElement("localized-time");
    element.setAttribute("from", isoString);
    output.appendChild(element);
  }

  // Listen for changes
  datetimeInput.addEventListener("change", updatePlayground);
  tzSelect.addEventListener("change", updatePlayground);

  // Initial render
  updatePlayground();
}

// Wait for DOM to be ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initRelativeDemo();
    initPlayground();
  });
} else {
  initRelativeDemo();
  initPlayground();
}
