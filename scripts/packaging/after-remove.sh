#!/bin/bash
# © 2025-2026 MiraNova Studio. All rights reserved.
#
# Debian postrm. electron-builder interpolates ${sanitizedProductName} at pack time.

if type update-alternatives >/dev/null 2>&1; then
    update-alternatives --remove 'novi' '/opt/${sanitizedProductName}/novi'
else
    rm -f '/usr/bin/novi'
fi

rm -f '/opt/${sanitizedProductName}/novi'

if hash gtk-update-icon-cache 2>/dev/null; then
    gtk-update-icon-cache -f -t /usr/share/icons/hicolor || true
fi
