![Banner image](/img/dev_tools_marquee.png)

Over the past few months I have had very interesting discussions with developers around what tools define their workspace and how can Akamai be part of that workspace. A recurring theme was the ability to instantly perform actions like purge, debugging errors, pull Akamai logs and debug ESI errors right from the browser or from their code editor. 

After a few brainstorming sessions with [Ricky Yu](https://github.com/ricky840) and his experience with building tools/extensions we decided to create a chrome extension that provides Akamai developer features directly within a browser. Below is a quick summary of the features available for testing within the chrome extension. 

### Akamai API Manager:
Manage your API credentials and toggle between different kinds of API tokens based on the service you are trying to access.
- Ability to add and manage API credentials	Ability to manage up to 20 API credentials. Developers tend to have multiple API tokens within a single Akamai account, this extensions helps you toggle between the multiple API endpoints depending on the Akamai service you have access to.    

### Fast Purge:
![Fast Purge img](/img/dev_tools_wallpaper2.png)
Manage and make invalidate/delete requests
- Make fast purge requests by entering URL or multiple URLs or CP codes or Cache Tags
- Purge history and manager: Keep a record of all the purges that you have issued using the extension
- Issue purges directly from the extension or even from the context menu (right click on an image you want to purge). Pretty useful when you are working on a dev page.

### Debug Requests
![Debug Requests img](/img/dev_tools_wallpaper3.png)
"Debug Requests" section, helps translate error reference code and pull logs for the error and transactions you make on Akamai, be it a WAF error or an IM error, the tools helps you translate the error code and save the error details as a PDF and share with colleagues OR pull logs and share with Akatec. 
- Ability to translate Error Reference Codes	View history of all the Error translations you did
- Notifies you when the translation is complete
- To fetch Akamai logs, you will need a ghost IP and the hostname associated to the logs you are interested in, we pull the logs for the past 30 mins from the time you click on "fetch logs" within the extension. 
- Debug history and manager: keeps a record of all the debugging you have done and can download and save it in case you need it for further debugging.

### Browser Settings
![Browser Settings img](/img/dev_tools_wallpaper4.png)
"Browser Settings", helps you manage your chrome browser configurations like proxy settings, flush DNS/socket pools and enablement of Akamai pragma headers.
- Ability to add multiple proxy configs	Ability to support proxies with Auth headers
- Supports up to 10 proxy configs. Once a proxy config is selected the user can open up a new tab OR a new window OR reload their current tab to make requests go through the proxy. Developers can configure & save multiple proxy profiles within this extension based on their dev pipelines.
- When a proxy config is selected the extension icon lights up GREEN notifying the user that they are on a proxy connection. 


# Call for Feedback 
Please download the extension here [Akamai Developer Toolkit - Chrome Web Store](https://chrome.google.com/webstore/detail/akamai-developer-toolkit/oeekflkhfpllpepjdkpodopelgaebeed/) and tell us what features you would like to see within the extension using the feedback button within the extension.


> Change Log: <br/>
> Update: 07/18/18: Support added to pruge content using CP codes or Cache Tags <br/>
> Update: 07/16/18: Support added to a) Translate error reference codes and b) Fetch logs from Akamai servers using Hostname and Ghost IP address <br/>
> Update: 07/07/18: Support added for proxying HTTP requests, flush DNS cache and enabling Akamai debug headers <br/>
> Version 1: API credentials manager, ability to issue fast purge request directly from the page you are working on <br/>


#### Disclaimer: This is an unofficial extension and there will be no Akamai engineering or Akamai Technical support provided in case the tool fails or throws errors, that being said please report all issues using the feedback button within the extension. All API tokens and credentials are stored locally in your laptop and not beamed up to the internet, we run edgegrid within the extension and pass the computed authorization headers with the API requests.

 
