function flatten(arr) {
  return [].concat(...arr)
}

function Treehelp(node) {
  var about = {
     Version: 0.1,
     Author: "Greg Jansen",
     Created: "Fall 2020",
     Updated: "Fall 2020"
  };
  if (window === this) {
    return new Treehelp(node);
  }
  if(node) {
    this.node = node;
    return this;
  } else {
    return about;
  }
}

Treehelp.prototype = {
  depthFirstChildren: function() {
    return flatten(
      this.node.children.map( x => x.children.length > 0 ? [x].concat(new Treehelp(x).depthFirstChildren()) : x)
    )
  },
  makePath: function(base) {
    if(this.node.id == 'root') {  // get base node
      if(base) {
        return base;
      } else {
        return '/';
      }
    }
    var segments = [];
    for(var n = this.node; n != null; n = n.parent) {
      segments.push(n.data.text);
    }
    let result = segments.reverse().join('/');
    if(base) result = base + result;
    if(this.node.isBatch) { result += "/"; }
    return result.replace(' ', '_');
  }
};

export { Treehelp as default };
