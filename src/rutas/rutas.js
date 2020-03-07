const express = require('express');
const router = express.Router();
const cifrado = require('../tools/cifrado');
const cifradoRSA = require('../tools/cifrado-rsa');
const validacion = require('../tools/validacion');
//const firma = require('../tools/Firma');
const multer = require('multer');
const path = require('path');
const cron = require('node-cron');
const jwt = require('jsonwebtoken');
const mail = require('../tools/mail');
const fs = require('fs');
/**---------------------------------------------------------------------------------------------------------- */

//4.-Time-Pink Floyd.rimo
function calcular_primo(num) {
    let p = true;
    for (let i = 2; i < num; i++) {
        if (num % i == 0) {
            p = false;
        }
    }
    if (num == 2) {
        p = true;
    } else if (num == 1) {
        p = false;
    }
    if (p == true) {
        return num;
    } else {
        return calcular_primo(Math.floor(Math.random() * (10000 - 1000) + 1000));
    }
}
/*--------------------------------------------- FIN ----------------------------------------------------------*/
/*-----------------------------------__Archivos recibidos de las rutas__-----------------------------------------*/

let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

let upload = multer({ storage: storage })
    /*----------------------------------------------------FIN-------------------------------------------------------*/

/* Testeo de profesor */
router.get('/testeo-profesor', (req, res) => {
    res.setHeader('Content-type', 'text/html');
    req.app.locals.layout = 'profesor';
    res.render('profesor/prueba-profesor');
});

// Pagina principal 
router.get('/', (req, res) => {
    if (req.session.usuario == undefined) {
        req.app.locals.layout = 'main';
        res.render('sin-sesion/inicio');
    } else {
        if (req.session.usuario.id_tus == 1) {
            req.getConnection((err, conn) => {
                conn.query('select * from eusuariosgrupo natural join cgrupo where id_usu=?', req.session.usuario.id_usu, (errConsul, GrupoUsu) => {
                    GrupoUsu.forEach(element => {
                        if (element.id_usu == req.session.usuario.id_usu) {
                            console.log('grupo asignado');
                            let gru = 1;
                            req.app.locals.layout = 'alumno';
                            res.render('alumno/inicio2', { usuario: req.session.usuario, grupo: gru, grupoNom: element.nom_gru });
                        } else {
                            console.log('grupo sin asignar');
                            let gru = 0;
                            req.app.locals.layout = 'alumno';
                            res.render('alumno/inicio2', { usuario: req.session.usuario, grupo: gru, grupoNom: element.nom_gru });
                        }
                    });
                });
            });
        }
        if (req.session.usuario.id_tus == 2) {
            req.app.locals.layout = 'tutor';
            res.render('tutor/inicio', { usuario: req.session.usuario });
        }
        if (req.session.usuario.id_tus == 3) {
            req.app.locals.layout = 'profesor';
            req.getConnection((err, conn) => {
                conn.query('select * from eusuariosgrupo natural join musuario natural join cgrupo where id_usu = ? order by nom_gru asc', req.session.usuario.id_usu, (err, grupos) => {
                    retornaGrupos(grupos, conn, (ListaFinal) => {
                        res.render('profesor/prueba-profesor', { grupos: ListaFinal, usuario: req.session.usuario });
                    });

                });
            });

        }
        if (req.session.usuario.id_tus == 4) {
            req.app.locals.layout = 'autoridad';
            req.getConnection((err, conn) => {
                conn.query('select * from cunidadaprendizaje', (err, unidades_aprendizaje) => {
                    conn.query('select * from ctemas natural join cunidadaprendizaje', (err, temas) => {
                        conn.query('select * from mapoyos natural join ctemas order by nom_tem asc', (err, apoyos) => {
                            conn.query('select * from cgrupo', (err, grupos) => {
                                res.render('autoridad/inicio', {
                                    usuario: req.session.usuario,
                                    unidades_aprendizaje: unidades_aprendizaje,
                                    apoyos: apoyos,
                                    grupos: grupos,
                                    temas: temas
                                });
                            });


                        });

                    });

                });
            });

        }
        if (req.session.usuario.id_tus == 5) {
            req.getConnection((err, conn) => {

                conn.query('select * from MUsuario natural join CTipoUsuario where cor_usu != ?', req.session.usuario.cor_usu, (err2, usuario) => {
                    if (err2) console.log(err2);
                    console.log(req.session.usuario.nom_usu);
                    req.app.locals.layout = 'Administrador';
                    res.render('admin/HomeAd2', { usuario: req.session.usuario, rows: usuario });
                })
            })
        }
    }
});


// Cerrar sesion
router.get('/logout', (req, res) => {
    req.session.usuario = undefined;
    res.redirect('/');
});

router.get('/apoyos-a-alumnos', (req, res) => {
    req.app.locals.layout = 'profesor';
    req.getConnection((err, conn) => {
        conn.query('select * from ctemas', (err, temas) => {
            res.render('profesor/apoyos', { temas: temas });
        });
    });

});

router.get('/preguntas', (req, res) => {
    req.app.locals.layout = 'profesor';
    req.getConnection((err, conn) => {
        conn.query("select * from ctemas", (err2, temas) => {
            conn.query("select * from cdificultad", (err3, dif) => {
                res.render('profesor/questions', { temas: temas, dif: dif });
            })
        });
    });
});

router.get('/cuestionarios', (req, res) => {
    if (req.session.usuario == undefined || req.session.usuario.id_tus != 3) {
        res.redirect('/');
    } else {
        req.app.locals.layout = 'profesor';
        req.getConnection((err, conn) => {
            conn.query("select * from mbancopreguntas natural join ctemas natural join cdificultad", (err2, preguntas) => {
                conn.query("select * from eusuariosgrupo natural join musuario natural join cgrupo where id_usu=?", req.session.usuario.id_usu, (err3, grupos) => {
                    if (err2) console.log("ERROR 2: " + err2)
                    if (err3) console.log("ERROR 3: " + err2)
                    console.log(preguntas)
                    console.log(grupos)
                    res.render('profesor/Create', { preguntas: preguntas, grupos: grupos });
                });
            });
        });
    }
});

/* ------- Peticiones ajax ------------- */

router.post('/getAlumnosGrupo', (req, res) => {
    const { id_gru } = req.body;
    req.getConnection((err, conn) => {
        conn.query('select id_ugr, nom_usu, id_gru from eusuariosgrupo natural join musuario where id_gru = ? and id_tus = 1 order by nom_usu asc', id_gru, (err, alumnosGrupo) => {
            let jfinal = [];
            alumnosGrupo.forEach(algru => {
                let j = {
                    "id_ugr": algru.id_ugr,
                    "nom_usu": algru.nom_usu,
                    "id_gru": algru.id_gru,
                    "id_prof": req.session.usuario.id_usu
                }
                jfinal.push(j);

            });
            res.json(jfinal);
        });
    });
});

router.post('/deleteAlumnoGrupo', (req, res) => {
    const { id_ugr } = req.body;
    req.getConnection((err, conn) => {
        conn.query('delete from eusuariosgrupo where id_ugr = ?', id_ugr, (err, alumnoGrupoEliminado) => {
            res.json('Alumno eliminado satisfactoriamente ');
        });
    });
});

router.post('/verGruposProfesor', (req, res) => {
    const { id_prof } = req.body;
    req.getConnection((err, conn) => {
        conn.query('select * from eusuariosgrupo natural join musuario natural join cgrupo where id_usu = ? order by nom_gru asc', id_prof, (err, grupos) => {
            retornaGrupos(grupos, conn, (ListaFinal) => {
                res.json(ListaFinal);
            });
        });

    });
});

