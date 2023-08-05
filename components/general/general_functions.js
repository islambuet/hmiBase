/**
 * Created by Shaiful Islam on 2023-08-02.
 */
// ---------------
/* global basic_info */
$('#switch_legend_production').change(function () {
    if ($(this).is(":checked")) {
        $('#svg_general_colors').hide();
        $('#container_production').show();
    } else {
        $('#svg_general_colors').show();
        $('#container_production').hide();

    }
});
function setActiveAlarmSettings(){
    let hmiSettings= basic_info['hmiSettings']
    if(hmiSettings['detailed_active_alarm'] ==1){
        $('#table_active_alarms').show()
        $('#container_ticker_active_alarms').hide()
    }
    else{
        $('#table_active_alarms').hide()
        $('#container_ticker_active_alarms').show()
    }
}
function setBinsLabel(){
    let bins=basic_info['bins']
    let layoutNo=basic_info['hmiSettings']['general_layout_no']
    if(bins!=undefined){
        let num_bins=Math.max(...Object.values(bins).map(bin => bin['gui_id']!='999'?bin['gui_id']:0), 0);
        let bin_width=0;
        if(num_bins>0){
            if(layoutNo=="5"){
                bin_width=Math.trunc(1120/Math.ceil(num_bins/2))
            }
            else{
                bin_width=Math.trunc(1500/Math.ceil(num_bins/2))
            }
        }
        for(let key in bins){
            if(bins[key]['gui_id']>0){
                if(bins[key]['gui_id']!="999"){
                    let binIndex=(Math.ceil(bins[key]['gui_id']/2));
                    let posRect=0;
                    let posText=0;
                    if((layoutNo=="1")||(layoutNo=="3"))
                    {
                        posRect=201-1+(binIndex-1)*bin_width;
                    }
                    else if(layoutNo==5){
                        posRect=1280-(binIndex)*bin_width;
                    }
                    else {
                        posRect=1650-(binIndex)*bin_width;
                    }
                    posText=posRect-20+(bin_width/2);
                    $('.bin[gui-bin-id='+bins[key]['gui_id']+'] rect').attr('width',bin_width-10).attr('x',posRect)
                    $('.bin[gui-bin-id='+bins[key]['gui_id']+'] text').attr('x',posText);
                }
                $('.bin[gui-bin-id='+bins[key]['gui_id']+'] .bin-label').text(bins[key]['bin_label']);
                $('.bin[gui-bin-id='+bins[key]['gui_id']+']').attr('bin-id',bins[key]['bin_id']).show();
            }
        }

    }
}
function setConveyorsLabel(){
    let conveyors=basic_info['conveyors'];
    if(conveyors!=undefined){
        Object.values(conveyors).forEach(record => {
            if(record['gui_id']>0){
                $('.conveyor[gui-conveyor-id='+record['gui_id']+']').attr('conveyor-id',record['conveyor_id']).attr('data-original-title',record['conveyor_name']).show();
                $('.conveyor-bg[gui-conveyor-id='+record['gui_id']+']').show();
            }
        })
    }
}
function setPhotoeyesLabel(){
    let inputs=basic_info['inputs']
    if(inputs!=undefined){
        Object.values(inputs).forEach(record => {
            if(record['gui_id']>0 && (record['input_type']==0)&& (record['device_type']==0)&& (record['device_number']==0) ){
                $('.photoeye[gui-input-id='+record['gui_id']+']').attr('input-id',record['input_id']).attr('data-original-title',record['electrical_name']+'<br>'+record['description']).show();
            }
        })
    }
}
function setTestButtonsStatus(outputStates){
    let machine_id=basic_info['selectedMachineId'];
    if(outputStates[machine_id+"_49"] && outputStates[machine_id+"_49"]['state']==1){
        $("#btn-test-red-light").attr('data-started',1).css('background-color',$("#btn-test-red-light").attr('data-started-color'));
    }
    if(outputStates[machine_id+"_50"] && outputStates[machine_id+"_50"]['state']==1){
        $("#btn-test-amber-light").attr('data-started',1).css('background-color',$("#btn-test-amber-light").attr('data-started-color'));
    }
    if(outputStates[machine_id+"_51"] && outputStates[machine_id+"_51"]['state']==1){
        $("#btn-test-blue-light").attr('data-started',1).css('background-color',$("#btn-test-blue-light").attr('data-started-color'));
    }
}
/* global secondsToDhms */
let ticker_active_alarms = $('#ticker_active_alarms').newsTicker({
    row_height: 100,
    max_rows: 2,
    duration: 4000,
    pauseOnHover: 0
});
let ticker_data_current = []
function setActiveAlarms(active_alarms){
    let alarms=basic_info['alarms']
    let machine_id=basic_info['selectedMachineId'];
    let now_timestamp=moment().unix();
    let alarm_class_names = {"0" : "Error", "1" : "Warning", "2" : "Message"};
    $("#table_active_alarms tbody").empty();
    let tickers_data_new = [];
    if(active_alarms.length>0){
        for(let i=0;(i<active_alarms.length && i<5);i++){
            let key=machine_id+'_'+active_alarms[i]['alarm_id']+'_'+active_alarms[i]['alarm_type'];
            if(alarms[key]!=undefined) {
                let html = '<tr>' +
                    '<td>' + moment.unix(active_alarms[i]['date_active_timestamp']).format("MMM D Y, H:mm:ss") + '</td>' +
                    '<td>' + secondsToDhms(now_timestamp-active_alarms[i]['date_active_timestamp']) + '</td>' +
                    '<td>' + alarm_class_names[alarms[key]['alarm_class']] + '</td>' +
                    '<td>' + alarms[key]['location'] + '</td>' +
                    '<td>' + alarms[key]['description'] + '</td>' +
                    '<td>' + alarms[key]['variable_name'] + '</td>' +
                    '</tr>';
                $("#table_active_alarms tbody").append(html);
                tickers_data_new.push(alarms[key]['description']);
            }
        }
    }
    let ticker_data_count = tickers_data_new.length;
    if(ticker_data_count>0){
        if(tickers_data_new.sort().join(',') !== ticker_data_current.sort().join(',')){
            $('#ticker_active_alarms').empty();
            ticker_active_alarms.newsTicker('pause');
            ticker_data_current=tickers_data_new;
            if(ticker_data_count == 1){
                let html = '<li class="ticker-single-item">' + ticker_data_current[0] + '</li>';
                $("#ticker_active_alarms").append(html);
            }
            else {
                ticker_data_current.forEach(elem => {
                    let html = '<li>' + elem + '</li>';
                    $("#ticker_active_alarms").append(html);
                });
                if(ticker_data_count>2){
                    ticker_active_alarms.newsTicker('unpause');
                }
            }
        }
    }
    else{
        ticker_data_current=[]
        $('#ticker_active_alarms').empty();
        ticker_active_alarms.newsTicker('pause');

        let html = '<tr><td colspan="6">No active alarm to display</td></tr>';
        $("#table_active_alarms tbody").append(html);
    }
}
function setBinsStates(bin_states){
    let bin_state_colors=basic_info['bin_state_colors'];
    for(let bin_key in bin_states){
        let bin_color='#27e22b';
        for(let i=0;i<bin_state_colors.length;i++)
        {
            let bin_state_color=bin_state_colors[i];
            if(bin_states[bin_key][bin_state_color['name']]==1){
                bin_color=bin_state_color['color_active'];
                break;
            }
        }
        $('.bin[bin-id='+bin_states[bin_key]['bin_id']+'] rect').css('fill',bin_color);
    }
}
function setConveyorsStates(conveyor_states){
    let conveyor_colors = { "0" : "#ccc",  "1" : "#27e22b", "2" : "#ffc000", "3" : "red","4":"#87cefa"};
    for(let key in conveyor_states){
        $('.conveyor[conveyor-id='+conveyor_states[key]['conveyor_id']+'] .status').css('fill',conveyor_colors[conveyor_states[key]['state']]);
    }
}
function setDoorsStates(input_states){
    let machine_id=basic_info['selectedMachineId'];
    $('.door').hide();//hide all buttons
    let doors=basic_info['doors']
    for(let door_no in doors){
        let door=doors[door_no];
        let door_closed='in-active';
        let door_locked='in-active';
        let door_safe='in-active';
        if(door[1] !=undefined){
            if(input_states[machine_id+'_'+door[1]['input_id']] !=undefined){
                if(input_states[machine_id+'_'+door[1]['input_id']]['state']==door[1]['active_state']){
                    door_closed='active';
                }
            }
        }
        if(door[2]){
            if(input_states[machine_id+'_'+door[2]['input_id']]){
                if(input_states[machine_id+'_'+door[2]['input_id']]['state']==door[2]['active_state']){
                    door_locked='active';
                }
            }
        }
        if(door[3]){
            if(input_states[machine_id+'_'+door[3]['input_id']]){
                if(input_states[machine_id+'_'+door[3]['input_id']]['state']==door[3]['active_state']){
                    door_safe='active';
                }
            }
        }
        if(door_closed=='active'){
            if((door_locked=='in-active')&&(door_safe=='in-active')){
                $('.door-lock[data-device-id='+(+door_no+90)+']').show();
            }
            else{
                $('.door-unlock[data-device-id='+(+door_no+90)+']').show();
            }
        }
        else{
            $('.door-open[data-device-id='+(+door_no+90)+']').show();
        }

    }
}
function setPhotoeyesStates(input_states){
    let input_colors = {"in-active" : "#39b54a", "active" : "#f7931e"};
    for(let key in basic_info['inputs']){
        let input=basic_info['inputs'][key];
        if((input['input_type']==0)&&(input['device_type']==0)&&(input['device_number']==0)&& (input['gui_id']>0)){
            let state='in-active'
            if(input_states[key]){
                if(input['active_state']==input_states[key]['state']){
                    state='active'
                }
            }
            $('.photoeye[input-id='+input["input_id"]+'] .status').css('fill',input_colors[state]);
        }
    }
}