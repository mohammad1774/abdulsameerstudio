document.documentElement.classList.add("js");

const currentYear = String(new Date().getFullYear());
for (const year of document.querySelectorAll("[data-current-year]")) {
  year.textContent = currentYear;
}

const navigationToggle = document.querySelector(".nav-toggle");
const navigation = document.querySelector("#primary-navigation");

function closeNavigation({ restoreFocus = false } = {}) {
  if (!navigationToggle || !navigation) {
    return;
  }

  navigationToggle.setAttribute("aria-expanded", "false");
  navigation.removeAttribute("data-open");

  if (restoreFocus) {
    navigationToggle.focus();
  }
}

if (navigationToggle && navigation) {
  navigationToggle.addEventListener("click", () => {
    const isOpen = navigationToggle.getAttribute("aria-expanded") === "true";
    navigationToggle.setAttribute("aria-expanded", String(!isOpen));
    navigation.toggleAttribute("data-open", !isOpen);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeNavigation();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigation.hasAttribute("data-open")) {
      closeNavigation({ restoreFocus: true });
    }
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(width > 760px)").matches) {
      closeNavigation();
    }
  });
}

const skipLink = document.querySelector('.skip-link[href="#main-content"]');
const mainContent = document.querySelector("#main-content");

if (skipLink && mainContent instanceof HTMLElement) {
  skipLink.addEventListener("click", () => {
    window.requestAnimationFrame(() => mainContent.focus());
  });
}
