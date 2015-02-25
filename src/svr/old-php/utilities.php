<?php
/**********************************************************************

File     : utilities.php
Project  : NexusLogica PHP Server Library
Purpose  : PHP file for utility functions.
Revisions: Original definition by Lawrence Gunn.
           2013/06/04

Copyright (c) 2013 by Lawrence Gunn.
All Rights Reserved.

*/

$ERR_SQL_ERROR             = 1;
$ERR_NO_WAVEFORM_WITH_ID   = 2;

function PsSetting($settingName)
{
  return $GLOBALS[$settingName];
}

function PsLog($msg)
{
  $openType = "a"; // Append
  if(file_exists($GLOBALS['LOG_FILE_PATH']) && filesize($GLOBALS['LOG_FILE_PATH']) > $GLOBALS['MAX_LOG_SIZE']) {
    $openType = "w"; // The log is getting too large - start over.
  }

  $fd = fopen($GLOBALS['LOG_FILE_PATH'], $openType);

  date_default_timezone_set('UTC');
  $time=microtime();
  $timeval=substr($time, 11).substr($time, 1, 9);
  preg_match('/\.(\d*)/', "" . $timeval, $found);

  list($microSec, $timeStamp) = explode(" ", microtime());
  $otherTime = date('F jS, Y, H:i:', $timeStamp) . (date('s', $timeStamp) + $microSec);

  //$str = "[" . date("Y/m/d h:i:s", time()) . "." . substr($found[1], 1, 3) .  "] " . $msg;
  $str = "[" . $otherTime .  "] " . $msg;
  fwrite($fd, $str . "\n");
  fclose($fd);
}

function PsPrettyPrintXML($simpleXml)
{
  $doc = new DOMDocument('1.0');
  $doc->formatOutput = true;
  $domnode = dom_import_simplexml($simpleXml);
  $domnode = $doc->importNode($domnode, true);
  $domnode = $doc->appendChild($domnode);

  $stringXML = $doc->saveXML();

  PsLog($stringXML);
  print $stringXML;
}

function PsErrorHandler($errno, $errstr)
{
//  if($errno == E_WARNING || $errno == E_USER_ERROR) {
    PsLog("CATCH: $errno: $errstr");
//  }
}

set_error_handler("PsErrorHandler");

?>
