<?php

// Load the Google API PHP Client Library.
require_once __DIR__ . '/google-api-php-client-2.2.0/vendor/autoload.php';


$tk=getAuthToken();
echo json_encode($tk['access_token']);


function getAuthToken()
{
  // Creates and returns the Analytics Reporting service object.

  // Use the developers console and download your service account
  // credentials in JSON format. Place them in this directory or
  // change the key file location if necessary.
  $KEY_FILE_LOCATION = __DIR__ . '/service-account-credentials.json';

  // Create and configure a new client object.
  $client = new Google_Client();
  $client->setApplicationName("Hello Analytics Reporting");
  $client->setAuthConfig($KEY_FILE_LOCATION);
  $client->setScopes(['https://www.googleapis.com/auth/analytics.readonly']);
  $client->refreshTokenWithAssertion();
  $token = $client->getAccessToken();

  return $token;
}



