import fs from "fs";
import { COOKIE_FILE_PATH, DATA_FOLDER_PATH } from "./constant";

export const saveCookies = (cookies: string[]) => {
  // Check if the data directory exists, if not create it
  if (!fs.existsSync(DATA_FOLDER_PATH)) {
    fs.mkdirSync(DATA_FOLDER_PATH, { recursive: true });
    console.log(`Created data directory: ${DATA_FOLDER_PATH}`);
  }

  fs.writeFileSync(COOKIE_FILE_PATH, JSON.stringify(cookies, null, 2), "utf8");
};

export const loadCookies = () => {
  if (!fs.existsSync(COOKIE_FILE_PATH)) return null;

  try {
    const raw = fs.readFileSync(COOKIE_FILE_PATH, "utf-8");
    const cookies: string[] = JSON.parse(raw);
    if (!Array.isArray(cookies)) return null;

    const now = new Date();

    const expiredCookies = cookies.some((cookie) => {
      const parts = cookie.split(";").map((part) => part.trim());
      const expiresValue = parts.find((part) => part.toLowerCase().startsWith("expires="));

      if (!expiresValue) return false;

      const expiresDate = new Date(expiresValue.split("=")[1]);
      return expiresDate < now;
    });

    return expiredCookies ? null : cookies;
  } catch (error) {
    console.error("Failed to load cookies:", error);
    return null;
  }
};
