<?php
  require('config.php');
  require('utilities.php');

  if(file_exists($LOG_FILE_PATH)) {
    $handle = fopen($LOG_FILE_PATH, "w");
    $logText = fwrite($handle, "");
    fclose($handle);
  }

  header( 'Location: ' . PsSetting('PSAPI_SERVER_BASE') . '/log.php' ) ;
?>
