let debugInfoEnabled = false;

RegisterNetEvent("forfi-debugtools:tppos");
onNet("forfi-debugtools:tppos", (pos) => {
  if (pos[0] && pos[1] && pos[2]) {
    tpToCoords(parseInt(pos[0]), parseInt(pos[1]), parseInt(pos[2]));
  }
});

RegisterNetEvent("forfi-debugtools:tpto");
onNet("forfi-debugtools:tpto", (pid) => {
  if (pid) {
    const targetPed = GetPlayerPed(GetPlayerFromServerId(parseInt(pid)));
    const targetCoords = GetEntityCoords(targetPed);
    tpToCoords(targetCoords[0], targetCoords[1], targetCoords[2]+0.5);
  }
});

async function tpToCoords(x, y, z) {
  const playerPed = GetPlayerPed(-1);
  const myVehicle = GetVehiclePedIsIn(playerPed, false);
  let entityToFreeze = playerPed;
  if (DoesEntityExist(myVehicle) && IsEntityAVehicle(myVehicle)) {
    SetNetworkVehicleRespotTimer(VehToNet(myVehicle), 5000);
    entityToFreeze = myVehicle;
  }
  SetPedCoordsKeepVehicle(playerPed, x, y, z);
  FreezeEntityPosition(entityToFreeze, true);
  while (!HasCollisionLoadedAroundEntity(entityToFreeze)) {
    await Wait(100);
  }
  FreezeEntityPosition(entityToFreeze, false);
}

RegisterNetEvent("forfi-debugtools:tpwaypoint");
onNet("forfi-debugtools:tpwaypoint", async () => {
  const WaypointHandle = GetFirstBlipInfoId(8);
  if (DoesBlipExist(WaypointHandle)) {
    const waypointCoords = GetBlipInfoIdCoord(WaypointHandle);
    for (let height = 1; height < 1000; height++) {
      SetPedCoordsKeepVehicle(PlayerPedId(), waypointCoords[0], waypointCoords[1], height + 0.0);
      const [foundGround, zPos] = GetGroundZFor_3dCoord(waypointCoords[0], waypointCoords[1], height + 0.0, 0);
      if (foundGround) {
        SetPedCoordsKeepVehicle(PlayerPedId(), waypointCoords[0], waypointCoords[1], zPos + 0.0);
        break;
      }
      await Wait(5);
    }
  }
});

RegisterNetEvent("forfi-debugtools:testsound");
onNet("forfi-debugtools:testsound", (args) => {
  if (args[0] && args[1]) {
    PlaySoundFrontend(-1, args[0], args[1]);
  }
});

RegisterNetEvent("forfi-debugtools:getpos");
onNet("forfi-debugtools:getpos", () => {
  const pos = GetEntityCoords(GetPlayerPed(-1));
  const heading = GetEntityHeading(GetPlayerPed(-1));
  const text = "x: "+pos[0].toFixed(2)+", y: "+pos[1].toFixed(2)+", z: "+pos[2].toFixed(2)+", heading: "+heading.toFixed(2);
  SendNuiMessage(JSON.stringify({
    action: "OPEN_TEXTBOX",
    text: text
  }));
  SetNuiFocus(true, true);
});

RegisterNetEvent("forfi-debugtools:spawnVeh");
onNet("forfi-debugtools:spawnVeh", async (model) => {
  const myVehicle = GetVehiclePedIsIn(GetPlayerPed(-1), false);
  if (IsEntityAVehicle(myVehicle)) {
    SetEntityAsMissionEntity(myVehicle, true, true);
    DeleteEntity(myVehicle);
  }
  if (IsModelAVehicle(model)) {
    const playerPed = GetPlayerPed(-1)
    const playerPos = GetEntityCoords(playerPed);
    const vehicle = await spawnVehicle(model, {
      x: playerPos[0],
      y: playerPos[1],
      z: playerPos[2],
      heading: GetEntityHeading(playerPed),
      network: true
    });
    SetPedIntoVehicle(playerPed, vehicle, -1);
  }
});

