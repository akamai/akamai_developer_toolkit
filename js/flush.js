var script_tag = document.createElement('script');
script_tag.type = 'text/javascript';
script_tag.text = 'window.g_browser.sendClearHostResolverCache();window.g_browser.sendFlushSocketPools();';
document.body.appendChild(script_tag);
