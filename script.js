/* =========================================================
   FakeInfo
   Random User API client and UI functionality
   ========================================================= */

"use strict";

/* =========================================================
   Configuration
   ========================================================= */

const API_URL = "https://randomuser.me/api/";

const nationalityNames = {
    US: "United States",
    GB: "United Kingdom",
    IN: "India",
    CA: "Canada",
    AU: "Australia",
    DE: "Germany",
    FR: "France",
    BR: "Brazil",
    ES: "Spain",
    MX: "Mexico",
    JP: "Japan",
    KR: "South Korea"
};

/* =========================================================
   DOM references
   ========================================================= */

const generateButton = document.getElementById("generateButton");
const retryButton = document.getElementById("retryButton");

const nationalitySelect = document.getElementById("nationality");
const resultCountSelect = document.getElementById("resultCount");

const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");

const profilesContainer = document.getElementById("profilesContainer");
const emptyState = document.getElementById("emptyState");
const batchActions = document.getElementById("batchActions");

const copyAllButton = document.getElementById("copyAllButton");
const downloadAllButton = document.getElementById("downloadAllButton");
const newProfilesButton = document.getElementById("newProfilesButton");
const resetButton = document.getElementById("resetButton");

const mobileMenuToggle = document.getElementById("mobileMenuToggle");
const mainNavigation = document.getElementById("mainNavigation");

/* =========================================================
   Application state
   ========================================================= */

let currentProfiles = [];
let lastRequest = {
    nationality: "",
    count: 1
};

/* =========================================================
   Initialization
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    bindEvents();
});

/* =========================================================
   Event handlers
   ========================================================= */

function bindEvents() {
    generateButton.addEventListener("click", generateProfiles);
    retryButton.addEventListener("click", generateProfiles);

    newProfilesButton.addEventListener("click", generateProfiles);

    copyAllButton.addEventListener("click", function () {
        copyAllProfiles(copyAllButton);
    });

    downloadAllButton.addEventListener("click", downloadAllProfiles);

    resetButton.addEventListener("click", resetApplication);

    mobileMenuToggle.addEventListener("click", toggleMobileMenu);

    mainNavigation.addEventListener("click", function (event) {
        if (event.target.matches("a")) {
            closeMobileMenu();
        }
    });
}

/* =========================================================
   API request
   ========================================================= */

async function generateProfiles() {
    const nationality = nationalitySelect.value;
    const count = Number(resultCountSelect.value);

    lastRequest = {
        nationality: nationality,
        count: count
    };

    setLoadingState(true);
    hideError();

    const url = buildApiUrl(nationality, count);

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const data = await response.json();

        if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
            throw new Error("No profiles returned");
        }

        currentProfiles = data.results;

        renderProfiles(currentProfiles);

        setLoadingState(false);
    } catch (error) {
        console.error("FakeInfo API error:", error);

        setLoadingState(false);
        showError();
    }
}

function buildApiUrl(nationality, count) {
    const params = new URLSearchParams();

    if (count > 1) {
        params.set("results", String(count));
    }

    if (nationality) {
        params.set("nat", nationality);
    }

    const queryString = params.toString();

    return queryString
        ? API_URL + "?" + queryString
        : API_URL;
}

/* =========================================================
   UI state
   ========================================================= */

function setLoadingState(isLoading) {
    generateButton.disabled = isLoading;
    generateButton.textContent = isLoading
        ? "Generating..."
        : "Generate Fake Person";

    loadingMessage.hidden = !isLoading;

    if (isLoading) {
        errorMessage.hidden = true;
    }
}

function showError() {
    errorMessage.hidden = false;
}

function hideError() {
    errorMessage.hidden = true;
}

