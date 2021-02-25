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
