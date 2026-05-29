function addAvatarFloorShadow(image) {
  const parent = image.parentElement;
  if (!parent || parent.querySelector(".avatar-floor-shadow")) return;

  const shadow = document.createElement("span");
  shadow.className = "avatar-floor-shadow";
  shadow.setAttribute("aria-hidden", "true");
  parent.insertBefore(shadow, image);
}

function cleanAvatarEdge(image) {
  const source = image.currentSrc || image.src;
  if (!source || image.dataset.cleanupRunning === "true" || image.dataset.cleanedSource === source) return;

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
    const pixelCount = width * height;
    const original = new Uint8ClampedArray(data);
    const clearMask = new Uint8Array(pixelCount);

    function pixelIndex(x, y) {
      return y * width + x;
    }

    function offsetByIndex(index) {
      return index * 4;
    }

    function offset(x, y) {
      return offsetByIndex(pixelIndex(x, y));
    }

    function isBackgroundLike(i, alphaLimit = 255) {
      const alpha = original[i + 3];
      if (alpha <= 12) return true;
      if (alpha > alphaLimit) return false;

      const red = original[i];
      const green = original[i + 1];
      const blue = original[i + 2];
      const max = Math.max(red, green, blue);
      const min = Math.min(red, green, blue);
      const brightness = (red + green + blue) / 3;
      const saturation = max - min;

      return (
        (brightness > 222 && saturation < 48) ||
        (red > 218 && green > 218 && blue > 214) ||
        (alpha < 220 && brightness > 205 && saturation < 70)
      );
    }

    const queue = [];

    function queueIfBackground(x, y) {
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      const index = pixelIndex(x, y);
      if (clearMask[index]) return;
      const i = offsetByIndex(index);
      if (!isBackgroundLike(i, 255)) return;
      clearMask[index] = 1;
      queue.push(index);
    }

    for (let x = 0; x < width; x += 1) {
      queueIfBackground(x, 0);
      queueIfBackground(x, height - 1);
    }

    for (let y = 0; y < height; y += 1) {
      queueIfBackground(0, y);
      queueIfBackground(width - 1, y);
    }

    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const index = queue[cursor];
      const x = index % width;
      const y = Math.floor(index / width);
      queueIfBackground(x + 1, y);
      queueIfBackground(x - 1, y);
      queueIfBackground(x, y + 1);
      queueIfBackground(x, y - 1);
    }

    for (let index = 0; index < pixelCount; index += 1) {
      if (!clearMask[index]) continue;
      data[offsetByIndex(index) + 3] = 0;
    }

    const afterFlood = new Uint8ClampedArray(data);

    function touchesTransparent(x, y, radius) {
      for (let yy = Math.max(0, y - radius); yy <= Math.min(height - 1, y + radius); yy += 1) {
        for (let xx = Math.max(0, x - radius); xx <= Math.min(width - 1, x + radius); xx += 1) {
          const i = offset(xx, yy);
          if (afterFlood[i + 3] < 24) return true;
        }
      }
      return false;
    }

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = offset(x, y);
        const alpha = afterFlood[i + 3];
        if (alpha === 0) continue;
        if (!touchesTransparent(x, y, 2)) continue;

        const red = afterFlood[i];
        const green = afterFlood[i + 1];
        const blue = afterFlood[i + 2];
        const max = Math.max(red, green, blue);
        const min = Math.min(red, green, blue);
        const brightness = (red + green + blue) / 3;
        const saturation = max - min;

        if (brightness > 212 && saturation < 62) {
          data[i + 3] = 0;
          continue;
        }

        if (alpha < 245 && brightness > 190 && saturation < 90) {
          data[i + 3] = Math.max(0, alpha - 120);
        }
      }
    }

    const edgeCorrected = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = offset(x, y);
        const alpha = edgeCorrected[i + 3];
        if (alpha === 0 || alpha > 245) continue;

        let totalRed = 0;
        let totalGreen = 0;
        let totalBlue = 0;
        let total = 0;

        for (let yy = Math.max(0, y - 3); yy <= Math.min(height - 1, y + 3); yy += 1) {
          for (let xx = Math.max(0, x - 3); xx <= Math.min(width - 1, x + 3); xx += 1) {
            const j = offset(xx, yy);
            const neighbourAlpha = edgeCorrected[j + 3];
            if (neighbourAlpha > 245) {
              const neighbourRed = edgeCorrected[j];
              const neighbourGreen = edgeCorrected[j + 1];
              const neighbourBlue = edgeCorrected[j + 2];
              const neighbourBrightness = (neighbourRed + neighbourGreen + neighbourBlue) / 3;
              const neighbourSaturation = Math.max(neighbourRed, neighbourGreen, neighbourBlue) - Math.min(neighbourRed, neighbourGreen, neighbourBlue);
              if (!(neighbourBrightness > 220 && neighbourSaturation < 60)) {
                totalRed += neighbourRed;
                totalGreen += neighbourGreen;
                totalBlue += neighbourBlue;
                total += 1;
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

    context.putImageData(imageData, 0, 0);
    const cleaned = canvas.toDataURL("image/png");
    image.dataset.cleanedSource = cleaned;
    image.dataset.cleanupRunning = "false";
    image.src = cleaned;
  };

  cleaner.onerror = () => {
    image.dataset.cleanedSource = source;
    image.dataset.cleanupRunning = "false";
  };

  image.dataset.cleanupRunning = "true";
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
    window.requestAnimationFrame(() => prepareAvatarImage(mutation.target));
  });
});

document.querySelectorAll(".avatar-layer, .edit-room-avatar, [data-character-layer]").forEach((image) => {
  avatarObserver.observe(image, { attributes: true, attributeFilter: ["src"] });
});
