<?php

include 'conexion.php';

$appat_us = $_POST['appat_us'];
$apmat_us = $_POST['apmat_us'];
$nom_us = $_POST['nom_us'];
$cor_us = $_POST['cor_us'];
$usnam_us = $_POST['usnam_us'];
$pas_us = $_POST['pas_us'];
$id_sex = $_POST['id_sex'];
$id_tus = $_POST['id_tus'];

$consulta = "insert into usuario (appat_us,apmat_us,nom_us,
cor_us,usnam_us,pas_us,id_sex,id_tus) values 
('".$appat_us."','".$apmat_us."','".$nom_us."','".$cor_us."',
'".$usnam_us."','".$pas_us."',".$id_sex.",".$id_tus."";

mysqli_query($conexion,$consulta) or die (mysqli_error(''));
mysqli_close($conexion);
?>