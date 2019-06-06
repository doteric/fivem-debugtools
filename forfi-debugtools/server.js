RegisterCommand("tppos", (source, args, raw) => {
  emitNet("forfi-debugtools:tppos", source, args);
}, true);

RegisterCommand("tpto", (source, args, raw) => {
  emitNet("forfi-debugtools:tpto", source, args[0]);
}, true);

RegisterCommand("tpwaypoint", (source, args, raw) => {
  emitNet("forfi-debugtools:tpwaypoint", source);
}, true);

RegisterCommand("testsound", (source, args, raw) => {
  emitNet("forfi-debugtools:testsound", source, args);
}, false);

RegisterCommand("getpos", (source, args, raw) => {
  emitNet("forfi-debugtools:getpos", source);
}, false);

RegisterCommand("spawnveh", (source, args, raw) => {
  if (args[0]) {
    emitNet("forfi-debugtools:spawnVeh", source, args[0]);
  }
}, true);

RegisterCommand("getid", (source, args, raw) => {
  const player = source;
  let steamId = false;
  let licenseId = false;
  for (let i = 0; i < GetNumPlayerIdentifiers(player); i++) {
    let tempid = GetPlayerIdentifier(player, i);
    if (tempid.includes("steam")) {
      steamId = tempid;
    }
    else if (tempid.includes("license")) {
      licenseId = tempid;
    }
  }
  emitNet("forfi-debugtools:getid", source, steamId, licenseId);
}, false);

RegisterCommand("debugcam", (source, args, raw) => {
  emitNet("forfi-debugtools:debugcam", source);
}, true);

RegisterCommand("campos", (source, args, raw) => {
  emitNet("forfi-debugtools:campos", source);
}, true);

RegisterCommand("setcampos", (source, args, raw) => {
  emitNet("forfi-debugtools:setcampos", source, args);
}, true);