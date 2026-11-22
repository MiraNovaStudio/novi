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
exec '/opt/${sanitizedProductName}/${executable}' --novi-cli "$@"
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
