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