router.post('/modificarClaveGrupo', (req, res) => {
    const id_gru = req.body.id_gru;
    const clave = req.body.clave;
    req.getConnection((err, conn) => {
        conn.query('update cgrupo set cla_gru = ? where id_gru = ?', [clave, id_gru], (err, exito) => {
            res.json("La clave del grupo se ha modificado con éxito");
        });
    });

});
router.post('/getUsuariosAjax', (req, res) => {
    const { id_usu } = req.body;
    req.getConnection((err, conn) => {
        conn.query('select * from musuario natural join ctipousuario where id_usu = ? ', id_usu, (err, usuConsul) => {
            console.log('el error es: ', err);
            let jfinal = [];
            usuConsul.forEach(usus => {
                console.log('holi: ', usus.id_usu);
                let j = {
                    "id_usu": usus.id_usu,
                    "nom_usu": usus.nom_usu,
                    "cor_usu": usus.cor_usu,
                    "id_tus": usus.id_tus
                }
                jfinal.push(j);

            });
            res.json(jfinal);
        });
    });
});
router.post('/eliminarUsuarioAjax', (req, res) => {
    const id_usu = req.body.id_usu;
    console.log(id_usu);

    req.getConnection((err, conn) => {
        conn.query('delete from eusuariosgrupo where id_usu = ?', [id_usu], (err, exito) => {
            conn.query('delete from musuario where id_usu = ?', [id_usu], (err2, exito) => {
                if (err);
                console.log(err2);
                console.log(err);
                res.json("Usuario eliminado con exito");
            });
        });
    });

});
router.post('/modificarUsuarioAjax', (req, res) => {
    const id_usu = req.body.id_usu;
    const nom_usu = req.body.nom_usu;
    const cor_usu = req.body.cor_usu;

    let data = {
        "nom_usu": nom_usu,
        "cor_usu": cor_usu,

    }
    req.getConnection((err, conn) => {
        conn.query('update musuario set ? where id_usu = ?', [data, id_usu], (err, exito) => {
            res.json("Usuario modificado con exito");
        });
    });

});

router.post('/agregarApoyo', (req, res) => {
    const { formData } = req.body;
    console.log(formData.values());

    res.json(formData);
});


"use strict";

function retornaGrupos(grupos, conn, callback) {
    let gruposFin = [],
        n = 0;
    grupos.forEach(grupo => {
        conn.query('select id_usu from eusuariosgrupo natural join musuario where id_gru = ? and id_tus = 1', grupo.id_gru, (err, alumnos) => {
            alumnos.forEach(alumno => {
                n++;
            });
            let g = {
                "id_gru": grupo.id_gru,
                "nom_gru": grupo.nom_gru,
                "cla_gru": grupo.cla_gru,
                "num_alu": n
            }
            gruposFin.push(g);
            n = 0;
        });
    });
    setTimeout(() => {
        callback(gruposFin);
    }, 0 | Math.random() * 100);
}


/* -------------- fin peticiones ajax ---------------*/
router.get('/ModificarDatosF', (req, res) => {

    if (req.session.name == undefined) {
        req.app.locals.layout = 'main';
        res.redirect('/');
    } else {
        let id_us = req.session.name;
        let id;
        let nom_us;
        let appat_us;
        let apmat_us;
        let cor_us;
        let usnam_us;
        let pas_us;
        let edit2 = [];
        req.getConnection((err, conn) => {
            conn.query('select * from usuario where id_us=? ', [id_us], (err, rows) => {
                rows.forEach(element => {
                    id = element.id_us,
                        nom_us = element.nom_us,
                        appat_us = element.appat_us,
                        apmat_us = element.apmat_us,
                        cor_us = cifrado.desencriptar(element.cor_us),
                        usnam_us = cifrado.desencriptar(element.usnam_us),

                        edit2.push({
                            "id": id,
                            "nom_us": nom_us,
                            "appat_us": appat_us,
                            "apmat_us": apmat_us,
                            "cor_us": cor_us,
                            "usnam_us": usnam_us,

                        });
                });
                if (req.session.cargo == 'alumno') {
                    req.app.locals.layout = 'Profesor';
                    res.render('alumno/alumno-modificar', { edit2: edit2 });
                } else if (req.session.cargo == 'docente') {
                    req.app.locals.layout = "alumno";
                    res.render('profesor/profesor-modificar', { edit2: edit2 });
                }
            });
        });
    }


});
router.post('/ModifyNa', (req, res) => {
    req.getConnection((err, conn) => {
        let passk = req.body.pass;
        let id_us = req.session.name;
        let pas_usc;
        conn.query('select * from usuario where id_us=?', [id_us], (err1, rows2) => {
            rows2.forEach(element => {
                pas_usc = cifrado.desencriptar(element.pas_us);
                console.log(pas_usc);
                console.log(passk);
                if (pas_usc == passk) {
                    console.log('si entra');
                    let nom_us = req.body.nom;
                    let appat_us = req.body.appat;
                    let apmat_us = req.body.apmat;
                    let usnam_usX = req.body.usnam;
                    let usnam_us = cifrado.cifrar(usnam_usX);
                    let cor_usX = req.body.cor;
                    let cor_us = cifrado.cifrar(cor_usX);
                    let pas_uss = req.body.pas;
                    let pas_us = cifrado.cifrar(pas_uss);
                    let editx = {
                        nom_us,
                        appat_us,
                        apmat_us,
                        usnam_us,
                        cor_us,
                        pas_us
                    }
                    conn.query('update usuario set ? where id_us=? ', [editx, id_us], (err, rows) => {
                        if (err) console.log(err);
                        res.redirect('/');
                    });
                } else {
                    console.log('no entra');
                    res.redirect('/');
                }
            });
        });
    });
});

// Pagina para logearte
router.get('/registra', (req, res) => {
    req.app.locals.layout = 'main';
    res.render('sin-sesion/registra');
});
//Registrar Administrador
router.post('/registrarAdmin', (req, res) => {
    console.log('me odio');

    req.getConnection((err, conn) => {
        if (err) console.log('este es el error: ', err);
        let adminRE = {
            "nom_usu": req.body.nombres_usuario + " " + req.body.apellidos_usuario,
            "curp_usu": null,
            "cor_usu": req.body.email_usuario,
            "pas_usu": cifrado.cifrar(req.body.contraseña_usuario),
            "id_tus": 5
        }
        conn.query('insert into musuario set ?', adminRE, (err2, rows) => {
            if (err2) console.log('este es el error: ', err2);
            req.app.locals.layout = "Administrador";
            res.redirect('/');
        });
    })
});


// Borrar el grupo del alumno
router.get('/eliminar/:id', (req, res) => {
    if (req.session.name == undefined) {
        res.redirect('/');
    } else {

        let id = req.params.id;
        req.getConnection((err, conn) => {
            conn.query('delete from agruparusuariogrupo where id_agru = ?', [id], (err2, rows) => {
                res.redirect('/');
            });
        });
    }

});

// intermediario para abrir el grupo en alumno
router.get('/abrir/:id', (req, res) => {
    if (req.session.name == undefined) {
        res.redirect('/');
    } else {
        let id = req.params.id;
        req.getConnection((err, conn) => {
            conn.query('select * from grupo where id_gru = ?', [id], (err2, rows) => {
                req.session.semestre = rows[0].id_sem;
            }); //ya deberia de funcionar
            req.session.abreGrupo = id;
            res.redirect('/grupo');
        });
    }

});

// Pagina de inicio con sesion de alumno
router.get('/alumno', (req, res) => {
    if (req.session.name == undefined && req.session.cargo != 'alumno') {
        res.redirect('/');
    } else {
        req.getConnection((err, conn) => {
            conn.query('select * from agruparusuariogrupo natural join grupo natural join usuario natural join semestre natural join turno where id_us = ? ', [req.session.name], (err2, rows) => {
                req.app.locals.layout = 'alumno';

                res.render('alumno/inicio', { rows: rows });
            });
        });
    }

});


