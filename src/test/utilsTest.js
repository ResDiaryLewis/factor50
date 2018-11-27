const expect = require('chai').expect;
const utils = require('../utils');

describe('utils.regexFindAll()', function() {
    it('should be empty if it doesn\'t match', function() {
        var s = 'foo';
        var re = new RegExp('bar', 'g');

        var result = utils.regexFindAll(re, s);

        expect(result).to.be.empty;
    });

    it('should be a list of length one if there is one match', function() {
        var s = 'foo';
        var re = new RegExp('f', 'g');

        var result = utils.regexFindAll(re, s);

        expect(result).to.deep.equal(['f']);
    });

    it('should match 3 times if there are 3 matches', function() {
        var s = 'fffooooo';
        var re = new RegExp('f', 'g');

        var result = utils.regexFindAll(re, s);

        expect(result).to.deep.equal(['f', 'f', 'f']);
    });
});

describe('utils.union()', function() { 
    it('should return the empty set for two empty sets', function() {
        var result = utils.union(new Set(), new Set());

        expect(result).to.be.empty;
    });

    it('should return the first argument for a set with an empty set', function() {
        var s1 = new Set([1, 2, 3]);

        var result = utils.union(s1, new Set());

        expect(result).to.deep.equal(s1);
    });

    it('should be the union of two sets', function() {
        var s1 = new Set([1, 2, 3]);
        var s2 = new Set([3, 4, 5]);

        var result = utils.union(s1, s2);

        expect(result).to.deep.equal(new Set([1, 2, 3, 4, 5]));
    });
});