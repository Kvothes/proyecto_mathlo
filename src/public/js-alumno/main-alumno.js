$(document).ready(function () {
    $('#sidebar').attr('class', 'active');
    $('#sidebarCollapse').click(function () {
        $('#sidebar').toggleClass('active');
    });
});