//pagina de grupos
router.get('/grupo', (req, res) => {
    if (req.session.name != undefined) {
        req.getConnection((err, conn) => {
            conn.query('select * from agruparpractica natural join practica where id_sem = ?', [req.session.semestre], (err2, rows) => {
                req.app.locals.layout = 'alumno';
                res.render('alumno/grupo', { rows: rows });
            });
        });

    } else {
        res.redirect('/');
    }
});

// Registrar usuario en la bd
router.post('/registrar', (req, res) => {
    if (!req.body.nombres_usuario || !req.body.apellidos_usuario || !req.body.email_usuario ||
        !req.body.curp_alumno || !req.body.contraseña_usuario || !req.body.tipo_usuario) {
        res.redirect('/#modal1');
    } else {
        let nombre = req.body.apellidos_usuario + ' ' + req.body.nombres_usuario;
        let cor = req.body.email_usuario.toLowerCase();
        let pas = req.body.contraseña_usuario;
        let tip = req.body.tipo_usuario;
        let curp = req.body.curp_alumno.toUpperCase();

        let usuario = {
            "nom_usu": nombre,
            "curp_usu": curp,
            "cor_usu": cor,
            "pas_usu": pas,
            "id_tus": tip
        }

        req.getConnection(async(err, conn) => {
            await conn.query(`select * from musuario where nom_usu = '${usuario.nom_usu}' or cor_usu = ' ${usuario.cor_usu}'`, (err, usuarioExistente) => {
                if (usuarioExistente.length < 1) {
                    usuario.pas_usu = cifrado.cifrar(usuario.pas_usu);
                    usuario.curp_usu = cifrado.cifrar(usuario.curp_usu);
                    req.session.usuario_sin_verificar = usuario;
                    mail.envia(usuario.cor_usu, mail.generaCodigo(usuario.cor_usu));
                    res.redirect('/confirmacion_de_usuario');
                } else {
                    res.redirect('/#inicio');
                }
            });
        });
    }
});

router.get('/confirmacion_de_usuario', (req, res) => {
    if (req.session.usuario_sin_verificar != undefined) {
        res.render('sin-sesion/confirmar');
    } else {
        res.redirect('/');
    }
});

router.post('/confirmacion', (req, res) => {
    if (!req.body.codigo_confirmacion) {
        res.redirect('/#!');
    } else {
        if (mail.generaCodigo(req.session.usuario_sin_verificar.cor_usu) == req.body.codigo_confirmacion) {
            req.getConnection((err, conn) => {

                conn.query(`insert into musuario set ?`, req.session.usuario_sin_verificar, (err, usuarioInsertado) => {
                    req.session.usuario_sin_verificar = undefined;
                    res.redirect('/');
                });
            });
        } else {
            res.redirect('/');
        }

    }
});
//insertar alumno al grupo
router.post('/alumnoIGrupo', (req, res) => {
    let cla_gru = req.body.codigo_grupo;
    // console.log(cla_gru);
    req.getConnection((err, conn) => {
        if (err);
        console.log('el error es: ', err);
        conn.query('select * from cgrupo where cla_gru = ?', cla_gru, (errConsul, clave) => {
            if (errConsul);
            console.log('el error en la consulta es: ', errConsul);
            clave.forEach(element => {
                console.log(element.cla_gru);
                console.log(element.id_gru);
                if (element.cla_gru == cla_gru) {
                    let insertData = {
                        "id_usu": req.session.usuario.id_usu,
                        "id_gru": cla_gru
                    }
                    conn.query('insert into eusuariosgrupo set ?', [insertData], (errInsert, row) => {
                        if (errInsert);
                        console.log('El error al insertar es: ', errInsert);
                        console.log(req.session.usuario.id_usu);
                        res.redirect('/');
                    });

                } else {
                    console.log('no furula');
                    res.redirect('/');
                }
            });
        })
    });
});

router.post('/recuperarCuenta', (req, res) => {
    if (!req.body.email_recuperacion) {
        res.redirect('/#!');
    } else {
        req.getConnection((err, conn) => {
            conn.query('select * from musuario where cor_usu = ?', req.body.email_recuperacion, (err, usuarioCorrecto) => {
                console.log(usuarioCorrecto);

                mail.enviaRecuperacion(req.body.email_recuperacion, cifrado.desencriptar(usuarioCorrecto[0].pas_usu));
                res.redirect('/#inicio');
            });
        });

    }
});

router.post('/insertarTema', (req, res) => {
    if (!req.body.tema) {
        res.redirect('/#!');
    } else {
        req.getConnection((err, conn) => {
            let tema = {
                "nom_tem": req.body.tema,
                "id_uni": req.body.unidad_aprendizaje
            }
            conn.query('insert into ctemas set ?', tema, (err, temaInsertado) => {
                res.redirect('/#!');
            });
        });
    }
});
router.post('/insertarGrupo', (req, res) => {
    if (!req.body.grupo) {
        res.redirect('/#!');
    } else {
        req.getConnection((err, conn) => {
            let grupo = {
                "nom_gru": req.body.grupo
            }
            conn.query('insert into cgrupo set ?', grupo, (err, grupoInsertado) => {
                res.redirect('/#!');
            });
        });
    }
});

router.post('/modificarTema', (req, res) => {
    if (!req.body.tema_modificar || !req.body.n_tema_modificar) {
        res.redirect('/#!');
    } else {
        req.getConnection((err, conn) => {
            conn.query(`update ctemas set nom_tem = '${req.body.tema_modificar}' where id_tem = ${req.body.n_tema_modificar}`, (err, temaModificado) => {
                res.redirect('/#!');
            });
        });
    }
});

router.post('/eliminarTema', (req, res) => {
    if (!req.body.tema_eliminar) {
        res.redirect('/#!');
    } else {
        req.getConnection((err, conn) => {
            conn.query('delete from ctemas where id_tem = ?', (req.body.tema_eliminar), (err, temaEliminado) => {
                res.redirect('/#!');
            });
        });
    }
});

router.post('/modificarGrupo', (req, res) => {
    if (!req.body.grupo_modificar || !req.body.n_grupo_modificar) {
        res.redirect('/#!');
    } else {
        req.getConnection((err, conn) => {
            conn.query(`update cgrupo set nom_gru = '${req.body.grupo_modificar}' where id_tem = ${req.body.n_grupo_modificar}`, (err, grupoModificado) => {
                res.redirect('/#!');
            });
        });
    }
});

router.post('/eliminarGrupo', (req, res) => {
    if (!req.body.grupo_eliminar) {
        res.redirect('/#!');
    } else {
        req.getConnection((err, conn) => {
            conn.query('delete from cgrupo where id_gru = ?', (req.body.grupo_eliminar), (err, grupoEliminado) => {
                res.redirect('/#!');
            });
        });
    }
});

// Iniciar sesion de un usuario sin sesion
router.post('/iniciar', (req, res) => {
    //aqui comprueba para inicar sesion
    if (!req.body.email_inicio || !req.body.contraseña_inicio) {
        res.redirect('/#inicia');
    } else {
        let email = req.body.email_inicio;
        let password = req.body.contraseña_inicio;

        req.getConnection((err, conn) => {
            conn.query(`select * from musuario where cor_usu = '${email}' and pas_usu = '${cifrado.cifrar(password)}'`, (err, usuarioCorrecto) => {
                if (usuarioCorrecto.length > 0) {
                    let usuario = {
                        "id_usu": usuarioCorrecto[0].id_usu,
                        "nom_usu": usuarioCorrecto[0].nom_usu,
                        "curp_usu": usuarioCorrecto[0].curp_usu,
                        "cor_usu": usuarioCorrecto[0].cor_usu,
                        "pas_usu": usuarioCorrecto[0].pas_usu,
                        "id_tus": usuarioCorrecto[0].id_tus
                    }
                    req.session.usuario = usuario;
                    res.redirect('/');
                } else {

                    req.app.locals.layout = 'main';
                    res.redirect('/#inicia');
                }
            });
        });
    }
});



