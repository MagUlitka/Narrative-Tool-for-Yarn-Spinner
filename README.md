# Narrative-Tool-for-Yarn-Spinner
A simple, user-friendly tool for generating Yarn script from the tree graph. Allows entry-level user to build and manage the narrative tree with ease; keeps track of variables, story flow and custom functions. Automatically generates nodes' titles. Works on most browsers.

# Current version: 1.0.1 alpha (private use only)
### Features:
- Easy-to-build and flexible narrative trees made of story nodes and choice nodes;
- The tree can be converted anytime to a yarn script code and the generated code can be tranformed into a working tree;
- All story nodes' titles are unique; there's basic title generation when creating new nodes or duplicating old ones;
- User can observe the changes made in node editor live on the canvas;
- User can use basic yarn spinner code functions, like declaring variables (which are stored in a variables table), setting variables' values, creating complex condition checks;
- Each story node is generated as a separate yarn script dialogue for maximum flexibility in creating narrative;
- User can use bold and italic inside the node's content editor and the formatting is kept in yarn script.


# Remaining requirements

### 1. Nodes

- make built-in yarn fuctions easily available **in future versions**
- one can give the core node a name; child nodes' names are generated based on choices or typed by hand 
- one can use the same node more than once; the tree shows the full node but the code just keeps a reference (**jump** command)
- must distinguish between intended newlines and divided fragments (the parts that change as the player hits enter/next button)
- one can edit font size and font color of each node
- one can hide functional lines for improved writing experience
- grouping nodes (subflows) and adding anchors for simpler trees and easier navigation
- setting zoom on newly added node

### 2. Website
- autosaves the progress
- keeps track of all variables that are kept in Yarn's memory and presents currently active variables based on the current node
- has user panel and a database
- every user has their trees collection; saved trees can be anchored inside other trees
- saves generated code into a file

### 3. Other
- generates a list of declared variables as a separate text file
- checks for differences between file versions
- brings ready presets for node customisation (including preset colour palette)
- improve condition adding for more intuitive and pleasant experience

# Logs

- **14.08.2024** - initialised the project
- **19.08.2024** - Built the page & added basic functionalities (nodes dragging, duplicating, deleting) using SvelteFlow and Svelte FLowbite examples; provided the skeleton of *StoryNode*. As a next step, enable node editing and refine structure.
- **29.08.2024** - Added editor for nodes - the user can now edit node's title, color and content using Quill rich text editor with bold, italic and automatic line owner + fixed some duplicate nodes issues.
- **11.09.2024** - Added variable panel, choice nodes, functional lines, node connection rule and enabled deleting edges.
- **05.10.2024** - Version 1.0.1. alpha released for private use (see versions section for more info).
