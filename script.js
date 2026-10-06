/*
  Your backend must expose:
    GET /api/files
      -> { "files": [{ "key": "...", "name": "...", "size": 123, "lastModified": "..." }] }

    GET /api/download?key=...
      -> { "url": "https://..." }

  IMPORTANT:
  Never put your Filebase access key or secret key in this file.
*/

const API_BASE = ""; // Example: "https://api.example.com"

const fileList = document.getElementById("fileList");
const fileCount = document.getElementById("fileCount");
const search = document.getElementById("search");
const refresh = document.getElementById("refresh");
const statusBox = document.getElementById("status");

let files = [];

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function iconFor(name) {
  const ext = name.split(".").pop().toLowerCase();

  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "ZIP";
  if (["mp4", "mkv", "mov", "webm"].includes(ext)) return "▶";
  if (["mp3", "wav", "flac", "m4a"].includes(ext)) return "♫";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "IMG";
  if (ext === "pdf") return "PDF";

  return "FILE";
}

function showStatus(message, error = false) {
  statusBox.textContent = message;
  statusBox.classList.remove("hidden");
  statusBox.classList.toggle("error", error);
}

function hideStatus() {
  statusBox.classList.add("hidden");
}

function render(list) {
  fileCount.textContent = `${files.length} file${files.length === 1 ? "" : "s"}`;

  if (!list.length) {
    fileList.innerHTML = `<div class="empty">No files found.</div>`;
    return;
  }

  fileList.innerHTML = list.map((file, index) => `
    <article class="file">
      <div class="icon">${iconFor(escapeHtml(file.name))}</div>
      <div>
        <h2 class="file-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</h2>
        <p class="meta">
          ${formatBytes(file.size)}
          ${file.lastModified ? ` • ${new Date(file.lastModified).toLocaleDateString()}` : ""}
        </p>
      </div>
      <button class="download" data-index="${files.indexOf(file)}">Download</button>
    </article>
  `).join("");

  fileList.querySelectorAll(".download").forEach(button => {
    button.addEventListener("click", () => {
      downloadFile(files[Number(button.dataset.index)], button);
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadFiles() {
  refresh.disabled = true;
  showStatus("Loading files...");

  try {
    const response = await fetch(`${API_BASE}/api/files`, {
      cache: "no-store"
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not load files.");
    }

    files = data.files || [];
    hideStatus();
    filterFiles();
  } catch (error) {
    showStatus(error.message || "Could not connect to the download API.", true);
    fileList.innerHTML = "";
    fileCount.textContent = "0 files";
  } finally {
    refresh.disabled = false;
  }
}

async function downloadFile(file, button) {
  button.disabled = true;
  button.textContent = "Preparing...";

  try {
    const response = await fetch(
      `${API_BASE}/api/download?key=${encodeURIComponent(file.key)}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not create download link.");
    }

    window.location.href = data.url;
  } catch (error) {
    showStatus(error.message || "Download failed.", true);
  } finally {
    button.disabled = false;
    button.textContent = "Download";
  }
}

function filterFiles() {
  const query = search.value.trim().toLowerCase();

  const filtered = query
    ? files.filter(file => file.name.toLowerCase().includes(query))
    : files;

  render(filtered);
}

search.addEventListener("input", filterFiles);
refresh.addEventListener("click", loadFiles);

loadFiles();
