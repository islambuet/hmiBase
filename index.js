const { app, BrowserWindow, Menu,ipcMain } = require('electron')
const ejse = require('ejs-electron');
const electronStore = require('electron-store');
const store=new electronStore();

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
                    console.log("settings");
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
    mainWindow.loadFile('index.ejs').then(function (){});
};
ipcMain.on("sendRequestToIpcMain", function(e, responseName,params={}) {
    if(responseName=='basic_info'){
        mainWindow.webContents.send(responseName,basic_info);
    }
    else if(responseName=='changeMenu'){
        basic_info['currentMenu']=params;
        ejse.data('system_current_page_file',basic_info['currentMenu']['file'])
        mainWindow.loadFile('index.ejs').then(function (){});

    }
    // else if(responseName=='saveSettings'){
    //     //mainWindow.webContents.send(responseName,basicInfo);
    //     let project_prefix='adta_';
    //     store.set(project_prefix+"java_server_ip_address", params['java_server_ip_address']);
    //     store.set(project_prefix+"java_server_port", params['java_server_port']);
    //     store.set(project_prefix+"cm_ip_address", params['cm_ip_address']);
    //     store.set(project_prefix+"detailed_active_alarm", params['detailed_active_alarm']);
    //     store.set(project_prefix+"motor_speed_unit", params['motor_speed_unit']);
    //     store.set(project_prefix+"general_layout_no", params['general_layout_no']);
    //     ejse.data('system_general_layout_no',params['general_layout_no'])
    //     //if needed to handle
    //     basicInfo['hmiSettings']=getHMISettings();
    //     mainWindow.webContents.send('basicInfo',basicInfo);
    // }

})
app.whenReady().then(() => {
    createWindow()
})