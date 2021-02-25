window.bleMac = localStorage.getItem("bleMac") || '';
window.faya = {
  service_uuid: '49535343-FE7D-4AE5-8FA9-9FAFD205E455',
  characteristic_uuid_TX: '49535343-8841-43F4-A8D4-ECBE34729BB3',
  characteristic_uuid_RX: '49535343-1E4D-4BD9-BA61-23C647249616'
};
window.NW = '0';
window.printer = function (){};
window.printer.init = function (){
  const that = this;
  window.printer.startScan(function (){
    window.printer.connectFAYA();
  })
}
window.printer.onError = function (reason){
  //alert("ERROR: " + reason);
  console.log('ERROR: ' + reason);
  alert('ERROR: ' + reason + "请断开蓝牙重新提交");
  document.dispatchEvent(window.bluetoothOffEvet);
}
window.printer.startScan = function (callback){
  const that = this
  var scanSeconds = 5
  window.ble && window.ble.startScan([], onDiscoverDevice, window.printer.onError)
  function onDiscoverDevice (device) {
    if (device.name === 'FAYA') {
      window.bleMac = device.id;
      localStorage.setItem("bleMac",device.id);
      callback && callback();
      document.dispatchEvent(window.scanDeviceSuccess);
    }
  }
  setTimeout(window.printer.stopScan, scanSeconds * 1000)
}
window.printer.stopScan = function (){
  const that = this
  window.ble && window.ble.stopScan(StopScanSuccess, window.printer.onError)
  function StopScanSuccess () {
    if (window.bleMac !== '') {
      document.dispatchEvent(window.contentSuccess);
      console.log('find out faya success')
    }
  }
}
window.printer.connectFAYA = function (){
  //alert("connectFAYA")
  window.ble.setPin('1234', window.printer.setPinSuccess, window.printer.onError)
}
window.printer.checkIsConnect= function (call){
  console.log(window.bleMac, 'checkIsConnect')
  window.ble.isConnected(window.bleMac, success, err)
  function success () {
    call && call(1)
  };
  function err(data){
    call && call(0)
  }
},
// 关闭链接
window.closeConnect = function (call) {
  console.log(this.bleMac, 'closeConnect')
  window.ble.disconnect(window.bleMac, onCloseSucess, window.onError)
  function onCloseSucess () {
    call && call();
    console.log('disconnect success')
  }
},
window.printer.setPinSuccess = function (){
  const that = this
  // 设置pin成功， 链接设备
  window.ble.connect(window.bleMac, onConnectSucess, window.onError)
  function onConnectSucess () {
    window.ble.startNotification(window.bleMac, window.faya.service_uuid, window.faya.characteristic_uuid_RX, window.printer.onNotification, window.onError)
    console.log('connect success');
    //alert("dispatchEvent bluetoothOnEvet");
    document.dispatchEvent(window.bluetoothOnEvet)
    window.pinSuccess = true;
  }
}
window.printer.onNotification = function (buffer){
  var data = new Uint8Array(buffer)
  var type = data[1]
  if (type === parseInt(0x47, 10)) {
    // 毛重
    console.log(String.fromCharCode.apply(null, data).substring(4))
  } else if (type === parseInt(0x4E, 10)) {
    // 净重
    window.NW = String.fromCharCode.apply(null, data).substring(4)
    window.NW = window.NW.replace("(kg)","");
    if(window.NW){
      window.NW = parseFloat(window.NW);
    }
    console.log(String.fromCharCode.apply(null, data).substring(4))
  } else if (type === parseInt(0x54, 10)) {
    // 皮重
    console.log(String.fromCharCode.apply(null, data).substring(4))
  }
}
window.printer.readGW = function (){
  function success (data) {
    console.log('读毛重 success')
  }

  var data = new Uint8Array(3)
  data[0] = 0x02
  data[1] = 0x41
  data[2] = 0x03
  window.ble.writeWithoutResponse(window.bleMac, window.faya.service_uuid, window.faya.characteristic_uuid_TX, data.buffer, success, window.printer.onError)
}
window.printer.readNW = function (call){
  function success (data) {
    console.log('读净重 success')
  }
  var call = call || success;
  var data = new Uint8Array(3)
  data[0] = 0x02
  data[1] = 0x42
  data[2] = 0x03
  window.ble.writeWithoutResponse(window.bleMac, window.faya.service_uuid, window.faya.characteristic_uuid_TX, data.buffer, call, window.printer.onError)
}
window.printer.readTW = function (){
  function success (data) {
    console.log('读皮重 success')
  }
  var data = new Uint8Array(3)
  data[0] = 0x02
  data[1] = 0x43
  data[2] = 0x03
  window.ble.writeWithoutResponse(window.bleMac, window.faya.service_uuid, window.faya.characteristic_uuid_TX, data.buffer, success, window.printer.onError)
}
function printLable (para) {
  function success () {}
  function fail () {}

  window.cordova.plugins.mmprinter.print_label([{
    deptname: para.deptname,
    time: para.time,
    type: para.type,
    weight: para.weight,
    hospital: para.hospital,
    code: para.code,
    person: para.person
  }], success, fail)
}

export {
  printLable
}
