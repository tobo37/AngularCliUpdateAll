import json
import os

with open('package.json') as f:
    d = json.load(f)

def gitAddCommit(packageName):
    print('git add / commit: ' + packageName)
    cmdAdd = 'git add .'
    os.system(cmdAdd)
    cmdCommit = 'git commit -m "' + packageName + '"'
    os.system(cmdCommit)

def updateAngular():
    print('next update @angular/cli @angular/core')
    cmd = 'ng update @angular/cli @angular/core'
    os.system(cmd)
    gitAddCommit('@angular/cli @angular/core')

def updateDependencies():
    for line in d['dependencies']:
        packageName = line.split(':')[0]
        cmd = 'ng update ' + packageName
        print('next update: ' + packageName)
        os.system(cmd)
        gitAddCommit('update: '+packageName)

def updateDependenciesFast():
    print('next update Dependencies fast')
    lines = ''
    for line in d['dependencies']:
        lines.join(line.split(':')[0], ' ')
    cmd = 'ng update ' + lines
    os.system(cmd)
    gitAddCommit(lines)

def updateDevDependencies():
    for line in d['devDependencies']:
        packageName = line.split(':')[0]
        cmd = 'ng update ' + packageName
        print('next update: ' + packageName)
        os.system(cmd)
        gitAddCommit('update: '+packageName)

def updateDevDependenciesFast():
    print('next update DevDependencies fast')
    lines = ''
    for line in d['devDependencies']:
        lines.join(line.split(':')[0], ' ')
    cmd = 'ng update ' + lines
    os.system(cmd)
    gitAddCommit(lines)

def npmAuditFix():
    print('run npm fix audit')
    cmd = 'npm audit fix'
    os.system(cmd)
    gitAddCommit('npm audit fix')

def updateAll():
    updateAngular()
    try:
      updateDependenciesFast()
    except:
      updateDependencies()
    try:
      updateDevDependenciesFast()
    except:
      updateDevDependencies()
    npmAuditFix()
updateAll()
