//连接服务器
import * as ssh from 'node-ssh'
const sshClient = new ssh.NodeSSH() //初始化
async function connectServer(config){
   await sshClient.connect(config.ssh)
   console.log('连接成功')
}
export default {
    connectServer, //连接服务器
    ssh: sshClient //sshClient
}