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
currentUser={'id':0,'name':'Amazon Operator','role':0}
let basic_info={"connected":false,"currentUser":currentUser,hmiSettings:getHMISettings()}
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
            devTools: true
        }
    });
    ejse.data('system_general_layout_no',basic_info['hmiSettings']['general_layout_no'])
    ejse.data('system_current_page','general')
    mainWindow.loadFile('index.ejs').then(function (){
        //connectWithServer();
    });
};
app.whenReady().then(() => {
    createWindow()
})