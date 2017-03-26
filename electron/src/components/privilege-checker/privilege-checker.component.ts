import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/ignoreElements';
import 'rxjs/add/operator/takeWhile';

import { remote } from 'electron';
import * as path from 'path';
import * as sudo from 'sudo-prompt';
import * as os from 'os';

import { UhkDeviceService } from './../../services/uhk-device.service';

@Component({
    selector: 'privilege-checker',
    templateUrl: 'privilege-checker.component.html',
    styleUrls: ['privilege-checker.component.scss']
})
export class PrivilegeCheckerComponent {

    constructor(private router: Router, private uhkDevice: UhkDeviceService, private ngZone: NgZone) {
        uhkDevice.isConnected()
            .distinctUntilChanged()
            .takeWhile(connected => connected)
            .ignoreElements()
            .subscribe({
                complete: () => {
                    router.navigate(['/detection']);
                }
            });
        uhkDevice.isInitialized()
            .distinctUntilChanged()
            .takeWhile(initialized => !initialized)
            .ignoreElements()
            .subscribe({
                complete: () => {
                    router.navigate(['/']);
                }
            });
    }

    setUpPermissions(): void {
        let permissionSetter: Observable<void>;
        switch (process.platform) {
            case 'linux':
                permissionSetter = this.setUpPermissionsOnLinux();
                break;
            case 'win32':
                permissionSetter = this.setUpPermissionsOnWindows();
                break;
            default:
                permissionSetter = Observable.throw('Permissions couldn\'t be set. Invalid platform: ' + process.platform);
                break;
        }
        permissionSetter.subscribe({
            error: e => console.error(e),
            complete: () => {
                console.log('Permissions has been successfully set');
                this.uhkDevice.initialize();
                this.router.navigate(['/']);
            }
        });
    }

    private setUpPermissionsOnLinux(): Observable<void> {
        const subject = new ReplaySubject<void>();
        const rootDir = path.resolve(path.join(remote.process.cwd(), remote.process.argv[1]), '..');
        const scriptPath = path.resolve(rootDir, 'rules/setup-rules.sh');
        const options = {
            name: 'Setting UHK access rules'
        };
        sudo.exec(`sh ${scriptPath}`, options, (error: any) => {
            if (error) {
                subject.error(error);
            } else {
                subject.complete();
            }
        });

        return subject.asObservable();
    }

    private setUpPermissionsOnWindows(): Observable<void> {
        const subject = new ReplaySubject<void>();
        const rootDir = path.resolve(path.join(remote.process.cwd(), remote.process.argv[1]), '..');
        const platform = os.arch();
        const installer = path.resolve(rootDir, `driver/UHKDriverInstaller${platform}.exe`);
        const options = {
            name: 'Installing UHK driver'
        };
        sudo.exec(installer, options, (error: any, stdout: any, stderr: any) => {
            this.ngZone.run(() => {
                if (error) {
                    console.error(stderr);
                    subject.error(error);
                } else {
                    console.debug(stdout);
                    subject.complete();
                }
            });
        });

        return subject.asObservable();
    }

}
