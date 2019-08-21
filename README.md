# frag.extract

## ToDo

- continue on readme
- grammar and spell check

Fragment extractor for StackOverflow.

This is a tool to extract code fragments from answers to questions on StackOverflow. It works in conjunction with a [Visual Studio Code Extension](https://marketplace.visualstudio.com/items?itemName=JonasGann.fragment-editor), which recieves the fragments from this Chrome Extension and saves them to a database.
This Chrome Extension, as well as the VSC Extension, was created as part of a [software practical](https://pvs.ifi.uni-heidelberg.de/fileadmin/papers/2019/SoSe_2019_Softwarepraktikum_Programming_Tools_for_Data_Science_01.pdf) at the University of Heidelberg.

Frag.extract is available for Google Chrome on Windows, Linux and MacOS.
Fragments contain (was die halt brauchen) which are automatically parsed from a question thread on StackOverflow by best
match. "Best match" is determined through a neuronal network trained to
find the right code fragment to a so called "intention". Another way
to get a desired fragment is to click the associated button in the code block.
Fragments get sent to the VSC-extension by a native messenging host installed
through installing the VSC-extension itself. The chrome-extension on its own has
no use.

## Installation

There are two things which need to be installed seperately:

- "Fragment Editor" Visual Studio Code extension by Jonas Gann, can be found in the [VSC Marketplace](https://marketplace.visualstudio.com/items?itemName=JonasGann.fragment-editor)
- This Chrome Extension. Use the mouse to drag the frag-extract.crx file into a Chrome window and click "continue" in the bottom left.

MacOS users please be advised, that this extension should work fine under MacOC. It was, however, never tested on a Mac.

The VSC Extension can be found in the Marketplace under _Fragment Editor_ by _Jonas Gann_. Through this installation
the NM-host used for communication between Chrome and the database will be installed too.
The Chrome Extension can be installed easily by extracting a provided .zip-file and loading this directory into
`chrome://extensions/` (in developer mode).

## Fragments

A fragment contains of a

- label, short definite title of the useage of the fragment
- tags
- description, defaultly the title of the question
- language
- library and packages, used for the code
- code

## Popup

The Popup contains input fields for all fragment contents and three butons:

- ''jump to fragment'': scrolls to the codes origin on the opened website
- ''save'': saves the parameters in database and closes popup
- ''cancel'': cancels the editing process and closes popup

Important to notice is:

- when popup loses focus it closes but saves current changes in the editing process
- when `canceling` current process on editing gets lost, `saving` clears input fields as well

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

## Überschrift die sagt, dass hier die einzelnen Dateien und Funktionen beschrieben werden

### Chrome Extension

The Chrome Extension consists of

- `manifest.json`
- `background.js`, the background script, which handles tasks the other scripts cannot, like enabling the extension only on stackoverflow.com or opening the popup after a user manually selects a codeblock
- `content.js`, the content script is injected into the Stackoverflow site and is the only part of the extension that has access to the site's DOM. It therefore extracts the information for a fragment from the site.
- `popup.html` and `popup.js` make up the extention popup, which opens when the user clicks the extension icon. It recieves the fragment from the content script and provides the user with an editor for that fragment
- `opotions.html` and `options.js` provide the extensions options menu

[Materialize](https://materializecss.com/) was used as a design baseline. A couple of changes had to be made in
`materialize.css` to our purpose.

### Model

The extraction model contains of

- `train_lstm.ipynb`, the jupyter notebook containing data loading, preprocessing and training
- `loss.pdf`, visualizes the training curve for purposes of evaluation
- `lstm.h5`, is the model saved as Keras Python HDF5 format
- `model.h5`, is the same model in a different format for faster loading when doing tests in Python
- `model.json` contains weights and needs to be loaded together with `model.h5`
- `vocab.json`, contains the dictionary created when preprocessing in 'train_lstm.ipynb' (needed to recreate tokenization)

### In case of further training:

Following steps need to be taken to train and integrate a new model:

- Train the model in Python using TensorFlow or libraries which use TensorFlow like Keras
- Training in TensorFlowjs is possible but strongly disadvised because of performance issues (no GPU Training possible)
- When using Keras: Save the model using the Keras HDF5 format
- Save the dictionary used for tokenization as JSON
- Convert the HDF5 file to TensorFlowjs-format using their converter
- Host your dictionary file and your converted model file on a server
- Pass the new URL to `content.js`

#### Build with

The model to determine the best fitting fragment was build in Python using the [Keras library](https://keras.io/) as a framework and the [CoNaLa-Corpus Dataset](https://conala-corpus.github.io/) as training data.
To capture the complex text data with it's full meaning a 2-layer LSTM was built which takes a natural language intent and a code fragment as input and outputs the probability of them fitting.
Afterwards the model got exported into tensorflowjs-format by using the tensorflowjs-library. For further explanation read the tutorial on the [tensorflow website](https://www.tensorflow.org/js/tutorials/conversion/import_keras).
By using [TensorFlow.js](https://www.tensorflow.org/js) the model got imported into JavaScript and can be used to make predictions.
Currently TensorFlow.js Model and Tokenizer are hosted via GitHub Pages at following URL: <https://github.com/Flori-Boy/Hosting_Test/tree/master>

### Functionality

When opening a StackOverflow page the extension parses the page title (Question/Intent) and all codeblocks on said page.
To guarantee good performance only the first five codeblocks are taken into account.
Every codeblock will be tokenized together with the question and fed into a Neural Network which assigns probabilties of the codeblock being a good fit for the question.
The codeblock with the highest probability gets selected.
By sending a fragment there will be a connection between the NM-host and chrome established carrying the data provided by the popup
to the database. This fragment appears not later than 5 seconds after selection in the interface of the fragment editor.

### Native Messaging

Native Messaging (NM) is a function implemented by Google for communication between the chrome webbrowser and
a NM-host located on the clients file system. This host is installed automatically into
`~/.config/chromium/NativeMessagingHosts/com.frag.extract.json`
on Linux like Operating Systems or
`hier für Windows`. @tobias
It also contains the path to a script located in
`/.vscode-oss/extensions/[extension-version]/out/frag.extract.host/extract.py`, on linux and
`again windows`, on Windows, @tobias
and an allowed extension origin: chrome-extension://faoicolglehmgplpccapgobineahofjh/.
When sending a fragment a short time connection is established. The decision was against
a long life connection as this would consume much more (mir fällt nicht ein wie man CPU usage anders nennt).
With this decision made it is also not possible to communicate from the database to the chrome extension
which could have been a possibility to check whether a fragment already exists in the database, in order
to prevent redundant fragments.

For more information about Native Messaging see <https://developer.chrome.com/apps/nativeMessaging>

## Reference

Materialize was used for design: [materializecss.com](https://materializecss.com/)
