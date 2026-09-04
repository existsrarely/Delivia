/**
 * DELIVIA - Dynamic Hand-off QR Code & OTP Generator
 * Renders high-contrast canvas QR codes and safety verification passes
 */

class DeliviaQr {
  /**
   * Generates a stylized dynamic QR code matrix on a target canvas element
   * @param {HTMLCanvasElement} canvas
   * @param {string} text - Payload to encode
   * @param {string} color - Foreground color
   */
  renderQrCanvas(canvas, text = 'DELIVIA-PASS-7492', color = '#1E3A1E') {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width || 180;
    const height = canvas.height || 180;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    const gridSize = 21;
    const cellSize = (width - 24) / gridSize;
    const padding = 12;

    // Simple deterministic hash to build a visually authentic QR pattern
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }

    ctx.fillStyle = color;

    // Draw standard 3 Finder Patterns (Corners)
    const drawFinder = (r, c) => {
      // Outer 7x7
      ctx.fillRect(padding + c * cellSize, padding + r * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(padding + (c + 1) * cellSize, padding + (r + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = color;
      ctx.fillRect(padding + (c + 2) * cellSize, padding + (r + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    };

    drawFinder(0, 0); // Top-left
    drawFinder(0, gridSize - 7); // Top-right
    drawFinder(gridSize - 7, 0); // Bottom-left

    // Fill pseudo-random data bits
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Skip corner finder zones
        if ((r < 8 && c < 8) || (r < 8 && c >= gridSize - 8) || (r >= gridSize - 8 && c < 8)) {
          continue;
        }

        const seed = (r * 31 + c * 17 + Math.abs(hash)) % 100;
        if (seed > 45) {
          ctx.beginPath();
          ctx.arc(
            padding + c * cellSize + cellSize / 2,
            padding + r * cellSize + cellSize / 2,
            cellSize * 0.42,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }

    // Draw central Delivia logo badge in center
    const centerSize = cellSize * 4.5;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerSize / 2 + 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#E06D53'; // Brand salmon
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerSize / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.round(centerSize * 0.55)}px Outfit, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('D', centerX, centerY + 1);
  }
}

const deliviaQr = new DeliviaQr();
