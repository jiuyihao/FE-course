import build from "./utils/build.js";
import compressFile from "./utils/compressFile.js";
import handleCommand from "./utils/handleCommand.js";
import commanderLine from "./utils/helper.js";
import server from "./utils/ssh.js";
import uploadFile from "./utils/uploadFile.js";
import path from "node:path";


const main = async () => {
    const config = await commanderLine();
    const local = path.resolve(process.cwd(), config.targetFile)
    // build(config.targetDir)

    await compressFile(config.targetDir, local)
    await server.connectServer(config)
    await handleCommand(server.ssh, `rm -rf ${config.releaseDir}`, config.deployDir) //删除web
    await uploadFile(server.ssh, config, local)
    await handleCommand(server.ssh, `unzip ${config.releaseDir}`, config.deployDir) //解压
    await handleCommand(server.ssh, `rm -rf ${config.releaseDir}`, config.deployDir) //删除web
    await handleCommand(server.ssh, `mv dist ${config.releaseDir}`, config.deployDir) //把dist 改名成 web
    await server.ssh.dispose() //释放连接
    console.log('部署成功')
}
main()