# frag.extract.a

this still needs to be done

fragment extractor for StackOverflow.
A tool to extract code-fragments from StackOverflow into a Visual Studio Code Extension (link to other groups project).
Extension is aviable for Chrome (chromium) on Windows and Linux.
Fragments contain (was die halt brauchen) which are automatically parsed from a question thread on StackOverflow by best
match. "Best match" is determined through a neuronal network trained to
find the right code fragment to a so called "intention". Another way
to get a desired fragment is to click the associated button in the code block.
Fragments get sent to the VSC-extension by a native messenging host installed
through installing the VSC-extension itself. The chrome-extension on its own has
no use.
### Two ways to get a fragment:
1. Automatically while browsing on website.
   Our model finds the right code frament
   and parses the code fragment into the extension. To send it to the database only
   a label is missing, which is chosen by the user in order to prevent mislabeled fragments.

2. Manually by clicking ''Add to fragment''.
   Every answer-code block on any question thread on StackOverflow has a button to
   send the codeblock into the chrome-extension. There will be a pop-up
   appearing with all needed data parsed from the website. Again there will be
   an user-interaction to set a label. The pop-up closes when leaving
   it with the cursor, pressing the cancel-button or by sending the fragment.


### Native Messaging
Native Messaging (NM) is a function implemented by Google for communication between the chrome webbrowser and
a NM-host located on the clients file system. This host is installed automatically into
``~/.config/chromium/NativeMessagingHosts/com.frag.extract.json``
on Linux like Operating Systems or
``hier für Windows``.
It also contains the path to a script located in
``/.vscode-oss/extensions/[extension-version]/out/frag.extract.host/extract.py``, on linux and
``again windows``, on Windows,
and an allowed extension origin: chrome-extension://faoicolglehmgplpccapgobineahofjh/.
When sending a fragment a short time connection is established. The decision was against
a long life connection as this would consume much more (mir fällt nicht ein wie man CPU usage anders nennt).
With this decision made it is also not possible to communicate from the database to the chrome extension
which could have been a possibility to check whether a fragment already exists in the database, in order
to prevent redundant fragments.

For more information about Native Messaging see https://developer.chrome.com/apps/nativeMessaging



### Fragments
A fragment contains of a
- label
- tags
- description, defaultly the title of the question
- language
- library and packages
- code


### Popup
The Popup contains input fields for all fragment contents and three butons:
- ''jump to fragment'': scrolls to the codes origin on the opened website
- ''save'': saves the parameters in database and closes popup
- ''cancel'': cancels the editing process and closes popup

Important to notice is:
- when popup loses focus it closes but saves current changes in the editing process
- when `saving` or `canceling` current process on editing gets lost
