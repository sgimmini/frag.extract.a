#!/usr/bin/env python
import json
import sys
import struct

# On Windows, the default I/O mode is O_TEXT. Set this to O_BINARY
# to avoid unwanted modifications of the input/output streams.
if sys.platform == "win32":
	import os, msvcrt
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
	with open('data.json', 'w') as outfile:
    		json.dump(recieved, outfile)
	sys.exit(0)

if __name__ == '__main__':
	Main()