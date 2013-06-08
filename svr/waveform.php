<?php

  require('config.php');
  require('utilities.php');

  $verb = $_SERVER['REQUEST_METHOD'];
  PsLog("Entering: $verb waveform.php");

  // Respond to preflights (i.e. cross domain requests).
  if ("OPTIONS" == $verb) {
    // Return only the headers and not the content
    // Allow CORS for all access types (POST, GET, DELETE,...).
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: X-Requested-With');    
  }
  else {
    // Open the database. Needed for all the following calls.
		$con = mysql_connect(PsSetting('DB_HOST'), PsSetting('DB_USER'), PsSetting('DB_PW'));
		if (!$con) {
			PsLog("Unable to connect to the database: " . mysql_error());
			die('Could not connect: ' . mysql_error());
		}

		mysql_select_db(PsSetting('DB_NAME'), $con);

		if("POST" == $verb) {
			$query = "INSERT INTO `waveforms`(`id`, `name`, `waveform`) VALUES ('" . $_POST['id'] . "','" . $_POST['name'] . "','" . $_POST['waveform'] . "')";
			PsLog($query);
			mysql_query($query);
		}

		mysql_close($con);
  }

  PsLog("Exiting: postWaveform.php");
?>
