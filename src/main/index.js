import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { createStorageUnit, shelfList, storageUnitList, getStorageUnitById, getShelfById } from './shelf';
import * as TWEEN from '@tweenjs/tween.js'
let matArrayA = []; //内墙
let matArrayB = []; //外墙
// 1、创建场景
const scene = new THREE.Scene()

// 2、创建相机
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0, 500, 1500);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// 初始化灯光
var directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);//模拟远处类似太阳的光源
directionalLight.color.setHSL(0.1, 1, 0.95);
directionalLight.position.set(0, 200, 0).normalize();
scene.add(directionalLight);

var ambient = new THREE.AmbientLight(0xffffff, 1); //AmbientLight,影响整个场景的光源
ambient.position.set(0, 0, 0);
scene.add(ambient);

const rackTexture = new THREE.TextureLoader().load("./rack.png")
const cargoTexture = new THREE.TextureLoader().load("./box.png")

//创建地板
var floorTexture = new THREE.TextureLoader().load("./floor.jpg");
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(10, 10);
var floorGeometry = new THREE.BoxGeometry(1400, 800, 1);
var floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -0.5;
floor.rotation.x = Math.PI / 2;
floor.name = "地面";
scene.add(floor);

function createCubeWall(width, height, depth, angle, material, x, y, z, name) {
    var cubeGeometry = new THREE.BoxGeometry(width, height, depth);
    var cube = new THREE.Mesh(cubeGeometry, material);
    cube.position.x = x;
    cube.position.y = y;
    cube.position.z = z;
    cube.rotation.y += angle * Math.PI;  //-逆时针旋转,+顺时针
    cube.name = name;
    scene.add(cube);
}

createCubeWall(10, 200, 800, 0, new THREE.MeshPhongMaterial({ color: 0xafc0ca }), -695, 100, 0, "墙面");
createCubeWall(10, 200, 800, 1, new THREE.MeshPhongMaterial({ color: 0xafc0ca }), 695, 100, 0, "墙面");
createCubeWall(10, 200, 1400, 1.5, new THREE.MeshPhongMaterial({ color: 0xafc0ca }), 0, 100, -400, "墙面");

//返回墙对象
function returnWallObject(width, height, depth, angle, material, x, y, z, name) {
    var cubeGeometry = new THREE.BoxGeometry(width, height, depth);
    var cube = new THREE.Mesh(cubeGeometry, material);
    cube.position.x = x;
    cube.position.y = y;
    cube.position.z = z;
    cube.rotation.y += angle * Math.PI;
    cube.name = name;
    return cube;
}
function createResultBsp(bsp, objects_cube) {
    console.log(window)
    var material = new THREE.MeshPhongMaterial({ color: 0x9cb2d1, specular: 0x9cb2d1, shininess: 30, transparent: true, opacity: 1 });
    var BSP = new ThreeBSP(bsp);
    for (var i = 0; i < objects_cube.length; i++) {
        var less_bsp = new ThreeBSP(objects_cube[i]);
        BSP = BSP.subtract(less_bsp);
    }
    var result = BSP.toMesh(material);
    result.material.flatshading = THREE.FlatShading;
    result.geometry.computeFaceNormals();  //重新计算几何体侧面法向量
    result.geometry.computeVertexNormals();
    result.material.needsUpdate = true;  //更新纹理
    result.geometry.buffersNeedUpdate = true;
    result.geometry.uvsNeedUpdate = true;
    scene.add(result);
}

//创建挖了门的墙
// var wall = returnWallObject(2600, 200, 10, 0, matArrayB, 0, 100, 700, "墙面");
// var door_cube1 = returnWallObject(200, 180, 10, 0, matArrayB, -600, 90, 700, "前门1");
// var door_cube2 = returnWallObject(200, 180, 10, 0, matArrayB, 600, 90, 700, "前门2");
// var window_cube1 = returnWallObject(100, 100, 10, 0, matArrayB, -900, 90, 700, "窗户1");
// var window_cube2 = returnWallObject(100, 100, 10, 0, matArrayB, 900, 90, 700, "窗户2");
// var window_cube3 = returnWallObject(100, 100, 10, 0, matArrayB, -200, 90, 700, "窗户3");
// var window_cube4 = returnWallObject(100, 100, 10, 0, matArrayB, 200, 90, 700, "窗户4");
// var objects_cube = [];
// objects_cube.push(door_cube1);
// objects_cube.push(door_cube2);
// objects_cube.push(window_cube1);
// objects_cube.push(window_cube2);
// objects_cube.push(window_cube3);
// objects_cube.push(window_cube4);
// createResultBsp(wall, objects_cube);