/* Docente */
router.post('/ModGrupo/:id', (req, res) => {
    req.getConnection((err, conn) => {
        let id = req.params.id;
        let id_gru;
        let id_sem;
        let id_tur;
        let des_gru;
        let edit = [];
        conn.query('select * from grupo where id_gru=?', [id], (err, rows) => {
            rows.forEach(element => {
                id_gru = element.id_gru;
                id_sem = element.id_sem;
                id_tur = element.id_tur;
                des_gru = element.des_gru;
                edit.push({
                    "id_gru": id_gru,
                    "id_sem": id_sem,
                    "id_tur": id_tur,
                    "des_gru": des_gru
                });
            });
            console.log(edit);
            req.app.locals.layout = 'Profesor';
            res.render('profesor/modifica-prof', { edit: edit });

        });
    });
});
router.post('/ModGrupox/:id', (req, res) => {
    let id = req.params.id;
    console.log(id);
    let id_gru = req.body.id_gru;
    let id_sem = req.body.id_sem
    let id_tur = req.body.id_tur;
    let des_gru = req.body.des_gru;
    let Modify = {
        "id_gru": id_gru,
        "id_sem": id_sem,
        "id_tur": id_tur,
        "des_gru": des_gru
    };

    req.getConnection((err, conn) => {
        conn.query('update grupo set ? where id_gru=?', [Modify, id], (err, rows) => {
            if (err) console.log('este es el error: ', err);

        });
        res.redirect('/docente');
    });
});












router.get('/docente', (req, res) => {
    if (req.session.name == undefined && req.session.cargo != 'docente') {
        res.redirect('/');
    } else {
        req.getConnection((err, conn) => {
            conn.query('select * from agruparusuariogrupo natural join grupo natural join semestre natural join turno natural join token where id_us = ?', [req.session.name], (err2, rows) => {

                req.app.locals.layout = 'Profesor';
                res.render('profesor/agregar-grupo', { rows: rows });

            });

        });

    }
});

router.post('/setMetrica', (req, res) => {
    if (!req.body.metrica) {
        res.redirect('/docente/grupo');
    } else {
        req.getConnection((err, conn) => {
            let data = {
                "con_act": req.body.metrica
            }
            conn.query('insert into actividades set ?', [data], (err, rows) => {
                let da = {
                    "id_act": rows.insertId,
                    "id_gru": req.session.abreGrupo
                }
                conn.query('insert into agruparactividadesgrupo set ?', [da], (err, rows) => {
                    res.redirect('/docente/grupo');
                });

            });
        });
    }

});

router.post('/AbrirGrupo/:id', (req, res) => {
    let id = req.params.id;
    req.session.abreGrupo = id;
    res.redirect('/docente/grupo');
});

router.get('/docente/grupo', (req, res) => {
    if (req.session.name == undefined || req.session.abreGrupo == undefined || req.session.cargo != 'docente') {
        res.redirect('/');
    } else { //que haces we??
        let grupo = req.session.abreGrupo;
        req.getConnection((err, conn) => {
            conn.query('select * from agruparactividadesgrupo natural join grupo natural join actividades where id_gru = ?', [grupo], (err, rows) => {
                conn.query('select * from agruparusuariogrupo natural join usuario where id_gru = ? and id_tus = ? ', [grupo, 1], (err, alumnos) => {
                    alumnos.forEach(alumno => {
                        conn.query('select * from agruparactividadesgrupo where id_gru = ?', [grupo], (err, actividades) => {
                            actividades.forEach(actividad => {
                                conn.query('select * from calificacionparcial natural join agruparactividadesgrupo where id_gru = ? and id_act = ? and id_us = ?', [grupo, actividad.id_act, alumno.id_us], (err, calificaciones) => {
                                    if (calificaciones.length != 1) {
                                        let calificacionparcial = {
                                            "id_aag": actividad.id_aag,
                                            "cal_cpar": 0,
                                            "id_us": alumno.id_us
                                        }
                                        conn.query('insert into calificacionparcial set ?', [calificacionparcial], (err, correcto) => {

                                        });
                                    }
                                });
                            });
                        });
                    });
                    conn.query('select * from calificacionparcial natural join agruparactividadesgrupo natural join actividades natural join grupo where id_gru = ?', [grupo], (err, rows2) => {
                        conn.query('select * from agruparactividadesgrupo natural join actividades where id_gru = ?', [grupo], (err, rows3) => {
                            req.app.locals.layout = 'Profesor';
                            res.render('profesor/grupo', { actividades: rows3, calificaciones: rows3, grupo: grupo });
                        });
                    });
                });
            });
        });

    }
});
////////////////////////////////7
router.post('/AbrirGrupoA/:id_gru', (req, res) => {
    let id = req.params.id_gru;
    req.session.abreGrupoA = id;
    res.redirect('/alumno/grupo');
});
router.get('/alumno/grupo/', (req, res) => {
    let grupo = req.session.abreGrupoA
    req.getConnection((err, conn) => {
        conn.query('select * from agruparactividadesgrupo natural join grupo natural join actividades where id_gru = ?', [grupo], (err, rows) => {
            req.app.locals.layout = 'alumno';
            res.render('alumno/grupo-al', { rows: rows, grupo: grupo });
        });
    });
});



router.post('/docente/borrarActividad', (req, res) => {
    let grupo = req.session.abreGrupo;
    req.getConnection((err, conn) => {
        conn.query('delete from calificacionparcial where id_gru = ?', [grupo]), (err, rows) => {
            if (err) console.log(err);
        };
    });

});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/docente/calificacion/:id', (req, res) => {
    if (req.session.name == undefined || req.session.cargo != 'docente' || !req.params.id) {
        res.redirect('/docente/grupo');
    } else {
        let id = req.params.id;
        req.session.calificacionActividad = id;
        res.redirect('/docente/calificacionActividad');
    }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/docente/calificacionActividad', (req, res) => {
    if (req.session.name == undefined || req.session.cargo != 'docente' || req.session.calificacionActividad == undefined) {
        res.redirect('/docente/grupo');
    } else {
        let id = req.session.calificacionActividad;
        req.getConnection((err, conn) => {
            conn.query('select * from calificacionparcial natural join agruparactividadesgrupo natural join usuario where id_gru = ? and id_tus=? and id_aag = ?', [req.session.abreGrupo, 1, id], (err, rows) => {
                req.app.layout = 'Profesor';
                res.render('profesor/calificaciones', { rows: rows });
            });
        });
    }
});

router.post('/modCalificacion/:id', (req, res) => {
    if (req.session.name == undefined || req.session.cargo != 'docente' || !req.params.id) {
        res.redirect('/docente/grupo');
    } else {
        req.session.id_modificar = req.params.id;
        res.redirect('/docente/calificacionActividad/modificar');
    }
});

router.post('/modificaCalificacionbien', (req, res) => {
    if (!req.body.calificacion) {
        res.redirect('/docente/calificacionActividad/modificar');
    } else {
        let calificacion = {
            "cal_cpar": req.body.calificacion
        };
        req.getConnection((err, conn) => {
            conn.query('update calificacionparcial set ? where id_cpar = ?', [calificacion, req.session.id_modificar], (err, rows) => {
                res.redirect('/docente/calificacionActividad');
            });
        });
    }
});

