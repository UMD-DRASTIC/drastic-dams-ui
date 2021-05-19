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

/* eslint-disable no-console */
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
  },
  findVue: function(path) {
    //console.log('finding: '+path+'in...');
    //console.log(this.node);
    var chain = path.split('/');
    if(path.endsWith('/')) chain.pop();
    //chain.shift();
    var currentNode = this.node;
    for (var j = 0; j < chain.length; j++) {
      let nextnode = null;
      for(var i = 0; i < currentNode.$children.length; i++) {
        let n = currentNode.$children[i];
        //console.log(n.node.data);
        if(n.node.data.text == chain[j]) {
          nextnode = n;
          break;
        }
      }
      if(nextnode == null) {
        console.log("not found: "+chain[j]+"\nunder: "+currentNode.text);
        return null;
      } else {
        currentNode = nextnode;
      }
    }
    //console.log("found: "+currentNode.node.data.text);
    return currentNode;
  }
};

export { Treehelp as default };
