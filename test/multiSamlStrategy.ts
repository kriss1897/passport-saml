"use strict";
import * as express from "express";
import * as sinon from "sinon";
import * as should from "should";
import { Strategy as SamlStrategy, MultiSamlStrategy } from "../src/passport-saml";
import { SamlOptionsCallback } from "../src/passport-saml/types";

function verify() {}

describe("Strategy()", function () {
  it("extends passport Strategy", function () {
    function getSamlOptions() {
      return {};
    }
    const strategy = new MultiSamlStrategy({ getSamlOptions: getSamlOptions }, verify);
    strategy.should.be.an.instanceOf(SamlStrategy);
  });

  it("throws if wrong finder is provided", function () {
    function createStrategy() {
      return new MultiSamlStrategy({} as any, verify);
    }
    should.throws(createStrategy);
  });
});

describe("strategy#authenticate", function () {
  beforeEach(function () {
    this.superAuthenticateStub = sinon.stub(SamlStrategy.prototype, "authenticate");
  });

  afterEach(function () {
    this.superAuthenticateStub.restore();
  });

  it("calls super with request and auth options", function (done) {
    const superAuthenticateStub = this.superAuthenticateStub;
    function getSamlOptions(req: express.Request, fn: SamlOptionsCallback) {
      try {
        fn(null, {});
        sinon.assert.calledOnce(superAuthenticateStub);
        done();
      } catch (err2) {
        done(err2);
      }
    }

    const strategy = new MultiSamlStrategy(
      {
        getSamlOptions: getSamlOptions,
      },
      verify
    );
    strategy.authenticate("random" as any, "random" as any);
  });

  it("passes options on to saml strategy", function (done) {
    const passportOptions = {
      passReqToCallback: true,
      authnRequestBinding: "HTTP-POST",
      getSamlOptions: function (req: express.Request, fn: SamlOptionsCallback) {
        try {
          fn(null, {});
          strategy._passReqToCallback!.should.eql(true);
          strategy._authnRequestBinding!.should.eql("HTTP-POST");
          done();
        } catch (err2) {
          done(err2);
        }
      },
    };

    var strategy = new MultiSamlStrategy(passportOptions, verify);
    strategy.authenticate("random" as any, "random" as any);
  });

  it("uses given options to setup internal saml provider", function (done) {
    const superAuthenticateStub = this.superAuthenticateStub;
    const samlOptions = {
      issuer: "http://foo.issuer",
      callbackUrl: "http://foo.callback",
      cert: "deadbeef",
      host: "lvh",
      acceptedClockSkewMs: -1,
      identifierFormat: "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
      path: "/saml/callback",
      logoutUrl: "http://foo.slo",
      signatureAlgorithm: "sha256" as const,
    };

    function getSamlOptions(req: express.Request, fn: SamlOptionsCallback) {
      try {
        fn(null, samlOptions);
        sinon.assert.calledOnce(superAuthenticateStub);
        superAuthenticateStub.calledWith(
          Object.assign({}, { cacheProvider: "mock cache provider" }, samlOptions)
        );
        done();
      } catch (err2) {
        done(err2);
      }
    }

    const strategy = new MultiSamlStrategy(
      { getSamlOptions: getSamlOptions, cacheProvider: "mock cache provider" as any },
      verify
    );
    strategy.authenticate("random" as any, "random" as any);
  });
});

