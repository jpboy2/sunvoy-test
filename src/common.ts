// Common utility functions for the application
import crypto from "crypto";
import { SECRET } from "./constant";

export const encryptBody = (body: Record<string, string>): string => {
  const sortedBodyString = Object.keys(body)
    .sort()
    .map((key) => `${key}=${encodeURIComponent(body[key])}`)
    .join("&");

  const hmac = crypto.createHmac("sha1", SECRET);
  hmac.update(sortedBodyString);
  return hmac.digest("hex").toUpperCase();
};
