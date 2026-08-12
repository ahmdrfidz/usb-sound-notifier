const { program } = require('commander');
const usbDetect = require('usb-detection');
const player = require('play-sound')(opts = {});
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawn } = require('child_process');

const configPath = path.join(os.homedir(), '.usbsound-config.json');

function getConfig() {
    if (!fs.existsSync(configPath)) return {};
    try {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {
        return {};
    }
}

// Command 1: Mode Background / Daemon
program
  .command('start')
  .description('Run USB monitor in the background')
  .action(() => {
    const config = getConfig();
    usbDetect.startMonitoring();
    console.log("USB Sound Notifier (Daemon) is running...");

    usbDetect.on('add', (device) => {
            const deviceId = `${device.vendorId}:${device.productId}`;
            let defaultSoundPath = path.join(path.dirname(process.execPath), 'sounds', 'default.mp3');
            if (!fs.existsSync(defaultSoundPath)) {
                defaultSoundPath = path.join(__dirname, '..', 'sounds', 'default.mp3');
            }
            
            const soundToPlay = config[deviceId] || defaultSoundPath;
            
            player.play(soundToPlay, (err) => {
                if (err) console.error(`[Error] Failed to play audio file: ${soundToPlay}`);
            });
        });
  });

// Command 2: Customations sounds via CLI
program
  .command('set-sound   ')
  .description('Customize sound for a specific device')
  .action((vid, pid, file_audio) => {
      const config = getConfig();
      const deviceId = `${vid}:${pid}`;
      const absoluteAudioPath = path.resolve(file_audio);

      if (!fs.existsSync(absoluteAudioPath)) {
          console.error("Audio file not found! Make sure the path is correct.");
          process.exit(1);
      }
      
      config[deviceId] = absoluteAudioPath;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      
      console.log(`Success! Sound for device [${deviceId}] has been set to:\n-> ${absoluteAudioPath}`);
  });

function runWindowsInstall() {
    try {
        console.log("Starting installation...");
        const installDir = path.join(process.env.LOCALAPPDATA, 'USBSound');
        const targetExe = path.join(installDir, 'usbsound.exe');

        // 1. Create directory
        if (!fs.existsSync(installDir)) {
            fs.mkdirSync(installDir, { recursive: true });
        }

        // 2. Copy current executable and sounds folder to install dir
        if (process.execPath !== targetExe) {
            fs.copyFileSync(process.execPath, targetExe);
            console.log(`[v] Copied executable to ${targetExe}`);
            
            const sourceSounds = path.join(path.dirname(process.execPath), 'sounds');
            const targetSounds = path.join(installDir, 'sounds');
            if (fs.existsSync(sourceSounds)) {
                fs.cpSync(sourceSounds, targetSounds, { recursive: true });
                console.log(`[v] Copied sounds folder to ${targetSounds}`);
            }
        }

        // 3. Add to Windows Startup (Registry)
        const regCommand = `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "USBSoundDaemon" /t REG_SZ /d "\\"${targetExe}\\" start" /f`;
        execSync(regCommand, { stdio: 'ignore' });
        console.log("[v] Added to Windows Startup.");

        // 4. Add to User PATH
        const psCommand = `$p = [Environment]::GetEnvironmentVariable('Path', 'User'); if($p -notlike '*${installDir}*') { [Environment]::SetEnvironmentVariable('Path', $p + ';${installDir}', 'User') }`;
        execSync(`powershell.exe -NoProfile -Command "${psCommand}"`, { stdio: 'ignore' });
        console.log("[v] Added to Environment PATH.");

        console.log("\nInstallation Complete! You can now use the 'usbsound' command everywhere.");
        console.log("Please close and reopen your terminal to apply PATH changes.");
        
        // Auto start the daemon
        console.log("Starting the daemon in the background...");
        const child = spawn(targetExe, ['start'], {
            detached: true,
            stdio: 'ignore',
            windowsHide: true
        });
        child.unref();

    } catch (error) {
        console.error("[Error] Installation failed:", error.message);
    }
}

function runLinuxInstall() {
    try {
        console.log("Starting Linux installation...");
        const installDir = path.join(os.homedir(), '.local', 'bin');
        const targetExe = path.join(installDir, 'usbsound');

        if (!fs.existsSync(installDir)) {
            fs.mkdirSync(installDir, { recursive: true });
        }

        if (process.execPath !== targetExe) {
            fs.copyFileSync(process.execPath, targetExe);
            fs.chmodSync(targetExe, '755');
            console.log(`[v] Copied executable to ${targetExe}`);
            
            const sourceSounds = path.join(path.dirname(process.execPath), 'sounds');
            const targetSounds = path.join(installDir, 'sounds');
            if (fs.existsSync(sourceSounds)) {
                fs.cpSync(sourceSounds, targetSounds, { recursive: true });
                console.log(`[v] Copied sounds folder to ${targetSounds}`);
            }
        }

        // Setup systemd user service
        const systemdDir = path.join(os.homedir(), '.config', 'systemd', 'user');
        if (!fs.existsSync(systemdDir)) {
            fs.mkdirSync(systemdDir, { recursive: true });
        }

        const servicePath = path.join(systemdDir, 'usbsound.service');
        const serviceContent = `[Unit]
Description=USB Sound Notifier

[Service]
ExecStart=${targetExe} start
Restart=always

[Install]
WantedBy=default.target
`;
        fs.writeFileSync(servicePath, serviceContent);
        console.log("[v] Created systemd user service.");

        try {
            execSync('systemctl --user daemon-reload', { stdio: 'ignore' });
            execSync('systemctl --user enable usbsound.service', { stdio: 'ignore' });
            execSync('systemctl --user start usbsound.service', { stdio: 'ignore' });
            console.log("[v] Started and enabled usbsound background service.");
        } catch (e) {
            console.log("[-] Could not start systemd service automatically. You may need to start it manually:");
            console.log(`    ${targetExe} start &`);
        }

        console.log("\nInstallation Complete! You can now use the 'usbsound' command everywhere (assuming ~/.local/bin is in your PATH).");
    } catch (error) {
        console.error("[Error] Installation failed:", error.message);
    }
}

function runLinuxUninstall() {
    try {
        console.log("Starting Linux uninstallation...");
        const installDir = path.join(os.homedir(), '.local', 'bin');
        const targetExe = path.join(installDir, 'usbsound');
        const servicePath = path.join(os.homedir(), '.config', 'systemd', 'user', 'usbsound.service');

        try {
            execSync('systemctl --user stop usbsound.service', { stdio: 'ignore' });
            execSync('systemctl --user disable usbsound.service', { stdio: 'ignore' });
            console.log("[v] Stopped and disabled systemd service.");
        } catch (e) {}

        if (fs.existsSync(servicePath)) {
            fs.unlinkSync(servicePath);
            try {
                execSync('systemctl --user daemon-reload', { stdio: 'ignore' });
            } catch (e) {}
            console.log("[v] Removed systemd service file.");
        }

        try {
            execSync('pkill -f "usbsound start"', { stdio: 'ignore' });
        } catch (e) {}

        if (fs.existsSync(targetExe) && process.execPath !== targetExe) {
            fs.unlinkSync(targetExe);
            console.log("[v] Removed executable.");
        } else if (process.execPath === targetExe) {
            console.log(`\n[!] Almost done! Please delete the executable manually:\n${targetExe}`);
        }

        console.log("\nUninstallation Complete!");
    } catch (error) {
        console.error("[Error] Uninstallation failed:", error.message);
    }
}

// Command 3: Self-Installer
program
  .command('install')
  .description('Install the application to your system (Self-installer)')
  .action(() => {
    if (os.platform() === 'win32') {
        runWindowsInstall();
    } else if (os.platform() === 'linux') {
        runLinuxInstall();
    } else {
        console.error("The 'install' command is not supported on your OS.");
    }
  });

// Command 4: Self-Uninstaller
program
  .command('uninstall')
  .description('Uninstall the application from your system')
  .action(() => {
     if (os.platform() === 'win32') {
         try {
             console.log("Starting uninstallation...");
             const installDir = path.join(process.env.LOCALAPPDATA, 'USBSound');
             
             // 1. Stop background process
             try {
                 execSync('taskkill /f /im usbsound.exe', { stdio: 'ignore' });
                 console.log("[v] Stopped background process.");
             } catch (e) {} // Ignore if not running

             // 2. Remove from Registry
             try {
                 execSync(`reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "USBSoundDaemon" /f`, { stdio: 'ignore' });
                 console.log("[v] Removed from Windows Startup.");
             } catch (e) {}

             // 3. Remove from PATH
             const psCommand = `$p = [Environment]::GetEnvironmentVariable('Path', 'User'); if($p -like '*${installDir}*') { $newPath = ($p -split ';' | Where-Object { $_ -ne '${installDir}' -and $_ -ne '' }) -join ';'; [Environment]::SetEnvironmentVariable('Path', $newPath, 'User') }`;
             execSync(`powershell.exe -NoProfile -Command "${psCommand}"`, { stdio: 'ignore' });
             console.log("[v] Removed from Environment PATH.");

             // Note: We can't delete the executable if it's currently running the uninstall command.
             if (process.execPath.includes(installDir)) {
                 console.log(`\n[!] Almost done! Please close this terminal and manually delete the folder:\n${installDir}`);
             } else {
                 if (fs.existsSync(installDir)) {
                     try {
                        fs.rmSync(installDir, { recursive: true, force: true });
                        console.log("[v] Removed installation folder.");
                     } catch(e) {
                        console.log(`[!] Could not remove folder automatically. Please delete it manually:\n${installDir}`);
                     }
                 }
             }
             
             console.log("\nUninstallation Complete!");
         } catch (error) {
             console.error("[Error] Uninstallation failed:", error.message);
         }
     } else if (os.platform() === 'linux') {
         runLinuxUninstall();
     } else {
         console.error("The 'uninstall' command is not supported on your OS.");
     }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    if (os.platform() === 'win32') {
        const installDir = path.join(process.env.LOCALAPPDATA, 'USBSound');
        const targetExe = path.join(installDir, 'usbsound.exe');
        
        // If double-clicked from outside the install directory (and not running via node)
        if (process.execPath !== targetExe && !process.execPath.toLowerCase().includes('node.exe')) {
            console.log("=========================================");
            console.log("    USB Sound Notifier - Auto Setup      ");
            console.log("=========================================\n");
            
            runWindowsInstall();
            
            console.log("\nThis window will close automatically in 5 seconds...");
            setTimeout(() => process.exit(0), 5000);
        } else {
            program.outputHelp();
        }
    } else if (os.platform() === 'linux') {
        const installDir = path.join(os.homedir(), '.local', 'bin');
        const targetExe = path.join(installDir, 'usbsound');
        
        // On Linux, you usually run from terminal, but we can offer auto-setup too.
        if (process.execPath !== targetExe && !process.execPath.includes('node')) {
            console.log("=========================================");
            console.log("    USB Sound Notifier - Auto Setup      ");
            console.log("=========================================\n");
            
            runLinuxInstall();
            
            console.log("\nThis window will close automatically in 5 seconds...");
            setTimeout(() => process.exit(0), 5000);
        } else {
            program.outputHelp();
        }
    } else {
        program.outputHelp();
    }
}