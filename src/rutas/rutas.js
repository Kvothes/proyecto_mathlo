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

// Pagina principal 
router.get('/web', (req, res) => {
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
                conn.query('select * from MUsuario natural join CTipoUsuario where cor_usu != ? order by nom_usu asc', req.session.usuario.cor_usu, (err2, usuario) => {
                    conn.query('select * from cgrupo  natural join musuario natural join eusuariosgrupo order by nom_gru asc', (err, grupos) => {
                        //console.log(req.session.usuario.id_usu);
                        //console.log('grupos:', grupos);
                        retornaGrupos(grupos, conn, (ListaFinalGrupo) => {
                            if (err2) console.log(err2);
                            retornaUsuarios(usuario, conn, (ListaFinal) => {
                                req.app.locals.layout = 'Administrador2';
                                res.render('admin/prueba_admin', { usuariosRetorno: ListaFinal, grupos: ListaFinalGrupo, usuario: req.session.usuario, rows: usuario });
                            });
                        });

                    });

                })
            })
        }
    }
});

router.get('/web/vergraficas', (req, res) => {
    req.app.locals.layout = 'profesor';
    req.getConnection((err, conn) => {
        conn.query('select * from eusuariosgrupo natural join cgrupo where id_usu = ?', req.session.usuario.id_usu, (err, grupos) => {
            conn.query('select id_cue,nom_cue,id_gru from ecuestionario', (err, cuestionarios) => {
                let array = [],
                    cuestionariosGrupo = [];
                cuestionarios.forEach(cuestionario => {
                    array = cuestionario.id_gru.split(',');
                    array.forEach(id => {
                        grupos.forEach(grupo => {
                            if (id == grupo.id_gru) {
                                cuestionariosGrupo.push(cuestionario);
                            }
                        });
                    });
                });
                res.render('profesor/testGraficas', { grupos, cuestionarios: cuestionariosGrupo });
            });
        });
    });

});

// Cerrar sesion
router.get('/web/logout', (req, res) => {
    req.session.usuario = undefined;
    res.redirect('/web');
});

router.get('/web/apoyos-a-alumnos', (req, res) => {
    req.app.locals.layout = 'profesor';
    req.getConnection((err, conn) => {
        conn.query('select * from ctemas', (err, temas) => {
            conn.query('select * from mapoyos natural join ctemas', (err, apoyos) => {
                res.render('profesor/apoyos', { temas: temas, apoyos: apoyos });
            });
        });
    });

});
/*-------------------------------------------CUESTIONARIOS--------------------------------------*/
router.get('/web/preguntas', (req, res) => {
    req.app.locals.layout = 'profesor';
    req.getConnection((err, conn) => {
        conn.query("select * from ctemas", (err2, temas) => {
            conn.query("select * from cdificultad", (err3, dif) => {
                conn.query('select * from mbancopreguntas', (err, preguntas) => {
                    res.render('profesor/questions', { temas: temas, dif: dif, preguntas });
                });

            })
        });
    });
});

