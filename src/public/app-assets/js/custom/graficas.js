google.charts.load('current', { 'packages': ['corechart'] });
google.charts.load('current', { 'packages': ['bar'] });

function limpiaGraficas() {
    $('#grafica1').html('');
    $('#grafica2').html('');
    $('#grafica3').html('');
    $('#grafica4').html('');
    $('#grafica5').html('');
    $('#grafica6').html('');
}

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
    limpiaGraficas();
    $.ajax({
        url: 'http://localhost:8000/gamma/generalGrades/',
        method: 'GET',
        success: (res) => {
            $('#btn_inicio').html('');
            $('#menu_nav_reportes').css('display', 'inline-block');
            $('#menu_nav_reportes_cuestionario').css('display', 'inline-block');
            document.getElementById('btn_inicio').style = '';
            document.getElementById('btn_inicio').className = '';
            drawChart(res, 'Alumnos aprobados y reprobados generales', "grafica3");

        }
    });
    $.ajax({
        url: 'http://localhost:8000/gamma/generalColumnTopic/',
        method: 'GET',
        success: (res) => {
            drawChartBar(res, 'Temas', 'Puntaje por temas', 'grafica4');
        }
    });
}

function cargarGraficasGrupo(id_gru, nom_gru) {
    $('#menu_nav_reportes_alumnos').css('display', 'inline-block');
    limpiaGraficas();
    $.ajax({
        url: `http://localhost:8000/gamma/generalColumnGroupTopic/${id_gru}/`,
        method: 'GET',
        success: (res) => {

            drawChartBar(res, `Temas del grupo ${nom_gru}`, 'Correctos e incorrectos', 'grafica3');
        }
    });
}

function filtrarGraficas() {
    let grupo = document.getElementById('grupo_ver').value;
    let alumno = document.getElementById('alumno_ver').value;
    let cuestionario = document.getElementById('cuestionario_ver').value;
    let tema = document.getElementById('tema_ver').value;
    if (cuestionario != -1) {
        if (grupo != -1) {
            if (alumno != -1) {
                alumnoCuestionario(alumno, cuestionario);
            } else {
                grupoCuestionario(grupo, cuestionario);
            }
        } else {
            cuestionaire(cuestionario);
        }
    }
}

function grupoCuestionario(id_gru, id_cue) {
    limpiaGraficas();
    $.ajax({
        url: `http://localhost:8000/gamma/generalGroupQuestionnaire/${id_gru}/${id_cue}/`,
        method: 'GET',
        success: (res) => {
            $('#grafica1').html('');
            drawChart(res, `Aprobados y reprobados del cuestionario en el grupo`, 'grafica1');
        }
    })
    $.ajax({
        url: `http://localhost:8000/gamma/questionnaireGradeGroup/${id_gru}/${id_cue}/`,
        method: 'GET',
        success: (res) => {
            $('#grafica2').html('');
            drawChartBar(res, `Correctas e incorrectas del cuestionario en el grupo`, `Por pregunta`, 'grafica2');
        }
    })
}

function cuestionaire(id_cue) {
    limpiaGraficas();
    $.ajax({
        url: `http://localhost:8000/gamma/generalQuestionnaire/${id_cue}/`,
        method: 'GET',
        success: (res) => {
            $('#grafica1').html('');
            drawChart(res, `Aprobados y reprobados del cuestionario general`, 'grafica1');
        }
    })
    $.ajax({
        url: `http://localhost:8000/gamma/questionnaireGrades/${id_cue}/`,
        method: 'GET',
        success: (res) => {
            $('#grafica2').html('');
            drawChartBar(res, `Aciertos e incorrectos del cuestionario`, 'General', 'grafica2');
        }
    })
}

function alumnoCuestionario(id_alum, id_cues) {
    limpiaGraficas();
    $.ajax({
        url: `http://localhost:8000/gamma/questionnaireAlumno/${id_alum}/${id_cues}/`,
        method: 'GET',
        success: (res) => {
            $('#grafica1').html('');
            drawChart(res, `Correctas e incorrectas del cuestionario del alumno`, 'grafica1');
        }
    })
}