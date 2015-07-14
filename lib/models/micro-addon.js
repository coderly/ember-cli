'use strict';

/**
@module ember-cli
*/

var path = require('path');
var existsSync   = require('exists-sync');
var Funnel = require('broccoli-funnel');
var assign       = require('lodash/object/assign');
var SilentError  = require('silent-error');

var Addon  = require('../models/addon');

function getExistingFiles(root, fileList) {
  var filteredList = fileList.filter(function(file) {
    return existsSync(path.join(root,file));
  });

  return filteredList;
}

var MicroAddon = Addon.extend({

  buildTree: function(sourceTree, includedFiles) {
    var addon = this;

    return new Funnel(sourceTree, {
      include: includedFiles,
      getDestinationPath: function(fileName) {
        return addon.mapFile(fileName);
      }
    });
  },

  mapFile: function(fileName) {
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
  },

  treeForApp: function() {
    var supportedFiles = ['component.js', 'helper.js', 'library.js'];
    var includedFiles = getExistingFiles(this.root, supportedFiles);

    return this.buildTree(this.root, includedFiles);
  },

  treeForTemplates: function() {
    var supportedFiles = ['template.hbs'];
    var includedFiles = getExistingFiles(this.root, supportedFiles);

    return this.buildTree(this.root, includedFiles);
  },

  treeForAddon: function() {
    var supportedFiles = ['style.css'];
    var includedFiles = getExistingFiles(this.root, supportedFiles);

    return this.buildTree(this.root, includedFiles);
  }
});

MicroAddon.lookup = function(addon) {
  var Constructor, addonModule, modulePath, moduleDir;

  modulePath = Addon.resolvePath(addon);
  moduleDir  = path.dirname(modulePath);

  if (existsSync(modulePath)) {
    addonModule = require(modulePath);

    if (typeof addonModule === 'function') {
      Constructor = addonModule;
      Constructor.prototype.root = Constructor.prototype.root || moduleDir;
      Constructor.prototype.pkg  = Constructor.prototype.pkg || addon.pkg;
    } else {
      Constructor = MicroAddon.extend(assign({
        root: moduleDir,
        pkg: addon.pkg
      }, addonModule));
    }
  }

  if (!Constructor) {
    throw new SilentError('The `' + addon.pkg.name + '` addon could not be found at `' + addon.path + '`.');
  }

  return Constructor;
};

module.exports = MicroAddon;