router.get('/web/cuestionarios', (req, res) => {
    if (req.session.usuario == undefined || (req.session.usuario.id_tus != 3 && req.session.usuario.id_tus != 4 && req.session.usuario.id_tus != 5)) {
        res.redirect('/web');
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
/*-----------------------------------------FIN CUESTIONARIOS--------------------------------------*/
/* ------- Peticiones ajax ------------- */

router.post('/web/getApoyosAjax', (req, res) => {
    let tema = req.body.id_tem;

    req.getConnection((err, conn) => {
        if (tema != -1) {
            conn.query('select * from mapoyos natural join ctemas where id_tem = ?', tema, (err, apoyos) => {
                res.json(apoyos);
            });
        } else {
            conn.query('select * from mapoyos natural join ctemas', (err, apoyos) => {
                res.json(apoyos);
            });
        }

    });
});

router.post('/web/deleteApoyoAjax', (req, res) => {
    let id = req.body.id_apoyo;

    req.getConnection((err, conn) => {
        conn.query('delete from mapoyos where id_apo = ?', id, (err, exito) => {
            console.log(err);

            res.json('Apoyo eliminado satisfactoriamente');
        });
    });
});

router.post('/web/updateApoyoLinkAjax', (req, res) => {
    let id = req.body.id_apoyo;
    let link = req.body.link;
    req.getConnection((err, conn) => {
        conn.query('update mapoyos set vin_apo = ? where id_apo = ?', [link, id], (err, apoyoModificado) => {
            res.json('Link del apoyo modificado satisfactoriamente');
        });
    });
});

router.post('/web/getAlumnosGrupo', (req, res) => {
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

router.post('/web/deleteAlumnoGrupo', (req, res) => {
    const { id_ugr } = req.body;
    req.getConnection((err, conn) => {
        conn.query('delete from eusuariosgrupo where id_ugr = ?', id_ugr, (err, alumnoGrupoEliminado) => {
            res.json('Alumno eliminado satisfactoriamente ');
        });
    });
});

router.post('/web/verGruposProfesor', (req, res) => {
    const { id_prof } = req.body;
    req.getConnection((err, conn) => {
        conn.query('select * from eusuariosgrupo natural join musuario natural join cgrupo where id_usu = ? order by nom_gru asc', id_prof, (err, grupos) => {
            retornaGrupos(grupos, conn, (ListaFinal) => {
                res.json(ListaFinal);
            });
        });

    });
});

router.post('/web/modificarClaveGrupo', (req, res) => {
    const id_gru = req.body.id_gru;
    const clave = req.body.clave;
    req.getConnection((err, conn) => {
        conn.query('update cgrupo set cla_gru = ? where id_gru = ?', [clave, id_gru], (err, exito) => {
            res.json("La clave del grupo se ha modificado con éxito");
        });
    });

});
router.post('/web/getUsuariosAjax', (req, res) => {
    const { id_usu } = req.body;
    req.getConnection((err, conn) => {
        conn.query('select * from musuario natural join ctipousuario ', (err, usuConsul) => {
            console.log('el error es: ', err);
            //console.log('f', usuConsul);
            retornaUsuarios(usuConsul, conn, (ListaFinal) => {
                res.json(ListaFinal);

            });

        });
    });
});
router.get('/web/prueba_admin', (req, res) => {
    req.getConnection((err, conn) => {
        conn.query('select * from MUsuario natural join CTipoUsuario where cor_usu != ?', req.session.usuario.cor_usu, (err2, usuario) => {
            if (err2) console.log(err2);
            retornaUsuarios(usuario, conn, (ListaFinal) => {
                req.app.locals.layout = "Administrador2";
                res.render('admin/prueba_admin', { usuariosRetorno: ListaFinal, usuario: req.session.usuario, rows: usuario });
            });

        })
    });
});
router.post('/web/eliminarUsuarioAjax', (req, res) => {
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
router.post('/web/modificarUsuarioAjax', (req, res) => {
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
"use strict";

function retornaUsuarios(usuarios, conn, callback) {
    let usuariosFin = [],
        n = 0;
    usuarios.forEach(user => {
        conn.query('select * from musuario natural join ctipousuario ', (err, userConsult) => {
            userConsult.forEach(consult => {
                n++;
            });
            let data = {
                "id_usu": user.id_usu,
                "nom_usu": user.nom_usu,
                "cor_usu": user.cor_usu,
                "id_tus": user.id_tus,
                "cat_tus": user.cat_tus
            }
            usuariosFin.push(data);
            //console.log(usuariosFin);
            n = 0;
        });
    });
    setTimeout(() => {
        callback(usuariosFin);
    }, 0 | Math.random() * (.3 - .2) + .2 * 1000);
}

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

// Registrar usuario en la bd
router.post('/web/registrar', (req, res) => {
    if (!req.body.nombres_usuario || !req.body.apellidos_usuario || !req.body.email_usuario ||
        !req.body.curp_alumno || !req.body.contraseña_usuario || !req.body.tipo_usuario) {
        res.redirect('/web/#modal1');
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
                    res.redirect('/web/confirmacion_de_usuario');
                } else {
                    res.redirect('/web/#inicio');
                }
            });
        });
    }
});

router.get('/web/confirmacion_de_usuario', (req, res) => {
    if (req.session.usuario_sin_verificar != undefined) {
        res.render('sin-sesion/confirmar');
    } else {
        res.redirect('/web');
    }
});

router.post('/web/confirmacion', (req, res) => {
    if (!req.body.codigo_confirmacion) {
        res.redirect('/web/#!');
    } else {
        if (mail.generaCodigo(req.session.usuario_sin_verificar.cor_usu) == req.body.codigo_confirmacion) {
            req.getConnection((err, conn) => {

                conn.query(`insert into musuario set ?`, req.session.usuario_sin_verificar, (err, usuarioInsertado) => {
                    req.session.usuario_sin_verificar = undefined;
                    res.redirect('/web');
                });
            });
        } else {
            res.redirect('/web');
        }

    }
});

//insertar alumno al grupo
router.post('/web/alumnoIGrupo', (req, res) => {
    let cla_gru = req.body.codigo_grupo;
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
                        res.redirect('/web');
                    });

                } else {
                    console.log('no furula');
                    res.redirect('/web');
                }
            });
        })
    });
});

