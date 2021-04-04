if (!Object.entries) {
  Object.entries = function (obj) {
    var props = Object.keys(obj),
      i = props.length,
      resArray = new Array(i);
    while (i--) {
      resArray[i] = [ownProps[i], obj[ownProps[i]]];
    }

    return resArray;
  };
}
