'use strict';

var path = require('path');
var existsSync   = require('exists-sync');
var Funnel = require('broccoli-funnel');
var Addon  = require('../models/addon');

function getExistingFiles(fileList) {
  return fileList.filter(function(file) {
    return existsSync(file);
  });
}

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
  } else if (fileName === 'library.js') {
    return path.join('lib', this.name + '.js');
  }
};

Addon.prototype.treeForApp = function() {
  var supportedFiles = ['component.js', 'helper.js', 'library.js'];
  var includedFiles = getExistingFiles(supportedFiles);

  return this.buildTree(this.root, includedFiles);
};

Addon.prototype.treeForTemplates = function() {
  var supportedFiles = ['style.css'];
  var includedFiles = getExistingFiles(supportedFiles);

  return this.buildTree(this.root, includedFiles);
};

Addon.prototype.treeForAddon = function() {
  var supportedFiles = ['template.hbs'];
  var includedFiles = getExistingFiles(supportedFiles);

  return this.buildTree(this.root, includedFiles);
};
