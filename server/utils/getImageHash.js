// File: utils/getImageHash.js
import sharp from "sharp";
import crypto from "crypto";

/**
 * Generates a perceptual hash of an image
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} - 64-character hex hash
 */
export async function getImageHash(imagePath) {
  try {
    let inputBuffer = imagePath;
    if (typeof imagePath === "string" && imagePath.startsWith("http")) {
      const axios = (await import("axios")).default;
      const response = await axios.get(imagePath, { responseType: "arraybuffer" });
      inputBuffer = Buffer.from(response.data);
    }
    // Convert image to 8x8 grayscale for perceptual hashing
    const buffer = await sharp(inputBuffer)
      .resize(8, 8, { fit: "fill" })
      .grayscale()
      .raw()
      .toBuffer();

    // Compute hash: each pixel >128 -> 1 else 0
    const avg = buffer.reduce((sum, val) => sum + val, 0) / buffer.length;
    let hash = "";
    buffer.forEach((val) => {
      hash += val > avg ? "1" : "0";
    });

    // Convert binary string to hex
    const hex = parseInt(hash, 2).toString(16).padStart(16, "0");
    return hex;
  } catch (err) {
    console.error("getImageHash error:", err);
    throw err;
  }
}

/**
 * Calculates Hamming distance between two hex hashes
 * @param {string} hash1
 * @param {string} hash2
 * @returns {number} - Number of differing bits
 */
export function hammingDistance(hash1, hash2) {
  // Convert hex to binary
  const bin1 = BigInt("0x" + hash1).toString(2).padStart(64, "0");
  const bin2 = BigInt("0x" + hash2).toString(2).padStart(64, "0");

  let distance = 0;
  for (let i = 0; i < bin1.length; i++) {
    if (bin1[i] !== bin2[i]) distance++;
  }
  return distance;
}
