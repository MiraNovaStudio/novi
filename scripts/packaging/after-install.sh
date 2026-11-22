#!/bin/bash
# © 2025-2026 MiraNova Studio. All rights reserved.
#
# Debian postinst. electron-builder interpolates ${executable} and
# ${sanitizedProductName} at pack time (NoviEditor / Novi). This file
# replaces the stock after-install.tpl entirely.

# CLI wrapper: `novi` is not the Electron binary. The binary stays
# ${executable}; this script is the user-facing entry point.
cat > '/opt/${sanitizedProductName}/novi' << 'EOF'
#!/bin/sh
APP='/opt/${sanitizedProductName}/${executable}'
SOCK="$HOME/.novi/novi-editor.sock"
# Set before exec so a terminal launch is tied to the same desktop file
# GNOME uses for Show Apps. Chromium would otherwise look for a lowercased
# desktop filename and miss NoviEditor.desktop.
export CHROME_DESKTOP='${executable}.desktop'

# A socket file can outlive a crashed editor. Only hand off when something
# is actually listening; otherwise start the window in its own session.
# Do not exec --novi-cli for a cold start: that path used to spawn a second
# Electron and exit, and the exit took the window with it.
if [ -S "$SOCK" ] && command -v python3 >/dev/null 2>&1 && python3 -c 'import socket,sys
s=socket.socket(socket.AF_UNIX)
s.settimeout(0.3)
try:
    s.connect(sys.argv[1])
except Exception:
    sys.exit(1)
s.close()
' "$SOCK"; then
  exec "$APP" --novi-cli "$@"
fi

mkdir -p "$HOME/.novi"
if command -v setsid >/dev/null 2>&1; then
  nohup setsid "$APP" --novi-direct "$@" >>"$HOME/.novi/launch.log" 2>&1 &
else
  nohup "$APP" --novi-direct "$@" >>"$HOME/.novi/launch.log" 2>&1 &
fi
EOF
chmod +x '/opt/${sanitizedProductName}/novi'

if type update-alternatives 2>/dev/null >&1; then
    # Drop a leftover plain symlink so update-alternatives can own /usr/bin/novi.
    if [ -L '/usr/bin/novi' -a -e '/usr/bin/novi' -a "`readlink '/usr/bin/novi'`" != '/etc/alternatives/novi' ]; then
        rm -f '/usr/bin/novi'
    fi
    update-alternatives --install '/usr/bin/novi' 'novi' '/opt/${sanitizedProductName}/novi' 100 || ln -sf '/opt/${sanitizedProductName}/novi' '/usr/bin/novi'
else
    ln -sf '/opt/${sanitizedProductName}/novi' '/usr/bin/novi'
fi

# SUID chrome-sandbox for Electron 5+
chmod 4755 '/opt/${sanitizedProductName}/chrome-sandbox' || true

if hash update-mime-database 2>/dev/null; then
    update-mime-database /usr/share/mime || true
fi

if hash update-desktop-database 2>/dev/null; then
    update-desktop-database /usr/share/applications || true
fi

if hash gtk-update-icon-cache 2>/dev/null; then
    gtk-update-icon-cache -f -t /usr/share/icons/hicolor || true
fi
