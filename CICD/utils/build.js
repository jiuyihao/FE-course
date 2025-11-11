import { execSync } from "child_process";
const build = (path) => {
  execSync("npm run build", {
    stdio: "inherit",
    cwd: path,
  });
};
export default build;
