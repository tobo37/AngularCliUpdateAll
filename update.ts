// # https://github.com/tobo37/AngularCliUpdateAll

// import json
// import os
// import sys

// def git_add_commit(package_name):
//     cmd_add = 'git add .'
//     os.system(cmd_add)
//     cmd_commit = 'git commit -m "' + package_name + '"'
//     os.system(cmd_commit)


// def update_angular():
//     cmd = 'ng update @angular/cli @angular/core'
//     os.system(cmd)
//     git_add_commit('@angular/cli @angular/core')

// def run_ng_update(package_name):
//     cmd = 'ng update ' + package_name
//     os.system(cmd)
//     git_add_commit('update: '+package_name)

// def update_slow(dep_from_package_json):
//     for line in dep_from_package_json:
//         package_name = line.split(':')[0]
//         run_ng_update(package_name)

// def update_fast(dep_from_package_json):
//     package_name_line = seperator.join(dep_from_package_json)
//     run_ng_update(package_name_line)

// def npm_audit_fix():
//     print('run npm fix audit')
//     cmd = 'npm audit fix'
//     os.system(cmd)
//     git_add_commit('npm audit fix')


// def update_all():
//     update_angular()
//     update_group(dependencies)
//     update_group(dev_dependencies)
//     npm_audit_fix()


// def update_group(dep_from_package_json):
//     try:
//         print("try")
//         update_fast(dep_from_package_json)
//     except:
//         print("fallback")
//         update_slow(dep_from_package_json)


// def load_package_json(path=''):
//     with open('package.json') as f:
//         package_json = json.load(f)
//     return package_json

// #### input handling ###


// def help_output():
//     print("update all: all | updataall")
//     print("update Dependencies: dep | save | dependencies")
//     print("update devDependencies: dev | save-dev | devDependencies")


// def handle_input(argv):
//     if(len(argv) == 0):
//         help_output()
//         return
//     for arg in argv:
//         arg = arg.lower()
//         global dependencies
//         global dev_dependencies
//         package_json = load_package_json()
        
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


// def main():
//     global seperator
//     seperator = " "
//     handle_input(sys.argv[1:])


// if __name__ == "__main__":
//     main()