router.post('/web/recuperarCuenta', (req, res) => {
    if (!req.body.email_recuperacion) {
        res.redirect('/web/#!');
    } else {
        req.getConnection((err, conn) => {
            conn.query('select * from musuario where cor_usu = ?', req.body.email_recuperacion, (err, usuarioCorrecto) => {
                console.log(usuarioCorrecto);

                mail.enviaRecuperacion(req.body.email_recuperacion, cifrado.desencriptar(usuarioCorrecto[0].pas_usu));
                res.redirect('/web/#inicio');
            });
        });

    }
});

router.post('/web/insertarTema', (req, res) => {
    if (!req.body.tema) {
        res.redirect('/web/#!');
    } else {
        req.getConnection((err, conn) => {
            let tema = {
                "nom_tem": req.body.tema,
                "id_uni": req.body.unidad_aprendizaje
            }
            conn.query('insert into ctemas set ?', tema, (err, temaInsertado) => {
                res.redirect('/web/#!');
            });
        });
    }
});

router.post('/web/insertarGrupo', (req, res) => {
    if (!req.body.grupo) {
        res.redirect('/web/#!');
    } else {
        req.getConnection((err, conn) => {
            let grupo = {
                "nom_gru": req.body.grupo
            }
            conn.query('insert into cgrupo set ?', grupo, (err, grupoInsertado) => {
                res.redirect('/web/#!');
            });
        });
    }
});

router.post('/web/modificarTema', (req, res) => {
    if (!req.body.tema_modificar || !req.body.n_tema_modificar) {
        res.redirect('/web/#!');
    } else {
        req.getConnection((err, conn) => {
            conn.query(`update ctemas set nom_tem = '${req.body.tema_modificar}' where id_tem = ${req.body.n_tema_modificar}`, (err, temaModificado) => {
                res.redirect('/web/#!');
            });
        });
    }
});

router.post('/web/eliminarTema', (req, res) => {
    if (!req.body.tema_eliminar) {
        res.redirect('/web/#!');
    } else {
        req.getConnection((err, conn) => {
            conn.query('delete from ctemas where id_tem = ?', (req.body.tema_eliminar), (err, temaEliminado) => {
                res.redirect('/web/#!');
            });
        });
    }
});

router.post('/web/modificarGrupo', (req, res) => {
    if (!req.body.grupo_modificar || !req.body.n_grupo_modificar) {
        res.redirect('/web/#!');
    } else {
        req.getConnection((err, conn) => {
            conn.query(`update cgrupo set nom_gru = '${req.body.grupo_modificar}' where id_tem = ${req.body.n_grupo_modificar}`, (err, grupoModificado) => {
                res.redirect('/web/#!');
            });
        });
    }
});

router.post('/web/eliminarGrupo', (req, res) => {
    if (!req.body.grupo_eliminar) {
        res.redirect('/web/#!');
    } else {
        req.getConnection((err, conn) => {
            conn.query('delete from cgrupo where id_gru = ?', (req.body.grupo_eliminar), (err, grupoEliminado) => {
                res.redirect('/web/#!');
            });
        });
    }
});

// Iniciar sesion de un usuario sin sesion
router.post('/web/iniciar', (req, res) => {
    //aqui comprueba para inicar sesion
    if (!req.body.email_inicio || !req.body.contraseña_inicio) {
        res.redirect('/web/#inicia');
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
                    res.redirect('/web');
                } else {
                    req.app.locals.layout = 'main';
                    res.redirect('/web/#inicia');
                }
            });
        });
    }
});

