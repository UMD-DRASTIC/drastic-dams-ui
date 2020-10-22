function Filenames(filename) {
  var about = {
     Version: 0.1,
     Author: "Greg Jansen",
     Created: "Fall 2020",
     Updated: "Fall 2020"
  };
  if (window === this) {
    return new Filenames(filename);
  }
  // NABWH_001_SG1_S19_B01_F01_D01_P008.tif
  this.resource_names = /^(?<archives>[^_]*)_(?<collection>_[^_]*)(?<subgroup>_.*)\..*/g
  this.sources = /\.tif$/g
  if(filename) {
    this.filename = filename;
    this.parts = this.filename.match(this.resource_names);
    return this;
  } else {
    return about;
  }
}

/* eslint-disable no-console */
Filenames.prototype = {
  getDescriptionPaths: function() {
    let basename = this.filename.slice(0, new String(this.filename).lastIndexOf('.'));
    let parts = basename.split('_');
    parts[0] = parts[0]+'_'+parts[1]; // WONT FIX smush archive and collection together
    parts.splice(1, 1);
    parts[3] = 'BX00'+parts[3].slice(1,3);  // B01 segment to BX0001 form
    parts[4] = 'FL00'+parts[4].slice(1,3);  // F01 segment to FL0001 form
    return parts.map((val, idx) => {
      return '/'+parts.slice(0, idx+1).join('/');
    }).reverse();
  },
  isSource: function() {
    return this.sources.test(this.filename);
  }
};

export { Filenames as default };
