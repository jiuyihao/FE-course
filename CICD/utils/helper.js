import inquirer from "inquirer";
import config from "../config.js";

async function commanderLine() {
    if(process.argv.length>=3){
        return config.find((item) => item.value === process.argv[2]);

    }
  const { project } = await inquirer.prompt([
    {
      type: "list",
      name: "project", //key
      message: "请选择要部署的项目",
      choices: config,
    },
  ]);
  return config.find((item) => item.value === project); //根据命令行输入,返回目标
}
export default commanderLine;
