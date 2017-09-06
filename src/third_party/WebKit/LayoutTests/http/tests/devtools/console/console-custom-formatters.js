// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

(async function() {
  TestRunner.addResult('Tests that console logging dumps properly when there are multiple custom formatters on the page\n');

  await TestRunner.loadModule('console_test_runner');
  await TestRunner.showPanel('console');

  await TestRunner.evaluateInPagePromise(`
    var a = {name: "a"};
    var b = {name: "b"};
    var c = {name: "c"};
    a.formattableBy1 = true;
    b.formattableBy2 = true;
    c.formattableBy1 = true;
    c.formattableBy2 = true;
    var formatter1 = {
        header: function(x)
        {
            if (!x.formattableBy1)
                return null;

            return ["span", {}, "Header formatted by 1 ", x.name];
        },

        hasBody: function(x)
        {
            return true;
        },

        body: function(x)
        {
            return ["span", {}, "Body formatted by 1 ", x.name]
        }
    };
    var formatter2 = {
        header: function(x)
        {
            if (!x.formattableBy2)
                return null;

            return ["span", {}, "Header formatted by 2 ", x.name];
        },

        hasBody: function(x)
        {
            return true;
        },

        body: function(x)
        {
            return ["span", {}, "Body formatted by 2 ", x.name]
        }
    };
    var configTest = {};
    var formatterWithConfig1 = {
        header: function(x, config)
        {
            if (x !== configTest || config)
                return null;

            return ["span", {}, "Formatter with config ", ["object", {"object": x, "config": {"info": "additional info"}}]];
        },

        hasBody: function(x)
        {
            return false;
        },

        body: function(x)
        {
            throw "Unreachable"
        }
    }
    var formatterWithConfig2 = {
        header: function(x, config)
        {
            if (x !== configTest || !config)
                return null;

            return ["span", {}, "Header ", "info: ", config.info];
        },

        hasBody: function(x, config)
        {
            return config && config.info;
        },

        body: function(x, config)
        {
            return ["span", {}, "body", "info: ", config.info]
        }
    }
    var selfReferenceTest = {};
    var selfReferencingFormatter = {
        header: function(x)
        {
            if (x !== selfReferenceTest)
                return null;

            return ["span", {}, "Formatter with config ", ["object", {"object": x}]];
        },

        hasBody: function(x)
        {
            return false;
        },

        body: function(x)
        {
            throw "Unreachable"
        }

    }
    window.devtoolsFormatters = [formatter1, formatter2, formatterWithConfig1, formatterWithConfig2, selfReferencingFormatter];
    function logVars()
    {
        console.log(a);
        console.log(b);
        console.log(c);
        console.log(configTest);
        console.log(selfReferenceTest);
        //swap first formatters: test that header+body should be generated by the same formatter
        window.devtoolsFormatters = [formatter2, formatter1, formatterWithConfig1, formatterWithConfig2, selfReferencingFormatter];
    }
  `);

  TestRunner.mainTarget.runtimeAgent().setCustomObjectFormatterEnabled(true);
  TestRunner.evaluateInPage('logVars()', expandVariablesInConsole);

  function expandVariablesInConsole() {
    var consoleView = Console.ConsoleView.instance();

    if (consoleView._needsFullUpdate)
      consoleView._updateMessageList();

    var viewMessages = consoleView._visibleViewMessages;

    for (var i = 0; i < viewMessages.length; ++i) {
      var uiMessage = viewMessages[i];
      var shadowRoot = uiMessage.contentElement().querySelector('.console-message-text *').shadowRoot;
      var customElement = (shadowRoot ? shadowRoot.querySelector('.custom-expandable-section-header') : null);

      if (customElement)
        customElement.click();
    }

    TestRunner.deprecatedRunAfterPendingDispatches(dumpExpanded);
  }

  function dumpExpanded() {
    ConsoleTestRunner.dumpConsoleMessages();
    TestRunner.completeTest();
  }
})();