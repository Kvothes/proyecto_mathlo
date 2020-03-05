<?php

$hostname = 'localhost';
$database = 'mychemis_mcbv02';
$username = 'root';
$password = '$BTC$#1my00770p';

$conexion = new mysqli($hostname,$username,$password,$database);

if ($conexion->connect_errno) {
    echo "lo sentimos, estamos presentando fallas técnicas";
}

?>