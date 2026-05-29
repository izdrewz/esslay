function addAvatarFloorShadow(image) {
  const parent = image.parentElement;
  if (!parent || parent.querySelector(".avatar-floor-shadow")) return;

  const shadow = document.createElement("span");
  shadow.className = "avatar-floor-shadow";
  shadow.setAttribute("aria-hidden", "true");
  parent.insertBefore(shadow, image);
}

function cleanAvatarEdge(image) {
  const source = image.dataset.cleanSource || image.currentSrc || image.src;
  if (!source || source.startsWith("data:") || image.dataset.cleanedSource === source) return;

  const cleaner = new Image();
  cleaner.crossOrigin = "anonymous";
  cleaner.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = cleaner.naturalWidth;
    canvas.height = cleaner.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(cleaner, 0, 0);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;
    const original = new Uint8ClampedArray(data);

    function offset(x, y) {
      return (y * width + x) * 4;
    }

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = offset(x, y);
        const alpha = original[i + 3];
        if (alpha === 0) continue;

        const red = original[i];
        const green = original[i + 1];
        const blue = original[i + 2];
        const max = Math.max(red, green, blue);
        const min = Math.min(red, green, blue);

        if (alpha < 10 || (alpha < 190 && max > 238 && max - min < 20)) {
          data[i + 3] = 0;
          continue;
        }

        if (alpha < 245) {
          let found = false;
          let totalRed = 0;
          let totalGreen = 0;
          let totalBlue = 0;
          let total = 0;

          for (let radius = 1; radius <= 4 && !found; radius += 1) {
            for (let yy = Math.max(0, y - radius); yy <= Math.min(height - 1, y + radius); yy += 1) {
              for (let xx = Math.max(0, x - radius); xx <= Math.min(width - 1, x + radius); xx += 1) {
                const j = offset(xx, yy);
                const neighbourAlpha = original[j + 3];
                if (neighbourAlpha > 230) {
                  totalRed += original[j];
                  totalGreen += original[j + 1];
                  totalBlue += original[j + 2];
                  total += 1;
                  found = true;
                }
              }
            }
          }

          if (total > 0) {
            data[i] = totalRed / total;
            data[i + 1] = totalGreen / total;
            data[i + 2] = totalBlue / total;
          }
        }
      }
    }

    context.putImageData(imageData, 0, 0);
    image.dataset.cleanedSource = source;
    image.dataset.cleanSource = source;
    image.src = canvas.toDataURL("image/png");
  };

  cleaner.onerror = () => {
    image.dataset.cleanedSource = source;
  };

  cleaner.src = source;
}

function prepareAvatarImage(image) {
  addAvatarFloorShadow(image);
  cleanAvatarEdge(image);
}

function prepareAllAvatars() {
  document.querySelectorAll(".avatar-layer, .edit-room-avatar, [data-character-layer]").forEach(prepareAvatarImage);
}

prepareAllAvatars();

const avatarObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type !== "attributes" || mutation.attributeName !== "src") return;
    const image = mutation.target;
    if (image.dataset.cleanSource && image.src.startsWith("data:")) return;
    window.requestAnimationFrame(() => prepareAvatarImage(image));
  });
});

document.querySelectorAll(".avatar-layer, .edit-room-avatar, [data-character-layer]").forEach((image) => {
  avatarObserver.observe(image, { attributes: true, attributeFilter: ["src"] });
});
