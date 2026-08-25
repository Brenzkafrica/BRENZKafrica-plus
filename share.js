(function () {
  "use strict";

  const SITE_NAME = "BRENZKafrica Plus";

  function getShareUrl() {
    return window.location.href;
  }

  async function shareBRENZKafrica() {
    const title =
      document.querySelector(".hero h1")?.textContent?.trim() ||
      SITE_NAME;

    const description =
      document.querySelector(".hero p")?.textContent?.trim() ||
      "Discover African stories, films, series and documentaries on BRENZKafrica Plus.";

    const url = getShareUrl();

    const shareData = {
      title: title,
      text: `${title} — ${description}`,
      url: url
    };

    /* iPhone / Android native Share Sheet */
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }
      }
    }

    /* Fallback: copy link */
    try {
      await navigator.clipboard.writeText(url);

      showToast("Link copied!");

    } catch (error) {

      window.prompt(
        "Copy this BRENZKafrica Plus link:",
        url
      );
    }
  }

  function showToast(message) {

    let toast =
      document.getElementById(
        "bk-share-toast"
      );

    if (!toast) {

      toast =
        document.createElement("div");

      toast.id =
        "bk-share-toast";

      toast.style.cssText = `
        position: fixed;
        left: 50%;
        bottom: 30px;
        transform: translateX(-50%);
        z-index: 999999;

        background: rgba(25,25,25,.96);
        color: white;

        padding: 12px 20px;

        border-radius: 30px;

        font-family:
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;

        font-size: 14px;
        font-weight: 600;

        box-shadow:
          0 10px 35px rgba(0,0,0,.45);

        border:
          1px solid rgba(255,255,255,.12);

        pointer-events: none;
      `;

      document.body.appendChild(toast);
    }

    toast.textContent = message;

    clearTimeout(toast._timer);

    toast._timer =
      setTimeout(
        function () {
          toast.remove();
        },
        2200
      );
  }

  function createShareButton() {

    const button =
      document.createElement("button");

    button.type = "button";

    button.className =
      "bk-share-btn";

    button.innerHTML = `
      <span
        style="
          font-size:18px;
          line-height:1;
          margin-right:6px;
        "
      >↗</span>
      <span>Share</span>
    `;

    button.setAttribute(
      "aria-label",
      "Share BRENZKafrica Plus"
    );

    button.style.cssText = `
      display: inline-flex;
      align-items: center;
      justify-content: center;

      min-height: 46px;

      padding: 0 22px;

      border-radius: 5px;

      border: 1px solid
        rgba(255,255,255,.16);

      background:
        rgba(70,70,70,.72);

      color: white;

      font-size: 14px;

      font-weight: 800;

      cursor: pointer;

      transition:
        transform 220ms ease,
        background 220ms ease;

      backdrop-filter: blur(8px);
    `;

    button.addEventListener(
      "mouseenter",
      function () {
        button.style.transform =
          "translateY(-2px)";

        button.style.background =
          "rgba(100,100,100,.85)";
      }
    );

    button.addEventListener(
      "mouseleave",
      function () {
        button.style.transform =
          "translateY(0)";

        button.style.background =
          "rgba(70,70,70,.72)";
      }
    );

    button.addEventListener(
      "click",
      shareBRENZKafrica
    );

    return button;
  }

  function addShareButton() {

    const heroButtons =
      document.querySelector(
        ".hero-buttons"
      );

    if (!heroButtons) {
      return;
    }

    /* Prevent duplicate buttons */
    if (
      heroButtons.querySelector(
        ".bk-share-btn"
      )
    ) {
      return;
    }

    const shareButton =
      createShareButton();

    heroButtons.appendChild(
      shareButton
    );
  }

  /*
   * Run after the page loads.
   */
  function initialize() {

    addShareButton();

    /*
     * Try again shortly afterward
     * in case the hero is rendered
     * dynamically.
     */
    setTimeout(
      addShareButton,
      500
    );

    setTimeout(
      addShareButton,
      1500
    );

    setTimeout(
      addShareButton,
      3000
    );
  }

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initialize
    );

  } else {

    initialize();

  }

  /*
   * Watch the page for dynamically
   * created hero content.
   */
  const observer =
    new MutationObserver(
      function () {
        addShareButton();
      }
    );

  observer.observe(
    document.body,
    {
      childList: true,
      subtree: true
    }
  );

})();