router.get('/docente/calificacionActividad/modificar', (req, res) => {
    if (req.session.name == undefined || req.session.cargo != 'docente' || req.session.id_modificar == undefined) {
        res.redirect('/docente/grupo');
    } else {
        req.getConnection((err, conn) => {
            conn.query('select * from calificacionparcial where id_aag = ?', [req.session.id_modificar], (err, rows) => {
                req.app.locals.layout = 'Profesor';
                res.render('profesor/modificarCalificacion', { rows: rows });
            });
        });
    }
});

router.post('/delActividad/:id', (req, res) => {
    if (req.session.name == undefined || req.session.cargo != 'docente') {
        res.redirect('/');
    } else if (!req.params.id) {
        res.redirect('/');
    } else {
        let id = req.params.id;
        req.getConnection((err, conn) => {
            conn.query('select * from calificacionparcial natural join agruparactividadesgrupo where id_act = ?', [id], (err, calificaciones) => {
                calificaciones.forEach(calificacion => {
                    conn.query('delete from calificacionparcial where id_aag = ?', [calificacion.id_aag], (err, rows3) => {
                        if (err) console.log(err);
                    });
                });
                conn.query('delete from agruparactividadesgrupo where id_act = ?', [id], (err, rows) => {
                    conn.query('delete from actividades where id_act = ?', [id], (err, rows) => {
                        res.redirect('/docente/grupo');
                    });
                });
            });


        });
    }
});
router.get('/lalala', (req, res) => {
    req.app.locals.layout = 'Administrador';
    res.render('admin/admin-css');
});
router.post('/modActividad/:id', (req, res) => {
    if (req.session.name == undefined || req.session.cargo != 'docente') {
        res.redirect('/');
    } else if (!req.params.id) {
        res.redirect('/');
    } else {
        let id = req.params.id;
        req.session.id_modificar = id;
        res.redirect('/docente/modificarActividad');
    }
});

router.get('/docente/modificarActividad', (req, res) => {
    if (req.session.name == undefined || req.session.cargo != 'docente' || req.session.id_modificar == undefined) {
        req.redirect('/docente/grupo');
    } else {
        req.getConnection((err, conn) => {
            conn.query('select * from actividades where id_act = ?', [req.session.id_modificar], (err, rows) => {
                req.app.locals.layout = 'Profesor'
                res.render('profesor/modificaAct', { rows: rows });
            });
        });
    }
});

router.post('/modifiAct', (req, res) => {
    if (!req.body.actividad || req.session.id_modificar == undefined) {
        res.redirect('/docente/grupo');
    } else {
        req.getConnection((err, conn) => {
            let data = {
                "con_act": req.body.actividad
            }
            conn.query('update actividades set ? where id_act = ?', [data, req.session.id_modificar], (err, rows) => {
                res.redirect('/docente/grupo');
            });
        });
    }
});

/* Fin de docente */


/*--------------------------------------ADMIN----------------------------------------------------*/

//pagina Inicio de Administrador
router.get('/Admin', (req, res) => {
    if (req.session.name == undefined || req.session.cargo != 'administrador') {
        res.redirect('/');
    } else {
        req.app.locals.layout = 'Administrador';
        res.render('admin/AdHome');
    }
});

router.get('/cuestionarioTesting', (req, res) => {
    req.app.locals.layout = 'Administrador';
    res.render('admin/CreateCuestionario');
});
//pagina para modificar practicas
router.get('/graficas', (req, res) => {
    if (req.session.name == undefined || req.session.cargo != 'administrador') {
        res.redirect('/');
    } else {
        req.app.locals.layout = 'Administrador';
        res.render('admin/graficas');
    }
});
router.get('/AdminPracticas', (req, res) => {
    if (req.session.name == undefined || req.session.cargo != 'administrador') {
        res.redirect('/');
    } else {
        console.log(req.session.cargo);
        req.getConnection((err, conn) => {
            conn.query('select * from practica', (err2, rows) => {
                req.app.locals.layout = 'Administrador';
                res.render('admin/VisualizarPAdmin', { rows: rows });
            });
        });
    }


});


router.get('/practicas', (req, res) => {

    req.app.locals.layout = 'Administrador';
    res.render('admin/upracticas');

});

//ANTERIOR subirPracticas
router.post('/insertarApoyo', upload.single('archivo_apoyo'), (req, res) => {
    let fileroute, vinculo;

    if (req.file != undefined) {
        fileroute = req.file.filename;
    } else {
        fileroute = null;
    }
    if (req.body.hipervinculo_apoyo != undefined) {
        vinculo = req.body.hipervinculo_apoyo;
    } else {
        vinculo = null;
    }
    if (!req.body.nombre_apoyo || !req.body.apoyo_tema) {
        res.redirect('/');
    } else {
        req.getConnection((err, conn) => {
            let apoyo = {
                "nom_apo": req.body.nombre_apoyo,
                "pdf_apo": fileroute,
                "vin_apo": vinculo,
                "id_tem": req.body.apoyo_tema
            }

            conn.query('insert into mapoyos set ?', apoyo, (err, apoyoInsertado) => {
                res.redirect('/');
            });

        });
    }



});

router.post('/editarPractica/:id_pra', (req, res) => {
    let id_pra = req.params.id_pra;
    //res.redirect('/modifyPracticas',{ id_pra: id_pra } ); 
    req.app.locals.layout = 'Administrador';
    res.render('admin/ModificarPractica', { id_pra: id_pra });
});
/*
router.post('/modifyPracticas/:id_pra', upload, (req, res) => {
    //res.send(req.params.id_pra)
    if (req.file != undefined) {
        const fileroute = req.file.filename;
        let id_pra = req.params.id_pra;
        console.log(fileroute);
        const description = req.body.description;
        console.log(+ "Es la descripción", description);
        let mensaje = validacion.Practicas(fileroute, description);
        if (!mensaje.estado) {
            res.redirect('/practicas');
            if (mensaje.archivo) {
                console.log("Error en el archivo")
            }
            if (mensaje.descriptcion) {
                console.log("MALs");
            }
        } else {

            req.getConnection((err, conn) => {
                let sad = {
                    "arc_pra": fileroute,
                    "des_pra": description
                }
                conn.query('update practica set ? where id_pra= ?', [sad, id_pra], (err, rows) => {
                    if (err) console.log(err);
                    res.redirect('/AdminPracticas');
                });
            });

        }
        console.log('ruta', fileroute);

    } else {
        console.log("No hay archivo")
        res.redirect('/practicas');
    }
});
*/
//Eliminar prácticas

router.post('/eliminarPractica/:id_pra', (req, res) => {
    let id_pra = req.params.id_pra;
    console.log(id_pra)
    req.getConnection((err, conn) => {
        conn.query('delete from agruparpractica where id_pra = ? ', [id_pra], (err2, rows) => {
            conn.query('delete from practica where id_pra = ? ', [id_pra], (err3, rows2) => {
                res.redirect('/AdminPracticas')
            });
        });

    });

});

//mostrar Practicas por semestre 

router.get('/practicasSemestre', (req, res) => {
    req.app.locals.layout = 'Administrador';
    res.render('admin/escogerp');

});

router.post('/escogerPractica', (req, res) => {
    const semestre = req.body.semestre;
    console.log(semestre)
    req.getConnection((err, conn) => {
        conn.query('select * from agruparpractica natural join practica where id_sem=?', [semestre], (err2, rows) => {
            if (err) console.log(err)
            req.app.locals.layout = 'Administrador';
            res.render('admin/PracticaxSemestre', { rows: rows });
            console.log(rows);
        });
    })
});


