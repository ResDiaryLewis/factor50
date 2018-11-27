const expect = require('chai').expect;
const spfValidation = require('../spfValidation');

describe('spfValidation.getCloudFlareResourcesWithType()', function() {
    it('should not match a non cloudflare_record', function() {
        var s = `resource "foobar" "baz" {
            type  = "A"
            value = "blah"
        }`;
        var recordType = 'A';
        
        var result = spfValidation.getCloudFlareResourcesWithType(s, recordType);

        expect(result).to.be.empty;
    });

    it('should match a cloudflare_record with type A', function() {
        var s = `resource "cloudflare_record" "baz" {
            type  = "A"
            value = "blah"
        }`;
        var recordType = 'A';
        
        var result = spfValidation.getCloudFlareResourcesWithType(s, recordType);

        expect(result).to.deep.equal([s]);
    });

    it('should match a cloudflare_record with type A or MX', function() {
        var r1 = `resource "cloudflare_record" "baz" {
            type  = "A"
            value = "blah"
        }`;
        var r2 = `resource "cloudflare_record" "bar" {
            type  = "MX"
            value = "blah"
        }`;
        var recordType = '(A|MX)';
        
        var result = spfValidation.getCloudFlareResourcesWithType(r1 + r2, recordType);

        expect(result).to.deep.equal([r1, r2]);
    });
});

describe('spfValidation.getCloudFlareRecordValue()', function() {
    it('should not match a non cloudflare_record' , function() {
        var s = `resource "foobar" "baz" {
            type  = "A"
            value = "blah"
        }`;
        var fieldName = 'value';

        var result = spfValidation.getCloudFlareRecordValue(s, fieldName);

        expect(result).to.be.null;
    });

    it('should not match a cloudflare_record without `fieldName`', function() {
        var s = `resource "cloudflare_record" "baz" {
            type  = "A"
            value = "blah"
        }`;
        var fieldName = 'domain';

        var result = spfValidation.getCloudFlareRecordValue(s, fieldName);

        expect(result).to.be.null;
    });

    it('should return a field value if it exists', function() {
        var s = `resource "cloudflare_record" "baz" {
            type  = "A"
            value = "blah"
        }`;
        var fieldName = 'type';

        var result = spfValidation.getCloudFlareRecordValue(s, fieldName);

        expect(result).to.be.equal('A');
    });
});

describe('spfValidation.getFullHostName()', function() {
    it('should return null for non cloudflare_record', function() {
        var s = `resource "foobar" "baz" {
            type  = "A"
            value = "blah"
        }`;

        var result = spfValidation.getFullHostName(s);

        expect(result).to.be.null;
    });

    it('should return the full hostname for a cloudflare_record', function() {
        var s = `resource "cloudflare_record" "baz" {
            domain = "example.com"
            name   = "subdomain"
        }`;

        var result = spfValidation.getFullHostName(s);

        expect(result).to.be.equal('subdomain.example.com');
    });
});

describe('spfValidation.ifSpfRecord()', function() {
    it('should return false for a non cloudflare_record', function() {
        var s = `resource "foobar" "baz" {
            type  = "A"
            value = "blah"
        }`;

        var result = spfValidation.ifSpfRecord(s);

        expect(result).to.be.false;
    });

    it('should return false for a cloudflare_record that isn\'t an SPF', function() {
        var s = `resource "cloudflare_record" "baz" {
            type  = "A"
            value = "blah"
        }`;

        var result = spfValidation.ifSpfRecord(s);

        expect(result).to.be.false;
    });

    it('should return true for a cloudflare_record that is an SPF', function() {
        var s = `resource "cloudflare_record" "spf_resdiary_com_TXT_SPF" {
            domain  = "resdiary.com"
            value   = "v=spf1 ip4:0.0.0.0 -all"
            type    = "TXT"
            proxied = false
            name    = "spf"
        }`;

        var result = spfValidation.ifSpfRecord(s);

        expect(result).to.be.true;
    });
});

describe('spfValidation.getUniqueHostnames()', function() {
    it('should get one hostname', function() {
        var s = `resource "cloudflare_record" "spf_resdiary_com_TXT_SPF" {
            domain  = "resdiary.com"
            value   = "v=spf1 ip4:0.0.0.0 -all"
            type    = "TXT"
            proxied = false
            name    = "spf"
        }`;
        
        var cloudflare_resources = spfValidation.getCloudFlareResourcesWithType(s, '.+?');
        var result = spfValidation.getUniqueHostnames(cloudflare_resources);

        expect(result).to.deep.equal(new Set(['spf.resdiary.com']));
    });

    it('should get each hostname', function() {
        var s = `
            resource "cloudflare_record" "spf_resdiary_com_TXT_SPF" {
                domain  = "resdiary.com"
                value   = "v=spf1 ip4:0.0.0.0 -all"
                type    = "TXT"
                proxied = false
                name    = "spf"
            }
            
            resource "cloudflare_record" "spf2_resdiary_com_TXT_SPF" {
                domain  = "resdiary.com"
                value   = "v=spf1 ip4:0.0.0.0 -all"
                type    = "TXT"
                proxied = false
                name    = "spf2"
            }
        `;
        
        var cloudflare_resources = spfValidation.getCloudFlareResourcesWithType(s, '.+?');
        var result = spfValidation.getUniqueHostnames(cloudflare_resources);

        expect(result).to.deep.equal(new Set(['spf.resdiary.com', 'spf2.resdiary.com']));
    });
});
