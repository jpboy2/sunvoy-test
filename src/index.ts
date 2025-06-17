// Index
import fs from "fs";
import { JSDOM } from "jsdom";

import axiosClient from "./client";
import { encryptBody } from "./common";
import {
  LOGIN_URL,
  OUTPUT_FOLDER_PATH,
  PASSWORD,
  SETTINGS_API_URL,
  TOKEN_URL,
  USER_API_URL,
  USER_OUTPUT_FILE_PATH,
  USERNAME,
} from "./constant";
import { loadCookies, saveCookies } from "./cookie_manager";
import { TokenResponse } from "./types";

async function loginUser() {
  try {
    // Load cookies if still valid
    const tempCookies = loadCookies();

    if (tempCookies && tempCookies.length > 0) {
      axiosClient.defaults.headers.common["Cookie"] = tempCookies.join("; ");
      console.log("Loaded cookies from file!");
      return;
    }

    // If no valid cookies, proceed with login
    const loginPageResult = await axiosClient.get(LOGIN_URL);
    const html = loginPageResult.data;

    const dom = new JSDOM(html);
    const document = dom.window.document;

    const nonceInput = document.querySelector('input[name="nonce"]');
    const nonce = nonceInput ? (nonceInput as HTMLInputElement).value : null;

    if (!nonce) {
      throw new Error("Nonce not found in the login page.");
    }

    const res = await axiosClient.post(
      LOGIN_URL,
      {
        nonce: nonce,
        username: USERNAME,
        password: PASSWORD,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        withCredentials: true,
        maxRedirects: 0,
        validateStatus: (status) => status === 302,
      }
    );

    const setCookie = res.headers["set-cookie"];

    if (setCookie && Array.isArray(setCookie)) {
      const cookieHeader = setCookie.map((c) => c.split(";")[0]);
      axiosClient.defaults.headers.common["Cookie"] = cookieHeader.join("; ");
      saveCookies(setCookie);
      console.log("Saved cookies!");
    }

    console.log("Login successful!");
  } catch (error) {
    console.error("Error logging in:", error);
  }
}

async function fetchUsersAndSaveToFile() {
  try {
    const res = await axiosClient.post(USER_API_URL);
    const users = res.data;

    // Check if the output directory exists, if not create it
    if (!fs.existsSync(OUTPUT_FOLDER_PATH)) {
      fs.mkdirSync(OUTPUT_FOLDER_PATH, { recursive: true });
      console.log(`Created outputs directory: ${OUTPUT_FOLDER_PATH}`);
    }

    // Save the users to a JSON file
    fs.writeFileSync(USER_OUTPUT_FILE_PATH, JSON.stringify(users, null, 2), "utf-8");
    console.log(`Users saved successfully!`);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

async function getUserTokenData(): Promise<TokenResponse> {
  const result = await axiosClient.get(TOKEN_URL);
  const html = result.data;

  const dom = new JSDOM(html);
  const document = dom.window.document;

  const accessToken = (document.querySelector("#access_token") as HTMLInputElement)?.value;
  const openId = (document.querySelector("#openId") as HTMLInputElement)?.value;
  const userId = (document.querySelector("#userId") as HTMLInputElement)?.value;
  const apiUser = (document.querySelector("#apiuser") as HTMLInputElement)?.value;
  const operateId = (document.querySelector("#operateId") as HTMLInputElement)?.value;
  const language = (document.querySelector("#language") as HTMLInputElement)?.value;

  return {
    access_token: accessToken || "",
    openId: openId || "",
    userId: userId || "",
    apiuser: apiUser || "",
    operateId: operateId || "",
    language: language || "",
  };
}

async function appendLoggedInUserToFile() {
  try {
    const tokenData = await getUserTokenData();

    const body = {
      ...tokenData,
      timestamp: Math.floor(Date.now() / 1000).toString(),
    };

    const checkcode = encryptBody(body);

    const res = await axiosClient.post(
      SETTINGS_API_URL,
      {
        ...body,
        checkcode,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const userInformation = res.data;

    const users = fs.readFileSync(USER_OUTPUT_FILE_PATH, "utf-8");
    const usersArray = JSON.parse(users || "[]");
    usersArray.push(userInformation);

    fs.writeFileSync(USER_OUTPUT_FILE_PATH, JSON.stringify(usersArray, null, 2), "utf-8");

    console.log("Logged-in user information appended successfully!");
  } catch (error) {
    console.error("Error appending logged-in user:", error);
  }
}

// Main function
async function main() {
  try {
    await loginUser();
    await fetchUsersAndSaveToFile();
    await appendLoggedInUserToFile();
  } catch (error) {
    console.error("An error occurred in the main function:", error);
  }
}

// Execute the main function
main();
