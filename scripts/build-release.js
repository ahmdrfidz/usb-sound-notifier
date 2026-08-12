const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const releaseDir = path.join(rootDir, 'release');

console.log('Preparing release folders...');

try {
    if (!fs.existsSync(path.join(rootDir, 'dist'))) {
        console.log('Running npm run build...');
        execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
    }
} catch (e) {
    console.error('Failed to build.');
    process.exit(1);
}

if (fs.existsSync(releaseDir)) {
    fs.rmSync(releaseDir, { recursive: true, force: true });
}
fs.mkdirSync(releaseDir);

const platforms = [
    { name: 'windows', exe: 'usbsound-win.exe' },
    { name: 'linux', exe: 'usbsound-linux' }
];

platforms.forEach(platform => {
    const platformDir = path.join(releaseDir, `USB_Sound_Notifier_${platform.name}`);
    fs.mkdirSync(platformDir);
    
    const exeSource = path.join(rootDir, 'dist', platform.exe);
    if (fs.existsSync(exeSource)) {
        fs.copyFileSync(exeSource, path.join(platformDir, platform.exe));
    }
    
    const soundsSource = path.join(rootDir, 'sounds');
    if (fs.existsSync(soundsSource)) {
        fs.cpSync(soundsSource, path.join(platformDir, 'sounds'), { recursive: true });
    }
    
    const readmeSource = path.join(rootDir, 'README.md');
    if (fs.existsSync(readmeSource)) {
        fs.copyFileSync(readmeSource, path.join(platformDir, 'README.md'));
    }
    
    console.log(`[v] Prepared release for ${platform.name} -> ${platformDir}`);
});

console.log('\nSuccess! Now you can zip the folders inside "release/" and give them to your users.');
