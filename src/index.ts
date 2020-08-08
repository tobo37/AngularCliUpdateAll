const { exec } = require('child_process');

export class AngularUdpater {
  dependencies: string[] = [];
  devDependencies: string[] = [];
  packageJson = this.load_package_json();
  constructor() {}

  runCommend(commend: string) {
    const runGitAdd = exec(commend, function (error: any, stdout: string, stderr: string) {
      if (error) {
        console.log(error.stack);
        console.log('Error code: ' + error.code);
        console.log('Signal received: ' + error.signal);
      }
      console.log('Child Process STDOUT: ' + stdout);
      console.log('Child Process STDERR: ' + stderr);
    });
    runGitAdd.on('exit', () => {
      console.log('added to commit');
    });
  }

  gitAddCommit(packageName: string) {
    const gitAddCommend = 'git add .';
    this.runCommend(gitAddCommend);
    const cmdCommend = 'git commit -m "' + packageName + '"';
    this.runCommend(cmdCommend);
  }

  updateAngular() {
    const cmd = 'ng update @angular/cli @angular/core';
    this.runCommend(cmd);
    this.gitAddCommit('@angular/cli @angular/core');
  }

  runNgUpdate(packageName: string) {
    const cmd = 'ng update ' + packageName;
    this.runCommend(cmd);
    this.gitAddCommit('update: ' + packageName);
  }

  updateSlow(depFromPackageJson: string[]) {
    depFromPackageJson.forEach((item) => {
        this.runNgUpdate(item.split(':')[0]);
    });
  }

  updateFast(depFromPackageJson: string[]) {
    const packageNameList: string[] = [];
    depFromPackageJson.forEach((item) => {
      packageNameList.push(item.split(':')[0]);
    });
    const packageNameLine = packageNameList.join(' ');
    this.runNgUpdate(packageNameLine);
  }

  npmAuditFix() {
    console.log('run npm fix audit');
    const cmd = 'npm audit fix';
    this.runCommend(cmd);
    this.gitAddCommit('npm audit fix');
  }

  updateAll() {
    this.updateAngular();
    this.updateGroup(this.dependencies);
    this.updateGroup(this.devDependencies);
    this.npmAuditFix();
  }

  updateGroup(depFromPackageJson: string[]) {
    try {
      console.log('try');
      this.updateFast(depFromPackageJson);
    } catch (error) {
      console.log('fallback');
      this.updateSlow(depFromPackageJson);
    }
  }

  load_package_json(path = './') {
    // return require(path + 'package.json');
    const json = require(path + 'package.json');
    json.forEach((element: string) => {
      console.log(element);
    });
  }
}

// #### input handling ###

// function help_output(){
//     console.log("update all: all | updataall")
//     console.log("update Dependencies: dep | save | dependencies")
//     console.log("update devDependencies: dev | save-dev | devDependencies")
// }

// function handle_input(argv){

// }
//     if(len(argv) == 0):
//         help_output()
//         return
//     for arg in argv:
//         arg = arg.lower()

//         if(arg == 'dep' or arg == 'save' or arg == 'dependencies'):
//             updateGroup(dependencies)
//         elif(arg == 'all' or arg == 'updateall'):
//             dependencies = package_json['dependencies']
//             dev_dependencies = package_json['devDependencies']
//             updateAll()
//         elif(arg == 'dev' or arg == 'save-dev' or arg == 'devdependencies'):
//             dev_dependencies = package_json['devDependencies']
//             updateGroup(dev_dependencies)
//         else:
//             help_output()

// ### main ####

// function main():
//     global seperator
//     seperator = " "
//     handle_input(sys.argv[1:])

// if __name__ == "__main__":
//     main()
