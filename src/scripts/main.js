document.documentElement.classList.add("js");

import galleryDimensions from "../assets/photos/gallery-manifest.json";

const thumbnailAssets = import.meta.glob("../assets/photos/gallery/**/*-thumb.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

const fullAssets = import.meta.glob("../assets/photos/gallery/**/*-full.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

const PHOTOS = Object.freeze([
  {
    source: "weddings/DSC00004.jpg",
    category: "wedding",
    title: "Golden Hour Ceremony",
    location: "Ottawa",
  },
  {
    source: "weddings/DSC00112.jpg",
    category: "wedding",
    title: "Wedding Day Moments",
    location: "Ottawa",
  },
  {
    source: "weddings/DSC00122.jpg",
    category: "wedding",
    title: "Bridal Portraits",
    location: "Ottawa",
  },
  {
    source: "portrait/DSC02808.jpg",
    category: "portrait",
    title: "Natural Light Portrait",
    location: "Gatineau Park",
  },
  {
    source: "portrait/DSC02820.jpg",
    category: "portrait",
    title: "Golden Hour Session",
    location: "Ottawa Studio",
  },
  {
    source: "portrait/DSC06641.jpg",
    category: "portrait",
    title: "Editorial Portrait",
    location: "Gatineau Park",
  },
  {
    source: "portrait/DSC06742.jpg",
    category: "portrait",
    title: "Lifestyle Portrait",
    location: "Ottawa Studio",
  },
  {
    source: "newborn/DSC02119.jpg",
    category: "newborn",
    title: "Seven Days New",
    location: "Ottawa Studio",
  },
  {
    source: "newborn/DSC07426.jpg",
    category: "newborn",
    title: "Tiny Fingers",
    location: "Ottawa Studio",
  },
  {
    source: "newborn/DSC07438.jpg",
    category: "newborn",
    title: "Peaceful Slumber",
    location: "Ottawa Studio",
  },
  {
    source: "newborn/DSC07490.jpg",
    category: "newborn",
    title: "Pure Innocence",
    location: "Ottawa Studio",
  },
  {
    source: "newborn/DSC07526.jpg",
    category: "newborn",
    title: "Little Dreamer",
    location: "Ottawa Studio",
  },
  {
    source: "newborn/DSC07544.jpg",
    category: "newborn",
    title: "Precious Moments",
    location: "Ottawa Studio",
  },
  {
    source: "weddings/DSC00188.jpg",
    category: "wedding",
    title: "The First Dance",
    location: "Ottawa",
  },
  {
    source: "weddings/DSC09344.jpg",
    category: "wedding",
    title: "Ceremony Details",
    location: "Ottawa",
  },
  {
    source: "weddings/DSC09369.jpg",
    category: "wedding",
    title: "Just Married",
    location: "Ottawa",
  },
  {
    source: "events/DSC00267.jpg",
    category: "event",
    title: "Annual Gala",
    location: "Ottawa",
  },
  {
    source: "events/DSC07334.jpg",
    category: "event",
    title: "Corporate Event",
    location: "Ottawa",
  },
  {
    source: "events/IMG_8119.JPG",
    category: "event",
    title: "Special Occasion",
    location: "Ottawa",
  },
  {
    source: "portrait/DSC06770.jpg",
    category: "portrait",
    title: "Family Moments",
    location: "Rideau Canal",
  },
  {
    source: "portrait/DSC06860.jpg",
    category: "portrait",
    title: "Classic Headshot",
    location: "Downtown Studio",
  },
  {
    source: "portrait/DSC06913.jpg",
    category: "portrait",
    title: "Creative Portrait",
    location: "ByWard Market",
  },
  {
    source: "corporate/DSC00206.JPG",
    category: "corporate",
    title: "Executive Headshots",
    location: "Downtown Studio",
  },
  {
    source: "corporate/DSC00217.JPG",
    category: "corporate",
    title: "Corporate Portraits",
    location: "Ottawa Studio",
  },
  {
    source: "corporate/DSC00247.JPG",
    category: "corporate",
    title: "Professional Headshots",
    location: "Downtown Studio",
  },
  {
    source: "corporate/DSC00473.JPG",
    category: "corporate",
    title: "Team Photography",
    location: "Corporate Client",
  },
  {
    source: "newborn/DSC07568.jpg",
    category: "newborn",
    title: "Gentle Touch",
    location: "Ottawa Studio",
  },
  {
    source: "newborn/DSC07574.jpg",
    category: "newborn",
    title: "Sweet Dreams",
    location: "Ottawa Studio",
  },
  {
    source: "newborn/DSC07579.jpg",
    category: "newborn",
    title: "Precious Beginnings",
    location: "Ottawa Studio",
  },
  {
    source: "newborn/DSC07583.jpg",
    category: "newborn",
    title: "Brand New",
    location: "Ottawa Studio",
  },
  {
    source: "newborn/DSC07607.jpg",
    category: "newborn",
    title: "Welcome to the World",
    location: "Ottawa Studio",
  },
  {
    source: "weddings/DSC09377.jpg",
    category: "wedding",
    title: "Romantic Portraits",
    location: "Ottawa",
  },
  {
    source: "weddings/DSC09612.jpg",
    category: "wedding",
    title: "Bridesmaids & Blooms",
    location: "Ottawa",
  },
  {
    source: "weddings/IMG_8471.JPG",
    category: "wedding",
    title: "Wedding Celebration",
    location: "Ottawa",
  },
  {
    source: "weddings/DSC01998.jpg",
    category: "wedding",
    title: "Wedding Story",
    location: "Ottawa",
  },
  {
    source: "weddings/DSC09870.jpg",
    category: "wedding",
    title: "Love & Light",
    location: "Ottawa",
  },
  {
    source: "weddings/DSC09900.jpg",
    category: "wedding",
    title: "Timeless Moments",
    location: "Ottawa",
  },
  {
    source: "portrait/DSC07113.jpg",
    category: "portrait",
    title: "Senior Portraits",
    location: "ByWard Market",
  },
  {
    source: "portrait/DSC07212.jpg",
    category: "portrait",
    title: "Candid Moments",
    location: "Gatineau Park",
  },
  {
    source: "portrait/IMG_5533.JPG",
    category: "portrait",
    title: "Studio Session",
    location: "Ottawa Studio",
  },
  {
    source: "corporate/DSC00533.JPG",
    category: "corporate",
    title: "Brand Photography",
    location: "Ottawa Studio",
  },
  {
    source: "corporate/DSC00689.JPG",
    category: "corporate",
    title: "Corporate Events",
    location: "Shaw Centre",
  },
  {
    source: "corporate/DSC01205.JPG",
    category: "corporate",
    title: "Office Portraits",
    location: "Downtown Ottawa",
  },
  {
    source: "corporate/DSC01354.JPG",
    category: "corporate",
    title: "Business Headshots",
    location: "Corporate Client",
  },
  {
    source: "corporate/DSC01629.jpg",
    category: "corporate",
    title: "Corporate Session",
    location: "Ottawa Studio",
  },
  {
    source: "events/IMG_8309.JPG",
    category: "event",
    title: "Event Coverage",
    location: "Ottawa",
  },
  {
    source: "events/IMG_8355.JPG",
    category: "event",
    title: "Celebration",
    location: "Ottawa",
  },
  {
    source: "events/IMG_9665_1.jpg",
    category: "event",
    title: "Live Event",
    location: "Ottawa",
  },
]);

const TESTIMONIALS = Object.freeze([
  {
    name: "Sarah & James",
    service: "Wedding",
    rating: 5,
    message:
      "Our wedding photos are absolutely breathtaking. Every emotion was captured perfectly — we still look through the gallery and cry happy tears. Best investment of our wedding!",
  },
  {
    name: "Michelle T.",
    service: "Newborn",
    rating: 5,
    message:
      "The newborn session was so gentle and relaxed. Our little one slept the whole time and the photos are just stunning. We'll treasure these forever.",
  },
  {
    name: "Dr. Patricia Chen",
    service: "Corporate",
    rating: 5,
    message:
      "Professional, efficient, and incredibly talented. My new headshots have already received so many compliments. Will be booking for our entire team.",
  },
  {
    name: "The Okafor Family",
    service: "Portrait",
    rating: 5,
    message:
      "We were nervous with young kids but everything was so comfortable and fun. The kids actually enjoyed it! The results are magazine-quality.",
  },
  {
    name: "Marketplace Ottawa",
    service: "Event",
    rating: 5,
    message:
      "Covered our annual fundraiser and the photos were delivered so quickly. The quality was exceptional and really captured the atmosphere.",
  },
  {
    name: "Amélie B.",
    service: "Portrait",
    rating: 5,
    message:
      "I've never felt comfortable in front of a camera but this experience changed everything. The patience and direction made me feel like a model. Incredible photos!",
  },
]);

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const thumbnailIndex = indexAssets(thumbnailAssets);
const fullIndex = indexAssets(fullAssets);
const dimensionIndex = new Map(
  Object.entries(galleryDimensions).map(([source, dimensions]) => [
    normalizeAssetIdentity(source),
    dimensions,
  ]),
);
const galleryPhotos = PHOTOS.map(resolvePhotoAssets).filter(Boolean);

for (const year of document.querySelectorAll("[data-current-year]")) {
  year.textContent = String(new Date().getFullYear());
}

initializeSkipLink();
initializeNavigation();
initializeGallery();
renderTestimonials();
initializeScrollEffects();

function normalizeAssetIdentity(value) {
  return value
    .replaceAll("\\", "/")
    .replace(/^.*\/gallery\//i, "")
    .replace(/-(?:thumb|full)\.webp$/i, "")
    .replace(/\.[^./]+$/i, "")
    .split("/")
    .map((part) => part.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .join("/");
}

function indexAssets(modules) {
  const byPath = new Map();
  const byStem = new Map();

  for (const [modulePath, assetUrl] of Object.entries(modules)) {
    if (typeof assetUrl !== "string") {
      continue;
    }

    const identity = normalizeAssetIdentity(modulePath);
    const stem = identity.split("/").at(-1);

    byPath.set(identity, assetUrl);
    if (stem && !byStem.has(stem)) {
      byStem.set(stem, assetUrl);
    }
  }

  return { byPath, byStem };
}

function findAsset(index, source) {
  const identity = normalizeAssetIdentity(source);
  const stem = identity.split("/").at(-1);
  return index.byPath.get(identity) ?? (stem ? index.byStem.get(stem) : undefined);
}

function resolvePhotoAssets(photo) {
  const thumbnail = findAsset(thumbnailIndex, photo.source);
  const full = findAsset(fullIndex, photo.source);
  const dimensions = dimensionIndex.get(normalizeAssetIdentity(photo.source));

  if (!thumbnail || !full || !dimensions) {
    return null;
  }

  return {
    ...photo,
    thumbnail,
    full,
    width: dimensions[0],
    height: dimensions[1],
  };
}

function initializeSkipLink() {
  const skipLink = document.querySelector('.skip-link[href="#main-content"]');
  const mainContent = document.querySelector("#main-content");

  if (!(skipLink instanceof HTMLAnchorElement) || !(mainContent instanceof HTMLElement)) {
    return;
  }

  skipLink.addEventListener("click", () => {
    window.requestAnimationFrame(() => {
      mainContent.focus({ preventScroll: true });
    });
  });
}

function initializeNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const navigation = document.querySelector("#primary-navigation");
  const wordmark = document.querySelector(".site-header .wordmark");
  const inertRegions = [
    ...document.querySelectorAll("main, body > footer, [data-back-to-top]"),
  ].filter((region) => region instanceof HTMLElement);

  if (!(toggle instanceof HTMLButtonElement) || !(navigation instanceof HTMLElement)) {
    return;
  }

  const setNavigationContext = (isOpen) => {
    if (wordmark instanceof HTMLElement) {
      wordmark.inert = isOpen;
    }

    for (const region of inertRegions) {
      region.inert = isOpen;
    }
  };

  const closeNavigation = ({ restoreFocus = false } = {}) => {
    toggle.setAttribute("aria-expanded", "false");
    navigation.removeAttribute("data-open");
    document.body.classList.remove("navigation-open");
    setNavigationContext(false);

    if (restoreFocus) {
      toggle.focus();
    }
  };

  const openNavigation = () => {
    toggle.setAttribute("aria-expanded", "true");
    navigation.setAttribute("data-open", "");
    document.body.classList.add("navigation-open");
    setNavigationContext(true);

    window.requestAnimationFrame(() => {
      navigation.querySelector("a[href]")?.focus();
    });
  };

  toggle.type = "button";
  toggle.setAttribute("aria-expanded", "false");
  toggle.addEventListener("click", () => {
    if (navigation.hasAttribute("data-open")) {
      closeNavigation({ restoreFocus: true });
    } else {
      openNavigation();
    }
  });

  navigation.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeNavigation();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!navigation.hasAttribute("data-open")) {
      return;
    }

    if (event.key === "Escape") {
      closeNavigation({ restoreFocus: true });
      return;
    }

    if (event.key === "Tab") {
      const focusableControls = [
        toggle,
        ...navigation.querySelectorAll("a[href], button:not([disabled])"),
      ].filter((control) => control instanceof HTMLElement);
      const firstControl = focusableControls[0];
      const lastControl = focusableControls.at(-1);

      if (event.shiftKey && document.activeElement === firstControl) {
        event.preventDefault();
        lastControl?.focus();
      } else if (!event.shiftKey && document.activeElement === lastControl) {
        event.preventDefault();
        firstControl?.focus();
      }
    }
  });

  const desktopQuery = window.matchMedia("(min-width: 48rem)");
  const closeAtDesktopWidth = (event) => {
    if (event.matches) {
      closeNavigation();
    }
  };

  desktopQuery.addEventListener("change", closeAtDesktopWidth);
}