router.post('/web/insertarApoyo', upload.single('archivo_apoyo'), (req, res) => {
    let fileroute, vinculo, filename;

    if (req.file != undefined) {
        fileroute = req.file.filename;
        filename = req.file.originalname;
    } else {
        fileroute = null;
        filename = null;
    }
    if (req.body.hipervinculo_apoyo != undefined) {
        vinculo = req.body.hipervinculo_apoyo;
    } else {
        vinculo = null;
    }
    if (!req.body.apoyo_tema) {
        res.json('No se pudo insertar el apoyo, verifique los datos');
    } else {
        req.getConnection((err, conn) => {
            let apoyo = {
                "pdf_apo": fileroute,
                "nom_pdf": filename,
                "vin_apo": vinculo,
                "id_tem": req.body.apoyo_tema
            }
            conn.query('insert into mapoyos set ?', apoyo, (err, apoyoInsertado) => {
                res.json('Apoyo insertado satisfactoriamente');
            });
        });
    }
});

router.post('/web/updateApoyo', upload.single('archivo_apoyo_modificar'), (req, res) => {
    let json = {

    };
    if (req.file != undefined) {
        json.pdf_apo = req.file.filename;
        json.nom_pdf = req.file.originalname;
    }
    if (req.body.link != undefined) {
        json.vin_apo = req.body.link;
    }
    if (req.body.update_tema != -1) {
        json.id_tem = req.body.update_tema;
    }
    req.getConnection((err, conn) => {
        conn.query('update mapoyos set ? where id_apo = ?', [json, req.body.id_apoyo_name], (err, apoyoModificado) => {
            conn.query('select * from mapoyos natural join ctemas where id_apo = ?', [req.body.id_apoyo_name], (err, apoyo) => {
                console.log(apoyo);
                res.json({
                    'aviso': "Apoyo modificado satisfactoriamente",
                    'id': apoyo[0].id_apo,
                    'pdf': apoyo[0].nom_pdf,
                    'url': apoyo[0].vin_apo,
                    'tema': apoyo[0].nom_tem
                });
            });

        });
    });
});

router.post('/web/AddGrupobb', (req, res) => {

    if (!req.body.id_gru || !req.body.id_sem || !req.body.id_tur || !req.body.des_gru) {
        res.redirect('/web');
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
                    res.redirect('/web/docente');
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
                        res.redirect('/web/docente');
                    } else {
                        res.redirect('/web/AddGrupo');
                    }
                }
            });
        });
    }


});

//Verificar Token
router.post('/web/alumno', (req, res) => {
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
        res.redirect('/web');
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
                        res.redirect('/web');
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

/*-----------------------------------------Administrador---------------------------------------------------*/
router.get('/web/Admin2.0', (req, res) => {
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
router.post('/web/eliminarUs2.0', (req, res) => {
    console.log(req.body.tema_eliminar)
    req.getConnection((err, conn) => {
        conn.query('delete from MUsuario where id_usu = ?', (req.body.tema_eliminar), (err, temaEliminado) => {
            req.app.locals.layout = 'Administrador';
            res.redirect('/web');
        });
    });
});
router.get('/web/ModifyUsAd2.0', (req, res) => {
    req.app.locals.layout = 'Administrador';
    res.render('admin/ModificarAd2');
});

/*-----------------------------------------Fin Administrador---------------------------------------------------*/
/*-----------------------------------------CUESTIONARIO---------------------------------------------------*/
router.post('/web/Addquestions/:questions', (req, res) => {
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
                if (i == questions.length - 1) { res.redirect('/web/CreateQuizz'); }
                if (err2) console.log("ERROR 2 ", err2)
            });
        }
        if (err) console.log("ERROR 1 ", err)
    });
});

router.get('/web/questions', (req, res) => {
    req.app.locals.layout = 'profesor';
    req.getConnection((err, conn) => {
        conn.query("select * from ctemas", (err2, temas) => {
            conn.query("select * from cdificultad", (err3, dif) => {
                res.render('profesor/questions', { temas: temas, dif: dif });
            })
        });
    });

});
router.post('/web/Addquestion', (req, res) => {
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
            res.redirect('/web/CreateQuizz');
        }); //Error: Lock wait timeout exceeded; try restarting transaction es algo del maisicuel XD
        if (err) console.log("ERROR 1 ", err)
    });
});

router.post('/web/AddQuizz', (req, res) => {
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
            res.redirect('/web/cuestionarios');
        });
        if (err) console.log("ERROR 1 ", err)
    });
});
/*-------------------------------------FIN DE CUESTIONARIO--------------------------------------------*/

module.exports = router;