#!/usr/bin/env python3
import random
import string
import sqlite3
import struct
import sys
import json

# On Windows, the default I/O mode is O_TEXT. Set this to O_BINARY
# to avoid unwanted modifications of the input/output streams.
if sys.platform == "win32":
    import os
    import msvcrt
    msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)
    msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)


# from https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging
def get_message():
    raw_length = sys.stdin.buffer.read(4)
    if len(raw_length) == 0:
        sys.exit(0)
    message_length = struct.unpack("@I", raw_length)[0]
    message = sys.stdin.buffer.read(message_length).decode("utf-8")
    return json.loads(message)


def Main():
    recieved = get_message()

    conn = sqlite3.connect("path")
    c = conn.cursor()
    # in database.ts table is created with 'char' as type instead of 'TEXT', don't know if that makes a difference
    c.execute("CREATE TABLE IF NOT EXISTS fragments (label TEXT PRIMARY KEY, prefix TEXT, scope TEXT, body TEXT, description TEXT, keywords TEXT, tags TEXT, domain TEXT, placeholders TEXT, snippet TEXT)")

    if recieved['label'] == "":
        recieved['label'] = ''.join(
            random.choices(string.ascii_uppercase, k=6))

    label = recieved['label'][:]
    snippet = {'label': recieved['label'], 'prefix': recieved['prefix'],
               'scope': recieved['scope'], 'body': recieved['body'], 'description': recieved['description']}

    counter = 2
    while True:
        try:
            c.executemany("INSERT INTO fragments VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [(recieved['label'], recieved['prefix'], recieved['scope'], recieved['body'], recieved[
                          'description'], "", recieved['tags'], recieved['domain'], "", json.dumps(snippet, separators=(',', ':'))), ])
            break
        except sqlite3.IntegrityError:
            recieved['label'] = label + ' (' + str(counter) + ')'
            snippet['label'] = recieved['label']
            counter += 1

    conn.commit()
    conn.close()
    sys.exit(0)


if __name__ == '__main__':
    Main()