/** 放置单层货架 */
/** x,y,z 整个模型在场景中的位置 */
/** plane_x,plane_y,plane_z 货架板面的长高宽 */
/** holder_x,holder_y,holder_z 货架支架的长高宽 */
/** scene,name,num 要添加的场景,货架的名字,单层货架的库位数量 */
function addRack(x, y, z, plane_x, plane_y, plane_z, holder_x, holder_y, holder_z, scene, name, num) {
    var plane = new THREE.BoxGeometry(plane_x, plane_y, plane_z / num);
    var leftPlane = new THREE.BoxGeometry(holder_y, plane_y, plane_z / num);
    var frontPlane = new THREE.BoxGeometry(plane_x - 2 * holder_x, plane_y, holder_y);
    var gz = [];
    for (var i = 0; i < num; i++) {
        gz.push(z + plane_z / num / 2 + (plane_z / num) * i);
        var plane_top = new THREE.Mesh(plane, new THREE.MeshLambertMaterial({ color: 0x1C86EE }));
        plane_top.position.set(x, y, gz[i]);

        var plane_left = new THREE.Mesh(leftPlane, new THREE.MeshLambertMaterial());
        plane_left.position.set(x - plane_x / 2, y - holder_y / 2 - holder_x / 2, gz[i]);
        plane_left.rotation.z += .5 * Math.PI;

        var plane_front = new THREE.Mesh(frontPlane, new THREE.MeshLambertMaterial());
        plane_front.position.set(x, y - holder_y / 2, gz[i] + plane_z / 2);
        plane_front.rotation.x += 0.5 * Math.PI;

        var plane_backend = new THREE.Mesh(frontPlane, new THREE.MeshLambertMaterial());
        plane_backend.position.set(x, y - holder_y / 2, gz[i] - plane_z / 2);
        plane_backend.rotation.x += 0.5 * Math.PI;

        var msg = name + "$" + (2 - i);

        var storageUnitId = msg.split("$")[1] + "$" + msg.split("$")[3] + "$" + msg.split("$")[4];
        //添加货位
        var storageUnit_obj = createStorageUnit(msg.split("$")[0],
            msg.split("$")[1],
            msg.split("$")[2],
            msg.split("$")[3],
            msg.split("$")[4],
            x, y, gz[i], storageUnitId);
        storageUnitList.push(storageUnit_obj);

        var Unit = getStorageUnitById(msg.split("$")[1], msg.split("$")[3], msg.split("$")[4]);
        plane_top.name = "货位" + "$" + Unit.storageUnitId;
        scene.add(plane_top);
        scene.add(plane_left);
        scene.add(plane_front);
        scene.add(plane_backend);
    }

    var holder = new THREE.BoxGeometry(holder_x, holder_y, holder_z);
    var holder_1 = new THREE.Mesh(holder, new THREE.MeshPhongMaterial({ color: 0x1C86EE, map: rackTexture }));
    var holder_2 = new THREE.Mesh(holder, new THREE.MeshPhongMaterial({ color: 0x1C86EE, map: rackTexture }));
    var holder_3 = new THREE.Mesh(holder, new THREE.MeshPhongMaterial({ color: 0x1C86EE, map: rackTexture }));
    var holder_4 = new THREE.Mesh(holder, new THREE.MeshPhongMaterial({ color: 0x1C86EE, map: rackTexture }));

    holder_1.position.set(x - plane_x / 2 + holder_x / 2, y - holder_y / 2 - plane_y / 2, z + holder_z / 2);
    holder_2.position.set(x + plane_x / 2 - holder_x / 2, y - holder_y / 2 - plane_y / 2, z + holder_z / 2);
    holder_3.position.set(x - plane_x / 2 + holder_x / 2, y - holder_y / 2 - plane_y / 2, z + plane_z - holder_z / 2);
    holder_4.position.set(x + plane_x / 2 - holder_x / 2, y - holder_y / 2 - plane_y / 2, z + plane_z - holder_z / 2);
    scene.add(holder_1);
    scene.add(holder_2);
    scene.add(holder_3);
    scene.add(holder_4);
}

/** 放置一叠货架 */
/** stack_num 货架的叠数 */
function addStackOfRack(x, y, z, plane_x, plane_y, plane_z, holder_x, holder_y, holder_z, scene, name, num, stack_num) {
    for (var i = 0; i < stack_num; i++) {
        addRack(x, y * (i + 1), z, plane_x, plane_y, plane_z, holder_x, holder_y, holder_z, scene, name + "$" + (i + 1), num);
    }
    let plane = new THREE.BoxGeometry(plane_x, plane_y, plane_z);
    let plane_bottom = new THREE.Mesh(plane, new THREE.MeshLambertMaterial({ color: 0x1C86EE }));
    plane_bottom.position.set(x, 0, z + plane_z / num / 2);
    scene.add(plane_bottom);
}

