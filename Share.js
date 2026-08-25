(function () {
  "use strict";

  const SITE_NAME = "BRENZKafrica Plus";

  function getShareUrl(item) {
    if (item && item.shareUrl) {
      return new URL(item.shareUrl, window.location.origin).href;
    }

    const id = item && (item.id || item.uuid);
    const slug = item && item.slug;

    if (slug) {
      return new URL(
        `/watch/${encodeURIComponent(slug)}`,
        window.location.origin
      ).href;
    }

    if (id) {
      return new URL(
        `/watch?id=${encodeURIComponent(id)}`,
        window.location.origin
      ).href;
    }

    return window.location.href;
  }

  async function shareItem(item = {}) {
    const title = item.title || SITE_NAME;

    const url = getShareUrl(item);

    const text =
      item.description ||
      `Watch ${title} on ${SITE_NAME}.`;

    const shareData = {
      title,
      text,
      url
    };

    try {
      if (
        navigator.share &&
        (!navigator.canShare || navigator.canShare(shareData))
      ) {
        await navigator.share(shareData);
        return;
      }
    } catch (error) {
      if (error && error.name === "AbortError") {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      showShareToast("Link copied");
    } catch (error) {
      window.prompt(
        "Copy this BRENZKafrica Plus link:",
        url
      );
    }
  }

  function showShareToast(message) {
    let toast = document.getElementById("bk-share-toast");

    if (!toast) {
      toast = document.createElement("div");

      toast.id = "bk-share-toast";

      toast.style.cssText = `
        position:fixed;
        left:50%;
        bottom:28px;
        transform:translateX(-50%);
        z-index:99999;
        padding:12px 18px;
        border-radius:999px;
        background:rgba(20,20,20,.96);
        color:#fff;
        font:600 13px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        box-shadow:0 10px 35px rgba(0,0,0,.4);
        border:1px solid rgba(255,255,255,.12);
      `;

      document.body.appendChild(toast);
    }

    toast.textContent = message;

    clearTimeout(toast._timer);

    toast._timer = setTimeout(() => {
      toast.remove();
    }, 2200);
  }

  function createShareButton(item = {}) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "bk-share-btn";

    button.setAttribute(
      "aria-label",
      `Share ${item.title || "this content"}`
    );

    button.innerHTML = `
      <span aria-hidden="true">↗</span>
      <span>Share</span>
    `;

    button.addEventListener("click", () => {
      shareItem(item);
    });

    return button;
  }

  function addHeroShareButton() {
    const heroButtons =
      document.querySelector(".hero-buttons");

    if (!heroButtons) return;

    if (
      heroButtons.querySelector(".bk-share-btn")
    ) {
      return;
    }

    const title =
      document
        .querySelector(".hero h1")
        ?.textContent
        ?.trim() ||
      SITE_NAME;

    const description =
      document
        .querySelector(".hero p")
        ?.textContent
        ?.trim() ||
      `Watch ${title} on ${SITE_NAME}.`;

    heroButtons.appendChild(
      createShareButton({
        title,
        description
      })
    );
  }

  function wireShareButtons() {
    document
      .querySelectorAll("[data-share]")
      .forEach((button) => {

        if (button.dataset.shareWired === "true") {
          return;
        }

        button.dataset.shareWired = "true";

        button.addEventListener("click", () => {

          shareItem({
            id:
              button.dataset.id ||
              button.dataset.contentId,

            uuid:
              button.dataset.uuid,

            slug:
              button.dataset.slug,

            shareUrl:
              button.dataset.shareUrl,

            title:
              button.dataset.title ||
              SITE_NAME,

            description:
              button.dataset.description ||
              ""
          });

        });
      });
  }

  window.BRENZKafricaShare = {
    share: shareItem,
    createButton: createShareButton,
    showToast: showShareToast
  };

  function initShare() {
    addHeroShareButton();
    wireShareButtons();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initShare
    );
  } else {
    initShare();
  }

  const observer =
    new MutationObserver(() => {
      addHeroShareButton();
      wireShareButtons();
    });

  observer.observe(
    document.documentElement,
    {
      childList: true,
      subtree: true
    }
  );

})();
