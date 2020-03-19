google.charts.load('current', { 'packages': ['corechart'] });
google.charts.load('current', { 'packages': ['bar'] });

function drawChart(chart_data, chart1_main_title, id) {
    var data =
        google.visualization.arrayToDataTable(chart_data);
    var options = {
        title: chart1_main_title,
        is3D: true,
        slices: { 0: { color: '#5c6bc0' }, 1: { color: '#ff9800' } }
    };
    var chart = new google.visualization.PieChart(document.getElementById(id));
    chart.draw(data, options);
}

function drawChartBar(chart_data, titulo, subtitulo, id) {
    let data =
        google.visualization.arrayToDataTable(chart_data);
    var options = {
        chart: {
            title: titulo,
            subtitle: subtitulo,
        },
        colors: ['#ff9800', '#5c6bc0']
    };
    var chart = new google.charts.Bar(document.getElementById(id));
    chart.draw(data, google.charts.Bar.convertOptions(options));
}

function cargaGraficas() {
    $('#menu_nav_reportes_alumnos').css('display', 'none');
    $('#graficaGeneralTemasGrupo').html('');
    $.ajax({
        url: 'http://localhost:8000/gamma/generalGrades/',
        method: 'GET',
        success: (res) => {
            $('#btn_inicio').html('');
            $('#menu_nav_reportes').css('display', 'inline-block');
            $('#menu_nav_reportes_cuestionario').css('display', 'inline-block');
            document.getElementById('btn_inicio').style = '';
            document.getElementById('btn_inicio').className = '';
            drawChart(res, 'Alumnos aprobados y reprobados', "graficaGeneralAlumnos");
        }
    });
    $.ajax({
        url: 'http://localhost:8000/gamma/generalColumnTopic/',
        method: 'GET',
        success: (res) => {
            drawChartBar(res, 'Temas', 'Puntaje por temas', 'graficaGeneralTemas');
        }
    });
}

function cargarGraficasGrupo(id_gru, nom_gru) {
    $('#menu_nav_reportes_alumnos').css('display', 'inline-block');
    $('#graficaGeneralTemas').html('');
    $('#graficaGeneralAlumnos').html('');
    $.ajax({
        url: `http://localhost:8000/gamma/generalColumnGroupTopic/${id_gru}/`,
        method: 'GET',
        success: (res) => {
            drawChartBar(res, `Temas del grupo ${nom_gru}`, 'Correctos e incorrectos', 'graficaGeneralTemasGrupo');
        }
    });
}