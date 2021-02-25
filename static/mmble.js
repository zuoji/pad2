window.bleMac = ''
var faya = {
  service_uuid: '49535343-FE7D-4AE5-8FA9-9FAFD205E455',
  characteristic_uuid_TX: '49535343-8841-43F4-A8D4-ECBE34729BB3',
  characteristic_uuid_RX: '49535343-1E4D-4BD9-BA61-23C647249616'
}

function onError (reason) {
  console.log('ERROR: ' + reason) // real apps should use notification.alert
}

function startScan () {
  var scanSeconds = 5
  window.ble.startScan([], onDiscoverDevice, onError)

  setTimeout(stopScan, scanSeconds * 1000)
};

function onDiscoverDevice (device) {
  if (device.name === 'FAYA') {
    window.bleMac = device.id
  }
}
function stopScan () {
  window.ble.stopScan(StopScanSuccess, onError)
}

function StopScanSuccess () {
  if (window.bleMac !== '') {
    console.log('find out faya success')
  }
}

function connectFAYA () {
  window.ble.setPin('1234', setPinSuccess, onError)
}

function setPinSuccess () {
  // 设置pin成功， 链接设备
  window.ble.connect(window.bleMac, onConnectSucess, onError)
}

function onConnectSucess () {
  window.ble.startNotification(window.bleMac, faya.service_uuid, faya.characteristic_uuid_RX, onNotification, onError)
  console.log('connect success')
}

// 读毛重
function readGW () {
  function success (data) {
    console.log('读毛重 success')
  }

  var data = new Uint8Array(3)
  data[0] = 0x02
  data[1] = 0x41
  data[2] = 0x03
  window.ble.writeWithoutResponse(window.bleMac, faya.service_uuid, faya.characteristic_uuid_TX, data.buffer, success, onError)
}

// 读净重
function readNW () {
  function success (data) {
    console.log('读净重 success')
  }
  var data = new Uint8Array(3)
  data[0] = 0x02
  data[1] = 0x42
  data[2] = 0x03
  window.ble.writeWithoutResponse(window.bleMac, faya.service_uuid, faya.characteristic_uuid_TX, data.buffer, success, onError)
}

// 读皮重
function readTW () {
  function success (data) {
    console.log('读皮重 success')
  }
  var data = new Uint8Array(3)
  data[0] = 0x02
  data[1] = 0x43
  data[2] = 0x03
  window.ble.writeWithoutResponse(window.bleMac, faya.service_uuid, faya.characteristic_uuid_TX, data.buffer, success, onError)
}

var NW = ''
function onNotification (buffer) {
  var data = new Uint8Array(buffer)
  var type = data[1]
  if (type === parseInt(0x47, 10)) {
    // 毛重
    console.log(String.fromCharCode.apply(null, data).substring(4))
  } else if (type === parseInt(0x4E, 10)) {
    // 净重
    NW = String.fromCharCode.apply(null, data).substring(4)
    console.log(String.fromCharCode.apply(null, data).substring(4))
  } else if (type === parseInt(0x54, 10)) {
    // 皮重
    console.log(String.fromCharCode.apply(null, data).substring(4))
  }
}

export {
  startScan,
  connectFAYA,
  readGW,
  readNW,
  readTW,
  NW
}
