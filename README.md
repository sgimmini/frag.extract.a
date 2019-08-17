# frag.extract.a

## ToDo
- continue on readme
- code input field of fixed size bigger than now, because when reopening it code can be cut off
    - code block has bigger size now and all input fields have a margin to the top - 
- languages field in popup to dropdown menu
    - first tag of question determines language (transitionally)
- use model for parsing fragments to popup
- change add to fragment button to look better: 
    - Not Anymore: put outside of codeblock, which looks better but still not the best way. Apparently does not open popup
    - changed string to arrow and placed button on the right inside of grey box 
- chrome extension in marketplace?
- licences? e.g. for materialize

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
`~/.config/chromium/NativeMessagingHosts/com.frag.extract.json`
on Linux like Operating Systems or
``hier für Windows``.
It also contains the path to a script located in
`/.vscode-oss/extensions/[extension-version]/out/frag.extract.host/extract.py`, on linux and
`again windows`, on Windows,
and an allowed extension origin: chrome-extension://faoicolglehmgplpccapgobineahofjh/.
When sending a fragment a short time connection is established. The decision was against
a long life connection as this would consume much more (mir fällt nicht ein wie man CPU usage anders nennt).
With this decision made it is also not possible to communicate from the database to the chrome extension
which could have been a possibility to check whether a fragment already exists in the database, in order
to prevent redundant fragments.

For more information about Native Messaging see https://developer.chrome.com/apps/nativeMessaging



### Fragments
A fragment contains of a
- label, short definite title of the useage of the fragment
- tags
- description, defaultly the title of the question
- language
- library and packages -, used for the code
- code


### Popup
The Popup contains input fields for all fragment contents and three butons:
- ''jump to fragment'': scrolls to the codes origin on the opened website
- ''save'': saves the parameters in database and closes popup
- ''cancel'': cancels the editing process and closes popup

Important to notice is:
- when popup loses focus it closes but saves current changes in the editing process
- when `canceling` current process on editing gets lost, `saving` clears input fields as well


## Installation 
There are two things need to be installed seperately: 
- Visual Studio Code Extension
- Chrome Extension
The VSC Extension can be found in the Marketplace under *Fragment Editor* by *Jonas Gann*. Through this installation 
the NM-host used for communication between Chrome and the database will be installed too.
The Chrome Extension can be installed easily by extracting a provided .zip-file and loading this directory into
`chrome://extensions/` (in developer mode). TODO: continue - may marketplace(?)


## Build with
The model to determine the best fitting fragment was ... @flo


## Überschrift (sehr gut)
may put build with in here?   

### Chrome Extension
The Chrome Extension contains of 
- `manifest.json` for GRUND
- `background.js`, a background script only allowing the popup to be opened on StackOverflow
- `content.js` extraction of websites content for fragments (see -> Fragments) 
- `popup.html` layout of the popup 
- `popup.js` receiving fragment content from `content.js` and processing visible data for `popup.html`(?)
- `opotions.html`
- `options.js`

Materialize https://materializecss.com/ was used as a design baseline. A couple of changes had to be made in
`materialize.css` to our purpose.    

### Model
@ſłø 

### Functionality
TODO: how the best fragment is determined
By sending a fragment there will be a connection between the NM-host and chrome established carrying the data provided by the popup
to the database. This fragment appears no later than 5 seconds later in the interface of the fragment editor. 