/*---------------------------------___Ruta de consulta de usuarios en la plataforma___--------------------------------------------*/
router.get('/ConsultaAdmin', (req, res) => {
    if (req.session.name == undefined || req.session.cargo != 'administrador') {
        res.redirect('/');
    } else {
        req.getConnection((err, conn) => {
            let id_us;
            let nom_us;
            let appat_us;
            let apmat_us;
            let cor_us;
            let usnam_us;
            let pas_us;
            let mod2 = [];
            let mod = [];
            conn.query('select * from usuario where id_tus=?', [1], (err, rows) => {
                rows.forEach(element => {
                    id_us = element.id_us;
                    nom_us = element.nom_us;
                    appat_us = element.appat_us;
                    apmat_us = element.apmat_us;
                    cor_us = cifrado.desencriptar(element.cor_us);
                    usnam_us = cifrado.desencriptar(element.usnam_us);
                    pas_us = cifrado.desencriptar(element.pas_us);
                    mod.push({
                        "id_us": id_us,
                        "nom_us": nom_us,
                        "appat_us": appat_us,
                        "apmat_us": apmat_us,
                        "cor_us": cor_us,
                        "usnam_us": usnam_us,
                        "pas_us": pas_us
                    });

                });

                conn.query('select * from usuario where id_tus = ?', [2], (err, rows2) => {
                    rows2.forEach(element => {
                        id_us = element.id_us;
                        nom_us = element.nom_us;
                        appat_us = element.appat_us;
                        apmat_us = element.apmat_us;
                        cor_us = cifrado.desencriptar(element.cor_us);
                        usnam_us = cifrado.desencriptar(element.usnam_us);
                        pas_us = cifrado.desencriptar(element.pas_us);
                        mod2.push({
                            "id_us": id_us,
                            "nom_us": nom_us,
                            "appat_us": appat_us,
                            "apmat_us": apmat_us,
                            "cor_us": cor_us,
                            "usnam_us": usnam_us,
                            "pas_us": pas_us
                        });
                    });

                    req.app.locals.layout = 'Administrador';
                    res.render('admin/Consult-admin', { mod: mod, mod2: mod2 });
                });


            });
        });
    }

});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////roy we entinedes el error :c 
//Ruta para eliminar un Usuario;
router.post('/BorrarAdmin/:id_us', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) console.log("hola ", err);
        let id_us = req.params.id_us;
        console.log(id_us);
        conn.query('delete from agruparusuariogrupo where id_us = ?', [id_us], (err, rows) => {
            conn.query('delete from calificacionparcial where id_us = ?', [id_us], (err, rows) => {
                conn.query('delete from agruparactividadesgrupo where id_us = ?', [id_us], (err, rows) => {
                    conn.query('delete from usuario where id_us = ?', [id_us], (err, rows) => {
                        res.redirect('/ConsultaAdmin');
                    });
                });

            });

        });

    });
});
//Pagina para Modificar algun Usuario
router.post('/Modify/:id_us', (req, res) => {
    req.getConnection((err, conn) => {
        let id_us = req.params.id_us;
        let id;
        let nom_us;
        let appat_us;
        let apmat_us;
        let cor_us;
        let usnam_us;
        let pas_us;
        let edit = [];
        conn.query('select * from usuario where id_us=?', [id_us], (err, rows) => {
            rows.forEach(element => {
                id = element.id_us;
                nom_us = element.nom_us;
                appat_us = element.appat_us;
                apmat_us = element.apmat_us;
                cor_us = cifrado.desencriptar(element.cor_us);
                usnam_us = cifrado.desencriptar(element.usnam_us);
                pas_us = cifrado.desencriptar(element.pas_us);
                edit.push({
                    "id": id,
                    "nom_us": nom_us,
                    "appat_us": appat_us,
                    "apmat_us": apmat_us,
                    "cor_us": cor_us,
                    "usnam_us": usnam_us,
                    "pas_us": pas_us
                });
            });

            console.log(edit);
            req.app.locals.layout = 'Administrador';
            res.render('admin/ModificarAlumno', { edit: edit });

        });
    });
});
//Ruta para Modificar admin 
router.post('/Mody/:id', (req, res) => {
    let id = req.params.id;
    console.log(id);
    let nom_us = req.body.nom;
    let appat_us = req.body.appat
    let apmat_us = req.body.apmat;
    let cor_us = req.body.cor;
    let usnam_us = req.body.usnam;
    let pas_us = req.body.pas;
    let Modify = {
        "nom_us": nom_us,
        "appat_us": appat_us,
        "apmat_us": apmat_us,
        "usnam_us": cifrado.cifrar(usnam_us),
        "cor_us": cifrado.cifrar(cor_us),
        "pas_us": cifrado.cifrar(pas_us)

    };
    console.log(Modify);
    req.getConnection((err, conn) => {
        conn.query('update usuario set ? where id_us=?', [Modify, id]);
    });
    res.redirect('/ConsultaAdmin');
});
//Ruta para Agregar grupos


router.get('/AddGrupo', (req, res) => {

    req.getConnection((err, conn) => {
        conn.query('select * from grupo natural join semestre natural join turno natural join token', (err2, rows) => {
            conn.query('select * from usuario where id_tus = ?', [2], (err2, docentes) => {
                if (req.session.cargo == "docente") {
                    res.redirect('/');
                } else {
                    req.app.locals.layout = "Administrador"
                    res.render('admin/Grupos-Usu', { rows: rows, docentes: docentes });
                }

            });
        });
    });
});

/////////////////////////////////////////////////
// crear administrador

router.post('/creaAdministrador', (req, res) => {
    if (!req.body.us_admin || !req.body.pas_admin) {
        res.redirect('/');
    } else {
        let us = req.body.us_admin;
        let pas = req.body.pas_admin;
        let data = {
            "us_admin": cifrado.cifrar(us),
            "pas_admin": cifrado.cifrar(pas)
        }
        req.getConnection((err, conn) => {
            conn.query('insert into administrador set ?', [data], (err2, rows) => {
                res.redirect('/');
            });
        });
    }
});

router.get('/ConsultaAdministradores', (req, res) => {
    if (req.session.name == undefined || req.session.cargo != 'administrador') {
        res.redirect('/');
    } else {
        let a = [];
        req.getConnection((err, conn) => {
            conn.query('select * from administrador', (err2, rows) => {
                rows.forEach(element => {
                    let datos = {
                        "id_admin": element.id_admin,
                        "us_admin": cifrado.desencriptar(element.us_admin),
                        "pas_admin": cifrado.desencriptar(element.pas_admin)
                    }
                    a.push(datos);
                });
                req.app.locals.layout = 'Administrador';
                res.render('admin/consultaAdministradores', { rows: a });
            });
        });
    }
});

router.post('/borrarAdministrador/:id_admin', (req, res) => {
    let id = req.params.id_admin;
    req.getConnection((err, conn) => {
        conn.query('select * from administrador', (err2, rows) => {
            if (rows.length < 2) {
                res.redirect('/');
            } else {
                conn.query('delete from administrador where id_admin = ?', [id], (err2, rows2) => {
                    res.redirect('/ConsultaAdministradores');
                });
            }
        });

    });
});

router.post('/modAdministrador/:id_admin', (req, res) => {
    req.session.id_modificar = req.params.id_admin;
    res.redirect('/modificaA');
});