function initializeGallery() {
  const gallery = document.querySelector("#gallery");
  if (!(gallery instanceof HTMLElement)) {
    return;
  }

  const filterButtons = [
    ...document.querySelectorAll(".filter-tab[data-filter], .gallery-filter[data-filter]"),
  ].filter((button) => button instanceof HTMLButtonElement);
  const status = document.querySelector("[data-gallery-status], #gallery-status");
  const lightbox = createLightboxController();
  let visiblePhotos = galleryPhotos;

  const renderGallery = (filter = "all") => {
    const normalizedFilter = normalizeFilter(filter);
    visiblePhotos =
      normalizedFilter === "all"
        ? galleryPhotos
        : galleryPhotos.filter((photo) => photo.category === normalizedFilter);

    const fragment = document.createDocumentFragment();

    for (const [index, photo] of visiblePhotos.entries()) {
      const button = document.createElement("button");
      button.classList.add("gallery-item");
      button.type = "button";
      button.dataset.category = photo.category;
      button.setAttribute("aria-label", `View ${photo.title}, ${photo.location}`);

      const image = document.createElement("img");
      image.classList.add("gallery-image");
      image.src = photo.thumbnail;
      image.alt = `${photo.title} — ${photo.location}`;
      image.loading = "lazy";
      image.decoding = "async";
      image.width = photo.width;
      image.height = photo.height;

      const overlay = document.createElement("span");
      overlay.classList.add("gallery-item-overlay");
      overlay.setAttribute("aria-hidden", "true");

      const copy = document.createElement("span");
      copy.classList.add("gallery-item-text");

      const title = document.createElement("span");
      title.classList.add("gallery-item-title");
      title.textContent = photo.title;

      const location = document.createElement("span");
      location.classList.add("gallery-item-location");
      location.textContent = photo.location;

      copy.append(title, location);
      overlay.append(copy);
      button.append(image, overlay);
      button.addEventListener("click", () => {
        lightbox?.open(visiblePhotos, index, button);
      });
      fragment.append(button);
    }

    gallery.replaceChildren(fragment);
    gallery.setAttribute("aria-busy", "false");

    if (status instanceof HTMLElement) {
      const noun = visiblePhotos.length === 1 ? "photograph" : "photographs";
      status.textContent = `${visiblePhotos.length} ${noun} shown`;
    }
  };

  for (const button of filterButtons) {
    button.type = "button";
    const isInitiallySelected = normalizeFilter(button.dataset.filter) === "all";
    button.setAttribute("aria-pressed", String(isInitiallySelected));
    button.classList.toggle("active", isInitiallySelected);
    button.classList.toggle("is-active", isInitiallySelected);

    button.addEventListener("click", () => {
      const filter = normalizeFilter(button.dataset.filter);

      for (const candidate of filterButtons) {
        const selected = candidate === button;
        candidate.setAttribute("aria-pressed", String(selected));
        candidate.classList.toggle("active", selected);
        candidate.classList.toggle("is-active", selected);
      }

      lightbox?.close();
      renderGallery(filter);
    });
  }

  const initiallyPressed =
    filterButtons.find((button) => button.getAttribute("aria-pressed") === "true") ??
    filterButtons[0];
  renderGallery(initiallyPressed?.dataset.filter ?? "all");
}

