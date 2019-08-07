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
