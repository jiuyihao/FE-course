async function uploadFile(ssh,config,local){
    await ssh.putFile(local,config.deployDir + config.releaseDir)
    console.log('上传成功')
}
export default uploadFile;