import { execSync } from 'child_process';
import Listr from 'listr';
import { UpdateOptions } from './cli';
import * as fs from 'fs';

export class AngularUdpater {
  dependencies: string[] = [];
  devDependencies: string[] = [];
  tasks = new Listr();
  options: UpdateOptions;

  constructor(options: UpdateOptions){
    this.options = options;
  }

  init(){
    this.loadPackageJson();
  }

  addOptions(options: UpdateOptions){
    this.options = options;
  }

  async exec(){
    this.prepareTasks();
    if(this.dependencies.length === 0 && this.devDependencies.length === 0){
      this.loadPackageJson();
    }
    await this.tasks.run();
  }

  private prepareTasks(){
    this.tasks.add({title: "update Angular", task: async () => this.updateAngular(), skip: () => !this.options.all});
    this.tasks.add({title: "update dependencies", task: () => this.updateGroup(this.dependencies), skip: () => !this.options.all && !this.options.dependencies});
    this.tasks.add({title: "update devDependencies", task: () => this.updateGroup(this.devDependencies), skip: () => !this.options.all && !this.options.devDependencies});
    this.tasks.add({title: "npm fix packages", task: () => this.npmAuditFix(), skip: () => this.options.skipFix});
  }

  private runCommend(commend: string) {
    execSync(commend);
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
    try {
      this.runCommend(cmd);
      this.gitAddCommit('update: ' + packageName);
      return true;
    } catch (error) {
      return false;
    }
    
  }

  private updateSlow(depFromPackageJson: string[]) {
    depFromPackageJson.forEach(item => {
        this.runNgUpdate(item);
    });
  }

  private updateFast(depFromPackageJson: string[]) {
    const packageNameLine = depFromPackageJson.join(' ');
    return this.runNgUpdate(packageNameLine);
  }

  private npmAuditFix() {
    const cmd = 'npm audit fix';
    this.runCommend(cmd);
    this.gitAddCommit('npm audit fix');
  }

  private updateGroup(depFromPackageJson: string[]) {
    if(!this.updateFast(depFromPackageJson)){
      this.updateSlow(depFromPackageJson);
    }
  }
  
  loadPackageJson() {
    const json = JSON.parse(fs.readFileSync('package.json', 'utf8'))
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