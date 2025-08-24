import { execSync } from "child_process";
const build = (path) => {
  execSync("pnpm run build", {
    stdio: "inherit",
    cwd: path,
  });
};
export default build;
