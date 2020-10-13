import { execSync } from 'child_process';
import Listr from 'listr';
import { UpdateOptions } from './cli';
import * as fs from 'fs';
import chalk from 'chalk';

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
    this.tasks.add({title: "update Angular", task: async () => await this.updateAngular(), enabled: () => this.options.all});
    this.tasks.add({title: "update bla", task: () => this.updateGroup(this.dependencies), enabled: () => this.options.all || this.options.dependencies});
    this.tasks.add({title: "update dev", task: () => this.updateGroup(this.devDependencies), enabled: () => this.options.all || this.options.devDependencies});
    this.tasks.add({title: "npm fix packages", task: () => this.npmAuditFix(), enabled: () => !this.options.skipFix});
  }

  private runCommend(commend: string) {
    try {
      console.log("run next: " + commend);
      execSync(commend);
      return true;
    } catch (error) {
      console.log(chalk.yellow(error));
      return false;
    }
    
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
      this.updateFast(depFromPackageJson);
    } catch (error) {
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