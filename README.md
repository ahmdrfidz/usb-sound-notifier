# USB Sound Notifier

A Node.js-based application (compiled to executable) that plays custom sound notifications when a USB device (like a Flash Drive, Mouse, Keyboard, etc.) is plugged into your Windows or Linux computer.

## Prerequisites

Before installing, make sure you have built (compiled) this application code into an executable file. If you are using `pkg`, make sure to run the build command first:

```bash
npm run build
```
Ensure the built files are available at the following locations:
- **Windows:** `dist\usbsound-win.exe`
- **Linux:** `dist/usbsound-linux`

---

## 🛠️ Installation Guide (Windows)

This application can install itself automatically without any extra scripts. It will add itself to Windows Startup (to run in the background) and register to the System PATH so the `usbsound` CLI command can be called from anywhere.

1. Download the `usbsound-win.exe` file.
2. **Double-click** the `.exe` file.
3. A terminal window will appear showing the setup progress. The application will copy itself to a safe location (`%LOCALAPPDATA%\USBSound`), add itself to the registry, and start the background daemon automatically.
4. The window will close by itself after 5 seconds.

*(Alternatively, you can run `usbsound-win.exe install` from the command prompt).*

### Verifying Installation
Open a new Terminal and run the following command:
```bash
usbsound --help
```
If the help menu appears, your installation was successful! The application is also currently running automatically in the background.

---

## 🐧 Installation Guide (Linux)

Just like Windows, the Linux version can install itself automatically without any `sudo` privileges.

1. Download the `usbsound-linux` binary.
2. Grant execution permission: `chmod +x usbsound-linux`
3. Simply execute it:
   ```bash
   ./usbsound-linux
   ```
4. A terminal setup will run automatically. It will copy itself to `~/.local/bin/usbsound` and set up a user-level `systemd` service so it runs automatically in the background without needing root access.

*(Alternatively, you can run `./usbsound-linux install`)*

---

## 🗑️ How to Uninstall (Remove Application)

If you want to stop using and remove this program from your computer:

### Uninstall on Windows
1. Open a terminal anywhere.
2. Run the uninstall command:
   ```bash
   usbsound uninstall
   ```
3. The uninstall process will automatically stop the running program, clean up your registry, remove the PATH variable, and instruct you to delete the remaining folder.

### Uninstall on Linux
1. Open a terminal anywhere.
2. Run the uninstall command:
   ```bash
   usbsound uninstall
   ```
3. The process will stop the background service, remove the systemd file, and instruct you to delete the remaining binary.

---

## Custom Sound Configuration
You can configure different sounds for different devices using the interactive setup menu.

1. Open a terminal anywhere.
2. Run the command:
   ```bash
   usbsound set-sound
   ```
3. The interactive UI will guide you to:
   - Enter your device's Vendor ID (VID) and Product ID (PID).
   - Select a sound file directly from the `sounds/` folder using your arrow keys.
   - Or, manually enter an absolute path to a custom audio file.

*(For more information, run the command `usbsound --help`)*
