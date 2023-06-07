const { app, BrowserWindow, Menu,ipcMain } = require('electron')
const ejse = require('ejs-electron');
const electronStore = require('electron-store');
const store=new electronStore();

const net = require('net');
const log4js = require("log4js");
const logger = log4js.getLogger();
let d = new Date();
let loggerConfig={
    "appenders": {
        "everything": {
            "type": "file",
            "filename":"logs/"+("0" +  d.getFullYear()+ "_" + ("0"+(d.getMonth()+1)).slice(-2) + "_" +("0" + d.getDate()).slice(-2)+"_" + ("0" + d.getHours()).slice(-2) + "_" + ("0" + d.getMinutes()).slice(-2)+ "_" + ("0" + d.getSeconds()).slice(-2))+'/logger.log',
            "maxLogSize":"10M",
            "layout":{
                "type": "pattern",
                "pattern": "[%d] [%5.5p] %m"
            }
        }
    },
    "categories": {
        "default": { "appenders": [ "everything"], "level": "ALL" }
    }
}
log4js.configure(loggerConfig);

function getHMISettings(){
    let project_prefix='adta_';
    return {
        'java_server_ip_address' : store.get(project_prefix+'java_server_ip_address', ''),
        'java_server_port' : store.get(project_prefix+'java_server_port', ''),
        'cm_ip_address' :  store.get(project_prefix+'cm_ip_address', ''),
        'detailed_active_alarm' : store.get(project_prefix+'detailed_active_alarm', '0'),
        'motor_speed_unit' : store.get(project_prefix+'motor_speed_unit', 'm_s'),
        'general_layout_no' : store.get(project_prefix+'general_layout_no', '2')
    };
}
let basic_info={
    "connected":false,
    "currentUser":{'id':0,'name':'Amazon Operator','role':0},
    'currentMenu':{'file':'general','title':'General View','name':'general','members':'general general_conveyors'},
    'selectedMachineId':0,
    'pageParams':{},
    'hmiSettings':getHMISettings()
}

let mainWindow;
let nativeMenus = [
    {
        label: 'Help',
        submenu: [
            {
                label: 'Settings',
                click() {
                    changeMenu({'currentMenu':{'file':'settings','title':'Settings','name':'settings','members':''}})
                }
            },
            {
                label: 'Reload',
                click() {
                    mainWindow.webContents.reload();
                }
            }
        ]
    },
];
if(!app.isPackaged)
{
    nativeMenus.push({
        label: 'Dev Tools',
        click() {
            mainWindow.webContents.openDevTools();
        }
    })
}
let menu = Menu.buildFromTemplate(nativeMenus)
Menu.setApplicationMenu(menu)

const createWindow = () => {
    //creating new window
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        resizable: !app.isPackaged,
        minimizable:!app.isPackaged,
        movable:!app.isPackaged,
        closable:!app.isPackaged,
        x:app.isPackaged?0:1921,
        y:0,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true,
        }
    });
    ejse.data('system_general_layout_no',basic_info['hmiSettings']['general_layout_no'])
    ejse.data('system_current_page_file',basic_info['currentMenu']['file'])
    mainWindow.loadFile('index.ejs').then(function (){ connectWithServer()});
};
function changeMenu(params){
    console.log(params)
    for(let key in params){
        basic_info[key]=params[key];
    }
    ejse.data('system_current_page_file',basic_info['currentMenu']['file'])
    mainWindow.loadFile('index.ejs').then(function (){});
}
ipcMain.on("sendRequestToIpcMain", function(e, responseName,params={}) {
    if(responseName=='basic_info'){
        mainWindow.webContents.send(responseName,basic_info);
    }
    else if(responseName=='changeMenu'){
        changeMenu(params)
    }
    else if(responseName=='saveSettings'){
        let project_prefix='adta_';
        store.set(project_prefix+"java_server_ip_address", params['java_server_ip_address']);
        store.set(project_prefix+"java_server_port", params['java_server_port']);
        store.set(project_prefix+"cm_ip_address", params['cm_ip_address']);
        store.set(project_prefix+"detailed_active_alarm", params['detailed_active_alarm']);
        store.set(project_prefix+"motor_speed_unit", params['motor_speed_unit']);
        store.set(project_prefix+"general_layout_no", params['general_layout_no']);
        ejse.data('system_general_layout_no',params['general_layout_no'])
        // //if needed to handle
        basic_info['hmiSettings']=getHMISettings();
        // mainWindow.webContents.send('basicInfo',basicInfo);
    }

})
let clientSocket = new net.Socket();
function connectWithServer () {

    let host=basic_info['hmiSettings']['java_server_ip_address'];
    let port=basic_info['hmiSettings']['java_server_port'];
    console.log(new Date().toString(),":Connecting with Host="+host+" Port="+port);
    if(!basic_info['connected'] && host && port && port>=0 && port<65536){
        clientSocket.connect(port, host);
    }
    else{//for incomplete settings
        setTimeout(connectWithServer, 2000);
    }
}
function connectClientSocketHandler() {
    logger.info(new Date().toString(),":Connected with JavaServer");
    basic_info['connected']=true;
    sendRequestToServer({"request" :'basic_info','params':{},"requestData":[]});//temporary machineId
}
function closeClientSocketHandler () {
    if(basic_info['connected']){
        logger.error(new Date().toString(),":DisConnected with JavaServer");
        changeMenu({'connected':false,'selectedMachineId':0})//or only send disconnect event
    }
    setTimeout(connectWithServer, 2000);
}
function sendRequestToServer(requestJson){
    if(basic_info['connected']){
        try{
            clientSocket.write('<begin>'+JSON.stringify(requestJson)+'</begin>');
        }
        catch(ex) {
            logger.error("Data Sending Error.")
            logger.error(ex)
        }
    }
    else{
        logger.error("Not Connected with Java server.")

    }
}

