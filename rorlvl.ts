/// <reference types="@mapeditor/tiled-api" />


class RORTile {
    atlasX: number;
    atlasY: number;
    x: number;
    y: number;
    collision: boolean;

    constructor(bData: ArrayBuffer) {
        let data = new DataView(bData);
        if(bData.byteLength !== 6){
            tiled.log("Tile Data: " + bData.byteLength);
        }
        this.atlasX = data.getUint8(0);
        this.atlasY = data.getUint8(1);
        this.x = data.getInt16(2, true);
        this.y = data.getInt16(4, true);
    }
}

function decodeUtf8(bytes: Uint8Array): string {
    let result = "";
    for (let i = 0; i < bytes.length; i++) {
        result += String.fromCharCode(bytes[i]);
    }
    return decodeURIComponent(result);
}

class RORLayer {
    name: string;
    meta: ArrayBuffer;
    tileCount: number;
    tiles: Array<RORTile>;
    dataEnd: number;
    tilemap: string;
    zIndex: number;
    associatedLayer: Layer;

    constructor(bData: ArrayBuffer) {
        let data = new DataView(bData);
        let bytes = new Uint8Array(bData);
        let terminatorIndex = bytes.findIndex(byte => byte === 0);
        let nameBytes = bytes.slice(0, terminatorIndex+1);
        this.name = decodeUtf8(nameBytes);
        tiled.log("Layer Name: " + this.name);
        

        let tileMapNameTerminatorIndex = bytes.slice(terminatorIndex+1).findIndex(byte => byte === 0) + terminatorIndex + 1;
        let tileMapNameBytes = bytes.slice(terminatorIndex+1, tileMapNameTerminatorIndex+1);
        let tileMapName = decodeUtf8(tileMapNameBytes);
        tiled.log("Tile Map Name: " + tileMapName);
        this.tilemap = tileMapName;

        let metaStart = tileMapNameTerminatorIndex + 1;
        this.tileCount = data.getInt16(metaStart+2, true);
        let metaEnd = metaStart + 6;

        this.meta = bData.slice(metaStart, metaEnd);

        let tileDataStart = metaEnd;
        let tileDataEnd = tileDataStart + (this.tileCount * 6);
        this.dataEnd = tileDataEnd;

        let tileData = bData.slice(tileDataStart, tileDataEnd);
        this.tiles = [];
        tiled.log("Tile Count: " + this.tileCount);
        for (let i = 0; i < this.tileCount; i++) {
            let tileStart = i * 6;
            let tileEnd = tileStart + 6;
            let tile = new RORTile(tileData.slice(tileStart, tileEnd));
            this.tiles.push(tile);


        }
    }
}


const META_LAYER_COUNT = 0x1A;
const META_COLLISION_COUNT = 0x1C;
const META_OBJECT_COUNT = 0x1D;
const LAYERS_START = 0x25;
const COLOR_START = 0x21

const format = tiled.registerMapFormat("rorlvl", {
    name: "Risk of Rain Returns Stage",
    extension: "rorlvl",
    read: function(fileName) {
        let map = new TileMap();
        let file = new BinaryFile(fileName, BinaryFile.ReadOnly);
        if (!file)
            return map;
        
        
        
        let bData = file.readAll();
        map.tileHeight = 32;
        map.tileWidth = 32;
        map.orientation = TileMap.Orthogonal;
        map.renderOrder = TileMap.RightDown;
        map.infinite = false;
        
        let colorBytes = new Uint8Array(bData.slice(COLOR_START, COLOR_START+3));
        let colorHexString = "#"+colorBytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
        map.backgroundColor = colorHexString;
        let data = new DataView(bData);
        
        let layerCount = data.getUint16(META_LAYER_COUNT,true);
        let collisionTypeCount = data.getUint8(META_COLLISION_COUNT);
        let objectCount = data.getUint16(META_OBJECT_COUNT,true);


        let mapX = data.getInt16(0x12, true);
        let mapY = data.getInt16(0x14, true);

        let mapWidth = data.getUint16(0x16, true) - mapX;
        let mapHeight = data.getUint16(0x18, true) - mapY;
        map.width = mapWidth;
        map.height = mapHeight;

        let layers: Array<RORLayer> = new Array<RORLayer>();
        let mapLayers: Array<Layer> = new Array<Layer>();
        let index = LAYERS_START;
        let currentLayer: RORLayer;

        let collisionTileset = new Tileset("Collision");
        collisionTileset.tileWidth = 32;
        collisionTileset.tileHeight = 32;
        collisionTileset.image = tiled.extensionsPath + "/collision_tile.png";
        map.addTileset(collisionTileset);

        let tilesets = new Array<Tileset>();

        let processedTilesets = {};
        let i: number;
        for(i=0; i < layerCount; index+=currentLayer.dataEnd, i++){
            currentLayer = new RORLayer(bData.slice(index))
            

            let layer = new TileLayer(currentLayer.name);
            let tmName = currentLayer.tilemap.slice(4,-1)
            


            let imgpath = tiled.extensionsPath+"/Export_Sprites/b" + tmName + "_0.png";

            let newTileset: Tileset;
            
            if(processedTilesets[tmName] === undefined){
                newTileset = new Tileset(tmName);
                newTileset.tileWidth = 32;
                newTileset.tileHeight = 32;
                newTileset.image = imgpath;
                processedTilesets[tmName] = newTileset;
                map.addTileset(newTileset);
            }
            else{
                newTileset = processedTilesets[tmName];
            }

            let image = new Image(imgpath);
            
            
            tilesets.push(newTileset);
            let edit = layer.edit();


            currentLayer.tiles.forEach(element => {
                let id = element.atlasX + element.atlasY * (image.width / 32)
                
                
                if((Math.floor(id) !== id) || (id < 0) || (id > newTileset.tileCount) || (
                    (element.atlasX+1)*32 > image.width || (element.atlasY+1)*32 > image.height 
                )){
                }
                else{
                    let t: Tile = newTileset.tile(id);
                    
                    if(element.x - mapX < mapWidth && element.y - mapY < mapHeight){
                    edit.setTile(element.x - mapX, element.y - mapY, t)
                    }
                }
            });
            
            edit.apply();
            currentLayer.associatedLayer = layer;
            layers.push(currentLayer);
            mapLayers.push(layer);
        }

        


        mapLayers
        .reverse().forEach(element => {
            map.addLayer(element);
        });

        tiled.log(layers.length + " Layers");

        let collisionLayer = new TileLayer("Collision");
        let collisionEdit = collisionLayer.edit();
        
        for(i = 0; i < collisionTypeCount; i++){
            let type = data.getUint8(index);
            tiled.log("Collision Type: " + type)
            let count = data.getUint32(index+1, true);
            index += 5;
            tiled.log("Collision Count: " + count)



            let collisionTile = collisionTileset.tile(type);

            for(let j = 0; j < count; j++){
                let x = data.getInt16(index+4*j, true)/2
                let y = data.getInt16(index+4*j+2, true)/2
                
                tiled.log("Collision Tile: " + x + ", " + y);
                collisionEdit.setTile(x-mapX, y-mapY, collisionTile);
            }
            index += count*4;
        }
        collisionEdit.apply();
        map.addLayer(collisionLayer);



        return map;
    }
});
