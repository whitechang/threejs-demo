export const PLANE_LENGTH = 44;  //货架板面长度
export const PLANE_WIDTH = 155;   //货架板面宽度
export const PLANE_HEIGHT = 2;   //货架板面高度
export const HOLDER_LENGTH = 2;  //支架长度
export const HOLDER_WIDTH = 2;   //支架宽度
export const HOLDER_HEIGHT = 25; //支架高度
export const LAYER_NUM = 3;      //货架层数
export const COLUMN_NUM = 1;     //货架每层列数
export const BOX_SIZE = 16;      //货物的大小(立方体)

export let shelfList = []; //货架列表
var shelf_obj = createShelf('Z1', 'A1', 'A1货架', PLANE_LENGTH, PLANE_WIDTH, PLANE_HEIGHT,
    HOLDER_LENGTH, HOLDER_WIDTH, HOLDER_HEIGHT, -300, 27, 0, LAYER_NUM, COLUMN_NUM);
var shelf_obj1 = createShelf('Z1', 'A2', 'A2货架', PLANE_LENGTH, PLANE_WIDTH, PLANE_HEIGHT,
    HOLDER_LENGTH, HOLDER_WIDTH, HOLDER_HEIGHT, 0, 27, 0, LAYER_NUM, COLUMN_NUM);
var shelf_obj2 = createShelf('Z1', 'A3', 'A3货架', PLANE_LENGTH, PLANE_WIDTH, PLANE_HEIGHT,
    HOLDER_LENGTH, HOLDER_WIDTH, HOLDER_HEIGHT, 300, 27, 0, LAYER_NUM, COLUMN_NUM);
shelfList.push(shelf_obj);
shelfList.push(shelf_obj1);
shelfList.push(shelf_obj2);
export let storageUnitList = []; //存储单元列表

export function createShelf(storageZoneId, shelfId, shelfName,
    planeLength, planeWidth, planeHeight,
    holderLength, holderWidth, holderHeight,
    positionX, positionY, positionZ,
    layerNum, columnNum) {
    return {
        storageZoneId: storageZoneId,
        shelfId: shelfId,
        shelfName: shelfName,
        planeLength: planeLength,
        planeWidth: planeWidth,
        planeHeight: planeHeight,
        holderLength: holderLength,
        holderWidth: holderWidth,
        holderHeight: holderHeight,
        positionX: positionX,
        positionY: positionY,
        positionZ: positionZ,
        layerNum: layerNum,
        columnNum: columnNum
    }
}

export function createStorageUnit(storageZoneId, shelfId, shelfName,
    inLayerNum, inColumnNum,
    positionX, positionY, positionZ, storageUnitId) {
    return {
        storageZoneId: storageZoneId,
        shelfId: shelfId,
        shelfName: shelfName,
        inLayerNum: inLayerNum,
        inColumnNum: inColumnNum,
        positionX: positionX,
        positionY: positionY,
        positionZ: positionZ,
        storageUnitId: storageUnitId
    }
}

export function getShelfById(shelfId) {
    const idx = shelfList.findIndex(shelf => shelf.shelfId === shelfId)
    if (idx !== -1) {
        return shelfList[idx]
    }
}

export function getStorageUnitByUnitId(storageUnitId) {
    const idx = storageUnitList.findIndex(storageUnit => storageUnit.storageUnitId === storageUnitId)
    if (idx !== -1) {
        return storageUnitList[idx]
    }
}

export function getStorageUnitById(shelfId, inLayerNum, inColumnNum) {
    const idx = storageUnitList.findIndex(storageUnit => storageUnit.shelfId == shelfId && storageUnit.inLayerNum == inLayerNum && storageUnit.inColumnNum == inColumnNum)
    if (idx !== -1) {
        return storageUnitList[idx]
    }
}