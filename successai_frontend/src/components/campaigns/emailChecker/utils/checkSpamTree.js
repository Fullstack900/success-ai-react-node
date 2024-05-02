import data from "./spam2.json";

class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfPhrase = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(phrase) {
    let node = this.root;
    const words = phrase.split(/\W+/);

    for (const word of words) {
      const cleanedWord = replaceSpecialChars(word).toLowerCase();
      if (!cleanedWord) continue; // Skip if the word is empty after cleaning
      if (!node.children[cleanedWord]) {
        node.children[cleanedWord] = new TrieNode();
      }
      node = node.children[cleanedWord];
    }
    node.isEndOfPhrase = true;
  }

  search(text) {
    const foundPhrases = new Set();
    const words = text.split(/\W+/);

    for (let i = 0; i < words.length; i++) {
      let node = this.root;
      let foundPhrase = "";
      let hasMatch = false;

      for (let j = i; j < words.length; j++) {
        const cleanedWord = replaceSpecialChars(words[j]).toLowerCase();
        if (!cleanedWord) continue; // Skip if the word is empty after cleaning

        if (node.children[cleanedWord]) {
          foundPhrase += (foundPhrase ? " " : "") + words[j];
          node = node.children[cleanedWord];

          if (node.isEndOfPhrase) {
            foundPhrases.add(foundPhrase);
            hasMatch = true;
            break; // Move to the next word if a match is found
          }
        } else {
          break; // Move to the next starting word if there is no match
        }
      }

      if (!hasMatch && foundPhrase) {
        // If no match was found for the current starting word,
        // consider it as a phrase variation and add it as a match.
        foundPhrases.add(foundPhrase);
      }
    }

    return Array.from(foundPhrases);
  }
}

function replaceSpecialChars(word) {
  // Replace commas, single quotes, and underscores with an empty string
  return word.replace(/[,'_]/g, "");
}

function checkSpamWords(paragraph) {
  const trie = new Trie();
  let newArr = [];

  // for (const phrase of data) {
  //   trie.insert(phrase);
  // }
  let spamArray = data
    ?.map((item) => {
      // if (paragraph?.toLowerCase()?.includes(item?.toLocaleLowerCase())) {
      //   return item;
      // }
      if (new RegExp(`\\b${item}\\b`, "ig").test(paragraph)) {
        return item;
      }
    })
    ?.filter((ele) => ele !== undefined);

  // const foundPhrases = trie.search(paragraph);
  return { spam: spamArray, count: spamArray.length };
  // Output: ["Apply now!", "Action required", "Apply here"]
}

export default checkSpamWords;
