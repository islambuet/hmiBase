/**
 * Created by Shaiful Islam on 2023-06-07.
 */
// ---------------

const {ipcRenderer} = require('electron');
let basicInfo={};

function startClock(){
    let now=new Date();
    $("#system_display_date").text((now.getMonth()+1).toString().padStart(2,"0")+"/"+now.getDate().toString().padStart(2,"0")+"/"+now.getFullYear())
    $("#system_display_time").text(now.getHours().toString().padStart(2,"0")+":"+now.getMinutes().toString().padStart(2,"0")+":"+now.getSeconds().toString().padStart(2,"0"))
}
$(document).ready(function ()
{
    //start clock
    startClock();//immediate
    setInterval(startClock,500);
    ipcRenderer.send("sendRequestToIpcMain", "basic_info",{});
});
ipcRenderer.on("basic_info", function(e, data) {
    basicInfo=data;
    //setting page title
    let currentMenu=basicInfo['currentMenu'];
    $('title').text(version+currentMenu['title'])

    //currentUser
    let currentUser=basicInfo['currentUser'];
    $('#system_user_name').text(currentUser['name'])

    if(currentUser['role']>0){
        jQuery("#menu_login").hide();
        jQuery("#menu_logout").show();
    }
    else{
        jQuery("#menu_login").show();
        jQuery("#menu_logout").hide();
    }
    if (typeof systemPageLoaded === 'function') {
        systemPageLoaded();
    }
    console.log(basicInfo)

})