describe("strategy#logout", function () {
  beforeEach(function () {
    this.superLogoutMock = sinon.stub(SamlStrategy.prototype, "logout");
  });

  afterEach(function () {
    this.superLogoutMock.restore();
  });

  it("calls super with request and auth options", function (done) {
    const superLogoutMock = this.superLogoutMock;
    function getSamlOptions(req: express.Request, fn: SamlOptionsCallback) {
      try {
        fn(null);
        sinon.assert.calledOnce(superLogoutMock);
        done();
      } catch (err2) {
        done(err2);
      }
    }

    const strategy = new MultiSamlStrategy({ getSamlOptions: getSamlOptions }, verify);
    strategy.logout("random" as any, "random" as any);
  });

  it("passes options on to saml strategy", function (done) {
    const passportOptions = {
      passReqToCallback: true,
      authnRequestBinding: "HTTP-POST",
      getSamlOptions: function (req: express.Request, fn: SamlOptionsCallback) {
        try {
          fn(null, {});
          strategy._passReqToCallback!.should.eql(true);
          strategy._authnRequestBinding!.should.eql("HTTP-POST");
          done();
        } catch (err2) {
          done(err2);
        }
      },
    };

    var strategy = new MultiSamlStrategy(passportOptions, verify);
    strategy.logout("random" as any, "random" as any);
  });

  it("uses given options to setup internal saml provider", function (done) {
    const superLogoutMock = this.superLogoutMock;
    const samlOptions = {
      issuer: "http://foo.issuer",
      callbackUrl: "http://foo.callback",
      cert: "deadbeef",
      host: "lvh",
      acceptedClockSkewMs: -1,
      identifierFormat: "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
      path: "/saml/callback",
      logoutUrl: "http://foo.slo",
      signatureAlgorithm: "sha256" as const,
    };

    function getSamlOptions(req: express.Request, fn: SamlOptionsCallback) {
      try {
        fn(null, samlOptions);
        sinon.assert.calledOnce(superLogoutMock);
        superLogoutMock.calledWith(Object.assign({}, samlOptions));
        done();
      } catch (err2) {
        done(err2);
      }
    }

    const strategy = new MultiSamlStrategy({ getSamlOptions: getSamlOptions }, verify);
    strategy.logout("random" as any, sinon.spy());
  });
});

describe("strategy#generateServiceProviderMetadata", function () {
  beforeEach(function () {
    this.superGenerateServiceProviderMetadata = sinon
      .stub(SamlStrategy.prototype, "generateServiceProviderMetadata")
      .returns("My Metadata Result");
  });

  afterEach(function () {
    this.superGenerateServiceProviderMetadata.restore();
  });

  it("calls super with request and generateServiceProviderMetadata options", function (done) {
    const superGenerateServiceProviderMetadata = this.superGenerateServiceProviderMetadata;
    function getSamlOptions(req: express.Request, fn: SamlOptionsCallback) {
      try {
        fn(null, {});
        sinon.assert.calledOnce(superGenerateServiceProviderMetadata);
        superGenerateServiceProviderMetadata.calledWith("bar", "baz");
        req.should.eql("foo");
        done();
      } catch (err2) {
        done(err2);
      }
    }

    const strategy = new MultiSamlStrategy({ getSamlOptions: getSamlOptions }, verify);
    strategy.generateServiceProviderMetadata("foo" as any, "bar", "baz", function () {});
  });

  it("passes options on to saml strategy", function (done) {
    const passportOptions = {
      passReqToCallback: true,
      authnRequestBinding: "HTTP-POST",

      getSamlOptions: function (req: express.Request, fn: SamlOptionsCallback) {
        try {
          fn(null);
          strategy._passReqToCallback!.should.eql(true);
          strategy._authnRequestBinding!.should.eql("HTTP-POST");
          done();
        } catch (err2) {
          done(err2);
        }
      },
    };

    var strategy = new MultiSamlStrategy(passportOptions, verify);
    strategy.generateServiceProviderMetadata("foo" as any, "bar", "baz", function () {});
  });

  it("should pass error to callback function", function (done) {
    const passportOptions = {
      getSamlOptions: function (req: express.Request, fn: SamlOptionsCallback) {
        fn(new Error("My error"), {});
      },
    };

    const strategy = new MultiSamlStrategy(passportOptions, verify);
    strategy.generateServiceProviderMetadata("foo" as any, "bar", "baz", function (error, result) {
      try {
        should(error?.message).equal("My error");
        done();
      } catch (err2) {
        done(err2);
      }
    });
  });

  it("should pass result to callback function", function (done) {
    const passportOptions = {
      getSamlOptions: function (req: express.Request, fn: SamlOptionsCallback) {
        fn(null, {});
      },
    };

    const strategy = new MultiSamlStrategy(passportOptions, verify);
    strategy.generateServiceProviderMetadata("foo" as any, "bar", "baz", function (error, result) {
      try {
        should(result).equal("My Metadata Result");
        done();
      } catch (err2) {
        done(err2);
      }
    });
  });
});