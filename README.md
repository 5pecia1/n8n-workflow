# My n8n workflow

## notion & google calender 2 way sync

### Feature

- [x] sync every 20 minutes(default, you can change it)
- [x] create
    - [x] notion -> gcal
    - [x] gcal -> notion
- [x] update 
    > There is a bug with alternating updates for ranged all day. The result is no problem.
    - [x] notion -> gcal
    - [x] gcal -> notion
- [x] delete
    - [x] notion -> gcal
    - [ ] gcal -> notion
         > Notion do not support delete api
- [ ] easy setup
    - [ ] combine setting data in workflow
- [ ] using offical n8n
    > When the task is finished, you can use it without installing docker.
    - [ ] contribute bug fix

### Use

#### Prerequirecs

* docker

#### Setting

1. Pull and run docker container
    ```bash
    $ docker run -d --restart always -e N8N_PORT=5678 -v ./n8n:/home/node/.n8n -p 5678:5678 --name n8n 5pecia1/n8n-custom:latest
    ```
    > Current latest n8n have bug about notion and gcal.  
    > So, You use my custom n8n image.
4. Open and import workflow
    1. open localhost:5678
    1. Click `Workflows`(upper left)
    2. Click `Import from FIle`
    3. Select [`./notion-gcal-2way-sync/Notion__Calender_Sync.json`](https://github.com/5pecia1/n8n-workflow/blob/main/notion-gcal-2-way-sync/Notion__Calender_Sync.json)
5. Set Google OAuth Credentials, Notion Credentials in n8n
    * Google OAuth reference: https://docs.n8n.io/credentials/google/#using-service-account
    * Notion reference: https://docs.n8n.io/credentials/notion/
6. Make properties in Notion Page in DB
    * name: `GCal Id`, type: **text**
7. Change your calender, notion information in workflow nodes  
    Nodes Chekclist
    * `Get Notion`
        * Notion API
        * Database ID
    * `Get Calendar`, `Create Evnet`, `Update Description`, `Update Evnet`, `Delete Event`
        * Google Calendar OAuth
        * Calendar ID
    * `Action Maker`
        * `var NOTION_DATE_PROPERTY_NAME = "Start-End Time";`  
        `Start-End Time` change to your date property name in notion db
    * `Create Page`, `Create Page Range Date`, `Update Page`, `Update Page Range Date`
        * Notion API
        * Key First Date Property. Set as below.  
        `<your date property name in notion db>|date`  
        example: `Start-End Time|date`
8. Set Interval
    1. set interval in `Interval` node

#### Run

1. Active this workflows  
    check `Active` button (upper right)


### Develop

#### Action Maker

#### Workflow