function normalizeFilter(filter) {
  const aliases = {
    all: "all",
    corporate: "corporate",
    event: "event",
    events: "event",
    newborn: "newborn",
    portrait: "portrait",
    portraits: "portrait",
    wedding: "wedding",
    weddings: "wedding",
  };

  return aliases[String(filter ?? "all").toLowerCase()] ?? "all";
}

function createLightboxController() {
  const dialog = document.querySelector("#lightbox");
  const image = document.querySelector("#lightbox-image, [data-lightbox-image]");
  const caption = document.querySelector("#lightbox-caption, [data-lightbox-caption]");

  if (
    !(dialog instanceof HTMLDialogElement) ||
    !(image instanceof HTMLImageElement) ||
    !(caption instanceof HTMLElement)
  ) {
    return null;
  }

  const closeButton = dialog.querySelector("[data-lightbox-close], .lightbox-close");
  const previousButton = dialog.querySelector(
    "[data-lightbox-prev], [data-lightbox-previous], .lightbox-prev, .lightbox-previous",
  );
  const nextButton = dialog.querySelector("[data-lightbox-next], .lightbox-next");
  let photos = [];
  let currentIndex = 0;
  let returnFocus = null;

  const showPhoto = (index) => {
    if (photos.length === 0) {
      return;
    }

    currentIndex = (index + photos.length) % photos.length;
    const photo = photos[currentIndex];
    image.src = photo.full;
    image.alt = `${photo.title} — ${photo.location}`;
    image.width = photo.width;
    image.height = photo.height;
    caption.textContent = `${photo.title} · ${photo.location}`;

    const onlyPhoto = photos.length === 1;
    if (previousButton instanceof HTMLButtonElement) {
      previousButton.disabled = onlyPhoto;
    }
    if (nextButton instanceof HTMLButtonElement) {
      nextButton.disabled = onlyPhoto;
    }
  };

  const close = () => {
    if (dialog.open) {
      dialog.close();
    }
  };

  const open = (nextPhotos, index, trigger) => {
    if (nextPhotos.length === 0) {
      return;
    }

    photos = nextPhotos;
    returnFocus = trigger instanceof HTMLElement ? trigger : null;
    showPhoto(index);

    if (!dialog.open) {
      dialog.showModal();
    }

    window.requestAnimationFrame(() => {
      if (closeButton instanceof HTMLElement) {
        closeButton.focus();
      } else {
        dialog.focus();
      }
    });
  };

  if (closeButton instanceof HTMLButtonElement) {
    closeButton.type = "button";
    closeButton.addEventListener("click", close);
  }

  if (previousButton instanceof HTMLButtonElement) {
    previousButton.type = "button";
    previousButton.addEventListener("click", () => {
      showPhoto(currentIndex - 1);
    });
  }

  if (nextButton instanceof HTMLButtonElement) {
    nextButton.type = "button";
    nextButton.addEventListener("click", () => {
      showPhoto(currentIndex + 1);
    });
  }

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      close();
    }
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPhoto(currentIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showPhoto(currentIndex + 1);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  });

  dialog.addEventListener("close", () => {
    image.removeAttribute("src");
    image.alt = "";
    returnFocus?.focus();
    returnFocus = null;
  });

  return { close, open };
}