function renderProfiles(profiles) {
    profilesContainer.innerHTML = "";

    emptyState.hidden = true;
    batchActions.hidden = false;

    profiles.forEach(function (profile, index) {
        const card = createProfileCard(profile, index);
        profilesContainer.appendChild(card);
    });

    window.setTimeout(function () {
        const firstCard = profilesContainer.querySelector(".profile-card");

        if (firstCard) {
            firstCard.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }, 50);
}

/* =========================================================
   Profile rendering
   ========================================================= */

function createProfileCard(profile, index) {
    const article = document.createElement("article");

    article.className = "profile-card";
    article.dataset.profileIndex = String(index);

    const fullName = formatFullName(profile);
    const dob = formatDate(profile.dob.date);
    const registrationDate = formatDate(profile.registered.date);

    const nationalityCode = profile.nat || "";
    const nationality = nationalityNames[nationalityCode] || nationalityCode;

    const address = formatAddress(profile);
    const timezone = formatTimezone(profile);

    article.innerHTML = `
        <div class="profile-header">

            <div class="profile-photo-wrap">
                <img
                    class="profile-photo"
                    src="${escapeAttribute(profile.picture.large)}"
                    alt="Fictional profile photo for ${escapeAttribute(fullName)}"
                    loading="lazy"
                    width="128"
                    height="128"
                >
            </div>

            <div>
                <h3 class="profile-name">${escapeHtml(fullName)}</h3>

                <div class="fake-badge">
                    FICTIONAL PROFILE
                </div>

                <div class="profile-intro">
                    This identity is randomly generated fictional data.
                    It does not represent a real person.
                </div>
            </div>

        </div>

        <div class="profile-body">

            <div class="profile-columns">

                <section class="profile-section">
                    <h4 class="profile-section-title">Personal Information</h4>

                    <div class="field-list">

                        ${createField(
                            "Gender",
                            capitalize(profile.gender),
                            false
                        )}

                        ${createField(
                            "Age",
                            profile.dob.age,
                            false
                        )}

                        ${createField(
                            "Date of Birth",
                            dob,
                            true,
                            "sensitive"
                        )}

                        ${createField(
                            "Nationality",
                            nationality,
                            false
                        )}

                        ${createField(
                            "Registration Date",
                            registrationDate,
                            true,
                            "sensitive"
                        )}

                    </div>
                </section>

                <section class="profile-section">
                    <h4 class="profile-section-title">Contact Information</h4>

                    <div class="field-list">

                        ${createField(
                            "Email",
                            profile.email,
                            true,
                            "sensitive"
                        )}

                        ${createField(
                            "Phone",
                            profile.phone,
                            true,
                            "sensitive"
                        )}

                        ${createField(
                            "Username",
                            profile.login.username,
                            true,
                            "sensitive"
                        )}

                    </div>
                </section>

                <section class="profile-section">
                    <h4 class="profile-section-title">Location</h4>

                    <div class="field-list">

                        ${createField(
                            "Country",
                            profile.location.country,
                            false
                        )}

                        ${createField(
                            "State",
                            profile.location.state,
                            false
                        )}

                        ${createField(
                            "City",
                            profile.location.city,
                            false
                        )}

                        ${createField(
                            "Postcode",
                            profile.location.postcode,
                            true,
                            "sensitive"
                        )}

                        ${createField(
                            "Address",
                            address,
                            true,
                            "sensitive"
                        )}

                    </div>
                </section>

                <section class="profile-section">
                    <h4 class="profile-section-title">Account & Timezone</h4>

                    <div class="field-list">

                        ${createField(
                            "Username",
                            profile.login.username,
                            true,
                            "sensitive"
                        )}

                        ${createField(
                            "Timezone",
                            timezone,
                            false
                        )}

                    </div>
                </section>

            </div>

            <div class="profile-actions">

                <button
                    type="button"
                    class="button button-secondary copy-profile-button"
                    data-index="${index}"
                >
                    Copy Profile
                </button>

                <button
                    type="button"
                    class="button button-secondary download-profile-button"
                    data-index="${index}"
                >
                    Download TXT
                </button>

                <button
                    type="button"
                    class="button button-secondary toggle-sensitive-button"
                    data-index="${index}"
                >
                    Hide Sensitive Fields
                </button>

                <button
                    type="button"
                    class="button button-primary another-profile-button"
                >
                    Generate Another
                </button>

            </div>

        </div>
    `;

    bindProfileEvents(article, profile, index);

    return article;
}

function createField(label, value, copyable, extraClass) {
    const safeValue = escapeHtml(String(value || "Not available"));
    const classes = extraClass
        ? "field-value " + extraClass + "-value"
        : "field-value";

    const copyButton = copyable
        ? `
            <button
                type="button"
                class="button field-copy-button"
                data-copy-value="${escapeAttribute(String(value || ""))}"
                aria-label="Copy ${escapeAttribute(label)}"
            >
                Copy
            </button>
        `
        : "";

    return `
        <div class="field-row">
            <span class="field-label">${escapeHtml(label)}</span>
            <span class="${classes}">${safeValue}</span>
            ${copyButton}
        </div>
    `;
}

/* =========================================================
   Profile event binding
   ========================================================= */

function bindProfileEvents(article, profile, index) {
    const fieldCopyButtons = article.querySelectorAll(".field-copy-button");

    fieldCopyButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const value = button.dataset.copyValue;

            copyText(value, button);
        });
    });

    const copyProfileButton = article.querySelector(".copy-profile-button");

    copyProfileButton.addEventListener("click", function () {
        copyProfile(profile, copyProfileButton);
    });

    const downloadButton = article.querySelector(".download-profile-button");

    downloadButton.addEventListener("click", function () {
        downloadProfile(profile);
    });

    const toggleSensitiveButton = article.querySelector(
        ".toggle-sensitive-button"
    );

    toggleSensitiveButton.addEventListener("click", function () {
        toggleSensitiveFields(article, toggleSensitiveButton);
    });

    const anotherButton = article.querySelector(".another-profile-button");

    anotherButton.addEventListener("click", function () {
        generateProfiles();
    });
}

/* =========================================================
   Sensitive-looking field visibility
   ========================================================= */

