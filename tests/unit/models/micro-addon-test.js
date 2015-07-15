'use strict';

var path          = require('path');
var Project       = require('../../../lib/models/project');
var MicroAddon    = require('../../../lib/models/micro-addon');
var expect        = require('chai').expect;
var path          = require('path');

var fixturePath   = path.resolve(__dirname, '../../fixtures/addon');

describe('models/addon.js', function() {
  var project, projectPath;

  describe('treePaths and treeForMethods', function() {
    var ExampleMicroAddon;

    beforeEach(function() {
      projectPath = path.resolve(fixturePath, 'simple');
      var packageContents = require(path.join(projectPath, 'package.json'));

      project = new Project(projectPath, packageContents);

      ExampleMicroAddon = MicroAddon.extend({
        name: 'example',
        root: projectPath,
      });
    });

    describe('treeForApp', function() {
      it('exists even when not explicitly set', function() {
        var first = new ExampleMicroAddon(project);

        expect(first.treeForApp).to.be.a('Function');
      });
    });

    describe('treeForAddon', function() {
      it('exists even when not explicitly set', function() {
        var first = new ExampleMicroAddon(project);

        expect(first.treeForAddon).to.be.a('Function');
      });
    });

    describe('treeForTemplates', function() {
      it('exists even when not explicitly set', function() {
        var first = new ExampleMicroAddon(project);

        expect(first.treeForTemplates).to.be.a('Function');
      });
    });
  });

  describe('_buildTree', function() {
    var ExampleMicroAddon;

    beforeEach(function() {
      projectPath = path.resolve(fixturePath, 'simple');
      var packageContents = require(path.join(projectPath, 'package.json'));

      project = new Project(projectPath, packageContents);

      ExampleMicroAddon = MicroAddon.extend({
        name: 'example',
        root: projectPath,
      });
    });

    it('should return a tree', function() {
      var addon = new ExampleMicroAddon();

      var tree = addon._buildTree(['component.js']);

      expect(tree).to.contain.all.keys('inputTree', 'include', 'destDir', 'getDestinationPath');
    });
  });

  describe('_mapFile', function() {
    var ExampleMicroAddon, addon;

    beforeEach(function() {
      projectPath = path.resolve(fixturePath, 'simple');
      var packageContents = require(path.join(projectPath, 'package.json'));

      project = new Project(projectPath, packageContents);

      ExampleMicroAddon = MicroAddon.extend({
        name: 'example',
        root: projectPath,
      });

      addon = new ExampleMicroAddon();
    });

    it('should perform the proper mapping', function() {
      expect(addon._mapFile('component.js')).to.equal('components/example.js');
      expect(addon._mapFile('helper.js')).to.equal('helpers/example.js');
      expect(addon._mapFile('library.js')).to.equal('lib/example.js');
      expect(addon._mapFile('template.hbs')).to.equal('components/example.hbs');
      expect(addon._mapFile('style.css')).to.equal('addon/styles/example.css');
    });

    it('should return "undefined" for unsupported file', function() {
      expect(addon._mapFile('random.ext')).to.equal(undefined);
    });
  });
});