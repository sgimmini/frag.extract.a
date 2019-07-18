#!/bin/sh

set -e

DIR="$( cd "$( dirname "$0" )" && pwd )"
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

HOST_NAME=extract.py

# Create directory to store native messaging host.
mkdir -p "$TARGET_DIR"
mkdir -p "$TARGET_TWO_DIR"

# Copy native messaging host manifest.
cp "$DIR/com.frag.extract.json" "$TARGET_DIR"
cp "$DIR/com.frag.extract.json" "$TARGET_TWO_DIR"

# Update host path in the manifest.
HOST_PATH=$DIR/extract.py
ESCAPED_HOST_PATH=${HOST_PATH////\\/}
sed -i -e "s/HOST_PATH/$ESCAPED_HOST_PATH/" "$TARGET_DIR/com.frag.extract.json"
sed -i -e "s/HOST_PATH/$ESCAPED_HOST_PATH/" "$TARGET_TWO_DIR/com.frag.extract.json"

# Set permissions for the manifest so that all users can read it.
chmod o+r "$TARGET_DIR/com.frag.extract.json"
chmod o+r "$TARGET_TWO_DIR/com.frag.extract.json"
