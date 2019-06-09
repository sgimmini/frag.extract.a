import * as vscode from 'vscode';
import { Fragment } from "./fragment";
import { Database } from './database';

/**
 * Try to create a fragment out of existing fragments
 */
export class FOEF {
    /**
     * Calculate a parametrized snippet of the code and return it
     * @param code Code to parametrize
     */
    static parametrize(code: string): { body: string, keywords: string, placeholders: string } {
        // 1) Split code in array of lines
        var codeLines = code.split("\n");

        // 2) For each line: Delete all predefined symbols from the code
        var deletable = ['\r', '(', ')', '{', '}', '[', ']', ';', ';', ':', '/', '-', '+', '<', '>', '&', '|', '?', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '=', '%', '!'];
        var keywordArrays: string[][] = [];
        codeLines.forEach((line: string) => {
            var reducedCode = "";
            for (var cnt = 0; cnt < line.length; cnt++) {
                if (!deletable.includes(line[cnt])) {
                    reducedCode += line[cnt];
                }
                else {
                    reducedCode += " ";
                }
            }
            keywordArrays.push(reducedCode.split(" ").filter((keyword: string) => {
                if (keyword === '') {
                    return false;
                }
                else {
                    return true;
                }
            }));
        });

        var findKeywords: string[] = [];
        keywordArrays.forEach((keywordArray: string[]) => {
            keywordArray.forEach((keyword: string) => {
                findKeywords.push(keyword);
            });
        });

        // 4) For each line: Find all fragments that have at least one keyword in common
        var fragmentsArrays: Fragment[][] = [];
        keywordArrays.forEach((keywordArray: string[]) => {
            var fragments: Fragment[] = [];
            keywordArray.forEach((keyword: string) => {
                Database.getFilteredFragments('keyword:' + keyword).forEach((fragment: Fragment) => {
                    fragments.push(fragment);
                });
            });
            fragmentsArrays.push(fragments);
        });

        // 5) For each line: Count occurence of each fragment
        var fragmentsMaps: Map<Fragment, number>[] = [];
        fragmentsArrays.forEach((fragmentsArray: Fragment[]) => {
            var fragmentsMap: Map<Fragment, number> = new Map();

            if (fragmentsArray.length !== 0) {
                fragmentsArray.forEach((fragment: Fragment) => {
                    if (!fragmentsMap.has(fragment)) {
                        fragmentsMap.set(fragment, 1);
                    }
                    else {
                        fragmentsMap.set(fragment, fragmentsMap.get(fragment)! + 1);
                    }
                });
            }
            fragmentsMaps.push(fragmentsMap);
        });

        // 6) For each line: Reduce count of fragment for each keyword i has that is not present in the selected code
        for (var cnt = 0; cnt < fragmentsMaps.length; cnt++) {
            for (let entrie of fragmentsMaps[cnt].entries()) {
                var fragment = entrie[0];
                var count = entrie[1];
                var keywords: string[] = [];
                if (fragment.keywords !== undefined) {
                    keywords = fragment.keywords.split(',');
                }

                // Substract one for each keyword the line does not have but the fragment has
                keywords.forEach((keyword: string) => {
                    if (!keywordArrays[cnt].includes(keyword)) {
                        count -= 1;
                    }
                });

                // Substract one for each keyword the fragment does not have but the line has: Too restrictive
                /*
                keywordArrays[cnt].forEach((keyword: string) =>
                {
                    if(!keywords.includes(keyword))
                    {
                        count -= 1;
                    }
                });
                */

                fragmentsMaps[cnt].set(fragment, count);
            }
        }

        // 7) For each line: Replace line by code of fragment with highest count
        var fragmentArray: Fragment[] = [];
        fragmentsMaps.forEach((fragmentsMap: Map<Fragment, number>) => {
            var currentFragment: Fragment;
            var currentCount = 0;
            for (let entrie of fragmentsMap.entries()) {
                if (entrie[1] > currentCount) {
                    currentFragment = entrie[0];
                    currentCount = entrie[1];
                }
            }
            fragmentArray.push(currentFragment!);
        });

        // 8) If matching fragments were found, replace line with fragments, otherwise leave original line untouched
        var newCode = "";
        for (var cnt = 0; cnt < fragmentArray.length; cnt++) {
            if (fragmentArray[cnt] === undefined) {
                if (cnt !== fragmentArray.length - 1) {
                    newCode += codeLines[cnt] + '\n';
                }
                else {
                    newCode += codeLines[cnt];
                }
            }
            else {
                // include whitespace before inserted fragments
                var previousCode = codeLines[cnt];
                var whitespace = "";
                for (var cnt1 = 0; cnt1 < previousCode.length; cnt1++) {
                    if (previousCode[cnt1] === " ") {
                        whitespace += " ";
                    }
                    else if (previousCode[cnt1] === "\t") {
                        whitespace += "\t";
                    }
                    else {
                        break;
                    }
                }
                if (cnt !== fragmentArray.length - 1) {
                    newCode += whitespace + fragmentArray[cnt].body + '\n';
                }
                else {
                    newCode += whitespace + fragmentArray[cnt].body;
                }
            }
        }

        // Adapt placeholder in body so that their number is incrementing also over different lines
        var placeholderCnt = 1;
        var _newCode = "";
        for (var cnt = 0; cnt < newCode.length; cnt++) {
            var ch1 = newCode.charAt(cnt);
            var ch2 = newCode.charAt(cnt + 1);
            if (ch1 === '$' && ch2 === '{') {
                _newCode += "${" + placeholderCnt;
                cnt += 2;
                placeholderCnt++;
            }
            else {
                _newCode += ch1;
            }
        }

        // Create new list of placeholders
        var newPlaceholders: string = "";

        for (var cnt = 0; cnt < fragmentArray.length; cnt++) {
            if (fragmentArray[cnt] !== undefined) {
                if (fragmentArray[cnt].placeholders !== undefined) {
                    newPlaceholders += fragmentArray[cnt].placeholders + ',';
                }
            }
        }

        // Adapt placeholders in list of placeholders so that their number is incrementing
        var _newPlaceholders: string = "";
        placeholderCnt = 1;
        for (var cnt = 0; cnt < newPlaceholders.length; cnt++) {
            var ch1 = newPlaceholders.charAt(cnt);
            var ch2 = newPlaceholders.charAt(cnt + 1);
            if (ch1 === '$' && ch2 === '{') {
                _newPlaceholders += "${" + placeholderCnt;
                cnt += 2;
                placeholderCnt++;
            }
            else {
                _newPlaceholders += ch1;
            }
        }

        _newPlaceholders = _newPlaceholders.substr(0, _newPlaceholders.length - 1);

        // Create new list of keywords
        var newKeywords: string = "";

        for (cnt = 0; cnt < fragmentArray.length; cnt++) {
            if (fragmentArray[cnt] !== undefined) {
                if (fragmentArray[cnt].keywords !== undefined) {
                    newKeywords += fragmentArray[cnt].keywords + ',';
                }
            }
        }
        newKeywords = newKeywords.substr(0, newKeywords.length - 1);

        return { body: _newCode, keywords: newKeywords, placeholders: _newPlaceholders };
    }
}