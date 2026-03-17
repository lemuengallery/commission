const galleryData = window.GALLERY_DATA ?? { sections: [] };

const galleryRoot = document.querySelector("#gallery-root");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxCounter = document.querySelector("#lightbox-counter");
const closeButton = document.querySelector(".lightbox-close");
const prevButton = document.querySelector(".lightbox-prev");
const nextButton = document.querySelector(".lightbox-next");
const petalLayer = document.querySelector(".petal-layer");

const state = {
  currentItem: null,
  currentIndex: 0,
};

function buildTagMarkup(tags) {
  const container = document.createDocumentFragment();

  tags.forEach((tag) => {
    const tagElement = document.createElement("span");
    tagElement.className = `tag tag-${tag}`;
    tagElement.textContent = tag;
    container.appendChild(tagElement);
  });

  return container;
}

function buildCard(item) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "gallery-card";
  card.setAttribute("aria-label", `Open ${item.illustrator}`);
  const frame = document.createElement("div");
  frame.className = "card-frame";

  const image = document.createElement("img");
  image.src = item.cover;
  image.alt = item.illustrator;
  image.loading = "lazy";
  frame.appendChild(image);

  const tags = document.createElement("div");
  tags.className = "card-tags";
  tags.appendChild(buildTagMarkup(item.tags));
  frame.appendChild(tags);

  if (item.imageCount > 1) {
    const count = document.createElement("span");
    count.className = "card-count";
    count.textContent = `${item.imageCount} images`;
    frame.appendChild(count);
  }

  const meta = document.createElement("div");
  meta.className = "card-meta";

  const illustrator = document.createElement("p");
  illustrator.className = "card-illustrator";
  illustrator.textContent = `Illustrator: ${item.illustrator}`;
  meta.appendChild(illustrator);

  card.append(frame, meta);

  card.addEventListener("click", () => openLightbox(item, 0));
  return card;
}

function buildSection(section) {
  const sectionElement = document.createElement("section");
  sectionElement.className = "gallery-section";

  const itemNoun = section.items.length === 1 ? "window" : "windows";
  const heading = document.createElement("div");
  heading.className = "section-heading";

  const title = document.createElement("h2");
  title.textContent = section.title;

  const count = document.createElement("p");
  count.textContent = `${section.items.length} ${itemNoun}`;

  heading.append(title, count);
  sectionElement.appendChild(heading);

  if (!section.items.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = "No images are available in this section yet.";
    sectionElement.appendChild(emptyState);
    return sectionElement;
  }

  const grid = document.createElement("div");
  grid.className = "gallery-grid";
  section.items.forEach((item) => grid.appendChild(buildCard(item)));
  sectionElement.appendChild(grid);
  return sectionElement;
}

function renderGallery() {
  galleryRoot.innerHTML = "";
  galleryData.sections.forEach((section) => {
    galleryRoot.appendChild(buildSection(section));
  });
}

function updateLightbox() {
  if (!state.currentItem) {
    return;
  }

  const imagePath = state.currentItem.images[state.currentIndex];
  lightboxImage.src = imagePath;
  lightboxImage.alt = `${state.currentItem.illustrator} preview ${state.currentIndex + 1}`;
  lightboxTitle.textContent = `Illustrator: ${state.currentItem.illustrator}`;
  lightboxCounter.textContent = `${state.currentIndex + 1} / ${state.currentItem.imageCount}`;

  const multiple = state.currentItem.imageCount > 1;
  prevButton.classList.toggle("is-hidden", !multiple);
  nextButton.classList.toggle("is-hidden", !multiple);
}

function openLightbox(item, index) {
  state.currentItem = item;
  state.currentIndex = index;
  updateLightbox();
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
  state.currentItem = null;
  state.currentIndex = 0;
  document.body.style.overflow = "";
}

function changeSlide(direction) {
  if (!state.currentItem || state.currentItem.imageCount <= 1) {
    return;
  }

  const total = state.currentItem.imageCount;
  state.currentIndex = (state.currentIndex + direction + total) % total;
  updateLightbox();
}

function createPetals() {
  const petalCount = 20;

  for (let index = 0; index < petalCount; index += 1) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.setProperty("--size", `${12 + Math.random() * 20}px`);
    petal.style.setProperty("--opacity", `${0.5 + Math.random() * 0.45}`);
    petal.style.setProperty("--duration", `${10 + Math.random() * 9}s`);
    petal.style.setProperty("--sway-duration", `${2.6 + Math.random() * 2.4}s`);
    petal.style.setProperty("--drift-start", `${-20 + Math.random() * 40}px`);
    petal.style.setProperty("--drift-end", `${-140 + Math.random() * 280}px`);
    petal.style.animationDelay = `${Math.random() * -18}s`;
    petalLayer.appendChild(petal);
  }
}

closeButton.addEventListener("click", closeLightbox);
prevButton.addEventListener("click", () => changeSlide(-1));
nextButton.addEventListener("click", () => changeSlide(1));

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

window.addEventListener("keydown", (event) => {
  if (!state.currentItem) {
    return;
  }

  if (event.key === "Escape") {
    closeLightbox();
  }

  if (event.key === "ArrowLeft") {
    changeSlide(-1);
  }

  if (event.key === "ArrowRight") {
    changeSlide(1);
  }
});

renderGallery();
createPetals();
