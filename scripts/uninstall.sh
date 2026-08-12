#!/bin/bash

echo "Starting USB Sound Notifier uninstallation for Linux..."

echo "[v] Stopping usbsound process if running..."
pkill -f "usbsound start" || true

if systemctl list-unit-files | grep -q usbsound.service 2>/dev/null; then
    sudo systemctl stop usbsound 2>/dev/null
    sudo systemctl disable usbsound 2>/dev/null
    sudo rm -f /etc/systemd/system/usbsound.service
    sudo systemctl daemon-reload
fi

if [ -f "/usr/local/bin/usbsound" ]; then
    sudo rm /usr/local/bin/usbsound
    echo "[v] Executable file /usr/local/bin/usbsound removed successfully."
else
    echo "[-] File /usr/local/bin/usbsound not found."
fi

echo -e "\nUninstallation Complete! USB Sound Notifier has been removed from your Linux system."
