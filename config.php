<?php

//Enter your domain URL below 

$domain = "https://vkrdownloaderr.herokuapp.com";

function e7061($e){
	$ed = base64_decode($e);
	$n = openssl_decrypt("$ed","AES-256-CBC","1111111111111111",0,"1111111111111111");
	return $n;
}
?>
