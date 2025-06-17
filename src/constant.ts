// Constants
import path from "path";

// User credentials (For testing purposes only) TODO: Will move to environment variables
export const USERNAME = "demo@example.org";
export const PASSWORD = "test";
export const SECRET = "mys3cr3t";

// Base URL for the API
const BASE_URL_1 = "https://challenge.sunvoy.com";
const BASE_URL_2 = "https://api.challenge.sunvoy.com";
const API_URL_1 = `${BASE_URL_1}/api`;
const API_URL_2 = `${BASE_URL_2}/api`;

// Login URL
export const LOGIN_URL = `${BASE_URL_1}/login`;

// Token URL
export const TOKEN_URL = `${BASE_URL_1}/settings/tokens`;

// API Endpoints
export const USER_API_URL = `${API_URL_1}/users`;
export const SETTINGS_API_URL = `${API_URL_2}/settings`;

// Data folder path
const DATA_FOLDER = "data";
export const DATA_FOLDER_PATH = path.join(__dirname, DATA_FOLDER);

// Cookie File Path
export const COOKIE_FILE_PATH = path.join(__dirname, DATA_FOLDER, "cookies.json");

// Output folder path
const OUTPUT_FOLDER = "outputs";
export const OUTPUT_FOLDER_PATH = path.join(__dirname, OUTPUT_FOLDER);

// Output file path
export const USER_OUTPUT_FILE_PATH = path.join(__dirname, OUTPUT_FOLDER, "users.json");
