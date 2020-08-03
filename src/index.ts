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

  update_angular() {
    const cmd = 'ng update @angular/cli @angular/core';
    this.runCommend(cmd);
    this.gitAddCommit('@angular/cli @angular/core');
  }

  run_ng_update(packageName: string) {
    const cmd = 'ng update ' + packageName;
    this.runCommend(cmd);
    this.gitAddCommit('update: ' + packageName);
  }

  update_slow(dep_from_package_json: string[]) {
    dep_from_package_json.forEach((item) => {
        this.run_ng_update(item.split(':')[0]);
    });
  }

  update_fast(dep_from_package_json: string[]) {
    const packageNameList: string[] = [];
    dep_from_package_json.forEach((item) => {
      packageNameList.push(item.split(':')[0]);
    });
    const packageNameLine = packageNameList.join(' ');
    this.run_ng_update(packageNameLine);
  }

  npm_audit_fix() {
    console.log('run npm fix audit');
    const cmd = 'npm audit fix';
    this.runCommend(cmd);
    this.gitAddCommit('npm audit fix');
  }

  update_all() {
    this.update_angular();
    this.update_group(this.dependencies);
    this.update_group(this.devDependencies);
    this.npm_audit_fix();
  }

  update_group(dep_from_package_json: string[]) {
    try {
      console.log('try');
      this.update_fast(dep_from_package_json);
    } catch (error) {
      console.log('fallback');
      this.update_slow(dep_from_package_json);
    }
  }

  load_package_json(path = '') {
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
//             update_group(dependencies)
//         elif(arg == 'all' or arg == 'updateall'):
//             dependencies = package_json['dependencies']
//             dev_dependencies = package_json['devDependencies']
//             update_all()
//         elif(arg == 'dev' or arg == 'save-dev' or arg == 'devdependencies'):
//             dev_dependencies = package_json['devDependencies']
//             update_group(dev_dependencies)
//         else:
//             help_output()

// ### main ####

// function main():
//     global seperator
//     seperator = " "
//     handle_input(sys.argv[1:])

// if __name__ == "__main__":
//     main()
