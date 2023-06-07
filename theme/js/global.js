/**
 * Created by Shaiful Islam on 2023-06-07.
 */
// ---------------

const {ipcRenderer} = require('electron');
let basic_info={};

function startClock(){
    let now=new Date();
    $("#system_display_date").text((now.getMonth()+1).toString().padStart(2,"0")+"/"+now.getDate().toString().padStart(2,"0")+"/"+now.getFullYear())
    $("#system_display_time").text(now.getHours().toString().padStart(2,"0")+":"+now.getMinutes().toString().padStart(2,"0")+":"+now.getSeconds().toString().padStart(2,"0"))
}
$(document).on('click','.menu',function (event){
    let file=$(this).attr('data-file');
    let title=$(this).attr('data-title');
    let name=$(this).attr('data-name');
    let members=$(this).attr('data-members');
    ipcRenderer.send("sendRequestToIpcMain", "changeMenu",{'currentMenu':{'file':file,'title':title,'name':name,'members':members},'pageParams':basic_info['pageParams']});
})
$(document).on('change','#system_machine_list',function (event){
    ipcRenderer.send("sendRequestToIpcMain", "changeMenu",{'selectedMachineId':$(this).val()});
});
$(document).ready(function ()
{
    //start clock
    startClock();//immediate
    setInterval(startClock,500);
    ipcRenderer.send("sendRequestToIpcMain", "basic_info");
});
ipcRenderer.on("basic_info", function(e, data) {
    basic_info=data;
    //setting page title
    let currentMenu=basic_info['currentMenu'];
    $('title').text(version+currentMenu['title'])
    //setting active menu
    let members=currentMenu['members'].split(" ");
    for(let i=0;i<members.length;i++){
        if(members[i]){
            $('.menu[data-name='+members[i]+']').addClass('active')
        }
    }
    //currentUser
    let currentUser=basic_info['currentUser'];
    $('#system_user_name').text(currentUser['name'])

    if(currentUser['role']>0){
        jQuery("#menu_login").hide();
        jQuery("#menu_logout").show();
    }
    else{
        jQuery("#menu_login").show();
        jQuery("#menu_logout").hide();
    }
    if(basic_info['connected']){
        $("#system_machine_status").css("color", "#0000FF");
        if(basic_info['machines']){
            for(let key in basic_info['machines']){
                $('#system_machine_list').append('<option value="'+basic_info['machines'][key]['machine_id']+'">'+basic_info['machines'][key]['machine_name']+'</option>');
            }
            $("#system_machine_list").val(basic_info['selectedMachineId']);
        }
        if(basic_info['selectedMachineId']>0){
            $('#system_machine_name').text(basic_info['machines'][basic_info['selectedMachineId']]['machine_name']);
            $('#system_machine_ip_address').text(basic_info['machines'][basic_info['selectedMachineId']]['ip_address']);
            $('.system_machine_info').hide();
            $('.system_machine_info[data-selected=1]').show();
            let requestData=[
                {'name':'machine_mode','params':{}},
                {'name':'disconnected_device_counter','params':{}},
                {'name':'active_alarms','params':{}}
            ];
            ipcRenderer.send("sendRequestToServer", "getCommonStatus",{},requestData);//send request now
            setInterval(() => {ipcRenderer.send("sendRequestToServer", "getCommonStatus",{},requestData);}, 2000);
        }
        else{
            $('.system_machine_info').hide();
            $('.system_machine_info[data-selected=0]').show();

        }
    }
    if (typeof systemPageLoaded === 'function') {
        systemPageLoaded();
    }
})
ipcRenderer.on("getCommonStatus", function(e, jsonObject) {
    let disconnected_device_counter = Number(jsonObject['data']['disconnected_device_counter']);
    if(disconnected_device_counter != 0) {
        $("#system_machine_status").css("color", "#FFBF00");
    }
    else {
        $("#system_machine_status").css("color", "#32CD32");
    }
    if(jsonObject['data']['machine_mode'] == 1) {
        $('.system_machine_info').css('background-color','#d3d3d3').css('color','#FFF');
    }
    else if(jsonObject['data']['machine_mode'] == 0) {
        $('.system_machine_info').css('background-color','#2780E3').css('color','#FFF');
    }

})