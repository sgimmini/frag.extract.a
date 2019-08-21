# Frag.Extract

Fragment extractor for Stackoverflow.

This is a tool to extract code fragments from answers to questions on Stackoverflow. It works in conjunction with a [Visual Studio Code Extension](https://marketplace.visualstudio.com/items?itemName=JonasGann.fragment-editor), which recieves the fragments from this Chrome Extension and saves them to a database.
The Chrome Extension, as well as the VSC Extension, were created as part of a [software practical](https://pvs.ifi.uni-heidelberg.de/fileadmin/papers/2019/SoSe_2019_Softwarepraktikum_Programming_Tools_for_Data_Science_01.pdf) at the University of Heidelberg.

Frag Extract is available for Google Chrome on Windows, Linux and MacOS.
With this extension you are able to quickly create a code fragment from a question on Stackoverflow. Such a fragment has several attributes which the extension automatically extracts from
the opened question thread. It chooses the codeblock from the answers which best matches the problem described in the question title. "Best match" is determined through a neuronal network trained to
find the right code fragment to a so called "intention".
You can also select the codeblock you find to best match your problem manually with a click of a button in the buttom right corner of every codeblock.

After clicking "Save" the fragment is sent to a Python script, which is part of the Fragment Editor VSC Extension, that then saves the fragment to a database, as Chrome extensions themselves do not have access to
the filesystem. Therefore, Frag Extract requires the Fragment Editor VSC Extension to be installed, however, it does not require Visual Studio Code to be actually running whilst you are saving a fragment.

## Requirements

- Python 3

Please note, that for Windows users the command "python" needs to be in your environment variables, which happens per default for system wide installations of Python 3.3 or higher.

## Installation

There are two things which need to be installed seperately:

- "Fragment Editor" Visual Studio Code extension by Jonas Gann, which can be found in the [VSC Marketplace](https://marketplace.visualstudio.com/items?itemName=JonasGann.fragment-editor)
- "Frag Extract" Chrome extension

Install the Chrome extension by navigating to <chrome://extensions>, activate Developer mode, click "Load unpacked" and select the "chrome_extension" directory in this repository's root folder.
This extension might be published to the Chrome Webstore in the future, which would make the installation process much easier.

MacOS users please be advised, that this extension should work fine under MacOC. It was, however, never tested on a Mac, due to a lack of Macs available to the developers.

## Usage

Find a question thread on Stackoverflow (through Google for example) for a problem you're having, where you want to save the solution to that problem for future use. Once you have navigated
to that site, the extension will, in the background, beginn to determine the best codeblock from the answers for that issue. Click on the extension icon in the top right to open a popup, which contains
an editor for fragments and will be prefilled with the information extracted from the question thread. You can edit any of the attributes there and then choose to save this fragment by clicking "Save", you
can also cancel the process by clicking "Cancel", which will close the popup and delete your changes.
It is, however, not necessary the click "Cancel". If you close the popup, it will remember the changes and load them again, when you reopen it. Opening the popup on a different site will delete the saved changes and instead load the fragment extracted from this page.

From the popup you can scroll the site to the selected codeblock by clicking the button with a little arrow on it. You can also manually select any codeblock in the answers by clicking a button next to it.
After you have saved a fragment, it will appear in the Fragment Editor VSC extension within 5 seconds.

## Options

The extension provides three options to the user:

- Automatically select all Tags, which will add all (non-language) tags from the page to the tags attribute instead of adding them as autocomplete options
- Automatically add Language to Tags, which will create a tag out of the extracted language, so users can group fragments by langauage in the Fragment Editor VSC extension
- Preset Label as a copy of Description, since Label is a required field, this allows the user to save fragments without having to input anything. However, both Label and Description attributes will then have the exact same value

Please note, that these options only take affect on sites loaded after the respective option was set by the user!

Advanced users can also modify the maximum number of codeblocks in the answers, that will be consired by the model to be selected as the codeblock for the fragment. Currently, only the first 5 codeblocks are consired, as evaluating takes time and evaluating more codeblocks might result in the user having to wait considerable time, before the fragment appears in the extension popup.
If you wish to modify this number, got to `/chrome_extension/scripts/content.js` and change `MAX_CODEBLOCKS` to your desired value. You will have to reload the extension afterwards.

## Fragments

A fragment consists of a

- label, short definite title of the useage of the fragment
- tags (optional), these are used to create a tree structure in the Fragment Editor VSC Extension
- description (optional), defaultly the title of the question
- language, the programming language of the code
- libraries / packages (optional), you can add make a note of any libraries / packages used in the codeblock
- code

## Popup

The Popup contains an editor for fragments. This consists of input fields for all fragment attributes and three butons:

- ''jump to fragment'': scrolls to the codes origin on the opened website
- ''save'': saves the parameters in database and closes popup
- ''cancel'': cancels the editing process and closes popup

Important to note is:

- when popup loses focus, it closes but saves current changes in the editing process
- opening the popup on a different site clears the unsaved changes made on the previous site
- when `canceling` current process on editing gets lost, `saving` clears input fields as well

### Two ways to get select a codeblock for the fragment

1. Automatically.
   Our model selects the codeblock with the highest propability of being a solution to the question
   and parses the code fragment into the extension. To save the fragment to the database only
   a label is missing, which is chosen by the user in order to prevent mislabeled fragments.

2. Manually, by clicking ''Add to fragment''.
   Every answer-code block on any question thread on Stackoverflow has a button in the buttom right with an arrow to
   send the codeblock into the Chrome extension. This opens a pop-up with the fragment editor and the attributes parsed from the website. Again, the user will have to set a label. The pop-up closes when clicking
   elsewhere, pressing the cancel-button or by sending the fragment.

## Contents of this repository

### Chrome Extension

The Chrome Extension consists of

- `manifest.json`
- `background.js`, the background script, which handles tasks the other scripts cannot, like enabling the extension only on Stackoverflow.com or opening the popup after a user manually selects a codeblock
- `content.js`, the content script is injected into the Stackoverflow site and is the only part of the extension that has access to the site's DOM. It therefore extracts the information for a fragment from the site.
- `popup.html` and `popup.js` make up the extention popup, which opens when the user clicks the extension icon. It recieves the fragment from the content script and provides the user with an editor for that fragment
- `options.html` and `options.js` provide the extensions options menu

For further information on the structure of a Chrome extension please consult Google's [documentation on Chrome extensions](https://developer.chrome.com/extensions).

[Materialize](https://materializecss.com/) was used as a design baseline.

### Model

The extraction model consists of

- `train_lstm.ipynb`, the jupyter notebook containing data loading, preprocessing and training
- `loss.pdf`, visualizes the training curve for purposes of evaluation
- `lstm.h5`, is the model saved as Keras Python HDF5 format
- `model.h5`, is the same model in a different format for faster loading when doing tests in Python
- `model.json` contains weights and needs to be loaded together with `model.h5`
- `vocab.json`, contains the dictionary created when preprocessing in 'train_lstm.ipynb' (needed to recreate tokenization)

#### In case of further training

Following steps need to be taken to train and integrate a new model:

- Train the model in Python using TensorFlow or libraries which use TensorFlow like Keras
- Training in TensorFlowjs is possible but strongly disadvised because of performance issues (no GPU Training possible)
- When using Keras: Save the model using the Keras HDF5 format
- Save the dictionary used for tokenization as JSON
- Convert the HDF5 file to TensorFlowjs-format using their converter
- Host your dictionary file and your converted model file on a server
- Pass the new URL to `/chrome_extension/scripts/content.js`

#### Build with

The model to determine the best fitting fragment was build in Python using the [Keras library](https://keras.io/) as a framework and the [CoNaLa-Corpus Dataset](https://conala-corpus.github.io/) as training data.
To capture the complex text data with it's full meaning a 2-layer LSTM was built which takes a natural language intent and a code fragment as input and outputs the probability of them fitting.
Afterwards the model got exported into tensorflowjs-format by using the tensorflowjs-library. For further explanation read the tutorial on the [tensorflow website](https://www.tensorflow.org/js/tutorials/conversion/import_keras).
By using [TensorFlow.js](https://www.tensorflow.org/js) the model got imported into JavaScript and can be used to make predictions.
Currently TensorFlow.js Model and Tokenizer are hosted via GitHub Pages at following URL: <https://github.com/Flori-Boy/Hosting_Test/tree/master>

#### Functionality

When opening a Stackoverflow page the extension parses the page title (Question/Intent) and all codeblocks on said page.
To guarantee good performance only the first five codeblocks are taken into account, this can be changed as noted in the Options section above.
Every codeblock will be tokenized together with the question and fed into a Neural Network which assigns probabilties of the codeblock being a good fit for the question.
The codeblock with the highest probability gets selected.

### Integration with Fragment Editor VSC extension

In `/vscextension` you will find the folder `frag.extract.host`. This contains all relevant files for the connection from the Chrome extension to the VSC extension, or rather the sqlite Fragment database of the VSC extension. A python script will recieve a fragment from the Chrome extension using Chrome's [Native Messaging API](https://developer.chrome.com/extensions/nativeMessaging).

`extension.ts` contains the code and comments on how to realise registering the Native Messaging host and how to clean up after deinstallation of the VSC extension.
If you do not want to use this Chrome extension in conjunction with Visual Studio Code, you can also use the `frag.extract.host`folder by itself with minor modification (rename `raw.py` to `extract.py` and provide a database path) or write your own programm or extension for a code editor, that recieves fragments from this Chrome extension and then does with these fragments whatever you may want.

For testing purposes we also include a very old version of the Fragment Editor VSC extension, packaged as a .vsix file, which you can install in the VSC Extensions Tab in the menu. This version was extensively tested and should work, even if a newer version of the VSC extension might not work in the future.