router.get('/modificaA', (req, res) => {
    if (req.session.name == undefined || req.session.cargo != 'administrador') {
        res.redirect('/');
    } else {
        req.getConnection((err, conn) => {
            conn.query('select * from administrador where id_admin = ?', [req.session.id_modificar], (err2, rows) => {
                let data = {
                    "id_admin": rows[0].id_admin,
                    "us_admin": cifrado.desencriptar(rows[0].us_admin),
                    "pas_admin": cifrado.desencriptar(rows[0].pas_admin)
                }
                req.app.locals.layout = 'Administrador';
                res.render('admin/modificaAdmin', { rows: data });
            });
        });
    }

});

router.post('/modifiAd', (req, res) => {
    if (!req.body.us_admin || !req.body.pas_admin) {
        res.redirect('/');
    } else {


        let data = {
            "us_admin": cifrado.cifrar(req.body.us_admin),
            "pas_admin": cifrado.cifrar(req.body.pas_admin)
        }
        req.getConnection((err, conn) => {
            conn.query('update administrador set ? where id_admin = ?', [data, req.session.id_modificar], (err2, rows) => {
                res.redirect('/ConsultaAdministradores');
            });
        });
    }
});
router.post('/AddGrupobb', (req, res) => {

    if (!req.body.id_gru || !req.body.id_sem || !req.body.id_tur || !req.body.des_gru) {
        res.redirect('/');
    } else {

        let id_gru = req.body.id_gru;
        let id_sem = req.body.id_sem;
        let id_tur = req.body.id_tur;
        let des_gru = req.body.des_gru;
        let abc = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        let l1 = abc[Math.floor(Math.random() * (50))];
        let l2 = abc[Math.floor(Math.random() * (50))];
        let l3 = abc[Math.floor(Math.random() * (50))];
        console.log('letra 1: ' + l1 + ' letra 2: ' + l2 + ' letra 3: ' + l3);
        let prim = calcular_primo(Math.floor(Math.random() * (10000 - 1000) + 1000));
        console.log('El primo es: ' + prim);
        let hexaprim = prim.toString(16);
        console.log("El número decimal %s en hexadecimal es %s", prim, hexaprim);
        let t = [l1, l2, l3];
        hexaprim.split('').forEach(hexaprim =>
            t.push(hexaprim)
        );
        console.log(t);
        for (var i = t.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = t[i];
            t[i] = t[j];
            t[j] = temp;
        }
        console.log(t);
        let st = t.toString();
        console.log(st);
        st = st.replace(/,/g, "");
        console.log(st);

        let grupo = {
            "id_gru": id_gru,
            "id_sem": id_sem,
            "id_tur": id_tur,
            "des_gru": des_gru
        };
        let token = {
            "id_gru": id_gru,
            "con_tok": st,
            "bol_tok": 1
        }
        console.log(grupo);
        req.getConnection((err, conn) => {
            conn.query('select * from agruparusuariogrupo where id_gru=?', [id_gru], (err, rows23) => {
                if (rows23.length > 0) {
                    res.redirect('/docente');
                } else {
                    conn.query('insert into grupo set ?', [grupo], (err, rows) => {
                        if (err) console.log("El error en insertar grupo es: ", err);
                        let id_us;
                        if (req.session.cargo == 'docente') {
                            id_us = req.session.name;
                            let dat = {
                                "id_gru": id_gru,
                                "id_us": id_us
                            }
                            conn.query('insert into agruparusuariogrupo set ?', [dat], (err2, rows) => {});
                        } else {
                            id_us = req.body.id_prof;
                            let dat = {
                                "id_gru": id_gru,
                                "id_us": id_us
                            }
                        }
                    });
                    conn.query('insert into token set ?', [token], (err, rows) => {
                        if (err) console.log("El error en insertar token es: ", err);

                        //como admin?. u: mychemis p: #erty!Mo;rph    creo
                    });
                    if (req.session.cargo == "docente") {
                        res.redirect('/docente');
                    } else {
                        res.redirect('/AddGrupo');
                    }
                }
            });
        });
    }


});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////77

//////////////////////////////////////////////////////////77777777777//////////////////////////////////////////////////////////////////////////////////////////////77
router.post('/deleteGA/:id_us', (req, res) => {
    let id_us = req.params.id_us;
    req.getConnection((err, conn) => {
        conn.query('delete from agruparusuariogrupo where id_us = ?', [id_us], (err, rows) => {
            res.redirect('/');
        });
    });
});
////////////////////////////////////////////////////////////7
router.post('/desactivar/:id_gru', (req, res) => {
    let id_gru = req.params.id_gru
    let id;
    let con_tok
    let bol_tok;
    let update = {};
    req.getConnection((err, conn) => {
        conn.query('select * from token where id_gru=?', [id_gru], (err, rows) => {
            rows.forEach(element => {
                id = element.id_gru;
                con_tok = element.con_tok;
                bol_tok = element.bol_tok;
                if (bol_tok == 1) {
                    update = {
                        "id_gru": id,
                        "con_tok": con_tok,
                        "bol_tok": 0
                    }
                    if (req.session.cargo == "docente") {
                        res.redirect('/docente');
                    } else { //nose
                        res.redirect('/AddGrupo');
                    }
                } else {
                    update = {
                        "id_gru": id,
                        "con_tok": con_tok,
                        "bol_tok": 1
                    }
                    if (req.session.cargo == "docente") {
                        res.redirect('/docente');
                    } else {
                        res.redirect('/AddGrupo');
                    }


                }
            });
            conn.query('update token set ? where id_gru=?', [update, id_gru], (req, res) => {

            });
        });
    });

});

//Token/////////////////////////////////////////////////////////////////////////////////////////////////
/*router.get('/Token', (req, res) => {
    if (req.session.name == undefined){
        res.redirect('/home');
    }
    req.getConnection((err,conn)=>{
        conn.query('select * from token',(err,rows)=>{
            req.app.locals.layout = "Profesor"
            res.render('profesor/token',{rows:rows});
        });
    });

    
});*/
//Ruta que genera el token y lo inserta a la base 
/* router.post('/GToken',(req,res)=>{
    let id_gru = req.body.id_gleteGAru;
    let abc = [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z];
    let l1 = abc[Math.random() * (25)];
    let l2 = abc[Math.random() * (25)];
    let l3 = abc[Math.random() * (25)];
    console.log('letra 1: '+l1+' letra 2: '+l2+' letra 3: '+l3);
    let prim = calcular_primo(Math.random() * (999-100)+100);
    console.log('El primo es: '+prim);
    let hexaprim = prim.toString(16); 
    console.log("El número decimal %s en hexadecimal es %s", prim, hexaprim);
    let token=prim+hexaprim;
    console.log(token);
    let tokeng = {
        "id_gru": id_agru,//aqui esta mal, la variable que declaraste es id_gru
        "token":token,
        
    };
    req.getConnection((err,conn)=>{
        //3.-Thats Life -Frank Sinatra.
        conn.query('insert into token set ?',[],(err,rows)=>{
            if(err); console.log('el error es',err);
            res.redirect('/Token');
        });
    });
}); */
////////////7Verificar Token
router.post('/alumno', (req, res) => {
    let token = req.body.token;
    rows.forEach(element => {
        bol = element.bol_tok;
        id_gru = element.id_gru;
        con_tok = element.con_tok;
        agr = {
            "id_gru": id_gru,
            "id_us": id_us
        }
    });
    let id_us = req.session.name;
    console.log(id_us);
    let con_tok;
    let agr = {};
    if (req.session.name == undefined) {
        res.redirect('/');
    } else {
        req.getConnection((err, conn) => {
            if (err) console.log("Error en Verificar token");
            conn.query('select * from token where con_tok=?', [token], (err, rows) => {
                rows.forEach(element => {
                    bol = element.bol_tok;
                    id_gru = element.id_gru;
                    con_tok = element.con_tok;
                    agr = {
                        "id_gru": id_gru,
                        "id_us": id_us
                    }
                });

                if (con_tok = token && bol == 1) {
                    console.log('concuerda');
                    conn.query('insert into agruparusuariogrupo set ?', [agr], (err, rows2) => {
                        res.redirect('/');
                    });
                } else {
                    req.getConnection((err, conn) => {
                        conn.query('select * from agruparusuariogrupo natural join grupo natural join usuario natural join semestre natural join turno where id_us = ? ', [req.session.name], (err2, rows) => {
                            req.app.locals.layout = 'alumno';
                            //console.log(rows, "rows")
                            const aviso = {
                                "aviso": "El código de grupo no existe"
                            }
                            req.app.locals.layout = 'alumno';
                            res.render('alumno/inicio', { rows: rows, aviso: aviso });
                        });
                    });
                    //console.log('no concuerda');
                    //res.redirect('/home');
                }
            });
        });
    }

});