RegisterNetEvent("forfi-debugtools:getid");
onNet("forfi-debugtools:getid", (steamId, licenseId) => {
  const text = steamId+"\n"+licenseId;
  SendNuiMessage(JSON.stringify({
    action: "OPEN_TEXTBOX",
    text: text
  }));
  SetNuiFocus(true, true);
});

let debugCamActive = false;
let debugCam;
let debugCamPos = {};
RegisterNetEvent("forfi-debugtools:debugcam");
onNet("forfi-debugtools:debugcam", async () => {
  if (debugCamActive === false) {
    const playerPed = GetPlayerPed(-1);
    const playerPos = GetEntityCoords(playerPed);
    FreezeEntityPosition(playerPed, true);
    // CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", xPos, yPos, zPos, updownRot, circleRot, leftrightRot, fov, false, 2);
    debugCamPos = {
      x: playerPos[0],
      y: playerPos[1],
      z: playerPos[2],
      xRot: 0.0,
      yRot: 0.0,
      zRot: 0.0,
      fov: 45.0
    }
    debugCam = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", debugCamPos.x, debugCamPos.y, debugCamPos.z, debugCamPos.xRot, debugCamPos.yRot, debugCamPos.zRot, debugCamPos.fov, false, 2);
    SetCamActive(debugCam, true);
    RenderScriptCams(true, 0, 1000, true, false);
    debugCamActive = true;
    while (debugCamActive) {
      await Wait(100);
      updateDebugCam();
    }
  }
  else {
    debugCamActive = false;
    RenderScriptCams(false, 0, 1000, true, false);
    SetCamActive(debugCam, false);
    DestroyCam(debugCam, true);
    const playerPed = GetPlayerPed(-1);
    FreezeEntityPosition(playerPed, false);
  }
});

setTick(() => {
  if (debugCamActive === true) {
    const sinX = Math.sin(debugCamPos.xRot * Math.PI / 180);
    const sinY = Math.sin(debugCamPos.yRot * Math.PI / 180);
    const sinZ = Math.sin(debugCamPos.zRot * Math.PI / 180);
    const cosX = Math.cos(debugCamPos.xRot * Math.PI / 180);
    const cosY = Math.cos(debugCamPos.yRot * Math.PI / 180);
    const cosZ = Math.cos(debugCamPos.zRot * Math.PI / 180);
    if (IsControlPressed(0, 32)) { // W
      debugCamPos.x += 0.5 * (cosZ * sinX * sinY - cosX * sinZ);
      debugCamPos.y += 0.5 * (cosX * cosZ - sinX * sinY * sinZ);
      debugCamPos.z += 0.5 * (cosY * sinX);
    }
    if (IsControlPressed(0, 33)) { // S
      debugCamPos.x -= 0.5 * (cosZ * sinX * sinY - cosX * sinZ);
      debugCamPos.y -= 0.5 * (cosX * cosZ - sinX * sinY * sinZ);
      debugCamPos.z -= 0.5 * (cosY * sinX);
    }
    if (IsControlPressed(0, 34)) { // A
      debugCamPos.x -= 0.5 * (cosY * cosZ);
      debugCamPos.y -= 0.5 * (cosY * sinZ);
      debugCamPos.z -= 0.5 * -sinY;
    }
    if (IsControlPressed(0, 35)) { // D
      debugCamPos.x += 0.5 * (cosY * cosZ);
      debugCamPos.y += 0.5 * (cosY * sinZ);
      debugCamPos.z += 0.5 * -sinY;
    }
    if (IsControlPressed(0, 10)) { // PAGE UP
      debugCamPos.x += 0.5 * (-cosX * cosZ * sinY + sinX * sinZ);
      debugCamPos.y += 0.5 * (-cosZ * sinX + cosX * sinY * sinZ);
      debugCamPos.z += 0.5 * (cosX * cosY);
    }
    if (IsControlPressed(0, 11)) { // PAGE DOWN
      debugCamPos.x -= 0.5 * (-cosX * cosZ * sinY + sinX * sinZ);
      debugCamPos.y -= 0.5 * (-cosZ * sinX + cosX * sinY * sinZ);
      debugCamPos.z -= 0.5 * (cosX * cosY);
    }
    if (IsControlPressed(0, 111)) { // NUMPAD 8
      debugCamPos.xRot += 1.0;
      debugCamPos.xRot %= 360;
    }
    if (IsControlPressed(0, 110)) { // NUMPAD 5
      debugCamPos.xRot -= 1.0;
      debugCamPos.xRot %= 360;
    }
    if (IsControlPressed(0, 108)) { // NUMPAD 4
      debugCamPos.zRot += 1.0;
      debugCamPos.zRot %= 360;
    }
    if (IsControlPressed(0, 107)) { // NUMPAD 6
      debugCamPos.zRot -= 1.0;
      debugCamPos.zRot %= 360;
    }
    if (IsControlPressed(0, 117)) { // NUMPAD 7
      debugCamPos.yRot -= 1.0;
      debugCamPos.yRot %= 360;
    }
    if (IsControlPressed(0, 118)) { // NUMPAD 9
      debugCamPos.yRot += 1.0;
      debugCamPos.yRot %= 360;
    }
    if (IsControlPressed(0, 96)) { // NUMPAD-
      debugCamPos.fov -= 1.0;
    }
    if (IsControlPressed(0, 97)) { // NUMPAD+
      debugCamPos.fov += 1.0;
    }
  }
});

