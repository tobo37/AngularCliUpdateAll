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
    print("update Dependencies: dep | save | dependencies")
    print("update devDependencies: dev | save-dev | devDependencies")


def handle_input(argv):
    if(len(argv) == 0):
        help_output()
        return
    for arg in argv:
        arg = arg.lower()
        if(arg == 'dep' or arg == 'save' or arg == 'dependencies'):
            updateGroup(dependencies)
        elif(arg == 'all' or arg == 'updateall'):
            updateAll()
        elif(arg == 'dev' or arg == 'save-dev' or arg == 'devdependencies'):
            updateGroup(devDependencies)
        else:
            help_output()

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
