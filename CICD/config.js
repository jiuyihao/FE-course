const config = [
  {
    name: "项目-A",
    value: "1", //这个值需要唯一 inquirer 会根据这个值来选择
    ssh: {
      host: "123.57.155.100", //远程服务器地址
      port: 22, //远程服务器端口 ssh默认的端口
      username: "root", //远程服务器用户名
      password: "@qaz796218", //远程服务器密码
    },
    // targetDir:'C:/Users/yihao/Desktop/vite-project/dist', //本地文件路径
    targetDir:
      "'/Users/yihaoji/Documents/React course/FE-course/在线代码编辑器/dist'", //本地文件路径
    targetFile: "dist.zip", //本地文件名
    deployDir: "/home/cicd/", //远程服务器部署路径
    releaseDir: "web", //dist会解压成web
  },
  {
    name: "项目-B",
    value: "2", //这个值需要唯一 inquirer 会根据这个值来选择
  },
];
export default config;