function renderTestimonials() {
  const grid = document.querySelector("#testimonial-grid, .testimonial-grid");
  if (!(grid instanceof HTMLElement)) {
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const testimonial of TESTIMONIALS) {
    const card = document.createElement("figure");
    card.classList.add("testimonial-card");

    const stars = document.createElement("p");
    stars.classList.add("testimonial-stars");

    const rating = document.createElement("span");
    rating.classList.add("visually-hidden");
    rating.textContent = `${testimonial.rating} out of 5 stars`;

    const visualStars = document.createElement("span");
    visualStars.classList.add("star-gold");
    visualStars.setAttribute("aria-hidden", "true");
    visualStars.textContent =
      "★".repeat(testimonial.rating) + "☆".repeat(Math.max(0, 5 - testimonial.rating));
    stars.append(rating, visualStars);

    const quotation = document.createElement("blockquote");
    quotation.classList.add("testimonial-quote");

    const message = document.createElement("p");
    message.textContent = testimonial.message;
    quotation.append(message);

    const author = document.createElement("figcaption");
    author.classList.add("testimonial-author");

    const name = document.createElement("span");
    name.classList.add("testimonial-name");
    name.textContent = testimonial.name;

    const service = document.createElement("span");
    service.classList.add("testimonial-service");
    service.textContent = `${testimonial.service} session`;

    author.append(name, service);
    card.append(stars, quotation, author);
    fragment.append(card);
  }

  grid.replaceChildren(fragment);
}

function initializeScrollEffects() {
  const header = document.querySelector("[data-site-header], .site-header, #nav");
  const backToTop = document.querySelector("[data-back-to-top], #back-to-top, #btt");
  let updateRequested = false;

  if (backToTop instanceof HTMLButtonElement) {
    backToTop.type = "button";
    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: reducedMotionQuery.matches ? "auto" : "smooth",
      });
    });
  }

  const update = () => {
    updateRequested = false;
    const scrolled = window.scrollY > 48;

    if (header instanceof HTMLElement) {
      header.toggleAttribute("data-scrolled", scrolled);
      header.classList.toggle("scrolled", scrolled);
      header.classList.toggle("is-scrolled", scrolled);
    }

    if (backToTop instanceof HTMLElement) {
      const visible = window.scrollY > 600;
      backToTop.toggleAttribute("data-visible", visible);
      backToTop.classList.toggle("show", visible);
      backToTop.classList.toggle("is-visible", visible);
      backToTop.setAttribute("aria-hidden", String(!visible));
      backToTop.tabIndex = visible ? 0 : -1;
    }
  };

  const requestUpdate = () => {
    if (!updateRequested) {
      updateRequested = true;
      window.requestAnimationFrame(update);
    }
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  update();
}
