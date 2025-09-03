# Tokens
- Spaces and Sizes will follow [utopia.fyi](https://utopia.fyi/) system
- Colors will follow 

# Base
- reset.css is done. It follows https://cube.fyi/ global.css
- fonts.css is a simple configuration file for external font import. 
- typography.css is done. Simple file that defines most of the baseline typoegraphic styels. We can revise/expand later.
- everylayout.css is done. It defines most of the https://every-layout.dev/ helper classes. 

## Utils
- utilities are done. We can revise/expand later.

# Components
Component Organization and Composability will follow https://atomicdesign.bradfrost.com/chapter-1/

## Atoms
- **Button** - The most basic interactive element for user actions.  
- **Input Field** - A field for user text entry.  
- **Icon** - A symbolic representation of an action or concept.  
- **Label**- A text element that identifies a UI control.  
- **Badge** - A small element for status indicators or counts.  
- **Divider** - A thin line to separate content.  

## Molecules
- **Search Bar** - A composition of an Input (Atom), a Label (Atom), and a Button (Atom).  
- **Alert/Toast** - A composition of an Icon (Atom), Text (Atom), and a container.  
- **Form Field** - A composition of a Label (Atom), Input (Atom), and optional Helper Text (Atom).  
- **Dropdown Menu** - An interactive element that reveals a list of options (Atoms).  
- **Pagination Control** - A set of navigation links/buttons (Atoms) for traversing pages.  
- **Tab Navigation Item** - An Icon (Atom) combined with a Label (Atom) within a clickable container.  

## Organisms
- **Header** - A composition of a Logo (Atom), Primary Navigation (Molecule), and Search Bar (Molecule).  
- **Card** - A composition of an Image (Atom), Title (Atom), Description (Atom), and Action Button (Atom).  
- **Data Table** - A complex composition of Table Headers (Atoms), Rows (Molecules), and Pagination (Molecule). 
- **Sidebar** - A collection of navigation links/groups (Molecules) forming a distinct vertical section.  
- **Modal/Dialog** - A container with a Header (Molecule), Content Body (Atoms/Molecules), and Action Footer (Molecule).  
- **Footer** - A composition of Site Links (Molecule), Social Media Icons (Molecule), and Legal Text (Atom).  

