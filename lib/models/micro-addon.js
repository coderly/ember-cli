'use strict';

var path = require('path');
var Funnel = require('broccoli-funnel');
var Addon  = require('../models/addon');

Addon.prototype.buildTree = function(sourceTree, includedFiles) {
  var addon = this;

  return new Funnel(sourceTree, {
    include: includedFiles,
    getDestination: function(fileName) {
      return addon.mapFile(fileName);
    }
  });
};

Addon.prototype.mapFile = function(fileName) {
  if (fileName === 'component.js') {
    return path.join('components', this.name + '.js');
  } else if (fileName === 'template.hbs') {
    return path.join('components', this.name + '.hbs');
  } else if (fileName === 'style.css') {
    return path.join('addon/styles', this.name + '.css');
  } else if (fileName === 'helper.js') {
    return path.join('helpers', this.name + '.js');
  }
};

Addon.prototype.treeForApp = function() {
  return this.buildTree(this.root, ['component.js', 'helper.js']);
};

Addon.prototype.treeForTemplates = function() {
  return this.buildTreew(this.root, ['style.css']);
};

Addon.prototype.treeForAddon = function() {
  return this.buildTree(this.root, ['template.hbs']);
};
