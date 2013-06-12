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

    $jsonString = "{}";
    $success = false;
    $errorMsg = "";
    $errorCode = $ERR_NO_WAVEFORM_WITH_ID;

    if("POST" == $verb) {
      $query = "INSERT INTO `waveforms`(`id`, `name`, `waveform`) VALUES ('" . $_POST['id'] . "','" . $_POST['name'] . "','" . $_POST['waveform'] . "')";
      PsLog($query);
      $result = mysql_query($query);
      if($result) {
        $success = true;
      }
      else {
        $errorMsg = mysql_error();
        $errorCode = $ERR_SQL_ERROR;
      }
    }
    else if("GET" == $verb) {
      $query = "SELECT id, name, modification_date, waveform FROM waveforms where id='" . $_REQUEST['id'] . "'";
      PsLog($query);
      $result = mysql_query($query);
      if($result && mysql_num_rows($result) == 1) {
        while($row = mysql_fetch_assoc($result)) {
//          $output[]=$row;
          $jsonString = json_encode($row);
        }
        $success = true;
      }
      else if(!$result) {
        $errorMsg = mysql_error();
      }
      else {
        $errorMsg = "No waveform with id " . $_REQUEST['id'];
      }
    }
    else if("DELETE" == $verb) {
      $query = "DELETE FROM waveforms where id = " . $_REQUEST['id'];
      PsLog($query);
      $result = mysql_query($query);
      if($result) {
        $success = true;
      }
      else {
        $errorMsg = mysql_error();
        $errorCode = $ERR_SQL_ERROR;
      }
    }

    if($success) {
      $fullResult = '{ status: "success", result: ' . $jsonString . ' }';
    }
    else {
      $fullResult = '{ status: "failure", errorCode: ' . $errorCode . ', errorMsg: "' . $errorMsg . '" }';
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

  PsLog("Exiting: postWaveform.php");
?>
