import { updateOptions } from '../../lib/cli.js';
import {AngularUdpater} from '../../lib/index.js';

test('run load packageJson', () => {
    const updateOps: updateOptions = {dependencies: false, all: true, devDependencies: false, remaining: '', skipFix: false};

    const au = new AngularUdpater(updateOps);
    au.loadPackageJson();
})