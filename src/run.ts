#!/usr/bin/env node
import { init } from "./cli";

const [,, ...args] = process.argv
init(args);