/** 根据货架配置添加货架 */
shelfList.forEach(function (shelf) {
    addStackOfRack(shelf.positionX, shelf.positionY, shelf.positionZ, shelf.planeLength, shelf.planeHeight, shelf.planeWidth, shelf.holderLength, shelf.holderHeight, shelf.holderWidth, scene, shelf.storageZoneId + "$" + shelf.shelfId + "$" + shelf.shelfName, shelf.columnNum, shelf.layerNum);
});


function addCargo(x, y, z, box_x, box_y, box_z, name) {
    var geometry = new THREE.BoxGeometry(box_x, box_y, box_z);
    var obj = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ map: cargoTexture }));
    obj.position.set(x, y, z);
    obj.name = name;
    scene.add(obj);
}

/** 添加单个货位上的货物 */
function addOneUnitCargos(shelfId, inLayerNum, inColumnNum) {
    var storageUnit = getStorageUnitById(shelfId, inLayerNum, inColumnNum);
    var shelf = getShelfById(storageUnit.shelfId);
    var storageUnitid = storageUnit.storageUnitId;
    var x = storageUnit.positionX;
    var y = storageUnit.positionY + 8 + shelf.planeHeight / 2;
    var z = storageUnit.positionZ;
    addCargo(x, y, z, 16, 16, 16, "货物" + "$" + storageUnitid)
}

//添加货物
for (var i = 1; i <= 2; i++) {
    for (var j = 1; j <= 3; j++) {
        addOneUnitCargos("A" + j, i, '2');
    }
}

// 创建渲染器
const renderer = new THREE.WebGLRenderer()
// 设置渲染器的大小
renderer.setSize(window.innerWidth, window.innerHeight)
// 将渲染器添加到页面中
document.body.appendChild(renderer.domElement)

// 创建控制器
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true;
// 视角最小距离
controls.minDistance = 100;
// 视角最远距离
controls.maxDistance = 5000;
// 最大角度
controls.maxPolarAngle = Math.PI / 2.2;

// 创建点击射线
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var selectedObjects = [];

window.addEventListener('click', onMouseClick);
window.addEventListener('dblclick', onMouseDblClick);

function onMouseClick(event) {
    var x, y;
    if (event.changedTouches) {
        x = event.changedTouches[0].pageX;
        y = event.changedTouches[0].pageY;
    } else {
        x = event.clientX;
        y = event.clientY;
    }
    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = - (y / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects([scene], true);

    const labelElement = document.querySelectorAll('#label');

    if (intersects.length == 0) {
        labelElement[0].style.display = 'none'//隐藏说明性标签
        return;
    }
    if (intersects[0].object.name == "地面" || (intersects[0].object.name == "") || (intersects[0].object.name == "墙面")) {
        labelElement[0].style.display = 'none';//隐藏说明性标签
        selectedObjects.pop();
    } else {
        labelElement[0].style.display = 'block';// 显示说明性标签
        labelElement[0].style.left = x;
        labelElement[0].style.top = y - 40;// 修改标签的位置
        labelElement[0].innerHTML = intersects[0].object.name;// 显示模型信息

        selectedObjects.pop();
        selectedObjects.push(intersects[0].object);
    }
}

function onMouseDblClick(event) {
    var x, y;
    if (event.changedTouches) {
        x = event.changedTouches[0].pageX;
        y = event.changedTouches[0].pageY;
    } else {
        x = event.clientX;
        y = event.clientY;
    }
    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = - (y / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects([scene], true);

    if (intersects.length == 0) {
        createCameraTween({ x: 0, y: 500, z: 1500 }, { x: 0, y: 0, z: 0 })
        return;
    }
    if (intersects[0].object.name == "地面" || (intersects[0].object.name == "") || (intersects[0].object.name == "墙面")) {
        createCameraTween({ x: 0, y: 500, z: 1500 }, { x: 0, y: 0, z: 0 })
    } else {
        const pos = intersects[0].point.clone();
        const pos2 = pos.clone();
        pos2.x = pos2.x + 150;
        createCameraTween(pos2, pos)
    }
}

function createCameraTween(endPos, endTarget) {
    new TWEEN.Tween({
        // 不管相机此刻处于什么状态，直接读取当前的位置和目标观察点
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
        tx: controls.target.x,
        ty: controls.target.y,
        tz: controls.target.z,
    })
        .to({
            // 动画结束相机位置坐标
            x: endPos.x,
            y: endPos.y,
            z: endPos.z,
            // 动画结束相机指向的目标观察点
            tx: endTarget.x,
            ty: endTarget.y,
            tz: endTarget.z,
        }, 1500)
        .onUpdate(function (obj) {
            // 动态改变相机位置
            camera.position.set(obj.x, obj.y, obj.z);
            // 动态计算相机视线
            // camera.lookAt(obj.tx, obj.ty, obj.tz);
            controls.target.set(obj.tx, obj.ty, obj.tz);
            controls.update();//内部会执行.lookAt()
        })
        .start()
}

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    TWEEN.update()
    renderer.render(scene, camera)
}

animate()
