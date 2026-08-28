/* =========================================================
   BRENZKafrica Plus — Notification Center
   Does NOT replace or modify the existing layout.
========================================================= */

(function () {
  "use strict";

  const SETTINGS_KEY = "bk_notification_settings";
  const SEEN_KEY = "bk_notification_seen";

  const defaults = {
    enabled: true,
    newContent: true,
    sports: true,
    breakingNews: true,
    episodes: true,
    browserAlerts: false
  };

  let settings = loadSettings();
  let notifications = [];
  let seen = loadSeen();

  function loadSettings() {
    try {
      return {
        ...defaults,
        ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}")
      };
    } catch {
      return { ...defaults };
    }
  }

  function saveSettings() {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(settings)
    );
  }

  function loadSeen() {
    try {
      return JSON.parse(
        localStorage.getItem(SEEN_KEY) || "[]"
      );
    } catch {
      return [];
    }
  }

  function saveSeen() {
    localStorage.setItem(
      SEEN_KEY,
      JSON.stringify(seen.slice(-100))
    );
  }

  /* =========================================================
     STYLES
  ========================================================= */

  const style = document.createElement("style");

  style.textContent = `

  #bkNotificationButton {
    position:relative;
    width:40px;
    height:40px;
    border:1px solid rgba(255,255,255,.14);
    border-radius:7px;
    background:#151515;
    color:#fff;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:18px;
    cursor:pointer;
    transition:.2s;
  }

  #bkNotificationButton:hover {
    background:#242424;
    border-color:#444;
    transform:translateY(-1px);
  }

  #bkNotificationBadge {
    position:absolute;
    top:-5px;
    right:-5px;
    min-width:17px;
    height:17px;
    padding:0 4px;
    border-radius:20px;
    background:#e50914;
    color:#fff;
    font-size:9px;
    font-weight:900;
    display:none;
    align-items:center;
    justify-content:center;
    border:2px solid #070707;
  }

  #bkNotificationPanel {
    position:fixed;
    top:78px;
    right:4.5%;
    width:min(390px,calc(100vw - 24px));
    max-height:calc(100vh - 100px);
    overflow:auto;
    background:rgba(13,13,13,.98);
    border:1px solid rgba(255,255,255,.12);
    border-radius:14px;
    box-shadow:0 25px 70px rgba(0,0,0,.7);
    z-index:9999;
    display:none;
    backdrop-filter:blur(20px);
  }

  #bkNotificationPanel.open {
    display:block;
  }

  .bk-notification-header {
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:18px;
    border-bottom:1px solid #252525;
  }

  .bk-notification-header strong {
    font-size:15px;
  }

  .bk-notification-header small {
    display:block;
    color:#777;
    font-size:10px;
    margin-top:3px;
  }

  .bk-notification-actions {
    display:flex;
    gap:4px;
  }

  .bk-notification-actions button {
    border:0;
    background:transparent;
    color:#aaa;
    font-size:18px;
    cursor:pointer;
    padding:5px;
  }

  .bk-notification-actions button:hover {
    color:#fff;
  }

  .bk-notification-item {
    display:flex;
    gap:12px;
    padding:15px 18px;
    border-bottom:1px solid rgba(255,255,255,.06);
    cursor:pointer;
  }

  .bk-notification-item:hover {
    background:#171717;
  }

  .bk-notification-icon {
    width:35px;
    height:35px;
    min-width:35px;
    border-radius:50%;
    background:#202020;
    display:flex;
    align-items:center;
    justify-content:center;
  }

  .bk-notification-title {
    font-size:12px;
    font-weight:800;
  }

  .bk-notification-text {
    color:#999;
    font-size:11px;
    line-height:1.5;
    margin-top:3px;
  }

  .bk-notification-time {
    color:#555;
    font-size:9px;
    margin-top:5px;
  }

  .bk-notification-empty {
    text-align:center;
    color:#666;
    font-size:12px;
    padding:45px 20px;
  }

  /* SETTINGS */

  #bkNotificationSettings {
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.75);
    z-index:10000;
    display:none;
    align-items:center;
    justify-content:center;
    padding:18px;
    backdrop-filter:blur(7px);
  }

  #bkNotificationSettings.open {
    display:flex;
  }

  .bk-settings-card {
    width:min(440px,100%);
    background:#111;
    border:1px solid #292929;
    border-radius:16px;
    overflow:hidden;
    box-shadow:0 25px 80px rgba(0,0,0,.8);
  }

  .bk-settings-header {
    padding:20px;
    border-bottom:1px solid #252525;
  }

  .bk-settings-header h3 {
    font-size:18px;
  }

  .bk-settings-header p {
    color:#777;
    font-size:11px;
    line-height:1.5;
    margin-top:5px;
  }

  .bk-setting {
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:15px;
    padding:15px 20px;
    border-bottom:1px solid #202020;
  }

  .bk-setting strong {
    font-size:12px;
  }

  .bk-setting span {
    display:block;
    color:#777;
    font-size:10px;
    margin-top:3px;
  }

  .bk-switch {
    position:relative;
    width:44px;
    height:24px;
    flex-shrink:0;
  }

  .bk-switch input {
    opacity:0;
    width:0;
    height:0;
  }

  .bk-slider {
    position:absolute;
    inset:0;
    background:#303030;
    border-radius:30px;
    cursor:pointer;
    transition:.2s;
  }

  .bk-slider:before {
    content:"";
    position:absolute;
    width:18px;
    height:18px;
    left:3px;
    top:3px;
    background:white;
    border-radius:50%;
    transition:.2s;
  }

  .bk-switch input:checked + .bk-slider {
    background:#e50914;
  }

  .bk-switch input:checked + .bk-slider:before {
    transform:translateX(20px);
  }

  .bk-settings-footer {
    display:flex;
    justify-content:flex-end;
    gap:8px;
    padding:15px 20px;
  }

  .bk-settings-footer button {
    border:1px solid #333;
    background:#202020;
    color:#fff;
    border-radius:6px;
    padding:9px 14px;
    font-size:11px;
    font-weight:800;
    cursor:pointer;
  }

  .bk-settings-footer .save {
    background:#e50914;
    border-color:#e50914;
  }

  @media(max-width:900px) {

    #bkNotificationPanel {
      top:70px;
      right:12px;
    }

  }

  `;

  document.head.appendChild(style);


  /* =========================================================
     CREATE NOTIFICATION BUTTON
  ========================================================= */

  function createButton() {

    if (document.getElementById("bkNotificationButton")) {
      return;
    }

    const button = document.createElement("button");

    button.id = "bkNotificationButton";
    button.type = "button";
    button.setAttribute(
      "aria-label",
      "Notifications"
    );

    button.innerHTML = `
      🔔
      <span id="bkNotificationBadge">0</span>
    `;

    const navRight =
      document.querySelector(".nav-right");

    if (navRight) {

      navRight.insertBefore(
        button,
        navRight.firstChild
      );

    } else {

      document.body.appendChild(button);

    }

    createPanel();

    button.addEventListener("click", function (event) {

      event.stopPropagation();

      const panel =
        document.getElementById(
          "bkNotificationPanel"
        );

      panel.classList.toggle("open");

      render();

    });
  }


  /* =========================================================
     NOTIFICATION PANEL
  ========================================================= */

  function createPanel() {

    const panel =
      document.createElement("div");

    panel.id = "bkNotificationPanel";

    panel.innerHTML = `

      <div class="bk-notification-header">

        <div>

          <strong>Notifications</strong>

          <small>
            BRENZKafrica Plus updates
          </small>

        </div>

        <div class="bk-notification-actions">

          <button
            id="bkNotificationSettingsButton"
            aria-label="Notification settings">
            ⚙️
          </button>

          <button
            id="bkNotificationClose"
            aria-label="Close notifications">
            ×
          </button>

        </div>

      </div>

      <div id="bkNotificationList"></div>

    `;

    document.body.appendChild(panel);

    document
      .getElementById("bkNotificationClose")
      .onclick = function () {

        panel.classList.remove("open");

      };

    document
      .getElementById(
        "bkNotificationSettingsButton"
      )
      .onclick = function () {

        panel.classList.remove("open");

        openSettings();

      };

    document.addEventListener(
      "click",
      function (event) {

        if (
          !panel.contains(event.target) &&
          event.target.id !==
          "bkNotificationButton"
        ) {

          panel.classList.remove("open");

        }

      }
    );

    createSettings();

  }


  /* =========================================================
     SETTINGS
  ========================================================= */

  function createSettings() {

    const modal =
      document.createElement("div");

    modal.id = "bkNotificationSettings";

    modal.innerHTML = `

      <div class="bk-settings-card">

        <div class="bk-settings-header">

          <h3>
            Notification settings
          </h3>

          <p>
            Choose what BRENZKafrica Plus
            should notify you about.
          </p>

        </div>

        ${setting(
          "enabled",
          "Notifications",
          "Turn BRENZKafrica Plus notifications on or off."
        )}

        ${setting(
          "newContent",
          "New content",
          "New shows, documentaries and creative releases."
        )}

        ${setting(
          "sports",
          "Sports",
          "Sports updates, scores and important match alerts."
        )}

        ${setting(
          "breakingNews",
          "Breaking news",
          "Important news and urgent updates."
        )}

        ${setting(
          "episodes",
          "New episodes",
          "New episodes from series you follow."
        )}

        ${setting(
          "browserAlerts",
          "Browser alerts",
          "Allow notifications from your browser."
        )}

        <div class="bk-settings-footer">

          <button id="bkSettingsCancel">
            Cancel
          </button>

          <button
            id="bkSettingsSave"
            class="save">
            Save settings
          </button>

        </div>

      </div>
    `;

    document.body.appendChild(modal);

    document
      .getElementById("bkSettingsCancel")
      .onclick = function () {

        modal.classList.remove("open");

      };

    document
      .getElementById("bkSettingsSave")
      .onclick = saveSettingsFromUI;

    modal.addEventListener(
      "click",
      function (event) {

        if (event.target === modal) {

          modal.classList.remove("open");

        }

      }
    );

  }


  function setting(
    key,
    title,
    description
  ) {

    return `

      <div class="bk-setting">

        <div>

          <strong>${title}</strong>

          <span>${description}</span>

        </div>

        <label class="bk-switch">

          <input
            type="checkbox"
            data-bk-setting="${key}"
            ${settings[key] ? "checked" : ""}
          >

          <span class="bk-slider"></span>

        </label>

      </div>

    `;

  }


  function openSettings() {

    document
      .querySelectorAll(
        "[data-bk-setting]"
      )
      .forEach(function (input) {

        input.checked =
          !!settings[
            input.dataset.bkSetting
          ];

      });

    document
      .getElementById(
        "bkNotificationSettings"
      )
      .classList.add("open");

  }


  async function saveSettingsFromUI() {

    document
      .querySelectorAll(
        "[data-bk-setting]"
      )
      .forEach(function (input) {

        settings[
          input.dataset.bkSetting
        ] = input.checked;

      });

    saveSettings();

    if (
      settings.browserAlerts &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {

      try {

        await Notification.requestPermission();

      } catch {}

    }

    document
      .getElementById(
        "bkNotificationSettings"
      )
      .classList.remove("open");

    render();

  }


  /* =========================================================
     ADD NOTIFICATION
  ========================================================= */

  function addNotification(data) {

    if (
      !data ||
      !data.id ||
      !data.title
    ) {

      return;

    }

    const notification = {

      id: data.id,

      type: data.type || "content",

      title: data.title,

      text:
        data.text ||
        "New update on BRENZKafrica Plus.",

      time:
        data.time ||
        "Just now"

    };

    notifications.push(notification);

    if (!isAllowed(notification)) {

      render();

      return;

    }

    showBrowserNotification(
      notification
    );

    render();

  }


  function isAllowed(notification) {

    if (!settings.enabled) {

      return false;

    }

    if (
      notification.type === "sports"
    ) {

      return settings.sports;

    }

    if (
      notification.type === "news"
    ) {

      return settings.breakingNews;

    }

    if (
      notification.type === "episode"
    ) {

      return settings.episodes;

    }

    return settings.newContent;

  }


  /* =========================================================
     BROWSER NOTIFICATION
  ========================================================= */

  function showBrowserNotification(
    notification
  ) {

    if (
      !settings.browserAlerts
    ) {

      return;

    }

    if (
      !("Notification" in window)
    ) {

      return;

    }

    if (
      Notification.permission !==
      "granted"
    ) {

      return;

    }

    try {

      new Notification(
        notification.title,
        {
          body: notification.text
        }
      );

    } catch {}

  }


  /* =========================================================
     RENDER
  ========================================================= */

  function render() {

    const list =
      document.getElementById(
        "bkNotificationList"
      );

    const badge =
      document.getElementById(
        "bkNotificationBadge"
      );

    if (!list || !badge) {

      return;

    }

    const visible =
      notifications.filter(
        isAllowed
      );

    const unread =
      visible.filter(
        function (item) {

          return !seen.includes(
            item.id
          );

        }
      ).length;

    badge.textContent =
      unread > 99
        ? "99+"
        : unread;

    badge.style.display =
      unread
        ? "flex"
        : "none";

    if (!visible.length) {

      list.innerHTML = `

        <div class="bk-notification-empty">

          You're all caught up.

        </div>

      `;

      return;

    }

    list.innerHTML =
      visible
        .slice()
        .reverse()
        .map(function (item) {

          return `

            <div
              class="bk-notification-item"
              data-id="${escapeHTML(item.id)}">

              <div class="bk-notification-icon">

                ${icon(item.type)}

              </div>

              <div>

                <div class="bk-notification-title">

                  ${escapeHTML(
                    item.title
                  )}

                </div>

                <div class="bk-notification-text">

                  ${escapeHTML(
                    item.text
                  )}

                </div>

                <div class="bk-notification-time">

                  ${escapeHTML(
                    item.time
                  )}

                </div>

              </div>

            </div>

          `;

        })
        .join("");

    list
      .querySelectorAll(
        ".bk-notification-item"
      )
      .forEach(function (element) {

        element.addEventListener(
          "click",
          function () {

            const id =
              element.dataset.id;

            if (!seen.includes(id)) {

              seen.push(id);

              saveSeen();

              render();

            }

          }
        );

      });

  }


  function icon(type) {

    if (type === "sports") {
      return "🏆";
    }

    if (type === "news") {
      return "📰";
    }

    if (type === "episode") {
      return "🎬";
    }

    return "✨";

  }


  function escapeHTML(value) {

    return String(value).replace(
      /[&<>"']/g,
      function (character) {

        return {

          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"

        }[character];

      }
    );

  }


  /* =========================================================
     PUBLIC API
     Your sports/news code can call these.
  ========================================================= */

  window.BRENZKafricaNotify = {

    add: addNotification,

    sports: function (
      id,
      title,
      text
    ) {

      addNotification({

        id,
        type: "sports",
        title,
        text

      });

    },

    news: function (
      id,
      title,
      text
    ) {

      addNotification({

        id,
        type: "news",
        title,
        text

      });

    },

    episode: function (
      id,
      title,
      text
    ) {

      addNotification({

        id,
        type: "episode",
        title,
        text

      });

    },

    content: function (
      id,
      title,
      text
    ) {

      addNotification({

        id,
        type: "content",
        title,
        text

      });

    },

    settings: openSettings

  };


  /* =========================================================
     START
  ========================================================= */

  function start() {

    createButton();

    /*
      Initial system notification.
    */

    addNotification({

      id: "bk-welcome",

      type: "content",

      title:
        "Welcome to BRENZKafrica Plus",

      text:
        "You're now connected to BRENZKafrica Plus notifications.",

      time:
        "Just now"

    });

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      start
    );

  } else {

    start();

  }

})();
