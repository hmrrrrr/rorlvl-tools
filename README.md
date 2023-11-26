# rorlvl tools
some tools and documentation on the .rorlvl format for Risk of Rain Returns
(very WIP)

## features
- ability to **read** .rorlvl tile data in Tiled

## planned features
- saving levels edited in Tiled
- reading/writing object data
  
## usage
included is an extension for [Tiled](https://www.mapeditor.org/) which allows for opening .rorlvl files in the editor  

you can get Tiled [here](https://github.com/mapeditor/tiled/releases/)  

once you've installed Tiled, move the files in this folder to the extensions directory,
which by default is here for each platform:

| Platform | Path                                              |
| :------- | :------------------------------------------------ |
| Windows  | *C:/Users/USER/AppData/Local/Tiled/extensions/*   |
| macOS    | *~/Library/Preferences/Tiled/extensions/*         |
| Linux    | *~/.config/tiled/extensions/*                     |

###### (this folder can also be found in the editor by going to Edit>Preferences>Plugins at the bottom of the window)

once you've copied over the files, you'll want to extract the sprites from data.win in the game files directory with [UndertaleModTool](https://github.com/krzys-h/UndertaleModTool) if you haven't already  
after that, move that folder (which should be called Export_Sprites) to the extensions folder, and you now should be able to load .rorlvl files in Tiled!  
for more information on Tiled, see the manual [here](https://doc.mapeditor.org/en/stable/manual/introduction/#)

### documentation
documentation on what i know of the .rorlvl format can be found in [rorlvl.md](rorlvl.md)