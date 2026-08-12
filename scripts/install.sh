#!/bin/bash
echo "Installing USB Sound Notifier..."
sudo cp dist/usbsound-linux /usr/local/bin/usbsound
sudo chmod +x /usr/local/bin/usbsound
echo "Installation Complete! You can now run 'usbsound start' in the background."