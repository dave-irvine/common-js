import { assert, expect } from "chai";
import "mocha";
import { Mock } from "moq.ts";
import { ManualPollOptions, AutoPollOptions, LazyLoadOptions } from "../src/ConfigCatClientOptions";
import { ICache, IConfigCatLogger, IManualPollOptions, OptionsBase } from "../src";
import { ConfigCatConsoleLogger } from "../src/ConfigCatLogger";
import { InMemoryCache } from "../src/Cache";

describe("Options", () => {

  it("ManualPollOptions initialization With -1 requestTimeoutMs ShouldThrowError", () => {
    expect(() => {
      new ManualPollOptions("APIKEY", { requestTimeoutMs: -1 }, new InMemoryCache());
    }).to.throw("Invalid 'requestTimeoutMs' value");
  });

  it("ManualPollOptions initialization without 'defaultCache' Should init with InMemoryCache", () => {
    let options: ManualPollOptions = new ManualPollOptions("APIKEY");

    assert.isNotNull(options.cache);
    assert.instanceOf(options.cache, InMemoryCache);
  });

  it("ManualPollOptions initialization With 'apiKey' Should create an instance, defaults OK", () => {
    let options: ManualPollOptions = new ManualPollOptions("APIKEY");
    assert.isDefined(options);

    assert.equal("APIKEY", options.apiKey);
    assert.equal(30000, options.requestTimeoutMs);
    assert.equal("https://cdn-global.configcat.com/configuration-files/APIKEY/config_v5.json", options.getUrl());
    assert.equal("m", options.clientVersion[0]);
  });

  it("ManualPollOptions initialization With parameters works", () => {
    const mockLogger = new Mock<IConfigCatLogger>();

    let options: ManualPollOptions = new ManualPollOptions(
      "APIKEY",
      {
        logger: mockLogger.object(),
        requestTimeoutMs: 10,
        proxy: "http://fake-proxy.com:8080"
      });

    assert.isDefined(options);
    assert.equal(mockLogger.object(), options.logger);
    assert.equal("APIKEY", options.apiKey);
    assert.equal(10, options.requestTimeoutMs);
    assert.equal("https://cdn-global.configcat.com/configuration-files/APIKEY/config_v5.json", options.getUrl());
    assert.equal("m", options.clientVersion[0]);
    assert.equal("http://fake-proxy.com:8080", options.proxy);
  });

  it("ManualPollOptions initialization With 'baseUrl' Should create an instance with custom baseUrl", () => {

    let options: ManualPollOptions = new ManualPollOptions("APIKEY", { baseUrl: "https://mycdn.example.org" });

    assert.isDefined(options);
    assert.equal("https://mycdn.example.org/configuration-files/APIKEY/config_v5.json", options.getUrl());
    assert.notEqual("https://cdn-global.configcat.com/configuration-files/APIKEY/config_v5.json", options.getUrl());
  });

  it("AutoPollOptions initialization With -1 requestTimeoutMs ShouldThrowError", () => {
    expect(() => {
      let options: AutoPollOptions = new AutoPollOptions("APIKEY", { requestTimeoutMs: -1 });
    }).to.throw("Invalid 'requestTimeoutMs' value");
  });

  it("AutoPollOptions initialization With 'apiKey' Should create an instance, defaults OK", () => {
    let options: AutoPollOptions = new AutoPollOptions("APIKEY");
    assert.isDefined(options);
    assert.isTrue(options.logger instanceof ConfigCatConsoleLogger);
    assert.equal("APIKEY", options.apiKey);
    assert.equal("https://cdn-global.configcat.com/configuration-files/APIKEY/config_v5.json", options.getUrl());
    assert.equal(60, options.pollIntervalSeconds);
    assert.equal("a", options.clientVersion[0]);
    assert.equal(30000, options.requestTimeoutMs);
    assert.isDefined(options.cache);
  });

  it("AutoPollOptions initialization With parameters works", () => {
    const mockLogger = new Mock<IConfigCatLogger>();

    let configChanged = function () { };
    let options: AutoPollOptions = new AutoPollOptions(
      "APIKEY",
      {
        logger: mockLogger.object(),
        configChanged: configChanged,
        pollIntervalSeconds: 59,
        requestTimeoutMs: 20,
        proxy: "http://fake-proxy.com:8080"
      });

    assert.isDefined(options);
    assert.equal(mockLogger.object(), options.logger);
    assert.equal("APIKEY", options.apiKey);
    assert.equal("https://cdn-global.configcat.com/configuration-files/APIKEY/config_v5.json", options.getUrl());
    assert.equal(59, options.pollIntervalSeconds);
    assert.equal(20, options.requestTimeoutMs);
    assert.equal(configChanged, options.configChanged);
    assert.equal("a", options.clientVersion[0]);
    assert.equal("http://fake-proxy.com:8080", options.proxy);
  });

  it("AutoPollOptions initialization With -1 'pollIntervalSeconds' ShouldThrowError", () => {
    expect(() => {
      new AutoPollOptions("APIKEY", { pollIntervalSeconds: -1 });
    }).to.throw("Invalid 'pollIntervalSeconds' value");
  });

  it("AutoPollOptions initialization With 0 'pollIntervalSeconds' ShouldThrowError", () => {
    expect(() => {
      new AutoPollOptions("APIKEY", { pollIntervalSeconds: 0 });
    }).to.throw("Invalid 'pollIntervalSeconds' value");
  });

  it("AutoPollOptions initialization without 'defaultCache' Should set to InMemoryCache", () => {
    let options: AutoPollOptions = new AutoPollOptions("APIKEY");

    assert.isNotNull(options.cache);
    assert.instanceOf(options.cache, InMemoryCache);
  });

  it("AutoPollOptions initialization With 'baseUrl' Should create an instance with custom baseUrl", () => {

    let options: AutoPollOptions = new AutoPollOptions("APIKEY", { baseUrl: "https://mycdn.example.org" });

    assert.isDefined(options);
    assert.equal("https://mycdn.example.org/configuration-files/APIKEY/config_v5.json", options.getUrl());
    assert.notEqual("https://cdn-global.configcat.com/configuration-files/APIKEY/config_v5.json", options.getUrl());
  });

  it("AutoPollOptions initialization With -1 'maxInitWaitTimeSeconds' ShouldThrowError", () => {
    expect(() => {
      new AutoPollOptions("APIKEY", { maxInitWaitTimeSeconds: -1 });
    }).to.throw("Invalid 'maxInitWaitTimeSeconds' value");
  });

  it("AutoPollOptions initialization With 0 'maxInitWaitTimeSeconds' Should create an instance with the passed value", () => {
    let options: AutoPollOptions = new AutoPollOptions("APIKEY", { maxInitWaitTimeSeconds: 0 });

    assert.isDefined(options);
    assert.isNotNull(options);
    assert.equal(options.maxInitWaitTimeSeconds, 0);
  });

  it("AutoPollOptions initialization Without 'maxInitWaitTimeSeconds' Should create an instance with default value(5)", () => {
    let options: AutoPollOptions = new AutoPollOptions("APIKEY");

    assert.isDefined(options);
    assert.isNotNull(options);
    assert.equal(options.maxInitWaitTimeSeconds, 5);
  });

  it("LazyLoadOptions initialization With 'apiKey' Should create an instance, defaults OK", () => {
    let options: LazyLoadOptions = new LazyLoadOptions("APIKEY");
    assert.isDefined(options);
    assert.equal("APIKEY", options.apiKey);
    assert.equal("https://cdn-global.configcat.com/configuration-files/APIKEY/config_v5.json", options.getUrl());
    assert.equal(60, options.cacheTimeToLiveSeconds);
    assert.equal("l", options.clientVersion[0]);
    assert.equal(30000, options.requestTimeoutMs);
  });

  it("LazyLoadOptions initialization With parameters works", () => {
    const mockLogger = new Mock<IConfigCatLogger>();
    let options: LazyLoadOptions = new LazyLoadOptions(
      "APIKEY",
      {
        logger: mockLogger.object(),
        cacheTimeToLiveSeconds: 59,
        requestTimeoutMs: 20,
        proxy: "http://fake-proxy.com:8080"
      });

    assert.isDefined(options);
    assert.equal(mockLogger.object(), options.logger);
    assert.equal("APIKEY", options.apiKey);
    assert.equal("https://cdn-global.configcat.com/configuration-files/APIKEY/config_v5.json", options.getUrl());
    assert.equal(59, options.cacheTimeToLiveSeconds);
    assert.equal("l", options.clientVersion[0]);
    assert.equal(20, options.requestTimeoutMs);
    assert.equal("http://fake-proxy.com:8080", options.proxy);
  });

  it("LazyLoadOptions initialization With -1 'cacheTimeToLiveSeconds' ShouldThrowError", () => {
    expect(() => {
      new LazyLoadOptions("APIKEY", { cacheTimeToLiveSeconds: -1 });
    }).to.throw("Invalid 'cacheTimeToLiveSeconds' value");
  });

  it("LazyLoadOptions initialization With -1 requestTimeoutMs ShouldThrowError", () => {
    expect(() => {
      new LazyLoadOptions("APIKEY", { requestTimeoutMs: -1 });
    }).to.throw("Invalid 'requestTimeoutMs' value");
  });

  it("LazyLoadOptions initialization without 'defaultCache' Should set to InMemoryCache", () => {
    let options: LazyLoadOptions = new LazyLoadOptions("APIKEY", {});

    assert.isNotNull(options.cache);
    assert.instanceOf(options.cache, InMemoryCache);
  });

  it("LazyLoadOptions initialization With 'baseUrl' Should create an instance with custom baseUrl", () => {

    let options: LazyLoadOptions = new LazyLoadOptions("APIKEY", { baseUrl: "https://mycdn.example.org" });

    assert.isDefined(options);
    assert.equal("https://mycdn.example.org/configuration-files/APIKEY/config_v5.json", options.getUrl());
    assert.notEqual("https://cdn-global.configcat.com/configuration-files/APIKEY/config_v5.json", options.getUrl());
  });

  it("Options initialization With 'defaultCache' Should set option cache to passed instance", () => {

    const mockCache = new Mock<ICache>();
    let options: OptionsBase = new FakeOptionsBase("APIKEY", "1.0", {}, mockCache.object());

    assert.instanceOf(options.cache, mockCache.object);
    assert.notInstanceOf(options.cache, InMemoryCache);
  });

  it("Options initialization With 'options.cache' Should overwrite defaultCache", () => {
    const mockCache = new Mock<ICache>();
    let options: OptionsBase = new FakeOptionsBase("APIKEY", "1.0", { cache: mockCache.object() }, new InMemoryCache());

    assert.instanceOf(options.cache, mockCache.object);
    assert.notInstanceOf(options.cache, InMemoryCache);
  });

  it("Options initialization With NULL 'cache' Should set InMemoryCache", () => {
    const mockCache = new Mock<ICache>();
    let options: OptionsBase = new FakeOptionsBase("APIKEY", "1.0", {}, mockCache.object());

    assert.isDefined(options.cache);
    assert.instanceOf(options.cache, InMemoryCache);
  });

  it("Options initialization With NULL 'options.cache' Should set InMemoryCache", () => {
    const mockCache = new Mock<ICache>();
    let options: OptionsBase = new FakeOptionsBase("APIKEY", "1.0", { cache: undefined }, mockCache.object());

    assert.isDefined(options.cache);
    assert.instanceOf(options.cache, InMemoryCache);
  });
});

class FakeOptionsBase extends OptionsBase { }