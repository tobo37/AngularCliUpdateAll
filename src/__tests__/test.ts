import {AngularUdpater} from '../index'

test('run load packageJson', () => {
    const au = new AngularUdpater();
    au.loadPackageJson('../../');
})