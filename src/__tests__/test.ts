import { UpdateOptions } from '../../lib/cli.js';
import {AngularUdpater} from '../../lib/index.js';

test('run load packageJson', () => {
    const updateOps: UpdateOptions = {dependencies: false, all: true, devDependencies: false, remaining: '', skipFix: false};

    const au = new AngularUdpater(updateOps);
    au.loadPackageJson();
})