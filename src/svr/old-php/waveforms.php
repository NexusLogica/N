<?php

  require('config.php');
  require('utilities.php');

  $verb = $_SERVER['REQUEST_METHOD'];
  PsLog("Entering: $verb waveforms.php");

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

    // Set the time zone to be UTC. Otherwise this returns local - bad.
		mysql_query("SET time_zone = '+00:00'") or die(mysql_error());

    $jsonString = "{}";
    $success = false;
    $errorMsg = "";
    $errorCode = $ERR_NO_WAVEFORM_WITH_ID;

		if("GET" == $verb) {
			$query = "SELECT `id`, `name`, `modification_date` FROM waveforms";
			$result = mysql_query($query);
      if($result) {
        while($row = mysql_fetch_assoc($result)) {
          $output[]=$row;
        }
        $jsonString = json_encode($output);
        $success = true;
      }
		}

    if($success) {
      $fullResult = '{ "status": "success", "result": ' . $jsonString . ' }';
    }
    else {
      $fullResult = '{ "status": "failure", "errorCode": ' . $errorCode . ', "errorMsg": "' . $errorMsg . '" }';
      PsLog($fullResult);
    }

    if(isset($_REQUEST['callback'])) {
      header("Content-Type: application/javascript");
      print($_REQUEST['callback'] . "(" . $fullResult . ");");
    }
    else {
      header("Content-Type: application/json");
      print($fullResult);
    }

		mysql_close($con);
  }

  PsLog("Exiting: waveforms.php");
?>