let buffer = "";
const startTag="<begin>";
const endTag="</begin>";
function dataReceivedClientSocketHandler(data) {
    buffer += data.toString(); // Add string on the end of the variable 'chunk'
    let startPos=buffer.indexOf(startTag);
    let endPos=buffer.indexOf(endTag);
    while (startPos>-1 && endPos>-1){
        if(startPos>0){
            logger.warn("[START_POS_ERROR] Message did not started with begin.");
            logger.warn("[MESSAGE]"+buffer);
        }
        if(startPos>endPos){
            logger.warn("[END_POS_ERROR] End tag found before start tag.");
            logger.warn("[MESSAGE]"+buffer);
            buffer=buffer.substring(startPos);
        }
        else{
            let messageString=buffer.substring(startPos+startTag.length,endPos);
            try {
                //let jo = JSON.parse(messageString.replace(/\}\s*\{/g, '},{') )
                let jo = JSON.parse( messageString.replace(/\}\s*\{/g, '},{'))
                processReceivedJsonObjects(jo);
            }
            catch (er) {
                console.log("Failed to convert Json");
                logger.error("[INVALID_DATA] "+messageString)
            }
            buffer=buffer.substring(endPos+endTag.length);
        }
        startPos=buffer.indexOf(startTag);
        endPos=buffer.indexOf(endTag);
    }
}
function processReceivedJsonObjects(jsonObject) {
    let request = jsonObject['request'];
    // console.log(request)
    if(request=='basic_info'){
        for(let key in jsonObject['data']){
            basic_info[key]=jsonObject['data'][key];
        }
        for(let key in basic_info['machines']){
            if(basic_info['hmiSettings']['cm_ip_address']==basic_info['machines'][key]['maintenance_gui_ip']){
                basic_info['selectedMachineId']=basic_info['machines'][key]['machine_id'];
            }
        }
        // let doors={}
        // for(let key in basicInfo['inputsInfo']){
        //     let inputInfo=basicInfo['inputsInfo'][key];
        //     if(inputInfo['device_type']==6){
        //         if(!doors[inputInfo['device_number']]){
        //             doors[inputInfo['device_number']]={}
        //         }
        //         doors[inputInfo['device_number']][inputInfo['device_fct']]=inputInfo;
        //     }
        // }
        // basicInfo['doorsInfo']=doors;
        changeMenu({})
    }
    else{
        mainWindow.webContents.send(request,jsonObject);
    }
}
clientSocket.on('connect', connectClientSocketHandler);
clientSocket.on('data',    dataReceivedClientSocketHandler);
clientSocket.on('end',     ()=>{console.log('end')});
clientSocket.on('timeout', ()=>{console.log('timeout')});
clientSocket.on('drain',   ()=>{console.log('drain')});
clientSocket.on('error',   ()=>{console.log('error')});
clientSocket.on('close',   closeClientSocketHandler);

ipcMain.on("sendRequestToServer", function(e, responseName,params,requestData=[]) {
    params['machine_id']=basic_info['selectedMachineId']//including machine_id
    sendRequestToServer({"request" :responseName,'params':params,"requestData":requestData});//temporary machineId
})
app.whenReady().then(() => {
    createWindow()
})