import { execSync } from 'child_process';
const build = (path) => {
    execSync('npm run build', {
        stdio: 'inherit', //输出日志
        cwd: path, //当前工作目录
    });
}
export default build;