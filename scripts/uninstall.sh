#!/bin/bash

echo "Starting USB Sound Notifier uninstallation for Linux..."

# 1. Stop background process
echo "[v] Stopping usbsound process if running..."
pkill -f "usbsound start" || true

# If using systemd, stop the service (optional)
if systemctl list-unit-files | grep -q usbsound.service 2>/dev/null; then
    sudo systemctl stop usbsound 2>/dev/null
    sudo systemctl disable usbsound 2>/dev/null
    sudo rm -f /etc/systemd/system/usbsound.service
    sudo systemctl daemon-reload
fi

# 2. Remove executable from /usr/local/bin
if [ -f "/usr/local/bin/usbsound" ]; then
    sudo rm /usr/local/bin/usbsound
    echo "[v] Executable file /usr/local/bin/usbsound removed successfully."
else
    echo "[-] File /usr/local/bin/usbsound not found."
fi

echo -e "\nUninstallation Complete! USB Sound Notifier has been removed from your Linux system."
