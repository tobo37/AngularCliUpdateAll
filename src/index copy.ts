// import { exec } from 'child_process';
// import * as request from "request-promise-native";
// export class AngularUdpater {
//   dependencies: string[] = [];
//   devDependencies: string[] = [];
//   packageJson = this.loadPackageJson();

//   runCommend(commend: string) {
//     const runGitAdd = exec(commend, (error: any, stdout: string, stderr: string) => {
//       if (error) {
//         // console.log(error.stack);
//         // console.log('Error code: ' + error.code);
//         // console.log('Signal received: ' + error.signal);
//       }
//       // console.log('Child Process STDOUT: ' + stdout);
//       // console.log('Child Process STDERR: ' + stderr);
//     });
//     runGitAdd.on('exit', () => {
//       // console.log('added to commit');
//     });
//   }

//   gitAddCommit(packageName: string) {
//     const gitAddCommend = 'git add .';
//     this.runCommend(gitAddCommend);
//     const cmdCommend = 'git commit -m "' + packageName + '"';
//     this.runCommend(cmdCommend);
//   }

//   updateAngular() {
//     const cmd = 'ng update @angular/cli @angular/core';
//     this.runCommend(cmd);
//     this.gitAddCommit('@angular/cli @angular/core');
//   }

//   runNgUpdate(packageName: string) {
//     const cmd = 'ng update ' + packageName;
//     this.runCommend(cmd);
//     this.gitAddCommit('update: ' + packageName);
//   }

//   updateSlow(depFromPackageJson: string[]) {
//     depFromPackageJson.forEach((item) => {
//         this.runNgUpdate(item.split(':')[0]);
//     });
//   }

//   updateFast(depFromPackageJson: string[]) {
//     const packageNameList: string[] = [];
//     depFromPackageJson.forEach((item) => {
//       packageNameList.push(item.split(':')[0]);
//     });
//     const packageNameLine = packageNameList.join(' ');
//     this.runNgUpdate(packageNameLine);
//   }

//   npmAuditFix() {
//     const cmd = 'npm audit fix';
//     this.runCommend(cmd);
//     this.gitAddCommit('npm audit fix');
//   }

//   updateAll() {
//     this.updateAngular();
//     this.updateGroup(this.dependencies);
//     this.updateGroup(this.devDependencies);
//     this.npmAuditFix();
//   }

//   updateGroup(depFromPackageJson: string[]) {
//     try {
//       this.updateFast(depFromPackageJson);
//     } catch (error) {
//       this.updateSlow(depFromPackageJson);
//     }
//   }

//   async loadPackageJson(path = './') {
//     const options = {
//         uri: path + 'package.json'
//     };

//     const result = await request.get(options);
//     // return require(path + 'package.json');
//     const json = require(path + 'package.json');
//     return json;
//   }
// }
