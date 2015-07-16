'use strict';

/**
@module ember-cli
*/

var path          = require('path');
var existsSync    = require('exists-sync');
var Funnel        = require('broccoli-funnel');
var assign        = require('lodash/object/assign');
var SilentError   = require('silent-error');
var mergeTrees    = require('broccoli-merge-trees');


var Addon         = require('../models/addon');

/**
  Root class for a Micro Addon. If your Addon module exports an Object, this
  will be extended with that Object. If the addon module exports a constructor,
  it will not be extending this vclass.

  MicroAddon extends the base Addon class. The custom behavior of a Micro Addon
  is implemented by defining some common hooks the Addon class exposes.

  - {{#crosslink "MicroAddon/_buildTree:method"}}_buildTree{{/crosslink}}
  - {{#crosslink "MicroAddon/_mapFile:method"}}_mapFile{{/crosslink}}
  - {{#crosslink "MicroAddon/treeForApp:method"}}treeForApp{{/crosslink}}
  - {{#crosslink "MicroAddon/treeForAddon:method"}}treeForAddon{{/crosslink}}
  - {{#crosslink "MicroAddon/treeForTemplate:method"}}treeForTemplate{{/crosslink}}

  @class MicroAddon
  @extends Addon
  @param {(Project|Addon)} parent The project or addon that directly depends on this addon
  @param {Project} project The current project (deprecated)
*/
var MicroAddon = Addon.extend({

  /**
    Builds a tree out of an explicit array of files

    @private
    @method _buildTree
    @param {Array} includedFiles Array of filenames to build a tree from. All files are in addon root
    @return {tree} Newly built tree
  */
  _buildTree: function(includedFiles) {
    var addon = this;

    return new Funnel(addon.root, {
      include: includedFiles,
      getDestinationPath: function(fileName) {
        return addon._mapFile(fileName);
      }
    });
  },

  /**
    Maps a source file (placed in addon root) to a destination file

    Component mappings:
    - component.js  -> components/addon-name.js
    - template.hbs  -> templates/components/addon-name.hbs
    - style.css     -> addon/styles/addon-name.css

    Helper mappings:
    - helper.js     -> helpers/addon-name.js

    Library mappings:
    - library.js    -> lib/addon-name.js

    @private
    @method _mapFile
    @param {String} fileName Based file name
    @return {String} Mapped file path
  */
  _mapFile: function(fileName) {
    if (fileName === 'component.js') {
      return path.join('components', this.name + '.js');
    } else if (fileName === 'template.hbs') {
      return path.join('components', this.name + '.hbs');
    } else if (fileName === 'style.css') {
      return path.join('addon', 'styles', this.name + '.css');
    } else if (fileName === 'helper.js') {
      return path.join('helpers', this.name + '.js');
    } else if (fileName === 'library.js') {
      return path.join('lib', this.name + '.js');
    }
  },

  /**
    Maps app-related files from their location in a ember-micro-addon structure
    to their proper place in an ember-addon structure.

    Used by micro-components, micro-helpers and micro-libraries

    @public
    @method treeForApp
    @return {tree} A tree with properly mapped files.
  */
  treeForApp: function() {
    var includedFiles = ['component.js', 'helper.js'];

    return this._buildTree(includedFiles);
  },

  /**
    Maps app-related files from their location in a ember-micro-addon structure
    to their proper place in an ember-addon structure.

    Used by micro-components

    treeForTemplates maps to the templates subfolder automatically, so only the
    components subfolder is necessary in the mapped path.

    @public
    @method treeForTemplates
    @return {tree} A tree with properly mapped files.
  */
  treeForTemplates: function() {
    var includedFiles = ['template.hbs'];

    return this._buildTree(includedFiles);
  },

  /**
    Maps style.css to addon/styles/[addon-name].css. At that point, treeForAddon
    followed by the regular build process take over and style.css eventually
    ends up being merged into the app's vendor.css.

    @private
    @method treeForAddonStyles
    @return {tree} A tree with properly mapped files.
  */
  _treeForAddonStyles: function() {
    var includedFiles = ['style.css'];

    return this._buildTree(includedFiles);
  },

  /**
    Maps library.js to lib/library.js and outputs it to the addon folder. At
    that point, treeForAddon and the regular build process take over and
    library.js eventually becomes importable from
    '[addon-name]/lib/[addon-name]'

    @private
    @method treeForAddonJs
    @return {tree} A tree with properly mapped files.
  */
  _treeForAddonJs: function() {
    var includedFiles = ['library.js'];

    return this._buildTree(includedFiles);
  },

  /**
    Generates an addon tree and an addon style tree using treeForAddonJs and
    treeForAddonStyles, then merges them and returns the result.

    @public
    @method treeForAddon
    @return {tree} Merged and compiled output of _treeForAddonJs and
    _treeForAddonStyles
  */
  treeForAddon: function() {
    var addonTree = this._treeForAddonJs();
    var compiledAddonTree = this.compileAddon(addonTree);
    var addonStylesTree = this._treeForAddonStyles();
    var compiledStylesTree = this.compileStyles(addonStylesTree);

    return mergeTrees([compiledAddonTree, compiledStylesTree]);
  }
});

/**
  Returns the micro-addon class for a given addon name.
  If the MicroAddon exports a function, that function is used
  as constructor. If an Object is exported, a subclass of
  `MicroAddon` is returned with the exported hash merged into it.

  @private
  @static
  @method lookup
  @param {String} addon MicroAddon name
  @return {MicroAddon} MicroAddon class
*/
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