/*---------------------------------------PROFESOR------------------------------------------------*/
router.get('/Chatp', (req, res) => {
    /*if (req.session.name == undefined) {
        res.redirect('/home');
    }*/
    req.app.locals.layout = 'Profesor';
    res.render('profesor/chat');
});

router.get('/Calificaciones', (req, res) => {
    if (req.session.name == undefined) {
        res.redirect('/');
    } else {
        /*req.getConnection((err,conn)=>{
                conn.query('select * from calificaciones natural join __', (err2,rows)=>{
                    req.app.locals.layout='Profesor'; 
                    res.render('profesor/calificaciones', {rows:rows}); 
                }); 
            }); */
        req.app.locals.layout = 'Profesor';

        res.render('profesor/calificaciones');
    }

});

/*-----------------------------------------------------------------------------------------------*/

/*--------------------------------------TODOS----------------------------------------------------*/
/*----Consulta de practicas----*/
router.get('/viewPractice', (req, res) => {
    if (req.session.name == undefined) {
        res.redirect('/');
    } else {
        req.getConnection((err, conn) => {
            conn.query('select * from agruparpractica natural join practica natural join semestre', (err2, rows) => {
                if (err2) console.log(err2)
                console.log(rows);
                if (req.session.cargo == 'alumno') {
                    req.app.locals.layout = 'alumno';
                }
                if (req.session.cargo == 'administrador') {
                    req.app.locals.layout = 'Administrador';
                }
                if (req.session.cargo == 'docente') {
                    req.app.locals.layout = 'Profesor';
                }

                res.render('all/VisualizarPracticas', { rows: rows });
            });
        });
    }

});









/*-----------------------------------------Administrador---------------------------------------------------*/
router.get('/Admin2.0', (req, res) => {
    req.getConnection((err, conn) => {
        conn.query('select * from MUsuario natural join CTipoUsuario where nom_usu=?', "Flores Rodriguez Alan", (err2, rows) => {
            rows.forEach(element => {
                console.log(cifrado.desencriptar(element.pas_usu));

            });
            if (err2) console.log(err2);
            req.app.locals.layout = 'Administrador';
            res.render('admin/HomeAd2', { rows: rows });
        })
    })
});
router.post('/eliminarUs2.0', (req, res) => {
    console.log(req.body.tema_eliminar)
    req.getConnection((err, conn) => {
        conn.query('delete from MUsuario where id_usu = ?', (req.body.tema_eliminar), (err, temaEliminado) => {
            req.app.locals.layout = 'Administrador';
            res.redirect('/');
        });
    });
});
router.get('/ModifyUsAd2.0', (req, res) => {
    req.app.locals.layout = 'Administrador';
    res.render('admin/ModificarAd2');
});
//para no borrar lo que teniamos 
//Tengo una copia, si quieres, por el momento dejemoslo asi
//entonces borro lo del anterior admin o al menos lo quitare de estas rutas hare otro archivo en mi compi
/*-----------------------------------------ALUMNO---------------------------------------------------*/

router.get('/Cuestionario', (req, res) => {
    if (req.session.name == undefined) {
        res.redirect('/');
    }

});

router.get('/estequiometria', (req, res) => {
    req.app.locals.layout = 'alumno';
    res.render('alumno/estequiometria');
});

/*------------------------------------FIN DE ALUMNO---------------------------------------------------*/
/*------------------------------------CREAR CUESTIONARIO----------------------------------------------*/
router.get('/Quizz', (req, res) => {
    //if (req.session.usuario == undefined || req.session.usuario.id_tus!=3) {
    //    res.redirect('/');
    //} else {
    req.app.locals.layout = 'profesor';
    res.render('profesor/crearcuestionario');
    //}

});
router.get('/CreateQuizz', (req, res) => {
    req.app.locals.layout = 'profesor';
    req.getConnection((err, conn) => {
        conn.query("select * from mbancopreguntas natural join ctemas natural join cdificultad", (err2, preguntas) => {
            if (err2) console.log("ERROR 2: " + err2)
            console.log(preguntas)
            res.render('profesor/Create', { preguntas: preguntas });
        });
    });

});
router.post('/Addquestions/:questions', (req, res) => {
    req.app.locals.layout = 'profesor';
    // req.getConnection((err, conn) => {
    let questions = req.params.questions.split('|');

    for (let i = 0; i < questions.length; i++) {
        questions[i] = JSON.parse(questions[i]);

    }
    console.log(questions)
    req.getConnection((err, conn) => {
        for (let i = 0; i < questions.length; i++) {

            conn.query('insert into mbancopreguntas(con_pre,res_cor,id_tem,id_dif) values (?,?,?,?)', [questions[i].p, questions[i].a, 1, 1], (err2, temaEliminado) => {
                req.app.locals.layout = 'Administrador';
                if (i == questions.length - 1) { res.redirect('/CreateQuizz'); }
                if (err2) console.log("ERROR 2 ", err2)
            });
        }
        if (err) console.log("ERROR 1 ", err)
    });
});

router.get('/questions', (req, res) => {
    req.app.locals.layout = 'profesor';
    req.getConnection((err, conn) => {
        conn.query("select * from ctemas", (err2, temas) => {
            conn.query("select * from cdificultad", (err3, dif) => {
                res.render('profesor/questions', { temas: temas, dif: dif });
            })
        });
    });

});
router.post('/Addquestion', (req, res) => {
    req.app.locals.layout = 'profesor';
    console.log(req.body)
    req.getConnection((err, conn) => {
        let valores = {
            "con_pre": req.body.pregunta,
            "res_cor": req.body.a,
            "opc_a": req.body.a,
            "opc_b": req.body.b,
            "opc_c": req.body.c,
            "opc_d": req.body.d,
            "id_tem": parseInt(req.body.tema),
            "id_dif": parseInt(req.body.dificultad)
        }
        conn.query('insert into mbancopreguntas set ?', valores, (err2, temaEliminado) => {
            if (err2) console.log("ERROR 2 ", err2)
            res.redirect('/CreateQuizz');
        }); //Error: Lock wait timeout exceeded; try restarting transaction es algo del maisicuel XD
        if (err) console.log("ERROR 1 ", err)
    });
});

router.post('/AddQuizz', (req, res) => {
    req.app.locals.layout = 'profesor';
    console.log(req.body, "VAYA");
    req.getConnection((err, conn) => {
        let elements = {
            "nom_cue": req.body.nombre,
            "id_bpr": req.body.element.toString(),
            "id_gru": req.body.group.toString()
        }
        conn.query('insert into ecuestionario set ?', elements, (err2, elementos) => {
            if (err2) console.log("ERROR 2 ", err2)
            res.redirect('/cuestionarios');
        });
        if (err) console.log("ERROR 1 ", err)
    });
});
/*-------------------------------------FIN DE CUESTIONARIO--------------------------------------------*/

module.exports = router;