function updateDebugCam() {
  let newCam = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", debugCamPos.x, debugCamPos.y, debugCamPos.z, debugCamPos.xRot, debugCamPos.yRot, debugCamPos.zRot, debugCamPos.fov, false, 2);
  SetCamActiveWithInterp(newCam, debugCam, 100, true, true);
  SetCamActive(debugCam, false);
  DestroyCam(debugCam, true);
  debugCam = newCam;
}

RegisterNetEvent("forfi-debugtools:campos");
onNet("forfi-debugtools:campos", async () => {
  if (debugCamActive === true) {
    const text = JSON.stringify(debugCamPos);
    SendNuiMessage(JSON.stringify({
      action: "OPEN_TEXTBOX",
      text: text
    }));
    SetNuiFocus(true, true);
  }
});

RegisterNetEvent("forfi-debugtools:setcampos");
onNet("forfi-debugtools:setcampos", async (args) => {
  if (debugCamActive === true) {
    if (args[0] && args[1] && args[2]) {
      debugCamPos = {
        x: parseFloat(args[0]),
        y: parseFloat(args[1]),
        z: parseFloat(args[2]),
        xRot: 0.0,
        yRot: 0.0,
        zRot: 0.0,
        fov: 45.0
      };
    }
  }
});

RegisterNuiCallbackType("debugtools:close");
on("__cfx_nui:debugtools:close", (data, cb) => {
  SetNuiFocus(false, false);
});

setImmediate(() => {
  emit('chat:addSuggestion', '/tppos', 'Teleport to coords.', [
    {name:"x", help:"X coord."},
    {name:"y", help:"Y coord."},
    {name:"z", help:"Z coord."}
  ]);
  emit('chat:addSuggestion', '/tpto', 'Teleport to player.', [
    {name:"id", help:"Player server id."}
  ]);
});

setTick(() => {
  if (IsControlJustReleased(1, 56)) {
    debugInfoEnabled = !debugInfoEnabled;
  }
  if (debugInfoEnabled) {
    const pos = GetEntityCoords(GetPlayerPed(-1));
    const heading = GetEntityHeading(GetPlayerPed(-1));
    const text = "X: "+pos[0].toFixed(2)+", Y: "+pos[1].toFixed(2)+", Z: "+pos[2].toFixed(2)+", H: "+heading.toFixed(2);
    emit("showText", 0.75, 0.005, 0.3, text, 170, 170, 170, 255);
  }
});

async function spawnVehicle(modelHash, data, markAsNotNeeded = true) {
  RequestModel(modelHash);
  while (!HasModelLoaded(modelHash)) {
    await Wait(100);
  }
  const vehicle = CreateVehicle(modelHash, data.x, data.y, data.z, data.heading,data.network, false);
  if (markAsNotNeeded) {
    SetEntityAsNoLongerNeeded(vehicle);
  }
  SetModelAsNoLongerNeeded(modelHash);
  return vehicle;
}

const Wait = (ms) => new Promise(res => setTimeout(res, ms));