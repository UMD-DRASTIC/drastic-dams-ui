/* eslint-disable no-console */
import XLSX from 'xlsx';
import filenames from './filenames';

function Sheet(fsfileentry) {
  var about = {
     Version: 0.1,
     Author: "Greg Jansen",
     Created: "Fall 2020",
     Updated: "Fall 2020"
  };
  if (window === this) {
    return new Sheet(fsfileentry);
  }
  // NABWH_001_SG1_S19_B01_F01_D01_P008.tif
  this.workbook = undefined;
  if(fsfileentry) {
    this.fsfileentry = fsfileentry;
    return this;
  } else {
    return about;
  }
}

function readFile(entry, successCallback, errorCallback) {
  entry.file(function(f) {
    //console.log('file function called');
    var reader = new FileReader();
    reader.onload = function(e) {
      //console.log('reader function');
      var data = new Uint8Array(e.target.result);
      successCallback(XLSX.read(data, {type: 'array'}));
    };
    reader.onerror = function() {
      errorCallback(reader.error);
    }
    reader.readAsArrayBuffer(f);
  }, errorCallback);
}

// function extractLines(start, end, text) {
//   let result = [];
//   text.split('\n').forEach( (line, idx) => {
//     if(start <= idx && idx <= end) {
//       result.push(line);
//     }
//   });
//   console.log(result.length);
//   return result.join('\n');
// }

/* eslint-disable no-console */
Sheet.prototype = {
  getTextPreview: function() {
    var worksheet = this.workbook.Sheets[this.workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_txt(worksheet).split('\n').slice(0, 6).join('\n');
  },
  loadWorkbook: function() {
    readFile(this.fsfileentry,
      wb => { this.workbook = wb; },
      function(e) {
        console.log(e);
      }
    );
  },
  harvestDC: function(descriptions_base) {
    let result = `@prefix  dce:   <http://purl.org/dc/elements/1.1/>.
@prefix  xsd:   <http://www.w3.org/2001/XMLSchema#>.

`;
    var worksheet = this.workbook.Sheets[this.workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(worksheet);
    const lookup = {};
    Object.entries(json[0]).forEach(([key, value]) => {
      if(value.toLowerCase() in dc_mapping) {
        lookup[key] = value.toLowerCase();
      }
    });
    json.slice(1).forEach((item) => {
      let dc_record = {};
      Object.entries(item).forEach(([key, value]) => {
        if(new String(value).trim().length < 1) {
          // skip blank values in spreadsheet
        } else if (key in lookup) {
          if(lookup[key] != 'date') {
            dc_record[lookup[key]] = '"'+value.replace(/"/g,'\\"')+'"';
          } else {
            dc_record[lookup[key]] = '"'+value+'"^^xsd:date';
          }
        }
      });
      let path = new filenames(dc_record['identifier']).getItemPath().slice(1,-1);
      //console.log(path);
      result += `<${descriptions_base}${path}> `
      Object.entries(dc_record).forEach(([prop, value]) => {
        result += `dce:${prop} ${value};\n`;
      });
      result += ".\n";
    });
    //console.log(extractLines(240, 242, result));
    return result;
  }
}

const dc_mapping = {
  identifier: {},
  title: {},
  creator: {},
  subject: {},
  description: {},
  date: {},
  rights: {}
};

/* eslint-disable no-unused-vars */
const example_json = [
  {
    "__EMPTY": "Collection",
    "__EMPTY_1": "SubGroup",
    "__EMPTY_2": "Series",
    "__EMPTY_3": "Sub Series",
    "__EMPTY_4": "Box",
    "__EMPTY_5": "Folder",
    "__EMPTY_6": "Document",
    "Dublin Core Metadata": "Identifier",
    "__EMPTY_7": "Title",
    "__EMPTY_8": "Creator",
    "__EMPTY_9": "Subject",
    "__EMPTY_10": "Description",
    "__EMPTY_11": "Date",
    "__EMPTY_12": "Rights"
  },
  {
    "__EMPTY": "NABWH_001",
    "__EMPTY_1": 1,
    "__EMPTY_2": 19,
    "__EMPTY_4": 1,
    "__EMPTY_5": 1,
    "__EMPTY_6": 1,
    "Dublin Core Metadata": "NABWH_001_SG1_S19_B01_F01_D01",
    "__EMPTY_7": "Newsletter, New Careers",
    "__EMPTY_8": "New Careers",
    "__EMPTY_9": "New Careers",
    "__EMPTY_10": "Vol. 1, No. 3 of newsletter New Careers",
    "__EMPTY_11": "1967",
    "__EMPTY_12": "Fair Use Only. The subject of this image is part of the National Archives for Black Women's History, which has been under the management and care of the National Park Service since 1994. The Mary McLeod Bethune Council House National Historic Site, National Archives for Black Women's History does not hold the intellectual property rights to all materials within its collections. Use of this image and the subject document is restricted to fair use only. Contact the repository for updated information about more extensive use.  [2017-08-04]."
  }
];


export { Sheet as default };
