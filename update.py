import json
import os
import sys

def gitAddCommit(packageName):
    cmdAdd = 'git add .'
    os.system(cmdAdd)
    cmdCommit = 'git commit -m "' + packageName + '"'
    os.system(cmdCommit)


def updateAngular():
    cmd = 'ng update @angular/cli @angular/core'
    os.system(cmd)
    gitAddCommit('@angular/cli @angular/core')

def runNgUpdate(packageName):
    cmd = 'ng update ' + packageName
    os.system(cmd)
    gitAddCommit('update: '+packageName)

def updateSlow(depFromPackageJson):
    for line in depFromPackageJson:
        packageName = line.split(':')[0]
        runNgUpdate(packageName)

def updateFast(depFromPackageJson):
    packageNameLine = seperator.join(depFromPackageJson)
    runNgUpdate(packageNameLine)

def npmAuditFix():
    print('run npm fix audit')
    cmd = 'npm audit fix'
    os.system(cmd)
    gitAddCommit('npm audit fix')


def updateAll():
    updateAngular()
    updateGroup(dependencies)
    updateGroup(devDependencies)
    npmAuditFix()


def updateGroup(depFromPackageJson):
    try:
        print("try")
        updateFast(depFromPackageJson)
    except:
        print("fallback")
        updateSlow(depFromPackageJson)


def load_package_json(path=''):
    with open('package.json') as f:
        packageJson = json.load(f)
    return packageJson

#### input handling ###


def help_output():
    print("update all: all | updataall")
    print("update Dependencies: dep | dependencies")


def handle_input(argv):
    if(len(argv) == 0):
        help_output()
        return
    for arg in argv:
        arg = arg.lower()
        switch(arg) {
            case 'dep' or 'dependencies': 
                updateGroup(dependencies)
                break
            case 'all' or 'updateall':
                updateAll()
        }
        print(arg)
        if(arg == 'dep' or arg == 'dependencies'):
            updateGroup(dependencies)
        if(arg)

### main ####


def main():
    global seperator
    global packageJson
    global dependencies
    global devDependencies
    seperator = " "
    packageJson = load_package_json()
    dependencies = packageJson['dependencies']
    devDependencies = packageJson['devDependencies']

    handle_input(sys.argv[1:])


if __name__ == "__main__":
    main()
