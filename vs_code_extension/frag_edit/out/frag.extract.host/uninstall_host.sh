#!/bin/sh

set -e

if [ "$(uname -s)" = "Darwin" ]; then
  if [ "$(whoami)" = "root" ]; then
    TARGET_DIR="/Library/Google/Chrome/NativeMessagingHosts"
    TARGET_TWO_DIR="/Library/Application Support/Chromium/NativeMessagingHosts"
  else
    TARGET_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
    TARGET_TWO_DIR="$HOME/Library/Application Support/Chromium/NativeMessagingHosts"
  fi
else
  if [ "$(whoami)" = "root" ]; then
    TARGET_DIR="/etc/opt/chrome/native-messaging-hosts"
    TARGET_TWO_DIR="/etc/chromium/native-messaging-hosts"
  else
    TARGET_DIR="$HOME/.config/google-chrome/NativeMessagingHosts"
    TARGET_TWO_DIR="$HOME/.config/chromium/NativeMessagingHosts"
  fi
fi

HOST_NAME=com.frag.extract

rm "$TARGET_DIR/com.frag.extract.json"
rm "$TARGET_TWO_DIR/com.frag.extract.json"