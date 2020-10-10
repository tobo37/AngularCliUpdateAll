import { exec } from 'child_process';
import Listr from 'listr';
import { updateOptions } from './cli';
import * as fs from 'fs';

export class AngularUdpater {
  dependencies: string[] = [];
  devDependencies: string[] = [];
  tasks = new Listr();
  options: updateOptions;

  constructor(options: updateOptions){
    this.options = options;
  }

  async init(){
    await this.loadPackageJson();
  }

  addOptions(options: updateOptions){
    this.options = options;
  }

  async exec(){
    this.prepareTasks();
    if(this.dependencies.length === 0 && this.devDependencies.length === 0){
      await this.loadPackageJson();
    }
    await this.tasks.run();
  }

  private prepareTasks(){
    this.tasks.add({title: "update Angular", task: () => this.updateAngular(), enabled: () => this.options.all});
    this.tasks.add({title: "update bla", task: () => this.updateGroup(this.dependencies), enabled: () => this.options.all || this.options.dependencies});
    this.tasks.add({title: "update dev", task: () => this.updateGroup(this.devDependencies), enabled: () => this.options.all || this.options.devDependencies});
    this.tasks.add({title: "npm fix packages", task: () => this.npmAuditFix(), enabled: () => !this.options.skipFix});
  }

  private runCommend(commend: string) {
    const runGitAdd = exec(commend, (error: any, stdout: string, stderr: string) => {
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

  private gitAddCommit(packageName: string) {
    const gitAddCommend = 'git add .';
    this.runCommend(gitAddCommend);
    const cmdCommend = 'git commit -m "' + packageName + '"';
    this.runCommend(cmdCommend);
  }

  private updateAngular() {
    const cmd = 'ng update @angular/cli @angular/core';
    this.runCommend(cmd);
    this.gitAddCommit('@angular/cli @angular/core');
  }

  private runNgUpdate(packageName: string) {
    const cmd = 'ng update ' + packageName;
    this.runCommend(cmd);
    this.gitAddCommit('update: ' + packageName);
  }

  private updateSlow(depFromPackageJson: string[]) {
    depFromPackageJson.forEach((item) => {
        this.runNgUpdate(item.split(':')[0]);
    });
  }

  private updateFast(depFromPackageJson: string[]) {
    const packageNameList: string[] = [];
    depFromPackageJson.forEach((item) => {
      packageNameList.push(item.split(':')[0]);
    });
    const packageNameLine = packageNameList.join(' ');
    this.runNgUpdate(packageNameLine);
  }

  private npmAuditFix() {
    console.log('run npm fix audit');
    const cmd = 'npm audit fix';
    this.runCommend(cmd);
    this.gitAddCommit('npm audit fix');
  }

  private updateAll() {
    this.updateAngular();
    this.updateGroup(this.dependencies);
    this.updateGroup(this.devDependencies);
    this.npmAuditFix();
  }

  private updateGroup(depFromPackageJson: string[]) {
    try {
      console.log('try');
      this.updateFast(depFromPackageJson);
    } catch (error) {
      console.log('fallback');
      this.updateSlow(depFromPackageJson);
    }
  }
  
  loadPackageJson(path?: string) {
    const json = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    console.log(json);
    this.dependencies = [];
    this.devDependencies = [];
    Object.keys(json.dependencies).forEach((element: string)=> {
      this.dependencies.push(element);
    });
    Object.keys(json.devDependencies).forEach((element: string)=> {
      this.devDependencies.push(element);
    });
  }
}