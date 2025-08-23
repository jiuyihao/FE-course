import archiver from "archiver";
import fs from "node:fs";
function compressFile(targetFile, localFile) {
  return new Promise((resolve, reject) => {
    //压缩的方式zip
    const archive = archiver("zip", {
      zlib: { level: 9 }, //1-9等级越高越厉害
    });
    //输出流
    const stream = fs.createWriteStream(localFile);
    stream.on("close", () => {
      console.log((archive.pointer() / 1024 / 1024).toFixed(2), "MB");
      resolve(true);
    });
    stream.on("error", (err) => {
      reject(err);
    });
    archive.pipe(stream); //连接一下
    archive.directory(targetFile, "dist"); //确定来源
    archive.finalize(); //压缩
  });
}
export default compressFile;
