import { execSync } from "node:child_process";

const backend = (process.env.BACKEND_PUBLIC_URL ?? "").replace(/\/$/, "");
const apiUrl = backend ? `${backend}/api` : "/api";

console.log(`Building frontend with VITE_API_URL=${apiUrl}`);

execSync("npm run build:vite", {
  stdio: "inherit",
  env: { ...process.env, VITE_API_URL: apiUrl },
});
