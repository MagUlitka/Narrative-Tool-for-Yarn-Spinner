# Narrative-Tool-for-Yarn-Spinner
A simple, user-friendly tool for generating Yarn script from the tree graph. Allows entry-level user to build and manage the narrative tree with ease; keeps track of variables, story flow and custom functions. Automatically generates nodes' titles. Works on most browsers.

# Requirements 

### 1. Nodes
- must be draggable across the workfield
- must be divided into sections, including: title, choices, character(s) + custom sections decided by the user (in default case: character(s)'s expression, character's line/narrative line, relationship with the character(s))
- allow adding VSCode graph-view sections, like color, group etc.
- must separate between character's line and narrative description; user can easily indicate lines for the characters from the rest
- every node is a separate piece of dialogue + choices; choices transit the player to another node using **jump** command
- one can declare and set variables for different data types (case 1: set string; case 2: set number/do math; case 3: change true/false)
- one can change variables before, during and after the dialogue (before choices)
- one can set if, elseif and else statements as they please, both in dialogue and displayed choices (using operators)
- make built-in yarn fuctions easily available
- connection between dialogues is shown as a line between choice and following node, which one can easily delete
- one can give the core node a name; child nodes' names are generated based on choices or typed by hand
- one can use the same node more than once; the tree shows the full node but the code just keeps a reference (**jump** command)
- must distinguish between intended newlines and divided fragments (the parts that change as the player hits enter/next button)
- one can delete a node and keep it unrelated

### 2. Website
- has a button "generate script"
- has a button "load tree"
- autosaves the progress
- keeps track of all variables that are kept in Yarn's memory and presents currently active variables based on the current node
- can zoom in and out
- allows user to use bold, italics and highlight inside nodes

### 3. Other
- translates the tree components into Yarn and puts the script into a .yarn file
- loads .yarn file and generates a tree from script
- always has variable containing player's name
- generates a list of declared variables as a separate text file
- checks for differences between file versions

# Logs

- **14.08.2024** - initialised the project
- **19.08.2024** - Built the page & added basic functionalities (nodes dragging, duplicating, deleting) using SvelteFlow and Svelte FLowbite examples; provided the skeleton of *StoryNode*. As a next step, enable node editing and refine structure.
