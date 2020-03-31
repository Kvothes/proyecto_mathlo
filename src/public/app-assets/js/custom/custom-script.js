function barraBusqueda(id_barra, id_tabla) {
    let input, filter, table, tr, td, i, txtValue;
    input = document.getElementById(id_barra);

    filter = input.value.toUpperCase();
    table = document.getElementById(id_tabla);
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td");

        if (td) {
            for (let j = 0; j < td.length; j++) {
                txtValue = td[j].textContent || td[j].innerText;
                if (txtValue.toUpperCase().includes(filter)) {
                    tr[i].style.display = "";
                    break;
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    }
}


function mostrarAlumnos(id_gru) {
    $.ajax({
        url: `/web/getAlumnosGrupo`,
        method: 'POST',
        data: {
            id_gru: id_gru
        },
        success: (alumnos) => {
            let tbody = $('#tabla_alumnos');
            let n = 1;
            tbody.html('');
            alumnos.forEach(alumno => {
                tbody.append(`
                    <tr>
                        <td>${n}</td>
                        <td>${alumno.nom_usu}</td>
                        <td><a href="javascript:void(0);" class="waves-effect waves-teal btn-flat" onclick="eliminarAlumnoGrupo(${alumno.id_ugr}, ${alumno.id_gru}, ${alumno.id_prof})">Eliminar del grupo</a></td>
                    </tr>
                `);
                n++;
            });
        }
    });
}


function eliminarAlumnoGrupo(id_ugr, id_gru, id_prof) {
    $.ajax({
        url: `/web/deleteAlumnoGrupo`,
        method: 'POST',
        data: {
            id_ugr: id_ugr
        },
        success: (response) => {
            M.toast({ html: response, classes: 'rounded' });
            mostrarAlumnos(id_gru);
            verGruposProfesor(id_prof);
        }
    });
}


function verGruposProfesor(id_prof) {
    $.ajax({
        url: `/web/verGruposProfesor`,
        method: 'POST',
        data: {
            id_prof: id_prof
        },
        success: (gruposFin) => {
            let tbody = $('#tabla_grupos');
            tbody.html('');
            gruposFin.forEach(grupo => {
                if (grupo.cla_gru == null) {
                    grupo.cla_gru = '';
                }
                tbody.append(`
                    <tr>
                        <td>${grupo.nom_gru}</td>
                        <td contenteditable="true" id="clave${grupo.id_gru}">${grupo.cla_gru}</td>
                        <td>${grupo.num_alu}</td>
                        <td><a href="javascript:void(0);" class="waves-effect waves-teal btn-flat">Modificar clave</a></td>
                        <td><a href="javascript:void(0);" onclick="mostrarAlumnos(${grupo.id_gru});" class="waves-effect waves-teal btn-flat">Ver alumnado</a></td>
                    </tr>
                `);
            });
        }
    });
}


function verGruposProfesor(id_prof) {
    $.ajax({
        url: `/web/verGruposProfesor`,
        method: 'POST',
        data: {
            id_prof: id_prof
        },
        success: (gruposFin) => {
            let tbody = $('#tabla_grupos');
            tbody.html('');
            gruposFin.forEach(grupo => {
                if (grupo.cla_gru == null) {
                    grupo.cla_gru = '';
                }
                tbody.append(`
                    <tr>
                        <td>${grupo.nom_gru}</td>
                        <td contenteditable="true" id="clave${grupo.id_gru}">${grupo.cla_gru}</td>
                        <td>${grupo.num_alu}</td>
                        <td><a href="javascript:void(0);" class="waves-effect waves-teal btn-flat">Modificar clave</a></td>
                        <td><a href="javascript:void(0);" onclick="mostrarAlumnos(${grupo.id_gru});" class="waves-effect waves-teal btn-flat">Ver alumnado</a></td>
                    </tr>
                `);
            });
        }
    });
}


function modificarClaveGrupo(id_gru, clave) {
    $.ajax({
        url: `/web/modificarClaveGrupo`,
        method: 'POST',
        data: {
            id_gru: id_gru,
            clave: clave
        },
        success: (response) => {
            M.toast({ html: response, classes: 'rounded' });
        }
    });
}

function modificarUsuario(id_usu, nom_usu, cor_usu) {
    $.ajax({
        url: `/web/modificarUsuarioAjax`,
        method: 'POST',
        data: {
            id_usu: id_usu,
            nom_usu: nom_usu,
            cor_usu: cor_usu
        },
        success: (response) => {
            M.toast({ html: response, classes: 'rounded' });
        }
    });
}

function ConsultarPregunta(id_tem, id_dif) {
    $.ajax({
        url: `/web/preguntasx`,
        method: 'POST',
        data: {
            id_tem: id_tem,
            id_dif: id_dif
        },
        success: (response) => {
            M.toast({ html: response, classes: 'rounded' });
        }
    });
}


function eliminarUsuario(id_usu) {
    $.ajax({
        url: `/web/eliminarUsuarioAjax`,
        method: 'POST',
        data: {
            id_usu: id_usu
        },
        success: (response) => {
            M.toast({ html: response, classes: 'rounded' });
            mostrarUsuarios(id_usu);
        }
    });
}

function mostrarUsuarios(id_usu) {
    $.ajax({
        url: `/web/getUsuariosAjax`,
        method: 'POST',
        data: {
            id_usu: id_usu
        },
        success: (ListaFinal) => {
            console.log(ListaFinal);
            let tbody = $('#tabla_usu');
            let valor;
            tbody.html('');
            ListaFinal.forEach(usuario => {
                console.log(usuario.nom_usu);
                if (usuario.id_tus == 1) {
                    valor = "Alumno";
                } else if (usuario.id_tus == 2) {
                    r = "Tutor";
                } else if (usuario.id_tus == 3) {
                    valor = "Profesor";
                } else if (usuario.id_tus == 4) {
                    valor = "Autoridad";
                } else {
                    valor = "Administrador";
                }
                tbody.append(`
                        <tr>
                       
                            <td contenteditable="true" id="nom_usu${usuario.id_usu}">${usuario.nom_usu}</td>
                            <td contenteditable="true" id="clave${usuario.id_usu}">${usuario.cor_usu}</td>
                            <td>${valor}</td>
                            <td>
                            <a href="javascript:void(0);" onclick="modificarUsuario({{id_usu}}, document.getElementById('nom_usu{{id_usu}}').innerText,document.getElementById('cor_usu{{id_usu}}').innerText);" class="waves-effect waves-teal btn-flat">Modificar</a>
                            </td>
                            <td>
                            <a href="javascript:void(0);" onclick="eliminarUsuario({{id_usu}});" class="waves-effect waves-teal btn-flat">Eliminar</a>
                            </td>
                        </tr>
                `);

            });
        }
    });
}
$(() => {
    $("#formuploadajax").on("submit", (e) => {
        e.preventDefault();
        let formData = new FormData(document.getElementById("formuploadajax"));
        //formData.append(f.attr("name"), $(this)[0].files[0]);
        $.ajax({
            url: "/web/insertarApoyo",
            method: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            processData: false
        }).done(function(res) {
            M.toast({ html: res, classes: 'rounded' });
            mostrarApoyos(-1);
        });
    });
    $('#modificar_apoyo_ventana').on("submit", (e) => {
        e.preventDefault();
        let formData = new FormData(document.getElementById('modificar_apoyo_ventana'));
        formData.append('link', document.getElementById('url_ventana_muestra').textContent);
        $.ajax({
            url: "/web/updateApoyo",
            method: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            processData: false
        }).done((res) => {
            M.toast({ html: res.aviso, classes: 'rounded' });
            mostrarApoyos(-1);
            setVentanaApoyos(res.pdf, res.url, res.tema, res.id);
        });
    });
});

function mostrarApoyos(id_tem) {
    $.ajax({
        url: '/web/getApoyosAjax',
        method: 'POST',
        data: {
            id_tem: id_tem
        }
    }).done((apoyos) => {
        let contenedor = $('#div_contenedor_apoyos');
        contenedor.html('');
        apoyos.forEach(apoyo => {
            contenedor.append(`
            <div class="col xl3 l6 m3 s6" style="height: 250px;">
                <div class="card box-shadow-none mb-1 app-file-info">
                    <div class="card-content">
                        <div class="app-file-content-logo grey lighten-4" onclick="setVentanaApoyos('${apoyo.nom_pdf}','${apoyo.vin_apo}','${apoyo.nom_tem}');
                        document.getElementById('show').className = 'app-file-overlay show';
                        document.getElementById('show2').className = 'app-file-sidebar-info ps show'">
                            <div class="fonticon">
                                <i class="material-icons">more_vert</i>
                            </div>
                            <img class="recent-file" src="/app-assets/images/icon/pdf.png" height="38" width="30" alt="Card image cap">
                        </div>
                        <div class="app-file-details">
                            <div class="app-file-name font-weight-700">${apoyo.nom_tem}</div>
                            <div class="app-file-size">${apoyo.nom_pdf}</div>
                        </div>
                    </div>
                </div>
            </div>
            `);
        });
    });
}

function setVentanaApoyos(pdf, url, tema, id) {
    document.getElementById('pdf_ventana_muestra').textContent = pdf;
    document.getElementById('url_ventana_muestra').textContent = url;
    document.getElementById('tema_ventana_muestra').textContent = tema;
    document.getElementById('id_apoyo').value = id;
    $('#btn_delete_ventana_apoyos').click(() => {
        deleteApoyo(id);
    });
}


function deleteApoyo(id) {
    $.ajax({
        url: '/web/deleteApoyoAjax',
        method: 'POST',
        data: {
            id_apoyo: id
        }
    }).done((res) => {
        M.toast({ html: res, classes: 'rounded' });
        document.getElementById('show').className = 'app-file-overlay';
        document.getElementById('show2').className = 'app-file-sidebar-info ps';
        mostrarApoyos(-1);

    });
}

function obtenerAlumnos(id_gru) {
    $.ajax({
        url: '/web/getAlumnosGrupo',
        method: 'POST',
        data: {
            id_gru
        },
        success: (res) => {
            let array = [];
            if (id_gru != -1) {
                res[0].forEach(alumno => {
                    array.push([alumno.id_ugr, alumno.nom_usu]);
                    $('#alumnosSeleccionados').html('');
                    $('#cuestionarioSeleccionado').html('');
                    if (res[0].indexOf(alumno) == (res[0].length - 1)) {
                        crearSelectMaterialize(array, 'alumnosSeleccionados', 'Todos los alumnos');
                        crearSelectMaterialize(res[1], 'cuestionarioSeleccionado', 'Todos los cuestionarios');
                    }
                });
            } else {
                $('#cuestionarioSeleccionado').html('');
                crearSelectMaterialize(res[1], 'cuestionarioSeleccionado', 'Todos los cuestionarios');
            }
        }
    });
}

function crearSelectMaterialize(arreglo, id_select, general) {
    let select = document.getElementById(id_select);
    let optionGeneral = document.createElement('option');
    optionGeneral.value = -1;
    optionGeneral.textContent = general;
    select.appendChild(optionGeneral);
    arreglo.forEach(elemento => {

        let option = document.createElement('option');
        option.value = elemento[0];
        option.textContent = elemento[1];
        select.appendChild(option);
        if (arreglo.indexOf(elemento) == (arreglo.length - 1)) {
            $(`#${id_select}`).formSelect();
        }
    });
}