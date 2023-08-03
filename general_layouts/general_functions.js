/**
 * Created by Shaiful Islam on 2023-08-02.
 */
// ---------------
$('#switch_legend_production').change(function () {
    if ($(this).is(":checked")) {
        $('#svg_general_colors').hide();
        $('#container_production').show();
    } else {
        $('#svg_general_colors').show();
        $('#container_production').hide();

    }
});
function setBinsLabel(bins,layoutNo){
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
                $('.bin[gui-bin-id='+bins[key]['gui_id']+']').attr('bin-key',key).show();
            }
        }

    }
}
function setPhotoeyesLabel(inputs){
    if(inputs!=undefined){
        Object.values(inputs).forEach(record => {
            if(record['gui_id']>0 && (record['input_type']==0)&& (record['device_type']==0)&& (record['device_number']==0) ){
                $('.photoeye[gui-input-id='+record['gui_id']+']').attr('input-id',record['input_id']).attr('data-original-title',record['electrical_name']+'<br>'+record['description']).show();
            }
        })
    }
}
