//执行服务器的命令
async function handleCommand(ssh,command,path){
    await ssh.execCommand(command, {
        cwd: path,
    })
    console.log('执行成功')
}

export default handleCommand;