function toggleSensitiveFields(article, button) {
    const isHidden = article.classList.toggle("sensitive-hidden");

    button.textContent = isHidden
        ? "Show Sensitive Fields"
        : "Hide Sensitive Fields";

    button.setAttribute(
        "aria-pressed",
        String(isHidden)
    );
}

/* =========================================================
   Clipboard functionality
   ========================================================= */

async function copyText(text, button) {
    if (!navigator.clipboard) {
        showTemporaryButtonText(button, "Clipboard unavailable");
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        showTemporaryButtonText(button, "Copied!");
    } catch (error) {
        console.error("Clipboard error:", error);
        showTemporaryButtonText(button, "Copy failed");
    }
}

async function copyProfile(profile, button) {
    const text = formatProfileText(profile);

    await copyText(text, button);
}

async function copyAllProfiles(button) {
    if (currentProfiles.length === 0) {
        return;
    }

    const content = currentProfiles
        .map(formatProfileText)
        .join("\n\n" + "=".repeat(45) + "\n\n");

    await copyText(content, button);
}

function showTemporaryButtonText(button, temporaryText) {
    const originalText = button.textContent;

    button.textContent = temporaryText;
    button.disabled = true;

    window.setTimeout(function () {
        button.textContent = originalText;
        button.disabled = false;
    }, 1400);
}

/* =========================================================
   Download functionality
   ========================================================= */

function downloadProfile(profile) {
    const text = formatProfileText(profile);

    downloadTextFile(text, "fake-profile.txt");
}

function downloadAllProfiles() {
    if (currentProfiles.length === 0) {
        return;
    }

    const text = currentProfiles
        .map(formatProfileText)
        .join("\n\n" + "=".repeat(45) + "\n\n");

    downloadTextFile(text, "fake-profiles.txt");
}

function downloadTextFile(content, filename) {
    const blob = new Blob(
        [content],
        {
            type: "text/plain;charset=utf-8"
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(function () {
        URL.revokeObjectURL(url);
    }, 1000);
}

/* =========================================================
   Text formatting
   ========================================================= */

function formatProfileText(profile) {
    const fullName = formatFullName(profile);
    const nationality = nationalityNames[profile.nat] || profile.nat || "Unknown";

    return [
        "FAKEINFO",
        "FICTIONAL PROFILE",
        "",
        "This is fictional data generated for entertainment, testing and mockups.",
        "It does not represent a real person.",
        "",
        "Name: " + fullName,
        "Gender: " + capitalize(profile.gender),
        "Age: " + profile.dob.age,
        "Date of Birth: " + formatDate(profile.dob.date),
        "Email: " + profile.email,
        "Phone: " + profile.phone,
        "Country: " + profile.location.country,
        "State: " + profile.location.state,
        "City: " + profile.location.city,
        "Postcode: " + profile.location.postcode,
        "Address: " + formatAddress(profile),
        "Username: " + profile.login.username,
        "Nationality: " + nationality,
        "Timezone: " + formatTimezone(profile),
        "Registration Date: " + formatDate(profile.registered.date)
    ].join("\n");
}

/* =========================================================
   Data formatting helpers
   ========================================================= */

function formatFullName(profile) {
    return [
        profile.name.title,
        profile.name.first,
        profile.name.last
    ]
        .filter(Boolean)
        .join(" ");
}

function formatAddress(profile) {
    const number = profile.location.street.number;
    const name = profile.location.street.name;

    return [number, name]
        .filter(Boolean)
        .join(" ");
}

function formatTimezone(profile) {
    const offset = profile.location.timezone.offset;
    const description = profile.location.timezone.description;

    if (description) {
        return offset + " (" + description + ")";
    }

    return offset;
}

function formatDate(dateString) {
    if (!dateString) {
        return "Not available";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return day + "/" + month + "/" + year;
}

function capitalize(value) {
    if (!value) {
        return "";
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
}

/* =========================================================
   Reset
   ========================================================= */

function resetApplication() {
    currentProfiles = [];

    nationalitySelect.value = "";
    resultCountSelect.value = "1";

    profilesContainer.innerHTML = "";

    emptyState.hidden = false;
    batchActions.hidden = true;

    hideError();
    loadingMessage.hidden = true;

    generateButton.disabled = false;
    generateButton.textContent = "Generate Fake Person";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

/* =========================================================
   Mobile navigation
   ========================================================= */

function toggleMobileMenu() {
    const isOpen = mainNavigation.classList.toggle("open");

    mobileMenuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
    );

    mobileMenuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
    );
}

function closeMobileMenu() {
    mainNavigation.classList.remove("open");

    mobileMenuToggle.setAttribute(
        "aria-expanded",
        "false"
    );

    mobileMenuToggle.setAttribute(
        "aria-label",
        "Open navigation"
    );
}

/* =========================================================
   Security / HTML escaping
   ========================================================= */

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return escapeHtml(value);
}
